export type Row = {
  java: string
  go: string
  category: 'syntax' | 'types' | 'concurrency' | 'tooling' | 'structure'
  note: string
}

export const translation: Row[] = [
  { java: 'int add(int a, int b)', go: 'func add(a, b int) int', category: 'syntax', note: 'types come AFTER names' },
  { java: 'void f()', go: 'func f()', category: 'syntax', note: 'no void — omit the return type' },
  { java: 'throws Exception / Pair<A,B>', go: 'func f() (int, error)', category: 'syntax', note: 'multiple return values are native' },
  { java: 'class Counter { int n; }', go: 'type Counter struct { n int }', category: 'types', note: 'struct, not class' },
  { java: 'void inc() { this.n++; }', go: 'func (c *Counter) inc() { c.n++ }', category: 'types', note: '(c *Counter) is the receiver = explicit this' },
  { java: 'new Counter()', go: 'Counter{} / &Counter{}', category: 'types', note: 'composite literal, no constructors' },
  { java: 'new Point(1, 2)', go: 'Point{X: 1, Y: 2}', category: 'types', note: 'field names, not positions' },
  { java: 'class Foo implements Bar', go: '(nothing)', category: 'types', note: 'interfaces are satisfied implicitly' },
  { java: 'public / package-private', go: 'Capitalized / lowercase', category: 'structure', note: 'capitalization IS the access modifier' },
  { java: 'Math.max(a, b)', go: 'math.Max(a, b)', category: 'structure', note: 'package-level func = Java static' },
  { java: 'package com.foo.store;', go: 'package store (in dir store/)', category: 'structure', note: 'package == directory' },
  { java: 'import com.foo.*;', go: '(illegal)', category: 'structure', note: 'no wildcards; unused import = compile ERROR' },
  { java: 'pom.xml / jar', go: 'go.mod / no jars', category: 'tooling', note: 'import path is a URL' },
  { java: 'finally / try-with-resources', go: 'defer f.Close()', category: 'syntax', note: 'function-scoped, LIFO' },
  { java: 'new Thread() / virtual thread', go: 'go f()', category: 'concurrency', note: 'goroutine, ~2KB growable stack' },
  { java: 'ExecutorService', go: '(none needed)', category: 'concurrency', note: 'the runtime is the scheduler' },
  { java: 'CountDownLatch', go: 'sync.WaitGroup', category: 'concurrency', note: 'Add / Done / Wait' },
  { java: 'BlockingQueue', go: 'chan T', category: 'concurrency', note: 'plus select for multiplexing' },
  { java: 'ThreadLocal / cancellation', go: 'context.Context', category: 'concurrency', note: 'passed explicitly as the first arg' },
  { java: 'synchronized / ReentrantLock', go: 'sync.Mutex', category: 'concurrency', note: 'no keyword, just a struct field' },
  { java: 'JFR / MAT heap dump', go: 'pprof + go tool trace', category: 'tooling', note: 'profile-based; no object graph' },
  { java: 'lambda () -> x', go: 'func() { x }', category: 'syntax', note: 'captures the VARIABLE, and it is mutable' },
  { java: 'JUnit + Maven surefire', go: 'go test ./...', category: 'tooling', note: 'built in; tests live next to the code' },
  { java: 'Optional<T>', go: '(nothing) — use zero values / ok', category: 'types', note: 'v, ok := m[k] is the idiom' },
]
