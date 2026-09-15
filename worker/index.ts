const UPSTREAM = 'https://go.dev/_/compile'
const MAX_CODE_BYTES = 64 * 1024

const ALLOWED_ORIGIN = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/[a-z0-9-]+\.github\.io$/,
]

function corsHeaders(origin: string): HeadersInit {
  const allowed = ALLOWED_ORIGIN.some((re) => re.test(origin))
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get('Origin') ?? ''
    const cors = corsHeaders(origin)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }
    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: cors })
    }

    let code: unknown
    try {
      code = ((await request.json()) as { code?: unknown }).code
    } catch {
      return Response.json({ Errors: 'malformed request body' }, { status: 400, headers: cors })
    }
    if (typeof code !== 'string' || code.length === 0) {
      return Response.json({ Errors: 'missing "code"' }, { status: 400, headers: cors })
    }
    if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
      return Response.json({ Errors: 'program too large' }, { status: 413, headers: cors })
    }

    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ body: code, version: '2', withVet: 'true' }),
    })

    if (!upstream.ok) {
      return Response.json(
        { Errors: `playground returned ${upstream.status}` },
        { status: 502, headers: cors },
      )
    }

    return new Response(upstream.body, {
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    })
  },
}
