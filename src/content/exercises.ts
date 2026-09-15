import type { Challenge, DocLink } from './types'

export type Exercise = { docs: DocLink[]; challenge: Challenge }

export const exercises: Record<string, Exercise> = {
  serve: {
    docs: [
      { label: 'net/http', href: 'https://pkg.go.dev/net/http', note: 'the whole HTTP stack' },
      { label: 'http.NewServeMux', href: 'https://pkg.go.dev/net/http#NewServeMux', note: 'the router' },
      { label: 'ServeMux.HandleFunc', href: 'https://pkg.go.dev/net/http#ServeMux.HandleFunc', note: 'register a func' },
      { label: 'http.ListenAndServe', href: 'https://pkg.go.dev/net/http#ListenAndServe', note: 'bind a port (not in the sandbox)' },
      { label: 'fmt.Fprintln', href: 'https://pkg.go.dev/fmt#Fprintln', note: 'write to any io.Writer' },
      { label: 'httptest.NewRecorder', href: 'https://pkg.go.dev/net/http/httptest#NewRecorder', note: 'capture a response' },
    ],
    challenge: {
      id: 'ex-serve',
      prompt:
        'The health handler is written but never registered, so the request 404s. Register it for GET /health.',
      expected: 'status: 200\nbody:   ok',
      starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func health(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}

func main() {
	mux := http.NewServeMux()

	// TODO: register health so that GET /health reaches it.

	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	fmt.Println("status:", rec.Code)
	fmt.Println("body:  ", rec.Body.String())
}`,
      solution: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func health(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", health)

	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	fmt.Println("status:", rec.Code)
	fmt.Println("body:  ", rec.Body.String())
}`,
    },
  },

  handler: {
    docs: [
      { label: 'http.Handler', href: 'https://pkg.go.dev/net/http#Handler', note: 'the one-method interface' },
      { label: 'ServeMux.Handle', href: 'https://pkg.go.dev/net/http#ServeMux.Handle', note: 'register a Handler' },
      { label: 'Request.PathValue', href: 'https://pkg.go.dev/net/http#Request.PathValue', note: 'read a {wildcard}' },
      { label: 'fmt.Fprintf', href: 'https://pkg.go.dev/fmt#Fprintf', note: 'formatted write' },
      { label: 'Method sets (spec)', href: 'https://go.dev/ref/spec#Method_sets', note: 'what satisfies an interface' },
    ],
    challenge: {
      id: 'ex-handler',
      prompt:
        'farewell is registered as an http.Handler, so its ServeHTTP already compiles — it just writes nothing. Fill in the body so it responds with the message and the name from the URL.',
      expected: '200 goodbye, ana!',
      starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type farewell struct{ msg string }

func (f farewell) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// TODO: write "<msg>, <name>!" — the name comes from r.PathValue("name")
	_ = fmt.Sprint
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("GET /bye/{name}", farewell{msg: "goodbye"})

	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest("GET", "/bye/ana", nil))
	fmt.Println(rec.Code, rec.Body.String())
}`,
      solution: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type farewell struct{ msg string }

func (f farewell) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "%s, %s!", f.msg, r.PathValue("name"))
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("GET /bye/{name}", farewell{msg: "goodbye"})

	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, httptest.NewRequest("GET", "/bye/ana", nil))
	fmt.Println(rec.Code, rec.Body.String())
}`,
    },
  },

  state: {
    docs: [
      { label: 'Method declarations (spec)', href: 'https://go.dev/ref/spec#Method_declarations', note: 'receivers' },
      { label: 'Pointers (Tour)', href: 'https://go.dev/tour/moretypes/1', note: 'value vs pointer' },
      { label: 'Effective Go: receivers', href: 'https://go.dev/doc/effective_go#pointers_vs_values', note: 'which to pick' },
    ],
    challenge: {
      id: 'ex-state',
      prompt:
        'This counter reports hits=1 on every request instead of counting up. Make the count persist. Two things need changing, not one.',
      expected: 'hits=1\nhits=2\nhits=3',
      starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type counter struct{ hits int }

// TODO: this mutates a copy. Fix the receiver.
func (c counter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c.hits++
	fmt.Fprintf(w, "hits=%d", c.hits)
}

func main() {
	// TODO: and fix what gets registered here.
	var h http.Handler = counter{}

	for i := 0; i < 3; i++ {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
		fmt.Println(rec.Body.String())
	}
}`,
      solution: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type counter struct{ hits int }

// Pointer receiver: mutates the original, not a copy.
func (c *counter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c.hits++
	fmt.Fprintf(w, "hits=%d", c.hits)
}

func main() {
	// &counter{} — the method set of *counter is what satisfies http.Handler.
	var h http.Handler = &counter{}

	for i := 0; i < 3; i++ {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
		fmt.Println(rec.Body.String())
	}
}`,
    },
  },

  json: {
    docs: [
      { label: 'encoding/json', href: 'https://pkg.go.dev/encoding/json', note: 'the serialiser' },
      { label: 'json.Marshal', href: 'https://pkg.go.dev/encoding/json#Marshal', note: 'struct → bytes' },
      { label: 'json.NewDecoder', href: 'https://pkg.go.dev/encoding/json#NewDecoder', note: 'stream → struct' },
      { label: 'reflect.StructTag', href: 'https://pkg.go.dev/reflect#StructTag', note: 'the tag syntax itself' },
      { label: 'http.Error', href: 'https://pkg.go.dev/net/http#Error', note: 'status + message' },
    ],
    challenge: {
      id: 'ex-json',
      prompt:
        'This encodes to {} — the fields are invisible to encoding/json. Fix the struct so it emits the expected JSON. Remember the wire names are lowercase.',
      expected: '{"id":7,"title":"ship it"}',
      starter: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
)

// TODO: reflection cannot see these. Make them visible and name them on the wire.
type task struct {
	id    int
	title string
}

func show(w http.ResponseWriter, r *http.Request) {
	t := task{id: 7, title: "ship it"}
	json.NewEncoder(w).Encode(t)
}

func main() {
	rec := httptest.NewRecorder()
	show(rec, httptest.NewRequest("GET", "/task", nil))
	fmt.Print(rec.Body.String())
}`,
      solution: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
)

// Capital letter = exported = visible to reflection. Tag = the wire name.
type task struct {
	ID    int    \`json:"id"\`
	Title string \`json:"title"\`
}

func show(w http.ResponseWriter, r *http.Request) {
	t := task{ID: 7, Title: "ship it"}
	json.NewEncoder(w).Encode(t)
}

func main() {
	rec := httptest.NewRecorder()
	show(rec, httptest.NewRequest("GET", "/task", nil))
	fmt.Print(rec.Body.String())
}`,
    },
  },

  errors: {
    docs: [
      { label: 'errors', href: 'https://pkg.go.dev/errors', note: 'the whole package is small' },
      { label: 'errors.Is', href: 'https://pkg.go.dev/errors#Is', note: 'identity through the chain' },
      { label: 'errors.As', href: 'https://pkg.go.dev/errors#As', note: 'extract a typed error' },
      { label: 'fmt.Errorf', href: 'https://pkg.go.dev/fmt#Errorf', note: '%w is what wraps' },
      { label: 'Go blog: wrapping', href: 'https://go.dev/blog/go1.13-errors', note: 'why %w exists' },
    ],
    challenge: {
      id: 'ex-errors',
      prompt:
        'The handler returns 500 when it should return 404: errors.Is cannot find the sentinel. One verb is wrong. Find it.',
      expected: 'status: 404\nis errNotFound: true',
      starter: `package main

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
)

var errNotFound = errors.New("task not found")

func get(id int) (string, error) {
	if id != 1 {
		// TODO: this formats the error but breaks the chain.
		return "", fmt.Errorf("get %d: %v", id, errNotFound)
	}
	return "learn go", nil
}

func show(w http.ResponseWriter, r *http.Request) {
	_, err := get(42)
	if errors.Is(err, errNotFound) {
		http.Error(w, "no such task", http.StatusNotFound)
		return
	}
	http.Error(w, "internal", http.StatusInternalServerError)
}

func main() {
	rec := httptest.NewRecorder()
	show(rec, httptest.NewRequest("GET", "/tasks/42", nil))
	fmt.Println("status:", rec.Code)

	_, err := get(42)
	fmt.Println("is errNotFound:", errors.Is(err, errNotFound))
}`,
      solution: `package main

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
)

var errNotFound = errors.New("task not found")

func get(id int) (string, error) {
	if id != 1 {
		// %w wraps: keeps the sentinel reachable by errors.Is.
		return "", fmt.Errorf("get %d: %w", id, errNotFound)
	}
	return "learn go", nil
}

func show(w http.ResponseWriter, r *http.Request) {
	_, err := get(42)
	if errors.Is(err, errNotFound) {
		http.Error(w, "no such task", http.StatusNotFound)
		return
	}
	http.Error(w, "internal", http.StatusInternalServerError)
}

func main() {
	rec := httptest.NewRecorder()
	show(rec, httptest.NewRequest("GET", "/tasks/42", nil))
	fmt.Println("status:", rec.Code)

	_, err := get(42)
	fmt.Println("is errNotFound:", errors.Is(err, errNotFound))
}`,
    },
  },

  defer: {
    docs: [
      { label: 'Defer statements (spec)', href: 'https://go.dev/ref/spec#Defer_statements', note: 'the exact rules' },
      { label: 'Go blog: defer', href: 'https://go.dev/blog/defer-panic-and-recover', note: 'defer, panic, recover' },
      { label: 'Request.Body', href: 'https://pkg.go.dev/net/http#Request', note: 'the thing you must close' },
    ],
    challenge: {
      id: 'ex-defer',
      prompt:
        'Three resources are opened but never closed. Add one line so they close in reverse order, after the work is done.',
      expected: 'open 1\nopen 2\nopen 3\nwork done\nclose 3\nclose 2\nclose 1',
      starter: `package main

import "fmt"

func main() {
	for i := 1; i <= 3; i++ {
		fmt.Println("open", i)
		// TODO: schedule the matching close, without moving it to the bottom
	}

	fmt.Println("work done")
}`,
      solution: `package main

import "fmt"

func main() {
	for i := 1; i <= 3; i++ {
		fmt.Println("open", i)
		// Arguments evaluate NOW, so each defer captures its own i.
		// They run LIFO when main returns — after "work done".
		defer fmt.Println("close", i)
	}

	fmt.Println("work done")
}`,
    },
  },

  race: {
    docs: [
      { label: 'sync.Mutex', href: 'https://pkg.go.dev/sync#Mutex', note: 'zero value is unlocked' },
      { label: 'sync.RWMutex', href: 'https://pkg.go.dev/sync#RWMutex', note: 'many readers, one writer' },
      { label: 'sync/atomic', href: 'https://pkg.go.dev/sync/atomic', note: 'for a single counter' },
      { label: 'Race detector', href: 'https://go.dev/doc/articles/race_detector', note: 'go test -race' },
      { label: 'Go memory model', href: 'https://go.dev/ref/mem', note: 'what "synchronised" means' },
    ],
    challenge: {
      id: 'ex-race',
      prompt:
        'This counter is written from 1000 goroutines with no synchronisation. Run it before you change anything: the total comes out under 1000. Those missing increments are lost updates — a real data race, visible. Now add a mutex so it reaches 1000. (The playground scheduler is deterministic, so the wrong answer is the same every run. On real hardware it changes every time, which is exactly what makes races so hard to catch — hence go test -race.)',
      expected: 'total: 1000',
      starter: `package main

import (
	"fmt"
	"sync"
)

type counter struct {
	// TODO: add the thing that protects hits
	hits int
}

func (c *counter) inc() {
	// TODO: guard this
	c.hits++
}

func main() {
	c := &counter{}

	var wg sync.WaitGroup
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.inc()
		}()
	}
	wg.Wait()

	fmt.Println("total:", c.hits)
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

type counter struct {
	mu   sync.Mutex // sits next to the data it protects
	hits int
}

func (c *counter) inc() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.hits++
}

func main() {
	c := &counter{}

	var wg sync.WaitGroup
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.inc()
		}()
	}
	wg.Wait()

	fmt.Println("total:", c.hits)
}`,
    },
  },

  workers: {
    docs: [
      { label: 'sync.WaitGroup', href: 'https://pkg.go.dev/sync#WaitGroup', note: 'Add / Done / Wait' },
      { label: 'Channels (spec)', href: 'https://go.dev/ref/spec#Channel_types', note: 'chan T' },
      { label: 'close', href: 'https://pkg.go.dev/builtin#close', note: 'ends a range over a channel' },
      { label: 'Effective Go: channels', href: 'https://go.dev/doc/effective_go#channels', note: 'idiomatic patterns' },
      { label: 'Server.Shutdown', href: 'https://pkg.go.dev/net/http#Server.Shutdown', note: 'graceful stop' },
    ],
    challenge: {
      id: 'ex-workers',
      prompt:
        'Jobs are queued and the channel is closed, but nothing consumes them. Start one worker goroutine that drains the channel, and make main wait for it before printing "done".',
      expected: 'sent to ana\nsent to ben\ndone',
      starter: `package main

import (
	"fmt"
	"sync"
)

func main() {
	jobs := make(chan string, 4)

	var wg sync.WaitGroup
	// TODO: start a worker that ranges over jobs and prints "sent to <name>".
	// Remember to wg.Add(1) before it starts and defer wg.Done() inside it.

	for _, to := range []string{"ana", "ben"} {
		jobs <- to
	}
	close(jobs)

	wg.Wait()
	fmt.Println("done")
}`,
      solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	jobs := make(chan string, 4)

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		// range ends when the channel is closed and drained.
		for to := range jobs {
			fmt.Println("sent to", to)
		}
	}()

	for _, to := range []string{"ana", "ben"} {
		jobs <- to
	}
	close(jobs)

	wg.Wait()
	fmt.Println("done")
}`,
    },
  },

  context: {
    docs: [
      { label: 'context', href: 'https://pkg.go.dev/context', note: 'the whole package' },
      { label: 'context.WithTimeout', href: 'https://pkg.go.dev/context#WithTimeout', note: 'always defer cancel()' },
      { label: 'Context.Done', href: 'https://pkg.go.dev/context#Context', note: 'a channel that closes' },
      { label: 'Request.Context', href: 'https://pkg.go.dev/net/http#Request.Context', note: 'cancelled on disconnect' },
      { label: 'Select (spec)', href: 'https://go.dev/ref/spec#Select_statements', note: 'first ready wins' },
    ],
    challenge: {
      id: 'ex-context',
      prompt:
        'The query takes 100ms and the deadline is 30ms, but slow() ignores the context and blocks anyway — so the handler returns 200 late instead of 504 on time. Make it give up when the context does.',
      expected: 'status: 504\nbody:   context deadline exceeded',
      starter: `package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"time"
)

func slow(ctx context.Context) (string, error) {
	done := make(chan string, 1)
	go func() {
		time.Sleep(100 * time.Millisecond)
		done <- "42 rows"
	}()

	// TODO: wait for done OR for ctx to be cancelled, whichever happens first.
	// On cancellation, return ctx.Err().
	return <-done, nil
}

func handler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Millisecond)
	defer cancel()

	rows, err := slow(ctx)
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
      solution: `package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"time"
)

func slow(ctx context.Context) (string, error) {
	done := make(chan string, 1)
	go func() {
		time.Sleep(100 * time.Millisecond)
		done <- "42 rows"
	}()

	select {
	case v := <-done:
		return v, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Millisecond)
	defer cancel()

	rows, err := slow(ctx)
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

  middleware: {
    docs: [
      { label: 'http.HandlerFunc', href: 'https://pkg.go.dev/net/http#HandlerFunc', note: 'func → Handler adapter' },
      { label: 'http.Handler', href: 'https://pkg.go.dev/net/http#Handler', note: 'what you wrap' },
      { label: 'Function types (spec)', href: 'https://go.dev/ref/spec#Function_types', note: 'funcs are values' },
      { label: 'log/slog', href: 'https://pkg.go.dev/log/slog', note: 'structured logging' },
    ],
    challenge: {
      id: 'ex-middleware',
      prompt:
        'withTiming currently passes the handler straight through. Make it wrap: print "start" before the inner handler runs and "end" after, without touching the handler itself.',
      expected: 'start\nthe real work\nend',
      starter: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func withTiming(next http.Handler) http.Handler {
	// TODO: return a handler that prints "start", calls next, then prints "end".
	// http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { ... })
	// adapts a plain func into an http.Handler.
	return next
}

func main() {
	var app http.Handler = http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			fmt.Println("the real work")
		})

	app = withTiming(app)

	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
}`,
      solution: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

func withTiming(next http.Handler) http.Handler {
	// The returned closure captures next and keeps it alive.
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("start")
		next.ServeHTTP(w, r)
		fmt.Println("end")
	})
}

func main() {
	var app http.Handler = http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			fmt.Println("the real work")
		})

	app = withTiming(app)

	rec := httptest.NewRecorder()
	app.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
}`,
    },
  },

  ship: {
    docs: [
      { label: 'testing', href: 'https://pkg.go.dev/testing', note: 'T, B, subtests' },
      { label: 'net/http/httptest', href: 'https://pkg.go.dev/net/http/httptest', note: 'what this site runs on' },
      { label: 'net/http/pprof', href: 'https://pkg.go.dev/net/http/pprof', note: 'import _ to expose it' },
      { label: 'runtime/debug.SetMemoryLimit', href: 'https://pkg.go.dev/runtime/debug#SetMemoryLimit', note: 'GOMEMLIMIT in code' },
      { label: 'go build', href: 'https://pkg.go.dev/cmd/go#hdr-Compile_packages_and_dependencies', note: 'all the flags' },
      { label: 'Effective Go', href: 'https://go.dev/doc/effective_go', note: 'read once, properly' },
    ],
    challenge: {
      id: 'ex-ship',
      prompt:
        'Middleware cannot see what status the inner handler wrote — ResponseWriter has no getter. Finish statusRecorder so it remembers the code. It embeds http.ResponseWriter, so it already IS one; you only need to intercept the write.',
      expected: 'handler wrote: 418',
      starter: `package main

import (
	"net/http"
	"net/http/httptest"
	"fmt"
)

type statusRecorder struct {
	http.ResponseWriter // embedded: forwards every method you do not define
	status int
}

// TODO: define WriteHeader on *statusRecorder so it records the code
// and still forwards to the embedded ResponseWriter.

func main() {
	var app http.Handler = http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusTeapot)
		})

	rec := &statusRecorder{ResponseWriter: httptest.NewRecorder()}
	app.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))

	fmt.Println("handler wrote:", rec.status)
}`,
      solution: `package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

// Defining WriteHeader shadows the embedded one for this type.
func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func main() {
	var app http.Handler = http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusTeapot)
		})

	rec := &statusRecorder{ResponseWriter: httptest.NewRecorder()}
	app.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))

	fmt.Println("handler wrote:", rec.status)
}`,
    },
  },
}
