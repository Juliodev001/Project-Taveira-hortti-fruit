import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { wahaSendImage } from '@/lib/waha'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { phone, image, caption } = await req.json()
  if (!phone || !image) return NextResponse.json({ error: 'phone e image são obrigatórios' }, { status: 400 })

  // Salva PNG temporariamente em /public/tmp para o WAHA buscar via URL
  const tmpDir = join(process.cwd(), 'public', 'tmp')
  if (!existsSync(tmpDir)) await mkdir(tmpDir, { recursive: true })

  const filename = `${randomUUID()}.png`
  const filepath = join(tmpDir, filename)
  await writeFile(filepath, Buffer.from(image, 'base64'))

  // Constrói URL pública usando o host da própria requisição
  const proto = req.headers.get('x-forwarded-proto') ?? 'http'
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost'
  const imageUrl = `${proto}://${host}/tmp/${filename}`

  try {
    const result = await wahaSendImage(phone, imageUrl, caption)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 })
    return NextResponse.json({ ok: true })
  } finally {
    unlink(filepath).catch(() => {})
  }
}
