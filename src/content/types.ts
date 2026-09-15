export type Snippet = {
  id: string
  title: string
  code: string
  hint?: string
}

export type CompareRow = {
  java: string
  rust: string
  go: string
  note?: string
}

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'compare'; caption?: string; rows: CompareRow[] }
  | { kind: 'code'; code: string; caption?: string }
  | { kind: 'run'; snippet: Snippet }
  | { kind: 'aside'; tone: 'java' | 'rust' | 'warn'; text: string }

export type Section = {
  id: string
  n: number
  title: string
  blurb: string
  blocks: Block[]
}

export type Question = {
  id: string
  n: number
  q: string
  short: string
  blocks: Block[]
}

export type Step = {
  id: string
  n: number
  title: string
  problem: string
  learns: string[]
  blocks: Block[]
}
