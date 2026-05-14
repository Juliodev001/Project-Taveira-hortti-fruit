import { NextRequest, NextResponse } from 'next/server'

const WAHA_URL = process.env.WAHA_URL ?? 'http://localhost:3000'
const WAHA_SESSION = process.env.WAHA_SESSION ?? 'default'
const WAHA_API_KEY = process.env.WAHA_API_KEY ?? ''

function h() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY
  return headers
}

export async function GET() {
  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, {
      headers: h(),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json({ status: 'STOPPED', connected: false })
    const data = await res.json()
    return NextResponse.json({
      status: data.status ?? 'STOPPED',
      connected: data.status === 'WORKING',
      me: data.me ?? null,
    })
  } catch {
    return NextResponse.json({ status: 'OFFLINE', connected: false })
  }
}

export async function POST(req: NextRequest) {
  const { action } = await req.json()
  try {
    if (action === 'start') {
      // Try to start existing session first
      const startRes = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}/start`, {
        method: 'POST',
        headers: h(),
      })
      // If session doesn't exist (404), create and start it
      if (startRes.status === 404) {
        await fetch(`${WAHA_URL}/api/sessions`, {
          method: 'POST',
          headers: h(),
          body: JSON.stringify({ name: WAHA_SESSION, start: true }),
        })
      }
    } else if (action === 'stop') {
      await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}/stop`, {
        method: 'POST',
        headers: h(),
      })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'WAHA indisponível' }, { status: 502 })
  }
}
