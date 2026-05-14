import { NextRequest, NextResponse } from 'next/server'
import { wahaSendText } from '@/lib/waha'

export async function POST(req: NextRequest) {
  const { phone, message } = await req.json()
  if (!phone || !message) {
    return NextResponse.json({ error: 'phone e message são obrigatórios' }, { status: 400 })
  }
  const result = await wahaSendText(phone, message)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
