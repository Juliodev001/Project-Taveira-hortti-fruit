import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { memCache } from '@/lib/mem-cache'

const KEY = 'produtores'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const produtores = await memCache.fetch(
    KEY,
    () => prisma.produtor.findMany({ include: { parceiros: true }, orderBy: { nome: 'asc' } }),
    60_000
  )
  return NextResponse.json(produtores)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: { nome?: string; cpf?: string; telefone?: string; parceiros?: { percentual: number }[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Body inválido.' }, { status: 400 }) }
  const { nome, cpf, telefone, parceiros } = body

  const lista: { percentual: number }[] = parceiros ?? []
  const invalido = lista.some((p) => typeof p.percentual !== 'number' || !isFinite(p.percentual) || p.percentual < 0)
  if (invalido) return NextResponse.json({ error: 'Percentual inválido.' }, { status: 400 })
  const totalPerc = lista.reduce((s, p) => s + p.percentual, 0)
  if (totalPerc > 100) return NextResponse.json({ error: 'Soma das porcentagens não pode ultrapassar 100%.' }, { status: 400 })

  if (cpf) {
    const existing = await prisma.produtor.findUnique({ where: { cpf } })
    if (existing) return NextResponse.json({ error: 'CPF já cadastrado.' }, { status: 400 })
  }

  const produtor = await prisma.produtor.create({
    data: {
      nome, cpf: cpf || null, telefone: telefone || null,
      parceiros: { create: parceiros ?? [] },
    },
    include: { parceiros: true },
  })
  revalidateTag('produtores', 'max')
  memCache.invalidate(KEY)
  return NextResponse.json(produtor, { status: 201 })
}
