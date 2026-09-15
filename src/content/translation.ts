export type Row = {
  java: string
  rust: string
  go: string
  category: 'syntax' | 'types' | 'concurrency' | 'tooling' | 'structure'
  note: string
}

export const translation: Row[] = [
  { java: 'int add(int a, int b)', rust: 'fn add(a: i32, b: i32) -> i32', go: 'func add(a, b int) int', category: 'syntax', note: 'types come after names in Go and Rust' },
  { java: 'void f()', rust: 'fn f()', go: 'func f()', category: 'syntax', note: 'no void — omit the return type' },
  { java: 'throws Exception / Pair<A,B>', rust: '-> Result<i32, E>', go: 'func f() (int, error)', category: 'syntax', note: 'Go returns errors as a second value' },
  { java: 'class Counter { int n; }', rust: 'struct Counter { n: i32 }', go: 'type Counter struct { n int }', category: 'types', note: 'struct, not class' },
  { java: 'void inc() { this.n++; }', rust: 'fn inc(&mut self)', go: 'func (c *Counter) inc()', category: 'types', note: 'Go names the receiver; Rust uses self' },
  { java: 'new Counter()', rust: 'Counter { n: 0 }', go: 'Counter{} / &Counter{}', category: 'types', note: 'composite literal, no constructors' },
  { java: 'new Point(1, 2)', rust: 'Point { x: 1, y: 2 }', go: 'Point{X: 1, Y: 2}', category: 'types', note: 'field names, not positions' },
  { java: 'class Foo implements Bar', rust: 'impl Bar for Foo', go: '(nothing)', category: 'types', note: 'only Go has no declaration site' },
  { java: 'public / private', rust: 'pub / pub(crate)', go: 'Capitalized / lowercase', category: 'structure', note: 'capitalization IS the access modifier' },
  { java: 'Math.max(a, b)', rust: 'i32::max(a, b)', go: 'math.Max(a, b)', category: 'structure', note: 'package-level func = Java static' },
  { java: 'package com.foo.store;', rust: 'mod store;', go: 'package store (in dir store/)', category: 'structure', note: 'in Go the directory IS the package' },
  { java: 'import com.foo.*;', rust: 'use foo::*;', go: '(illegal)', category: 'structure', note: 'no wildcards; unused import = compile error' },
  { java: 'pom.xml / jar', rust: 'Cargo.toml / crate', go: 'go.mod / (a git tag)', category: 'tooling', note: 'the import path is the repo URL' },
  { java: 'Maven Central', rust: 'crates.io', go: '(no central registry)', category: 'tooling', note: 'Go resolves straight from the URL' },
  { java: 'nearest-wins resolution', rust: 'newest compatible semver', go: 'minimal version selection', category: 'tooling', note: 'Go never upgrades behind your back' },
  { java: 'finally / try-with-resources', rust: 'Drop trait (automatic)', go: 'defer f.Close()', category: 'syntax', note: 'function-scoped, LIFO' },
  { java: 'new Thread() / virtual thread', rust: 'tokio::spawn', go: 'go f()', category: 'concurrency', note: 'goroutine, ~2KB growable stack' },
  { java: 'ExecutorService', rust: 'the Tokio runtime', go: '(none needed)', category: 'concurrency', note: 'the Go runtime IS the scheduler' },
  { java: 'CountDownLatch', rust: 'JoinSet / join!', go: 'sync.WaitGroup', category: 'concurrency', note: 'Add / Done / Wait' },
  { java: 'BlockingQueue', rust: 'mpsc::channel', go: 'chan T', category: 'concurrency', note: 'plus select for multiplexing' },
  { java: 'ThreadLocal / cancellation', rust: 'CancellationToken', go: 'context.Context', category: 'concurrency', note: 'passed explicitly as the first arg' },
  { java: 'synchronized / ReentrantLock', rust: 'Mutex<T> owns the data', go: 'sync.Mutex next to the data', category: 'concurrency', note: 'Rust enforces it; Go trusts you' },
  { java: 'async is invisible (Loom)', rust: 'async fn colours everything', go: 'no colouring', category: 'concurrency', note: 'Go has no sync/async split' },
  { java: 'JFR / MAT heap dump', rust: 'perf / flamegraph', go: 'pprof + go tool trace', category: 'tooling', note: 'built in; no object graph though' },
  { java: 'lambda () -> x', rust: '|| x  (closure)', go: 'func() { x }', category: 'syntax', note: 'Go captures the VARIABLE, and it is mutable' },
  { java: 'JUnit + surefire', rust: '#[test] + cargo test', go: 'go test ./...', category: 'tooling', note: 'built in; tests sit next to the code' },
  { java: 'Optional<T>', rust: 'Option<T>', go: '(nothing) — zero values / ok', category: 'types', note: 'v, ok := m[k] is the idiom' },
  { java: 'every object on the heap', rust: 'stack by default, Box to heap', go: 'escape analysis decides', category: 'types', note: 'Go automates what Rust makes explicit' },
  { java: 'generational compacting GC', rust: 'no GC — ownership', go: 'concurrent mark-sweep, non-moving', category: 'types', note: 'Go tunes for pause time' },
  { java: 'Point[] = array of references', rust: 'Vec<Point> = contiguous', go: '[]Point = contiguous', category: 'types', note: 'Go matches Rust for memory layout' },
]
