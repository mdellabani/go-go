# Go for a Java dev — session notes

**One line:** Go is C with a garbage collector, cheap threads, and a package manager.
No VM, no JIT, no classes, no inheritance, no exceptions.

---

## 1. Java → Go translation table

| Java | Go | note |
|---|---|---|
| `int add(int a, int b)` | `func add(a, b int) int` | types go AFTER names |
| `Pair<T,E>` / exceptions | `func f() (int, error)` | multiple return values are native |
| `void` | *(nothing)* | omit the return type |
| `class Counter { int n; }` | `type Counter struct { n int }` | |
| `void inc() { this.n++; }` | `func (c *Counter) inc() { c.n++ }` | `(c *Counter)` = explicit `this` = **receiver** |
| `new Counter()` | `Counter{}` or `&Counter{}` | composite literal; no constructors |
| `new Point(1,2)` | `Point{X: 1, Y: 2}` | |
| `class Foo implements Bar` | *(nothing)* | interfaces are **implicit** |
| `public` / package-private | `Capitalized` / `lowercase` | capitalization IS the access modifier |
| `Math.max(a,b)` | `math.Max(a,b)` | package-level func = Java's `static` |
| `package com.foo.store;` | `package store` in dir `store/` | package == directory |
| `import com.foo.*;` | *(illegal)* | no wildcards, unused import = compile ERROR |
| pom.xml / jar | `go.mod` / no jars | import path is a URL |
| `finally` / try-with-resources | `defer f.Close()` | |
| `new Thread()` / virtual thread | `go f()` | goroutine, ~2KB stack |
| `ExecutorService` | *(none needed)* | runtime is the scheduler |
| `CountDownLatch` | `sync.WaitGroup` | |
| `BlockingQueue` | `chan T` | plus `select` |
| thread-local / cancellation | `context.Context` | passed explicitly as 1st arg |
| JFR / MAT heap dump | `pprof` + `go tool trace` | profile-based, no object graph |
| lambda `() -> x` | `func() { x }` | closures capture the VARIABLE, mutable |

## 2. Function & method anatomy

```
func   add   (a, b int)   int
 │      │        │         └── return type(s)
 │      │        └── params: name THEN type
 │      └── name
 └── keyword

func  (c *Counter)  inc  ()
       └────┬───┘
         receiver = `this`, you name it. Only new syntax in the language.
         *Counter = can mutate.  Counter = gets a copy.
```

`type Foo struct{}` = zero-field type. Exists only to hang methods on. 0 bytes.

## 3. Implicit interfaces (the big idea)

```go
// producer — never mentions any interface
type FileStore struct{ dir string }
func (f *FileStore) Get(k string) ([]byte, error) { ... }

// consumer, different package — declares the narrow thing IT needs
type Getter interface { Get(string) ([]byte, error) }
func Handler(g Getter) { ... }   // *FileStore satisfies it automatically
```

- Interfaces are declared by the **consumer**, not the producer.
- Keep them 1–2 methods (`io.Reader` has one).
- You can retrofit an interface onto a third-party type → everything is mockable.
- Rule of thumb: **accept interfaces, return structs.**

`http.Handler` is literally `interface { ServeHTTP(ResponseWriter, *Request) }`.
`http.HandlerFunc(f)` is an adapter: a *function type* with a `ServeHTTP` method, so a plain
func counts as a Handler.

## 4. Closures replace classes

```go
func WithTimeout(d time.Duration) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {              // middleware
        return http.HandlerFunc(func(w, r) {                   // runs per request
            ctx, cancel := context.WithTimeout(r.Context(), d)
            defer cancel()
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}
```
Layer 1 runs once (captures config `d`), layer 2 once per route (captures `next`),
layer 3 per request. The closure IS the object; captured vars ARE the fields.

## 5. Memory

- Stack vs heap decided by the compiler via **escape analysis**, not by you.
  A value "escapes" when it outlives its function (you return `&x`, store it in an
  interface, capture it in a surviving closure).
- See it: `go build -gcflags='-m' ./...`
- Structs are **value types** — assigning copies them. Pointers exist (`*T`, `&x`) but
  **no pointer arithmetic**. `**T` is legal but rare.
- GC: concurrent mark-sweep, tuned for latency (sub-ms pauses), not throughput.
  Knobs: `GOGC`, `GOMEMLIMIT`.
- Perf work in Go = "make this not allocate".

## 6. Concurrency

```go
go func() { process(job) }()   // func literal + () to call it + `go` to run it elsewhere
```
- goroutines are M:N multiplexed onto OS threads. Millions are fine.
- `main` returning kills everything → use `sync.WaitGroup`.
- Since Go 1.22 loop vars are per-iteration (the classic capture bug is fixed).
- `go test -race` catches real data races. Use it.

## 7. `defer`

Runs when the **function** returns (normal, early, or panic). LIFO.
**Arguments evaluated immediately, call happens later.**
Never `defer` inside a loop — it accumulates until the function ends.

## 8. Packages & layout

```
myapp/
  go.mod
  cmd/server/main.go     → one binary per `package main` dir
  cmd/migrate/main.go    → a module can build several binaries
  internal/store/        → COMPILER-ENFORCED private to this module
```
- package == directory; all files in a dir share the package name.
- **No circular imports** — compiler rejects them. Forces a DAG.
- `_ "net/http/pprof"` = blank import, run its `init()` for side effects only.
- Inside a package everything sees everything; capitalization only gates across packages.

## 9. Debugging

| need | tool |
|---|---|
| breakpoints | `dlv` (Delve) |
| CPU / memory | `go tool pprof http://host:6060/debug/pprof/{profile,heap}` |
| leak hunt | `go tool pprof -base old.pprof new.pprof` |
| goroutine leak | `/debug/pprof/goroutine` |
| latency timeline (≈JFR) | `runtime/trace` + `go tool trace` |
| GC log | `GODEBUG=gctrace=1` |
| races | `go test -race` |

No heap dump / MAT equivalent — you infer ownership from allocation sites.

## 10. Why infra companies pick it

Static binary → tiny container, ms startup, low memory at scale; sub-ms GC pauses for
tail latency; goroutines make 100k connections trivial; seconds-long builds; one obvious
way to write things so any engineer is productive in a week.
At an AI company Go is the **control plane** (gateway, scheduler, routing, billing,
observability) — the kernels are C++/CUDA, training is Python.

## 11. Gotcha list (flashcard these)

- receiver syntax `func (c *T) M()`
- capitalization = visibility
- unused import / unused local = compile error
- `defer` args evaluated at defer time
- nil interface != nil pointer (classic trap)
- slices have len AND cap; `append` may or may not reallocate
- no circular imports
- `internal/` is enforced, `pkg/` is just a convention
- errors are values: `if err != nil { return err }`
- zero values: an uninitialized struct is usable
- PGO = commit a prod CPU profile as `default.pgo`, build inlines/devirtualizes from it
