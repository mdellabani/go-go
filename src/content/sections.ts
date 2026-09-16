import type { Section } from './types'

export const sections: Section[] = [
  {
    id: 'syntax',
    n: 1,
    title: 'Functions & syntax',
    nav: 'Syntax',
    blurb: 'Types come after names. No void. Multiple return values.',
    blocks: [
      {
        kind: 'p',
        text: 'Go moves every type to the right of the thing it describes. That single rule accounts for most of why Go looks alien to a Java reader.',
      },
      {
        kind: 'code',
        caption: 'anatomy',
        code: `func   add   (a, b int)    int
 |      |        |          |
 |      |        |          +-- return type, AFTER the parens
 |      |        +-- params: NAME first, TYPE second
 |      +-- function name
 +-- keyword, always`,
      },
      {
        kind: 'run',
        snippet: {
          id: 'syntax-basics',
          title: 'Functions, multiple returns, zero values',
          hint: 'Try removing the `_ =` on the last line — unused variables are a compile error, not a warning.',
          code: `package main

import (
	"errors"
	"fmt"
)

func add(a, b int) int { return a + b }

// two return values: the result and an error. No exceptions in Go.
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("divide by zero")
	}
	return a / b, nil
}

func main() {
	fmt.Println(add(2, 3))

	if q, err := divide(10, 2); err == nil {
		fmt.Println("10/2 =", q)
	}

	_, err := divide(1, 0)
	fmt.Println("error was:", err)

	// zero values: nothing is null, everything has a usable default
	var n int
	var s string
	var b bool
	var p *int
	fmt.Printf("%d %q %t %v\\n", n, s, b, p)

	unused := "delete the underscore line below and this won't compile"
	_ = unused
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          'Shorthand when types repeat: func add(a, b int) int.',
          ':= declares and infers; var is for zero values or explicit types.',
          'Unused locals AND unused imports are compile errors. Deliberate, not pedantry.',
          'No ternary operator. No while (for does everything). No do-while.',
        ],
      },
    ],
  },

  {
    id: 'methods',
    n: 2,
    title: 'Methods & receivers',
    nav: 'Methods',
    blurb: 'A method is a function with an extra parameter list glued on the front.',
    blocks: [
      {
        kind: 'p',
        text: 'In Java a method lives inside the class and `this` is invisible. In Go the type and its methods are separate declarations, and the receiver — Go’s `this` — is written explicitly in its own parens before the name. It is the one declaration form with no Java counterpart.',
      },
      {
        kind: 'code',
        caption: 'anatomy',
        code: `func   (c *Counter)   inc   ()
 |          |           |     |
 |          |           |     +-- parameters: none
 |          |           +-- method name
 |          +-- THE RECEIVER = this, named by you, typed explicitly
 +-- keyword`,
      },
      {
        kind: 'run',
        snippet: {
          id: 'methods-receivers',
          title: 'Pointer receiver vs value receiver',
          hint: 'Change `func (c *Counter) Inc()` to `func (c Counter) Inc()` and run again. The counter stops counting — a value receiver gets a copy.',
          code: `package main

import "fmt"

type Counter struct {
	n int
}

// POINTER receiver: can mutate the struct
func (c *Counter) Inc() { c.n++ }

// VALUE receiver: gets a copy, mutations are lost
func (c Counter) Value() int { return c.n }

// structs are VALUE types — assigning copies them
type Point struct{ X, Y int }

func main() {
	c := &Counter{}
	c.Inc()
	c.Inc()
	c.Inc()
	fmt.Println("count:", c.Value())

	p1 := Point{X: 1, Y: 2}
	p2 := p1 // this is a COPY, not an alias (unlike Java)
	p2.X = 99
	fmt.Println(p1, p2)
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          'Use a pointer receiver by default: it can mutate, and it avoids copying the struct.',
          'Be consistent — do not mix value and pointer receivers on the same type.',
          'You can define methods on any named type you own, not just structs: type Celsius float64 can have methods.',
          'type Foo struct{} is a zero-field type. It exists purely to hang methods on and occupies 0 bytes.',
        ],
      },
    ],
  },

  {
    id: 'interfaces',
    n: 3,
    title: 'Implicit interfaces',
    nav: 'Interfaces',
    blurb: 'Interfaces are declared by the consumer, not the producer.',
    blocks: [
      {
        kind: 'p',
        text: 'There is no `implements` keyword. A type satisfies an interface by having the right methods. The consequence is that interfaces get declared where they are used, stay tiny, and can be retrofitted onto types you do not own.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'interfaces-implicit',
          title: 'Nobody says "implements"',
          hint: 'Delete the Speak method from Dog and read the error — that is what a failed implicit satisfaction looks like.',
          code: `package main

import "fmt"

// --- the "library" types: they mention no interface at all ---
type Dog struct{}
type Robot struct{ id int }

func (d Dog) Speak() string   { return "woof" }
func (r Robot) Speak() string { return fmt.Sprintf("beep-%d", r.id) }

// --- the CONSUMER declares the narrow thing it needs ---
type Speaker interface {
	Speak() string
}

func announce(s Speaker) {
	fmt.Println("->", s.Speak())
}

func main() {
	announce(Dog{})
	announce(Robot{id: 7})

	// an interface value holds (concrete type, value) — you can ask which
	var s Speaker = Robot{id: 1}
	if r, ok := s.(Robot); ok {
		fmt.Println("it was a Robot with id", r.id)
	}

	switch v := s.(type) {
	case Dog:
		fmt.Println("dog", v)
	case Robot:
		fmt.Println("robot", v.id)
	}
}`,
        },
      },
      {
        kind: 'p',
        text: 'The stdlib lives on this. io.Writer is one method, and because os.Stdout, a network connection, a file, and a bytes.Buffer all have it, every one of them is a drop-in for the others.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'interfaces-io-writer',
          title: 'One method, and everything composes',
          hint: 'Swap os.Stdout for &buf on the greet call and the same function writes into memory instead of the terminal.',
          code: `package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"strings"
)

// io.Writer is literally: interface { Write(p []byte) (n int, err error) }
func greet(w io.Writer, name string) {
	fmt.Fprintf(w, "hello, %s\\n", name)
}

func main() {
	greet(os.Stdout, "terminal")

	var buf bytes.Buffer
	greet(&buf, "memory")
	fmt.Print("buffer got: ", buf.String())

	var sb strings.Builder
	greet(&sb, "builder")
	fmt.Print("builder got: ", sb.String())
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          'Rule of thumb: accept interfaces, return structs.',
          'Keep interfaces at 1-2 methods. io.Reader has exactly one.',
          'You can wrap a third-party concrete type in your own interface — everything is mockable without the author’s cooperation.',
          'http.Handler is just interface { ServeHTTP(ResponseWriter, *Request) }.',
        ],
      },
    ],
  },

  {
    id: 'closures',
    n: 4,
    title: 'Closures',
    nav: 'Closures',
    blurb: 'Functions are values, they capture variables, and they replace most small classes.',
    blocks: [
      {
        kind: 'p',
        text: 'A closure captures the variable itself, not a copy of it, and keeps it alive after the enclosing function returns. Java forces captured locals to be effectively final; Go does not. This is why Go uses closures where Java would use a small stateful class.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'closures-counter',
          title: 'The closure is the object; captured vars are the fields',
          hint: 'Call counter() twice into two variables — each closure gets its own independent `count`.',
          code: `package main

import "fmt"

func counter() func() int {
	count := 0 // a local... that outlives counter()
	return func() int {
		count++
		return count
	}
}

// config captured once, used on every call — this is a "class" with one field
func multiplier(by int) func(int) int {
	return func(n int) int { return n * by }
}

func main() {
	c := counter()
	fmt.Println(c(), c(), c())

	other := counter()
	fmt.Println("independent:", other())

	triple := multiplier(3)
	fmt.Println(triple(5), triple(10))
}`,
        },
      },
      {
        kind: 'p',
        text: 'Stack three of these and you have the HTTP middleware pattern: an outer function captures config, the middle captures the next handler, and the inner one runs per request.',
      },
      {
        kind: 'code',
        caption: 'three layers, each returning the next',
        code: `func WithTimeout(d time.Duration) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {          // captures d
        return http.HandlerFunc(func(w, r) {               // captures d AND next
            ...                                            // runs per request
        })
    }
}`,
      },
    ],
  },

  {
    id: 'errors',
    n: 5,
    title: 'Errors are values',
    nav: 'Errors',
    blurb: 'No exceptions, no stack unwinding. You return errors and the caller checks them.',
    blocks: [
      {
        kind: 'p',
        text: 'error is an ordinary interface with one method. Nothing is thrown and nothing is caught. The verbosity buys visibility: every failure path appears at the call site, not in a signature you have to go and read.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'errors-wrapping',
          title: 'Wrapping, errors.Is, errors.As',
          hint: 'Swap %w for %v in the fmt.Errorf and watch errors.Is stop matching — %w is what preserves the chain.',
          code: `package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

type ValidationError struct {
	Field string
}

func (e *ValidationError) Error() string {
	return "invalid field: " + e.Field
}

func fetch(id int) error {
	if id == 0 {
		return &ValidationError{Field: "id"}
	}
	if id > 100 {
		// %w WRAPS: the chain is preserved for errors.Is
		return fmt.Errorf("fetching user %d: %w", id, ErrNotFound)
	}
	return nil
}

func main() {
	for _, id := range []int{5, 0, 999} {
		err := fetch(id)
		switch {
		case err == nil:
			fmt.Println(id, "-> ok")
		case errors.Is(err, ErrNotFound):
			fmt.Println(id, "-> sentinel matched:", err)
		default:
			var ve *ValidationError
			if errors.As(err, &ve) {
				fmt.Println(id, "-> validation on field", ve.Field)
			}
		}
	}
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          'if err != nil { return err } is the whole idiom. Wrap with fmt.Errorf("doing x: %w", err) to add context.',
          'errors.Is compares against a sentinel; errors.As extracts a concrete error type.',
          'panic exists but is for programmer bugs (index out of range, nil deref), not control flow.',
          'recover() in a deferred function stops a panic — used at goroutine boundaries in servers, and almost nowhere else.',
        ],
      },
    ],
  },

  {
    id: 'memory',
    n: 6,
    title: 'Memory & escape analysis',
    nav: 'Memory',
    blurb: 'The compiler decides stack vs heap. Perf work in Go means "make this not allocate".',
    blocks: [
      {
        kind: 'p',
        text: 'A value escapes when it outlives the function that created it — you return a pointer to it, store it in an interface, or capture it in a closure that survives. The compiler proves this and moves those values to the heap. In C returning &x is a dangling-pointer bug; in Go it is safe, and merely slower.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'memory-escape',
          title: 'Stack, heap, and value semantics',
          hint: 'Locally you can see the decision with: go build -gcflags=-m main.go',
          code: `package main

import "fmt"

func stackAlloc() int {
	x := 42
	return x // the VALUE is copied out; x dies here -> stack
}

func heapAlloc() *int {
	x := 42
	return &x // a POINTER survives -> x escapes -> heap
}

type Big struct{ data [4]int }

func byValue(b Big)   { b.data[0] = 99 } // mutates a COPY
func byPointer(b *Big) { b.data[0] = 99 } // mutates the original

func main() {
	fmt.Println(stackAlloc(), *heapAlloc())

	b := Big{}
	byValue(b)
	fmt.Println("after byValue:  ", b.data)
	byPointer(&b)
	fmt.Println("after byPointer:", b.data)

	// slices are views: len + cap + pointer to a backing array
	s := make([]int, 0, 2)
	fmt.Printf("len=%d cap=%d\\n", len(s), cap(s))
	s = append(s, 1, 2)
	fmt.Printf("len=%d cap=%d\\n", len(s), cap(s))
	s = append(s, 3) // exceeds cap -> reallocates, new backing array
	fmt.Printf("len=%d cap=%d\\n", len(s), cap(s))
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          "See the decisions: go build -gcflags='-m' ./...",
          'Pointers exist (*T, &x) but there is NO pointer arithmetic. **T is legal and rare.',
          'GC is concurrent mark-sweep tuned for latency (sub-ms pauses), not throughput. Knobs: GOGC, GOMEMLIMIT.',
          'Common escape causes: returning a pointer, storing into an interface, capturing in a surviving closure, values too large for the stack.',
        ],
      },
    ],
  },

  {
    id: 'concurrency',
    n: 7,
    title: 'Goroutines & channels',
    nav: 'Concurrency',
    blurb: 'go f() costs ~2KB. A million of them is normal.',
    blocks: [
      {
        kind: 'p',
        text: 'A goroutine is not an OS thread. The runtime multiplexes them M:N onto a handful of real threads, and their stacks start tiny and grow. This is exactly what Java 21 virtual threads copied — Go has had it since day one, which is why the whole stdlib is written blocking-style.',
      },
      {
        kind: 'code',
        caption: 'reading the syntax',
        code: `func() { process(job) }        // a function literal — a VALUE, not called
func() { process(job) }()      // the trailing () CALLS it
go func() { process(job) }()   // `+'`go`'+` runs that call in a new goroutine`,
      },
      {
        kind: 'run',
        snippet: {
          id: 'concurrency-waitgroup',
          title: 'Goroutines + WaitGroup',
          hint: 'Delete wg.Wait() and run again — main returns and kills every goroutine before they print.',
          code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	results := make([]string, 3)

	for i, job := range []string{"alpha", "beta", "gamma"} {
		wg.Add(1)
		// since Go 1.22 each iteration gets a FRESH i and job.
		// before 1.22 this was the classic capture bug.
		go func() {
			defer wg.Done()
			results[i] = "done:" + job
		}()
	}

	wg.Wait()
	fmt.Println(results)
}`,
        },
      },
      {
        kind: 'run',
        snippet: {
          id: 'concurrency-channels',
          title: 'Channels, select, and context cancellation',
          hint: 'Raise the worker sleep above the 200ms timeout and watch ctx.Done() win the select.',
          code: `package main

import (
	"context"
	"fmt"
	"time"
)

func worker(id int, jobs <-chan int, out chan<- string) {
	for j := range jobs { // ranges until the channel is closed
		time.Sleep(20 * time.Millisecond)
		out <- fmt.Sprintf("worker %d did job %d", id, j)
	}
}

func main() {
	jobs := make(chan int, 5)
	out := make(chan string, 5)

	for w := 1; w <= 3; w++ {
		go worker(w, jobs, out)
	}
	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)

	for i := 0; i < 5; i++ {
		fmt.Println(<-out)
	}

	// select multiplexes: whichever case is ready first wins
	ctx, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
	defer cancel()

	slow := make(chan string)
	go func() {
		time.Sleep(50 * time.Millisecond)
		slow <- "slow work finished"
	}()

	select {
	case msg := <-slow:
		fmt.Println(msg)
	case <-ctx.Done():
		fmt.Println("timed out:", ctx.Err())
	}
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          'chan T is a typed BlockingQueue. make(chan T) is unbuffered (a handoff); make(chan T, n) is buffered.',
          '<-chan T is receive-only, chan<- T is send-only — the arrow in the type is a compile-time direction check.',
          'select waits on several channels at once. With a default case it becomes non-blocking.',
          'context.Context carries deadlines and cancellation down the call tree. By convention it is the first parameter.',
          'go test -race catches real data races. Run it in CI.',
        ],
      },
    ],
  },

  {
    id: 'defer',
    n: 8,
    title: 'defer',
    nav: 'defer',
    blurb: 'finally, but attached to a statement and scoped to the function.',
    blocks: [
      {
        kind: 'run',
        snippet: {
          id: 'defer-order',
          title: 'LIFO order and argument evaluation',
          hint: 'The two prints differ: defer evaluates ARGUMENTS immediately, but a closure reads the variable at call time.',
          code: `package main

import "fmt"

func lifo() {
	for i := 1; i <= 3; i++ {
		defer fmt.Println("deferred", i)
	}
	fmt.Println("function body done")
}

func argsEvaluatedNow() {
	i := 0
	defer fmt.Println("plain defer sees:", i)        // i evaluated NOW -> 0
	defer func() { fmt.Println("closure sees:", i) }() // i read LATER -> 1
	i++
}

func main() {
	lifo()
	fmt.Println("---")
	argsEvaluatedNow()
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          'Runs on normal return, early return, and panic. It is your try-with-resources.',
          'Multiple defers run LIFO.',
          'Arguments are evaluated at the defer statement; the CALL happens at function exit.',
          'Scope is the FUNCTION, not the block — defer inside a loop accumulates and is a classic fd leak. Extract the body into its own function.',
        ],
      },
    ],
  },

  {
    id: 'packages',
    n: 9,
    title: 'Packages, imports & layout',
    nav: 'Packages',
    blurb: 'A package is a directory. Capitalization is the access modifier.',
    blocks: [
      {
        kind: 'code',
        caption: 'a real module',
        code: `myapp/
  go.mod                     module github.com/me/myapp
  cmd/server/main.go         -> go build ./cmd/server   -> ./server
  cmd/migrate/main.go        -> go build ./cmd/migrate  -> ./migrate
  internal/store/store.go    COMPILER-ENFORCED private to this module
  pkg/                       optional, public, often skipped`,
      },
      {
        kind: 'ul',
        items: [
          'A package == a directory. Every .go file in it declares the same package name. No splitting a package across dirs.',
          'Any package named main with a func main() compiles to one binary — one module can produce several.',
          'internal/ is a hardcoded rule in the toolchain, not a convention: only code rooted at its parent may import it.',
          'NO circular imports. The compiler rejects them outright, which forces your dependency graph to be a DAG.',
          'Unused imports are compile errors. goimports (on save) manages them for you.',
          'import _ "net/http/pprof" is a blank import: run its init() for the side effect only.',
          'Inside a package everything sees everything; capitalization only gates access ACROSS packages.',
          'http.ListenAndServe is a package qualifier + function — Go has no statics because package-level funcs already are that.',
        ],
      },
      {
        kind: 'run',
        snippet: {
          id: 'packages-visibility',
          title: 'Capitalization, structs, and the stdlib as namespace',
          hint: 'Rename Name to name and the json output loses the field — encoding/json can only see exported fields.',
          code: `package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type User struct {
	Name  string ` + '`json:"name"`' + `
	Email string ` + '`json:"email"`' + `
	// lowercase = unexported = invisible outside this package AND to encoding/json
	internalScore int
}

func main() {
	u := User{Name: "mde", Email: "mde@example.com", internalScore: 42}

	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	_ = enc.Encode(u)

	// package-level funcs = Java statics
	fmt.Println(strings.ToUpper("strings.ToUpper is Java's StringUtils"))
}`,
        },
      },
    ],
  },

  {
    id: 'debugging',
    n: 10,
    title: 'Debugging & profiling',
    nav: 'Debugging',
    blurb: 'No JFR, no heap dump. pprof instead, served over HTTP from the live process.',
    blocks: [
      {
        kind: 'p',
        text: 'Add one blank import to a server and you get live CPU, heap, goroutine, mutex and block profiles over HTTP. What you lose versus MAT is the object graph: you cannot ask "who holds a reference to this". You infer ownership from the allocation site instead.',
      },
      {
        kind: 'code',
        caption: 'one import, then profile production',
        code: `import _ "net/http/pprof"   // registers handlers on the default mux

go tool pprof http://host:6060/debug/pprof/heap        # memory
go tool pprof http://host:6060/debug/pprof/profile     # 30s CPU
go tool pprof http://host:6060/debug/pprof/goroutine   # leaked goroutines
go tool pprof -http=:8080 <profile>                    # flamegraph in the browser
go tool pprof -base old.pprof new.pprof                # LEAK HUNT: diff two heaps`,
      },
      {
        kind: 'table',
        head: ['need', 'tool'],
        rows: [
          ['breakpoints, stepping', 'dlv (Delve), IDE-integrated'],
          ['CPU / memory hotspots', 'go tool pprof'],
          ['memory leak', 'two heap profiles + pprof -base'],
          ['goroutine leak', '/debug/pprof/goroutine'],
          ['latency timeline (closest to JFR)', 'runtime/trace + go tool trace'],
          ['GC behaviour', 'GODEBUG=gctrace=1'],
          ['data races', 'go test -race'],
          ['post-mortem', 'GOTRACEBACK=crash + dlv core'],
        ],
      },
      {
        kind: 'p',
        text: 'PGO (profile-guided optimization): commit a real production CPU profile as default.pgo next to your main package and go build picks it up automatically — it inlines hot paths harder and devirtualizes interface calls. It is the JIT trick, done at build time from yesterday’s profile. Typical gain 2-14%.',
      },
    ],
  },

  {
    id: 'gotchas',
    n: 11,
    title: 'Gotchas',
    nav: 'Gotchas',
    blurb: 'The failures that compile cleanly and are wrong at runtime.',
    blocks: [
      {
        kind: 'run',
        snippet: {
          id: 'gotchas-nil-interface',
          title: 'The nil interface trap',
          hint: 'An interface value is a pair — (type, value) — and it is nil only when both halves are nil. Here the type half is *MyErr, so the comparison fails.',
          code: `package main

import "fmt"

type MyErr struct{}

func (e *MyErr) Error() string { return "boom" }

// BUG: returns a non-nil interface holding a nil pointer
func broken() error {
	var p *MyErr = nil
	return p
}

func correct() error {
	var p *MyErr = nil
	if p == nil {
		return nil
	}
	return p
}

func main() {
	fmt.Println("broken() == nil ?", broken() == nil) // false! surprising
	fmt.Println("correct() == nil ?", correct() == nil)
	fmt.Printf("broken() is %T holding %v\\n", broken(), broken())
}`,
        },
      },
      {
        kind: 'run',
        snippet: {
          id: 'gotchas-slices',
          title: 'Slices share a backing array',
          hint: 'Append past cap and the aliasing silently stops. That inconsistency is the bug.',
          code: `package main

import "fmt"

func main() {
	original := []int{1, 2, 3, 4, 5}
	view := original[1:3] // len 2, cap 4 — SHARES memory with original

	fmt.Printf("view len=%d cap=%d %v\\n", len(view), cap(view), view)

	view[0] = 99
	fmt.Println("mutating the view changed the original:", original)

	// append within cap writes into the SAME array
	view = append(view, 42)
	fmt.Println("append within cap also wrote through:", original)

	// copy is the safe way to detach
	safe := make([]int, len(original))
	copy(safe, original)
	safe[0] = -1
	fmt.Println(original, safe)

	// maps: the two-value form is Go's Optional
	m := map[string]int{"a": 1}
	if v, ok := m["missing"]; !ok {
		fmt.Println("absent, zero value is", v)
	}
}`,
        },
      },
      {
        kind: 'ul',
        items: [
          'nil interface != nil pointer — an interface is (type, value).',
          'Slices share backing arrays until append exceeds cap. Use copy() or slices.Clone to detach.',
          'defer arguments are evaluated immediately; defer in a loop leaks.',
          'Unused imports and unused locals are compile errors.',
          'Capitalization is visibility — including for encoding/json and reflection.',
          'No circular imports, ever.',
          'internal/ is enforced; pkg/ is just a convention.',
          'Zero values are usable: a var of a struct type is ready to go, but a nil map panics on write.',
          'Range over a map has randomized order, deliberately.',
          'Since Go 1.22 loop variables are per-iteration. Older code and older blog posts assume otherwise.',
          'Struct assignment copies. Method receivers copy unless they are pointers.',
        ],
      },
    ],
  },
]
