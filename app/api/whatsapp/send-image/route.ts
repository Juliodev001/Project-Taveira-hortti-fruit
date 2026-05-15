import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { wahaSendImageBase64 } from '@/lib/waha'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { phone, image, caption } = await req.json()
  if (!phone || !image) return NextResponse.json({ error: 'phone e image são obrigatórios' }, { status: 400 })

  const result = await wahaSendImageBase64(phone, image, caption)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 })
  return NextResponse.json({ ok: true })
}
