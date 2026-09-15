import type { Question } from './types'

export const orientation: Question[] = [
  {
    id: 'jvm',
    n: 1,
    q: 'Is Go a JVM language?',
    short: 'No. There is no VM, no bytecode, and nothing to install on the machine you deploy to.',
    blocks: [
      {
        kind: 'p',
        text: 'go build emits a native executable for one OS and one CPU architecture. That file is the deliverable. No JRE, no classpath, no fat jar, no container base image with a runtime in it — a Go service can ship in a FROM scratch image containing literally one file.',
      },
      {
        kind: 'p',
        text: 'The nuance worth having straight, because interviewers ask it: Go does have a runtime. The scheduler, the garbage collector, the allocator and the stack-growth machinery are all real, and they are all statically linked into your binary. The difference from the JVM is not "no runtime" — it is that the runtime ships inside the artifact instead of being installed underneath it, and it does not interpret or re-compile your code at any point.',
      },
      {
        kind: 'compare',
        caption: 'What you actually deploy',
        rows: [
          { java: 'JAR + a JRE on the host', rust: 'native binary', go: 'native binary', note: 'Go and Rust both give you one file' },
          { java: 'bytecode, JIT-compiled at runtime', rust: 'machine code', go: 'machine code', note: 'no warmup phase in Go or Rust' },
          { java: 'runtime installed separately', rust: 'no runtime (libc only)', go: 'runtime linked in (~1.5MB)', note: 'Go pays for GC + scheduler in binary size' },
          { java: '100ms–several s startup', rust: 'instant', go: 'instant', note: 'matters for CLI tools and scale-to-zero' },
          { java: 'cross-compile: irrelevant, JVM is the target', rust: 'needs a toolchain per target', go: 'GOOS=linux GOARCH=arm64 go build', note: 'Go cross-compiles out of the box' },
        ],
      },
      {
        kind: 'aside',
        tone: 'java',
        text: 'The closest Java analogue is a GraalVM native image — AOT-compiled, fast to start, no JVM needed. In Go that is not a special mode you opt into. It is the only mode.',
      },
    ],
  },

  {
    id: 'compiler',
    n: 2,
    q: 'Is the Go compiler like a C compiler or like javac?',
    short: 'Like a C compiler — straight to machine code, ahead of time — but it optimises for compile speed over peak output.',
    blocks: [
      {
        kind: 'p',
        text: 'javac does almost nothing interesting; it lowers source to bytecode and the real optimisation happens later in C2 at runtime, using live profile data. Go has no second chance. Everything the compiler is going to do, it does at build time, and what you ship is final.',
      },
      {
        kind: 'p',
        text: 'That trade cuts both ways and you should be able to argue both sides. Go wins on startup, on predictability, and on the absence of warmup, deoptimisation and recompilation storms. The JVM can win on a long-running hot loop, because C2 gets to speculate on what actually happened — devirtualising a call site that turned out to be monomorphic, for instance — and Go has to be conservative about the same code forever.',
      },
      {
        kind: 'p',
        text: 'Go closes part of that gap with PGO (profile-guided optimisation). You collect a CPU profile from production, commit it to the repo as default.pgo next to main, and the compiler uses it to drive inlining and devirtualisation decisions. It is the same idea as C2 profiling, moved to build time. Typical reported gain is a few percent — real, not transformative.',
      },
      {
        kind: 'code',
        caption: 'Ask the compiler what it decided',
        code: `# what escaped to the heap, and why
go build -gcflags="-m" ./...

# what got inlined
go build -gcflags="-m=2" ./... 2>&1 | grep "can inline"

# profile-guided build: drop default.pgo next to package main
go build -pgo=auto ./cmd/server`,
      },
      {
        kind: 'compare',
        caption: 'Compilation model',
        rows: [
          { java: 'javac → bytecode → JIT', rust: 'rustc → LLVM → machine code', go: 'gc → machine code', note: 'Go does not use LLVM by default' },
          { java: 'fast compile, slow warmup', rust: 'famously slow compile', go: 'very fast compile', note: 'Go compiles a big service in seconds' },
          { java: 'optimises with runtime profile', rust: 'optimises at build, monomorphises', go: 'optimises at build, PGO optional', note: 'Rust trades compile time for output quality' },
          { java: 'generics erased', rust: 'generics monomorphised', go: 'generics: mostly shape-based dictionaries', note: 'Go avoids Rust-style code-size blowup' },
        ],
      },
      {
        kind: 'aside',
        tone: 'warn',
        text: 'Compile speed is a design goal, not an accident. No circular imports, no header files, and an unused import being a hard error all exist so the compiler can be fast. Go trades some of your convenience for the build being instant.',
      },
    ],
  },

  {
    id: 'paradigm',
    n: 3,
    q: 'Is it object-oriented, or functional like C?',
    short: 'Neither. It is structs with methods, plus interfaces that nobody ever declares they implement.',
    blocks: [
      {
        kind: 'p',
        text: 'There are no classes, no inheritance, no constructors, no exceptions, no annotations and no generics-driven framework magic. There is a struct, which is a plain record of fields; a method, which is an ordinary function with an extra receiver parameter bolted onto the front; and an interface, which is a list of method signatures.',
      },
      {
        kind: 'p',
        text: 'The idea that actually reorganises how you design is implicit satisfaction. A type satisfies an interface by having the right methods. It never says so, and it does not import the interface. This inverts the dependency: in Java the producer declares "implements Serializable" and every implementation is coupled to the abstraction. In Go the consumer declares the interface it needs, right where it needs it, usually one method wide — and every type that already had that method satisfies it retroactively, including types from packages that were written years before your interface existed.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'orient-implicit',
          title: 'Nobody wrote "implements" anywhere in this program',
          hint: 'greeter never mentions http.Handler. Delete the ServeHTTP method and watch the assignment on line 19 stop compiling — that is the entire interface check.',
          code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type greeter struct{ name string }

// This method is the ONLY thing that makes greeter an http.Handler.
func (g greeter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "hello %s, you asked for %s", g.name, r.URL.Path)
}

func main() {
	// The compiler checks the method set here, at the assignment.
	var h http.Handler = greeter{name: "you"}

	req := httptest.NewRequest("GET", "/ping", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	fmt.Println("status:", rec.Code)
	fmt.Println("body:  ", rec.Body.String())
}`,
        },
      },
      {
        kind: 'compare',
        caption: 'Abstraction',
        rows: [
          { java: 'class C implements I', rust: 'impl I for C', go: '(nothing — just have the methods)', note: 'only Go has no declaration site at all' },
          { java: 'extends BaseClass', rust: '(no inheritance)', go: '(no inheritance)', note: 'Go and Rust both use composition' },
          { java: 'abstract class with state', rust: 'trait + default methods', go: 'embedded struct', note: 'embedding forwards methods, it is not subtyping' },
          { java: 'interface defined by library author', rust: 'trait usually by library author', go: 'interface defined by the caller', note: 'the inversion that changes your designs' },
          { java: 'throws / try-catch', rust: 'Result<T, E> + ?', go: '(v, err) + if err != nil', note: 'Go is closer to Rust here than to Java' },
        ],
      },
      {
        kind: 'aside',
        tone: 'rust',
        text: 'Rust traits are also structural in spirit but nominal in practice — you still write impl Trait for Type. Go has no such line. The cost is that "what does this type satisfy?" is not greppable; the benefit is zero coupling between a package and the abstractions its callers invent.',
      },
    ],
  },

  {
    id: 'memory',
    n: 4,
    q: 'How does memory allocation work?',
    short: 'The compiler decides stack or heap for you via escape analysis, and a latency-tuned GC collects the heap.',
    blocks: [
      {
        kind: 'p',
        text: 'You never write new or malloc as a placement decision. You write a value, and the compiler proves whether it can live on the stack. If a value is still reachable after its function returns — because you returned a pointer to it, stored it in a struct that outlives the call, or passed it to something the compiler cannot see through — it escapes, and it is allocated on the heap instead. That is what "a value outlives its function" means, and it is why returning &Foo{} in Go is safe where returning &foo in C is a dangling pointer.',
      },
      {
        kind: 'p',
        text: 'Structs are values. Assigning a struct copies it, passing one to a function copies it, and a []Point is one contiguous block of Points, not an array of pointers to scattered heap objects. This is the single biggest difference from Java for memory behaviour: cache locality is something you get by default rather than something you fight the language for.',
      },
      {
        kind: 'p',
        text: 'The collector is a concurrent mark-sweep, non-generational and non-compacting, tuned hard for pause time rather than throughput. Pauses are sub-millisecond and essentially independent of heap size. You get two knobs: GOGC (collect when the heap has grown by this percent, default 100) and GOMEMLIMIT (a soft ceiling — set this in containers). Non-compacting means pointers are stable and no object ever moves, which is what makes cheap interop with C possible; the price is fragmentation the JVM would have compacted away.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'orient-values',
          title: 'Structs are values, not references',
          hint: 'byValue gets a copy, so the original is untouched. byPointer gets the address. There is no third possibility — Go never silently passes a reference.',
          code: `package main

import "fmt"

type Point struct{ X, Y int }

func byValue(p Point)    { p.X = 999 }
func byPointer(p *Point) { p.X = 999 }

func main() {
	p := Point{X: 1, Y: 2}

	byValue(p)
	fmt.Println("after byValue:  ", p)

	byPointer(&p)
	fmt.Println("after byPointer:", p)

	// A slice of structs is ONE contiguous block of memory.
	pts := []Point{{1, 1}, {2, 2}, {3, 3}}
	fmt.Println("contiguous:", pts)

	// Ranging gives you copies — this is the classic surprise.
	for _, q := range pts {
		q.X = 0
	}
	fmt.Println("unchanged: ", pts)

	// Index if you want to mutate in place.
	for i := range pts {
		pts[i].X = 0
	}
	fmt.Println("mutated:   ", pts)
}`,
        },
      },
      {
        kind: 'compare',
        caption: 'Memory model',
        rows: [
          { java: 'every object on the heap', rust: 'stack by default, Box to heap', go: 'compiler decides (escape analysis)', note: 'Go automates what Rust makes explicit' },
          { java: 'generational, compacting GC', rust: 'no GC — ownership + drop', go: 'concurrent mark-sweep, non-moving', note: 'Go optimises pause time, JVM throughput' },
          { java: 'Point[] = array of references', rust: 'Vec<Point> = contiguous', go: '[]Point = contiguous', note: 'Go matches Rust for layout' },
          { java: 'no pointer arithmetic', rust: 'raw pointers in unsafe', go: 'pointers, but no arithmetic', note: 'Go pointers can be dereferenced, never offset' },
          { java: '-Xmx', rust: '(n/a)', go: 'GOMEMLIMIT + GOGC', note: 'always set GOMEMLIMIT in a container' },
        ],
      },
      {
        kind: 'aside',
        tone: 'warn',
        text: 'Performance work in Go is almost always "make this stop allocating", not "make this do fewer operations". go build -gcflags=-m tells you what escaped; go test -benchmem tells you how much. That is the whole loop.',
      },
    ],
  },

  {
    id: 'concurrency',
    n: 5,
    q: 'How does multithreading work?',
    short: 'You write ordinary blocking code and start thousands of goroutines; the runtime multiplexes them onto a handful of OS threads.',
    blocks: [
      {
        kind: 'p',
        text: 'go f() starts a goroutine. It costs about 2KB of stack, which grows and shrinks on demand, and it is scheduled by Go\'s own scheduler onto GOMAXPROCS OS threads — an M:N model. A million goroutines is a normal number. A million threads is not.',
      },
      {
        kind: 'p',
        text: 'The consequence that matters more than the cost: there is no async/await, and therefore no function colouring. A Go function that does I/O looks exactly like one that does not. When a goroutine blocks on a socket, the runtime parks it and runs something else on that thread; the syscall is non-blocking underneath and you never see it. This is why Go code reads like simple sequential code while behaving like an event loop, and it is the single largest ergonomic gap between Go and Rust async.',
      },
      {
        kind: 'p',
        text: 'Coordination is channels (typed queues), select (wait on several at once), sync.WaitGroup (a CountDownLatch), sync.Mutex (a plain struct field, no keyword) and context.Context for deadlines and cancellation, passed explicitly as the first argument by convention. There is no thread pool to size and no executor to shut down.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'orient-goroutines',
          title: 'Fan out, collect, cancel',
          hint: 'Three goroutines, a channel to collect, a context with a deadline. Drop the timeout to 5ms and watch the select take the cancellation branch instead.',
          code: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
	defer cancel()

	jobs := []string{"alpha", "beta", "gamma"}
	results := make(chan string, len(jobs))

	var wg sync.WaitGroup
	for _, job := range jobs {
		wg.Add(1)
		// Since Go 1.22 the loop variable is per-iteration, so capturing
		// job here is safe. Before 1.22 all three saw "gamma".
		go func() {
			defer wg.Done()
			time.Sleep(50 * time.Millisecond)
			results <- "done: " + job
		}()
	}

	// Close the channel once every worker has reported.
	go func() {
		wg.Wait()
		close(results)
	}()

	for {
		select {
		case r, open := <-results:
			if !open {
				fmt.Println("all workers finished")
				return
			}
			fmt.Println(r)
		case <-ctx.Done():
			fmt.Println("gave up:", ctx.Err())
			return
		}
	}
}`,
        },
      },
      {
        kind: 'compare',
        caption: 'Concurrency',
        rows: [
          { java: 'Thread / virtual thread', rust: 'tokio::spawn (needs a runtime)', go: 'go f()', note: 'Java virtual threads are the closest analogue' },
          { java: 'ExecutorService, sized pool', rust: 'the Tokio runtime', go: '(nothing to configure)', note: 'GOMAXPROCS is the only dial' },
          { java: 'async colours nothing (Loom)', rust: 'async fn colours everything', go: 'no colouring', note: 'Go needs no sync/async split' },
          { java: 'BlockingQueue', rust: 'mpsc / crossbeam channel', go: 'chan T', note: 'plus select for multiplexing' },
          { java: 'CompletableFuture.allOf', rust: 'join! / JoinSet', go: 'sync.WaitGroup', note: 'Add / Done / Wait' },
          { java: 'ThreadLocal, cancellation ad hoc', rust: 'CancellationToken', go: 'context.Context', note: 'explicit first parameter, never implicit' },
          { java: 'synchronized / ReentrantLock', rust: 'Mutex<T> wraps the data', go: 'sync.Mutex next to the data', note: 'Rust makes the lock own the value; Go trusts you' },
        ],
      },
      {
        kind: 'aside',
        tone: 'rust',
        text: 'Rust prevents data races at compile time through ownership. Go does not — a race is a real, shippable bug. What Go gives you instead is go test -race and go run -race, a runtime detector that is genuinely excellent and belongs in your CI.',
      },
    ],
  },

  {
    id: 'modules',
    n: 6,
    q: 'How does library management work?',
    short: 'go.mod, and the import path is the repository URL. There is no central registry.',
    blocks: [
      {
        kind: 'p',
        text: 'import "github.com/redis/go-redis/v9" means exactly what it says: that path is where the code lives. There is no Maven Central and no crates.io in the middle. go.mod pins versions, go.sum records cryptographic checksums of every module in the graph, and the default GOPROXY (proxy.golang.org) caches and immutably archives everything so a deleted repo cannot break your build.',
      },
      {
        kind: 'p',
        text: 'Version selection is the part worth knowing, because Go is deliberately the odd one out. Maven resolves conflicts by nearest-wins, Cargo picks the newest version compatible with all requirements. Go uses Minimal Version Selection: it takes the highest version that anyone in your dependency graph explicitly asked for, and nothing newer. Builds are therefore reproducible without a lockfile, and upgrades only happen when someone edits go.mod. Slightly startling the first time; it removes an entire category of "it broke overnight" incidents.',
      },
      {
        kind: 'p',
        text: 'Breaking changes go in the import path. v2 and later live at /v2, /v3 and so on, which means two major versions of the same library can coexist in one binary without shading or relocation.',
      },
      {
        kind: 'code',
        caption: 'The whole toolchain',
        code: `go mod init github.com/you/svc     # create go.mod
go get github.com/redis/go-redis/v9   # add a dependency
go mod tidy                        # add what is used, drop what is not
go build ./...                     # build every package
go test ./...                      # test every package
go vet ./...                       # static checks, built in
go test -race ./...                # the race detector
go test -bench=. -benchmem ./...   # benchmarks + allocation counts`,
      },
      {
        kind: 'compare',
        caption: 'Dependencies',
        rows: [
          { java: 'pom.xml / build.gradle', rust: 'Cargo.toml', go: 'go.mod', note: 'Go has no build script at all' },
          { java: 'Maven Central', rust: 'crates.io', go: '(the repo URL itself)', note: 'Go is the only decentralised one' },
          { java: 'nearest-wins resolution', rust: 'newest compatible (SemVer)', go: 'minimal version selection', note: 'Go upgrades only when you say so' },
          { java: 'shading for conflicts', rust: 'multiple semver-major versions', go: '/v2 in the import path', note: 'both allow coexisting majors' },
          { java: 'jar, published artifact', rust: 'crate, published', go: '(a git tag)', note: 'publishing a Go module = pushing a tag' },
        ],
      },
    ],
  },

  {
    id: 'layout',
    n: 7,
    q: 'How does project structure work?',
    short: 'A package is a directory. Capitalisation is the access modifier. internal/ is enforced by the compiler, not by convention.',
    blocks: [
      {
        kind: 'p',
        text: 'One directory is one package, and every file in it shares a flat namespace — no imports needed between files of the same package. The package name is normally the directory name. Files can be named anything.',
      },
      {
        kind: 'p',
        text: 'Visibility has exactly two levels and no keywords. An identifier starting with a capital letter is exported from its package; a lowercase one is not. This is not a naming convention that a linter checks — it is the language rule, checked by the compiler. There is no private, no protected, and no public.',
      },
      {
        kind: 'p',
        text: 'internal/ is the third rule and the one people assume is convention: any package under a directory named internal can only be imported by code rooted at internal\'s parent. Import it from outside that subtree and the build fails. It is a real access boundary, and it is how a library exposes a small public surface while keeping a large private one.',
      },
      {
        kind: 'code',
        caption: 'A service layout that scales',
        code: `svc/
  go.mod                    module github.com/you/svc
  cmd/
    server/main.go          package main  -> binary "server"
    migrate/main.go         package main  -> binary "migrate"
  internal/
    store/store.go          package store   — importable only inside svc/
    billing/billing.go      package billing — same
  pkg/
    tokens/tokens.go        package tokens  — the public API, if you want one

# one directory per binary under cmd/
go build ./cmd/server       -> ./server
go build ./cmd/migrate      -> ./migrate
go build ./...              -> builds everything`,
      },
      {
        kind: 'p',
        text: 'That answers the "one executable or many?" question: a repository produces as many binaries as it has package main directories. Each one is an independent, statically linked executable. Sharing code between them is just importing a package.',
      },
      {
        kind: 'compare',
        caption: 'Structure',
        rows: [
          { java: 'package com.foo.bar (declared)', rust: 'mod declared in code', go: 'package == the directory', note: 'Go has no nesting inside a package' },
          { java: 'public / private / protected', rust: 'pub / pub(crate) / private', go: 'Capital / lowercase', note: 'Rust pub(crate) is closest to internal/' },
          { java: 'circular imports allowed', rust: 'modules can be cyclic', go: 'circular import = compile error', note: 'forces a DAG; annoying then clarifying' },
          { java: 'src/test/java mirror tree', rust: '#[cfg(test)] in the same file', go: 'foo_test.go next to foo.go', note: 'Go tests can see package internals' },
          { java: 'import com.foo.*', rust: 'use foo::*', go: '(no wildcards, unused = error)', note: 'strictness buys compile speed' },
        ],
      },
    ],
  },

  {
    id: 'why',
    n: 8,
    q: 'Why do Datadog, Uber, Mistral and friends pick it?',
    short: 'One static binary to deploy, predictable tail latency, cheap concurrency for I/O fan-out — and a stranger can read your code on day one.',
    blocks: [
      {
        kind: 'ul',
        items: [
          'Deployment is a file copy. No runtime on the host, no base image with a JDK in it, no version skew between environments. For a company running thousands of small services this compounds enormously.',
          'Tail latency is predictable. Sub-millisecond GC pauses and no JIT warmup mean p99 looks like p50. For an API in front of paying customers that is often worth more than raw throughput.',
          'I/O fan-out is nearly free. An agent or a gateway that holds ten thousand open connections and waits on all of them is the exact shape goroutines were built for.',
          'Compiles in seconds, which keeps CI fast and keeps developers in flow. This is a real productivity argument, not a vanity metric.',
          'The language is small and gofmt is not configurable, so style debates do not happen and code review is about behaviour. Onboarding across a large org gets measurably cheaper.',
          'Tooling ships in the box: test, bench, race detector, profiler, vet, fuzzing. No plugin archaeology.',
        ],
      },
      {
        kind: 'p',
        text: 'Be equally clear about where it is not the answer, because that is what separates a considered opinion from enthusiasm. Go is not the language of numerical kernels, inference engines or anything that wants SIMD, manual memory layout, or zero-cost abstraction — that work is C++, Rust and CUDA. At an AI company, Go is overwhelmingly the control plane: the API gateway, the scheduler, the routing and queueing layer, the observability and orchestration tooling. The model runs somewhere else. Knowing which half of the stack you are interviewing for is the useful insight.',
      },
      {
        kind: 'compare',
        caption: 'Where each one wins',
        rows: [
          { java: 'huge ecosystem, mature frameworks', rust: 'maximum performance, no GC', go: 'operational simplicity', note: 'pick the axis you actually need' },
          { java: 'best-in-class throughput after warmup', rust: 'best latency and footprint', go: 'best latency-per-effort', note: 'Go is the pragmatic middle' },
          { java: 'weeks to master Spring', rust: 'months to fight the borrow checker', go: 'a productive week', note: 'onboarding cost is a real business input' },
          { java: 'control plane and data plane', rust: 'data plane, kernels, embedded', go: 'control plane, networking, CLIs', note: 'the honest division of labour' },
        ],
      },
    ],
  },

  {
    id: 'habits',
    n: 9,
    q: 'Anything else before I write code?',
    short: 'Five habits that are not optional, and one trap that catches everybody exactly once.',
    blocks: [
      {
        kind: 'ul',
        items: [
          'Errors are values. A function returns (T, error) and you check it immediately. No exceptions, no stack unwinding, no catch-all at the top. Wrap with fmt.Errorf("...: %w", err) to keep the chain, then interrogate it with errors.Is and errors.As.',
          'gofmt is not a preference. It is run by every editor on save, it has no options, and diffs are therefore about substance only.',
          'The standard library is the framework. net/http is a production HTTP server, encoding/json is the serialiser, testing is the test framework. Reach for a dependency later than you would in Java.',
          'The zero value is designed, not accidental. var mu sync.Mutex is ready to lock. var buf bytes.Buffer is ready to write. A nil slice appends correctly. Types are built so their zero value is useful — design yours the same way.',
          'Accept interfaces, return structs. Take the narrowest interface you need as a parameter; hand back concrete types so callers keep their options.',
        ],
      },
      {
        kind: 'run',
        snippet: {
          id: 'orient-nil-interface',
          title: 'The trap: a non-nil interface holding a nil pointer',
          hint: 'broken() returns a nil *MyErr — but the interface value wrapping it is not nil, because it carries a type. This is the most common real bug in Go. Return error, not *MyErr.',
          code: `package main

import "fmt"

type MyErr struct{ msg string }

func (e *MyErr) Error() string { return e.msg }

// WRONG: the concrete pointer type leaks into the interface.
func broken() error {
	var p *MyErr = nil
	return p
}

// RIGHT: return the untyped nil for the interface.
func correct() error {
	return nil
}

func main() {
	fmt.Println("broken() == nil ?", broken() == nil)
	fmt.Println("correct() == nil ?", correct() == nil)

	// An interface is (type, value). Non-nil type => non-nil interface.
	fmt.Printf("broken() holds type %T with value %v\\n", broken(), broken())
}`,
        },
      },
      {
        kind: 'aside',
        tone: 'warn',
        text: 'If you remember one thing from this page: an interface value is a pair of (type, value), and it is nil only when both halves are nil. Every confused nil check in Go traces back to that sentence.',
      },
    ],
  },
]
