export const compilationChain = `<svg viewBox="0 0 700 292" xmlns="http://www.w3.org/2000/svg">
  <style>
    .box { fill: var(--surface); stroke: var(--line-hard); stroke-width: 2 }
    .box-hot { fill: var(--foam); stroke: var(--accent); stroke-width: 2 }
    .t { font-family: var(--font-mono); font-size: 12px; font-weight: 700; fill: var(--ink) }
    .s { font-family: var(--font-mono); font-size: 10px; fill: var(--ink-dim) }
    .lane { font-family: var(--font-mono); font-size: 10px; font-weight: 800; letter-spacing: .12em; fill: var(--kicker) }
    .flow { stroke: var(--ink-dim); stroke-width: 2; fill: none; marker-end: url(#chain-head) }
    .cut { stroke: var(--hot); stroke-width: 2; stroke-dasharray: 6 5; fill: none }
    .cut-label { font-family: var(--font-mono); font-size: 10px; font-weight: 700; fill: var(--hot) }
  </style>
  <defs>
    <marker id="chain-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 Z" fill="var(--ink-dim)" />
    </marker>
  </defs>

  <line class="cut" x1="384" y1="12" x2="384" y2="268" />

  <text class="lane" x="6" y="26">GO</text>
  <rect class="box" x="6" y="36" width="92" height="50" rx="6" />
  <text class="t" x="14" y="60">.go files</text>
  <text class="s" x="14" y="76">one module</text>
  <path class="flow" d="M98 61 H108" />
  <rect class="box" x="112" y="36" width="136" height="50" rx="6" />
  <text class="t" x="120" y="60">go build</text>
  <text class="s" x="120" y="76">type-check, SSA, asm</text>
  <path class="flow" d="M252 61 H264" />
  <rect class="box" x="268" y="36" width="88" height="50" rx="6" />
  <text class="t" x="276" y="60">link</text>
  <text class="s" x="276" y="76">+ runtime</text>
  <path class="flow" d="M360 61 H392" />
  <rect class="box-hot" x="396" y="36" width="148" height="50" rx="6" />
  <text class="t" x="404" y="60">static binary</text>
  <text class="s" x="404" y="76">nothing else needed</text>
  <path class="flow" d="M548 61 H560" />
  <rect class="box" x="564" y="36" width="132" height="50" rx="6" />
  <text class="t" x="572" y="60">exec()</text>
  <text class="s" x="572" y="76">runtime starts main</text>

  <path class="cut" d="M470 86 V96" stroke-dasharray="3 3" />
  <rect class="box-hot" x="396" y="96" width="300" height="80" rx="6" />
  <text class="lane" x="404" y="116">INSIDE THAT ONE FILE</text>
  <text class="s" x="404" y="134">your code, compiled to machine code</text>
  <text class="s" x="404" y="150">goroutine scheduler · GC · allocator</text>
  <text class="s" x="404" y="166">netpoller · stack growth · type metadata</text>

  <text class="lane" x="6" y="200">JAVA</text>
  <rect class="box" x="6" y="210" width="92" height="50" rx="6" />
  <text class="t" x="14" y="234">.java files</text>
  <text class="s" x="14" y="250">one project</text>
  <path class="flow" d="M98 235 H108" />
  <rect class="box" x="112" y="210" width="136" height="50" rx="6" />
  <text class="t" x="120" y="234">javac</text>
  <text class="s" x="120" y="250">bytecode only</text>
  <path class="flow" d="M252 235 H264" />
  <rect class="box" x="268" y="210" width="88" height="50" rx="6" />
  <text class="t" x="276" y="234">jar</text>
  <text class="s" x="276" y="250">bytecode</text>
  <path class="flow" d="M360 235 H392" />
  <rect class="box" x="396" y="210" width="148" height="50" rx="6" />
  <text class="t" x="404" y="234">JRE on the host</text>
  <text class="s" x="404" y="250">load + verify</text>
  <path class="flow" d="M548 235 H560" />
  <rect class="box" x="564" y="210" width="132" height="50" rx="6" />
  <text class="t" x="572" y="234">C1 then C2</text>
  <text class="s" x="572" y="250">machine code, later</text>

  <text class="cut-label" x="376" y="284" text-anchor="end">your build machine</text>
  <text class="cut-label" x="392" y="284">the host you deploy to</text>
</svg>`
