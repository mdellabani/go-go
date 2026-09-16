import type { Step } from './types'

export const track: Step[] = [
  {
    id: 'serve',
    n: 1,
    title: 'A server in twelve lines',
    nav: 'First handler',
    problem: 'You have nothing. You need a process that answers HTTP.',
    learns: ['package main', 'func signatures', 'the stdlib is the framework', 'imports'],
    blocks: [
      {
        kind: 'p',
        text: 'There is no framework to install and no application server to deploy into. net/http in the standard library is a production HTTP server — the same one Docker, Kubernetes and Terraform are built on. This is the whole program.',
      },
      {
        kind: 'p',
        text: 'That signature is the entire contract, and it never changes: func hello(w http.ResponseWriter, r *http.Request) takes two parameters and returns nothing. w is where you write the response — it is an interface, so it is already a value you can write to. r is a pointer to the request; a pointer because requests are large and copying one per call would be waste, not because you are going to mutate it.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-serve',
          title: 'Your first handler',
          hint: 'In production the last three lines are one line: http.ListenAndServe(":8080", mux). The sandbox has no network, so we call the mux directly — which is exactly how Go tests drive handlers anyway.',
          code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

// w: where the response goes. r: the incoming request.
// No return value — you write to w instead.
func hello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "hello, world")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /hello", hello)

	// Production:  http.ListenAndServe(":8080", mux)
	// Here: drive the mux in-process, no socket required.
	req := httptest.NewRequest("GET", "/hello", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	fmt.Println("status:", rec.Code)
	fmt.Print("body:   ", rec.Body.String())
}`,
        },
      },
      {
        kind: 'aside',
        tone: 'java',
        text: 'http is not an object you constructed — it is the package name, the way Math is in Math.max. http.NewServeMux() is a package-level function, the direct equivalent of a Java static method. The import line is what brings the name http into scope.',
      },
    ],
  },

  {
    id: 'handler',
    n: 2,
    title: 'The handler is an interface',
    nav: 'Handler interface',
    problem: 'A bare function cannot carry configuration. You need a handler that knows things.',
    learns: ['structs', 'methods and receivers', 'implicit interfaces', 'method sets'],
    blocks: [
      {
        kind: 'p',
        text: 'http.Handler is the whole extension point of Go\'s HTTP stack, and it is one method wide: ServeHTTP(ResponseWriter, *Request). Any type with that method is a handler. There is no registration, no annotation and no base class.',
      },
      {
        kind: 'p',
        text: 'A method is an ordinary function with an extra parameter list in front. In func (g greeter) ServeHTTP(...), the (g greeter) part is the receiver — it is explicit this, and you get to name it and choose whether it is a value or a pointer. Nothing anywhere in this file mentions http.Handler; the compiler checks the method set at the point of assignment.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-handler',
          title: 'A struct that is a handler',
          hint: 'Rename ServeHTTP to Serve and the mux.Handle line stops compiling — that error IS the interface check. Try it.',
          code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

// A plain record. No class, no constructor.
type greeter struct {
	greeting string
}

// (g greeter) is the receiver — Go's explicit "this".
func (g greeter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		name = "world"
	}
	fmt.Fprintf(w, "%s, %s!", g.greeting, name)
}

func main() {
	mux := http.NewServeMux()
	// greeter satisfies http.Handler purely by having ServeHTTP.
	mux.Handle("GET /hi/{name}", greeter{greeting: "bonjour"})

	for _, path := range []string{"/hi/mistral", "/hi/"} {
		req := httptest.NewRequest("GET", path, nil)
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, req)
		fmt.Printf("%-12s -> %d %s\\n", path, rec.Code, rec.Body.String())
	}
}`,
        },
      },
      {
        kind: 'compare',
        caption: 'Declaring that you implement something',
        rows: [
          { java: 'class G implements Handler', rust: 'impl Handler for G', go: '(just write the method)', note: 'no declaration site in Go at all' },
          { java: 'this.greeting', rust: '&self', go: '(g greeter) — you name it', note: 'the receiver is a normal parameter' },
          { java: 'new Greeter("bonjour")', rust: 'Greeter { greeting: ... }', go: 'greeter{greeting: "bonjour"}', note: 'composite literal, no constructor' },
        ],
      },
    ],
  },

  {
    id: 'state',
    n: 3,
    title: 'Give it state (and meet the receiver trap)',
    nav: 'State',
    problem: 'Your handler needs to remember things between requests. Your first attempt will silently do nothing.',
    learns: ['pointer vs value receivers', 'value semantics', 'when to use *T'],
    blocks: [
      {
        kind: 'p',
        text: 'A value receiver gets a copy of the struct. Mutating it mutates the copy, the copy is discarded when the method returns, and nothing happens — with no error and no warning. It is the direct consequence of structs being values rather than references, and no tool in the toolchain will flag it.',
      },
      {
        kind: 'p',
        text: 'Use a pointer receiver if the method mutates the receiver, if the struct is large, or if the type contains a sync.Mutex. Keep it consistent across all methods on a type.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-state',
          title: 'The same handler, twice, one bug',
          hint: 'brokenCounter reports hits=1 forever — each call increments its own copy, then throws it away. Change (c brokenCounter) to (c *brokenCounter) and broken := &brokenCounter{} to fix it.',
          code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type brokenCounter struct{ hits int }

// VALUE receiver: mutates a copy. The increment is thrown away.
func (c brokenCounter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c.hits++
	fmt.Fprintf(w, "hits=%d", c.hits)
}

type workingCounter struct{ hits int }

// POINTER receiver: mutates the original.
func (c *workingCounter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c.hits++
	fmt.Fprintf(w, "hits=%d", c.hits)
}

func hit(h http.Handler) string {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
	return rec.Body.String()
}

func main() {
	broken := brokenCounter{}
	working := &workingCounter{}

	for i := 0; i < 3; i++ {
		fmt.Printf("broken: %-8s working: %s\\n", hit(broken), hit(working))
	}
}`,
        },
      },
      {
        kind: 'aside',
        tone: 'rust',
        text: 'Rust makes you say &self versus &mut self and the compiler stops you writing the broken version. Go lets it compile. The mental model is the same; the safety net is not.',
      },
    ],
  },

  {
    id: 'json',
    n: 4,
    title: 'Speak JSON',
    nav: 'JSON',
    problem: 'Returning strings is a toy. You need to accept and emit structured data.',
    learns: ['struct tags', 'why capitalisation is not style', 'encoding/json', 'slices and maps'],
    blocks: [
      {
        kind: 'p',
        text: 'encoding/json uses reflection, and reflection can only see exported fields. This is the moment capitalisation stops being a style rule and starts being load-bearing: a lowercase field is invisible to the JSON encoder, so it silently will not appear in your output. The struct tag next to the field controls the wire name.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-json',
          title: 'Decode a request, encode a response',
          hint: 'Lowercase the Title field to title and watch it vanish from the output — no error, just gone. That is why exported fields matter here.',
          code: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

// The tag controls the JSON name. The capital letter controls visibility.
type Task struct {
	ID    int    \`json:"id"\`
	Title string \`json:"title"\`
	Done  bool   \`json:"done"\`
	// unexported: invisible to encoding/json, always.
	secret string
}

type api struct {
	tasks []Task
	next  int
}

func (a *api) create(w http.ResponseWriter, r *http.Request) {
	var in Task
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	a.next++
	in.ID = a.next
	a.tasks = append(a.tasks, in)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(in)
}

func (a *api) list(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a.tasks)
}

func main() {
	a := &api{}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /tasks", a.create)
	mux.HandleFunc("GET /tasks", a.list)

	post := httptest.NewRequest("POST", "/tasks",
		strings.NewReader(\`{"title":"learn go","done":false}\`))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, post)
	fmt.Println("POST ->", rec.Code, strings.TrimSpace(rec.Body.String()))

	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest("GET", "/tasks", nil))
	fmt.Println("GET  ->", rec.Code, strings.TrimSpace(rec.Body.String()))
}`,
        },
      },
      {
        kind: 'aside',
        tone: 'java',
        text: 'a.create is a method value — a method bound to its receiver, handed around as a function. It is Java\'s a::create, and it is why HandleFunc accepts it with no wrapper.',
      },
    ],
  },

  {
    id: 'errors',
    n: 5,
    title: 'Errors are values, not control flow',
    nav: 'Errors',
    problem: 'Looking up a missing task must return 404, not crash the process.',
    learns: ['(T, error) returns', 'errors.Is', '%w wrapping', 'sentinel errors'],
    blocks: [
      {
        kind: 'p',
        text: 'There are no exceptions. A function that can fail returns an extra value of type error, and the caller checks it immediately. The upside is that every failure path is visible in the signature; the cost is that the error path is written out longhand, every time.',
      },
      {
        kind: 'p',
        text: 'Wrapping with %w preserves the original error inside a new one, building a chain that carries context without losing identity. errors.Is walks that chain looking for a specific sentinel; errors.As walks it looking for a specific type and extracts it. This is how you map a deep storage failure to an HTTP status at the edge without string-matching.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-errors',
          title: 'A sentinel error, wrapped and recovered',
          hint: 'errors.Is still finds errNotFound through two layers of wrapping. Swap it for err == errNotFound and the 404 becomes a 500.',
          code: `package main

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
)

var errNotFound = errors.New("task not found")

type store struct{ tasks map[int]string }

func (s *store) get(id int) (string, error) {
	t, ok := s.tasks[id]
	if !ok {
		// %w wraps: adds context, keeps identity.
		return "", fmt.Errorf("store.get %d: %w", id, errNotFound)
	}
	return t, nil
}

type api struct{ s *store }

func (a *api) show(w http.ResponseWriter, r *http.Request) {
	title, err := a.s.get(1)
	if err != nil {
		// errors.Is walks the whole wrap chain.
		if errors.Is(err, errNotFound) {
			http.Error(w, "no such task", http.StatusNotFound)
			return
		}
		http.Error(w, "internal", http.StatusInternalServerError)
		return
	}
	fmt.Fprint(w, title)
}

func main() {
	full := &api{s: &store{tasks: map[int]string{1: "learn go"}}}
	empty := &api{s: &store{tasks: map[int]string{}}}

	for name, a := range map[string]*api{"found": full, "missing": empty} {
		rec := httptest.NewRecorder()
		a.show(rec, httptest.NewRequest("GET", "/tasks/1", nil))
		fmt.Printf("%-8s -> %d\\n", name, rec.Code)
	}

	_, err := empty.s.get(42)
	fmt.Println("chain:", err)
	fmt.Println("is errNotFound:", errors.Is(err, errNotFound))
}`,
        },
      },
      {
        kind: 'compare',
        caption: 'Failure',
        rows: [
          { java: 'throw new NotFoundException()', rust: 'Err(NotFound)', go: 'return nil, errNotFound', note: 'Go is closer to Rust than to Java' },
          { java: 'try / catch / finally', rust: '? operator', go: 'if err != nil { return }', note: 'Go has no ? — the verbosity is deliberate' },
          { java: 'catch (NotFoundException e)', rust: 'matches!(e, NotFound)', go: 'errors.Is(err, errNotFound)', note: 'identity through the wrap chain' },
          { java: 'instanceof + cast', rust: 'downcast_ref', go: 'errors.As(err, &target)', note: 'extract a typed error' },
          { java: 'stack trace for free', rust: 'no trace by default', go: 'no trace — you add context', note: 'wrap at each layer instead' },
        ],
      },
    ],
  },

  {
    id: 'defer',
    n: 6,
    title: 'defer, and the cleanup you keep forgetting',
    nav: 'defer',
    problem: 'Request bodies and files leak unless you close them on every return path.',
    learns: ['defer', 'LIFO order', 'when arguments are evaluated'],
    blocks: [
      {
        kind: 'p',
        text: 'defer schedules a call to run when the surrounding function returns — by any path, including a panic. It is finally, but attached to a statement instead of a block, so the cleanup sits on the line after the acquisition where you can see that they match.',
      },
      {
        kind: 'p',
        text: 'Deferred calls run last-in-first-out, and their arguments are evaluated at the moment you write defer, not when the call runs — so defer fmt.Println(i) captures i as it is right now, while defer func(){ fmt.Println(i) }() reads it later.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-defer',
          title: 'LIFO order and evaluation time',
          hint: 'Both loops look identical. The first prints 2 1 0 (values captured at defer time), the second prints 3 3 3 (the closure reads i at the end).',
          code: `package main

import "fmt"

func lifo() {
	fmt.Print("args evaluated now: ")
	for i := 0; i < 3; i++ {
		defer fmt.Print(i, " ")
	}
}

func closures() {
	fmt.Print("closure reads later: ")
	i := 0
	for ; i < 3; i++ {
		defer func() { fmt.Print(i, " ") }()
	}
}

func main() {
	lifo()
	fmt.Println()
	closures()
	fmt.Println()
}`,
        },
      },
      {
        kind: 'code',
        caption: 'What it looks like in the handler',
        code: `func (a *api) create(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()   // runs on every return path below

	var in Task
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return             // body still closed
	}
	// ...
}`,
      },
      {
        kind: 'aside',
        tone: 'warn',
        text: 'defer is function-scoped, not block-scoped. A defer inside a for loop does not run at the end of the iteration — it piles up until the function returns. Opening files in a loop with defer inside it is a classic file-descriptor leak.',
      },
    ],
  },

  {
    id: 'race',
    n: 7,
    title: 'It is already concurrent, and you already have a bug',
    nav: 'Data race',
    problem: 'net/http runs every request in its own goroutine. Your shared counter is unsynchronised right now.',
    learns: ['shared state', 'sync.Mutex', 'go test -race'],
    blocks: [
      {
        kind: 'p',
        text: 'Nobody told you to make the server concurrent — it already is. http.Server calls your handler on a new goroutine per request. Every field your handler touches is therefore shared mutable state, and the counter from step 3 has a data race that will corrupt counts under load and will never show up on your laptop.',
      },
      {
        kind: 'p',
        text: 'The fix is a sync.Mutex sitting next to the data it protects. Note what it is not: there is no synchronized keyword and no lock object to look up. It is a struct field with a zero value that is already usable, locked and unlocked explicitly, conventionally with defer.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-race',
          title: 'A counter that survives 1000 concurrent requests',
          hint: 'Delete the two mutex lines and Run: the total drops below 1000. Those are lost updates, and the playground scheduler is deterministic so you get the same wrong number every time. On real hardware it changes every run, which is why -race exists.',
          code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
)

type counter struct {
	mu   sync.Mutex // zero value is ready to use — no initialisation
	hits int
}

func (c *counter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.hits++
	fmt.Fprintf(w, "%d", c.hits)
}

func main() {
	c := &counter{}

	var wg sync.WaitGroup
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil))
		}()
	}
	wg.Wait()

	fmt.Println("expected: 1000")
	fmt.Println("actual:  ", c.hits)
}`,
        },
      },
      {
        kind: 'code',
        caption: 'The command that finds these',
        code: `go test -race ./...     # run the suite with the race detector
go run -race ./cmd/server

# It instruments memory access and reports the two goroutines,
# with stacks, that touched the same address without synchronisation.
# ~10x slower. Run it in CI, not in production.`,
      },
      {
        kind: 'aside',
        tone: 'rust',
        text: 'This is the clearest place Rust is stronger: the borrow checker makes this bug unrepresentable, and Mutex<T> makes the lock own the data so you cannot read the field without taking the lock. Go puts them next to each other and trusts you, then ships a detector for when that trust fails.',
      },
    ],
  },

  {
    id: 'workers',
    n: 8,
    title: 'Work you do not want in the request path',
    nav: 'Workers',
    problem: 'Sending an email should not make the client wait 800ms.',
    learns: ['goroutines', 'channels', 'buffering', 'graceful shutdown'],
    blocks: [
      {
        kind: 'p',
        text: 'go f() starts a goroutine and returns immediately. A channel is a typed, synchronised queue — Go\'s BlockingQueue — and it is the normal way to hand work between goroutines. A buffered channel accepts up to its capacity without a receiver waiting, which is what gives you a work queue.',
      },
      {
        kind: 'p',
        text: 'Whoever sends on a channel is responsible for closing it, and ranging over a channel ends when it closes. Fire-and-forget goroutines with no coordination are how you lose work at shutdown.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-workers',
          title: 'Hand off to a background worker and drain it',
          hint: 'The handler returns immediately. close(jobs) then wg.Wait() is the graceful-shutdown pattern — stop accepting, then finish what is queued.',
          code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
)

type api struct{ jobs chan string }

func (a *api) send(w http.ResponseWriter, r *http.Request) {
	// Buffered, so this does not block the request.
	a.jobs <- r.PathValue("to")
	w.WriteHeader(http.StatusAccepted)
	fmt.Fprint(w, "queued")
}

func main() {
	a := &api{jobs: make(chan string, 16)}

	var wg sync.WaitGroup
	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			// Ranging over a channel ends when it is closed.
			for to := range a.jobs {
				fmt.Printf("worker %d sent mail to %s\\n", id, to)
			}
		}(w)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /mail/{to}", a.send)

	for _, to := range []string{"ana", "ben", "cleo"} {
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, httptest.NewRequest("POST", "/mail/"+to, nil))
		fmt.Println("handler returned:", rec.Code, rec.Body.String())
	}

	close(a.jobs) // no more work
	wg.Wait()     // let the workers drain
	fmt.Println("shut down cleanly")
}`,
        },
      },
    ],
  },

  {
    id: 'context',
    n: 9,
    title: 'context: deadlines that propagate',
    nav: 'context',
    problem: 'A slow database call should not hold a request open forever, and cancelling it must reach every layer.',
    learns: ['context.Context', 'WithTimeout', 'select', 'ctx.Done()'],
    blocks: [
      {
        kind: 'p',
        text: 'Every *http.Request carries a Context that is cancelled when the client disconnects. By convention it is passed explicitly as the first parameter of every function that does I/O — ctx context.Context — all the way down to the database driver. Cancellation therefore appears in the signature of every function that can be cancelled, instead of hiding in a ThreadLocal.',
      },
      {
        kind: 'p',
        text: 'select waits on several channel operations and takes whichever is ready first. Pairing a work channel against ctx.Done() is the standard shape for "do this, but give up if the caller has stopped caring".',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-context',
          title: 'The handler gives up before the work finishes',
          hint: 'The query takes 100ms, the deadline is 30ms, so the request 504s while the goroutine is abandoned. Raise the timeout above 100ms and it returns data instead.',
          code: `package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"time"
)

// Every I/O function takes ctx first. That is the convention.
func slowQuery(ctx context.Context) (string, error) {
	done := make(chan string, 1)
	go func() {
		time.Sleep(100 * time.Millisecond)
		done <- "42 rows"
	}()

	select {
	case v := <-done:
		return v, nil
	case <-ctx.Done():
		return "", ctx.Err() // context deadline exceeded
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Millisecond)
	defer cancel() // always cancel, or you leak the timer

	rows, err := slowQuery(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusGatewayTimeout)
		return
	}
	fmt.Fprint(w, rows)
}

func main() {
	rec := httptest.NewRecorder()
	handler(rec, httptest.NewRequest("GET", "/report", nil))
	fmt.Println("status:", rec.Code)
	fmt.Println("body:  ", rec.Body.String())
}`,
        },
      },
      {
        kind: 'compare',
        caption: 'Cancellation',
        rows: [
          { java: 'Future.cancel(true) / interrupt', rust: 'CancellationToken, drop the future', go: 'ctx, cancel := WithCancel(...)', note: 'Go makes it a parameter, not a thread property' },
          { java: 'ThreadLocal request scope', rust: 'task-local', go: 'ctx passed explicitly', note: 'verbose on purpose — it is greppable' },
          { java: '@Timeout annotation', rust: 'tokio::time::timeout', go: 'context.WithTimeout', note: 'no magic, no proxy object' },
        ],
      },
    ],
  },

  {
    id: 'middleware',
    n: 10,
    title: 'Middleware is just a closure',
    nav: 'Middleware',
    problem: 'You need logging and timing on every route without editing every handler.',
    learns: ['functions as values', 'closures', 'http.HandlerFunc', 'wrapping'],
    blocks: [
      {
        kind: 'p',
        text: 'Middleware in Go is a function that takes an http.Handler and returns a different http.Handler. That is the entire concept — no filter chain, no annotation, no container. Decompose the signature: func withLogging(next http.Handler) http.Handler takes one parameter called next of interface type http.Handler, and returns a value of that same interface type.',
      },
      {
        kind: 'p',
        text: 'The returned handler is a closure. It captures next — and anything else in scope, like a logger or a config value — and keeps it alive for as long as the handler exists. http.HandlerFunc is the adapter that turns a bare function into an http.Handler: it is a named function type that has a ServeHTTP method defined on it, so the function value is its own implementation.',
      },
      {
        kind: 'run',
        snippet: {
          id: 'step-middleware',
          title: 'Two layers of wrapping, applied once',
          hint: 'The output shows the order: outer middleware starts first and finishes last, exactly like a call stack. statusRecorder exists because ResponseWriter will not tell you what status was written.',
          code: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"time"
)

// Takes a handler, returns a handler. That is all middleware is.
func withLogging(next http.Handler) http.Handler {
	// HandlerFunc adapts a plain func into an http.Handler.
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("--> %s %s\\n", r.Method, r.URL.Path)
		next.ServeHTTP(w, r) // the closure captured next
		fmt.Printf("<-- %s %s\\n", r.Method, r.URL.Path)
	})
}

// Middleware can capture configuration too.
func withTimeoutHeader(d time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Timeout", d.String())
			next.ServeHTTP(w, r)
		})
	}
}

func main() {
	var app http.Handler = http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			fmt.Fprint(w, "the real work")
		})

	app = withTimeoutHeader(2 * time.Second)(app)
	app = withLogging(app)

	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, httptest.NewRequest("GET", "/work", nil))

	fmt.Println("status: ", rec.Code)
	fmt.Println("header: ", rec.Header().Get("X-Timeout"))
	fmt.Println("body:   ", rec.Body.String())
}`,
        },
      },
      {
        kind: 'aside',
        tone: 'java',
        text: 'This replaces the Spring filter chain, most annotations, and a good deal of aspect-oriented machinery with ordinary function composition you can read top to bottom. There is no container deciding order — the order is the order you wrote the wrapping in.',
      },
    ],
  },

  {
    id: 'ship',
    n: 11,
    title: 'Ship it',
    nav: 'Ship it',
    problem: 'It works on your machine. Now make it a binary, a test suite, and something you can profile in production.',
    learns: ['go build', 'table-driven tests', 'pprof', 'container settings'],
    blocks: [
      {
        kind: 'p',
        text: 'Testing is in the standard library and tests live next to the code they test, in the same package, which means they can reach unexported identifiers. The idiomatic shape is table-driven: a slice of cases, one loop, subtests via t.Run. httptest is the same tool you have been using all the way through this track — those snippets were already tests, just without the harness.',
      },
      {
        kind: 'code',
        caption: 'handler_test.go, sitting next to handler.go',
        code: `package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGreeter(t *testing.T) {
	cases := []struct {
		name string
		path string
		want int
	}{
		{"ok", "/hi/ana", http.StatusOK},
		{"missing name", "/hi/", http.StatusNotFound},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			newMux().ServeHTTP(rec, httptest.NewRequest("GET", tc.path, nil))
			if rec.Code != tc.want {
				t.Errorf("got %d, want %d", rec.Code, tc.want)
			}
		})
	}
}`,
      },
      {
        kind: 'code',
        caption: 'Build and profile',
        code: `# one static binary, no runtime on the host
CGO_ENABLED=0 go build -ldflags="-s -w" -o server ./cmd/server

# cross-compile from anywhere to anywhere
GOOS=linux GOARCH=arm64 go build ./cmd/server

# profiling: import _ "net/http/pprof" and expose it on an internal port
go tool pprof   http://localhost:6060/debug/pprof/profile?seconds=30   # CPU
go tool pprof   http://localhost:6060/debug/pprof/heap                 # memory
go tool trace   trace.out                                             # scheduler

# allocations per operation — the number that matters for Go perf work
go test -bench=. -benchmem ./...`,
      },
      {
        kind: 'ul',
        items: [
          'Always set GOMEMLIMIT in a container. The GC sizes itself against what it believes is available, and without it the runtime does not know about your cgroup limit.',
          'Go 1.25 made the runtime cgroup-aware for GOMAXPROCS; on older versions set it explicitly or use automaxprocs, or you will get one thread per host core inside a 2-core container.',
          'There is no heap dump and no JFR. You get pprof profiles instead — CPU, heap, goroutine, block, mutex — and they are sampled, cheap enough to leave enabled, and better than JFR for finding allocation sources. What you give up is the object graph: you cannot ask "what is holding a reference to this".',
          'A goroutine profile is the closest thing to a thread dump, and it is usually the first thing to look at when a service hangs.',
        ],
      },
      {
        kind: 'compare',
        caption: 'Operating it',
        rows: [
          { java: 'JFR / async-profiler', rust: 'perf / flamegraph', go: 'pprof (built in)', note: 'no agent, no flags, always available' },
          { java: 'MAT heap dump, object graph', rust: '(n/a)', go: 'heap profile, no graph', note: 'the one real capability you lose' },
          { java: 'jstack thread dump', rust: '(n/a)', go: 'goroutine profile', note: 'first stop for a hang' },
          { java: '-Xmx4g', rust: '(n/a)', go: 'GOMEMLIMIT=4GiB', note: 'soft limit, GC targets it' },
          { java: 'JMH', rust: 'criterion', go: 'go test -bench', note: 'built in, reports B/op and allocs/op' },
        ],
      },
    ],
  },
]
