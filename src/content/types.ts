export type Snippet = {
  id: string
  title: string
  code: string
  hint?: string
}

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'code'; code: string; caption?: string }
  | { kind: 'run'; snippet: Snippet }

export type Section = {
  id: string
  n: number
  title: string
  blurb: string
  blocks: Block[]
}
