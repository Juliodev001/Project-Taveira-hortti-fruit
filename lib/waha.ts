const WAHA_URL = process.env.WAHA_URL ?? 'http://localhost:3000'
const WAHA_SESSION = process.env.WAHA_SESSION ?? 'default'
const WAHA_API_KEY = process.env.WAHA_API_KEY ?? ''

function buildHeaders() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (WAHA_API_KEY) h['X-Api-Key'] = WAHA_API_KEY
  return h
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  return `${withCountry}@c.us`
}

export type WahaResult = { ok: true } | { ok: false; error: string }

export async function wahaStatus(): Promise<{ status: string; connected: boolean }> {
  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { status: 'OFFLINE', connected: false }
    const data = await res.json()
    const connected = data.status === 'WORKING' || data.engine?.state === 'CONNECTED'
    return { status: data.status ?? 'UNKNOWN', connected }
  } catch {
    return { status: 'OFFLINE', connected: false }
  }
}

export async function wahaSendText(phone: string, text: string): Promise<WahaResult> {
  try {
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ chatId: formatPhone(phone), text, session: WAHA_SESSION }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.message ?? `Erro ${res.status}` }
    }
    return { ok: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido'
    return { ok: false, error: msg.includes('timeout') ? 'WAHA não respondeu (timeout)' : 'WAHA indisponível' }
  }
}

export async function wahaSendImage(phone: string, imageUrl: string, caption?: string): Promise<WahaResult> {
  try {
    const res = await fetch(`${WAHA_URL}/api/sendImage`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        chatId: formatPhone(phone),
        file: { url: imageUrl },
        caption: caption ?? '',
        session: WAHA_SESSION,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.message ?? `Erro ${res.status}` }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'WAHA indisponível' }
  }
}

