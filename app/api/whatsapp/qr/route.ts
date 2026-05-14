export async function GET() {
  const WAHA_URL = process.env.WAHA_URL ?? 'http://localhost:3000'
  const WAHA_SESSION = process.env.WAHA_SESSION ?? 'default'
  const WAHA_API_KEY = process.env.WAHA_API_KEY ?? ''

  try {
    const res = await fetch(`${WAHA_URL}/api/${WAHA_SESSION}/auth/qr?format=image`, {
      headers: WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {},
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return new Response('QR indisponível', { status: 404 })
    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-cache, no-store' },
    })
  } catch {
    return new Response('WAHA indisponível', { status: 502 })
  }
}
