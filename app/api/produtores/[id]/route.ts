import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { memCache } from '@/lib/mem-cache'

const KEY = 'produtores'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const produtor = await prisma.produtor.findUnique({
    where: { id },
    include: { parceiros: { orderBy: { createdAt: 'asc' } } },
  })
  if (!produtor) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  return NextResponse.json(produtor)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { nome, cpf, telefone, parceiros } = await req.json()

  const totalPerc = (parceiros ?? []).reduce((s: number, p: { percentual: number }) => s + p.percentual, 0)
  if (totalPerc > 100) return NextResponse.json({ error: 'Soma das porcentagens não pode ultrapassar 100%.' }, { status: 400 })

  const existing = await prisma.produtor.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Produtor não encontrado.' }, { status: 404 })

  if (cpf && cpf !== existing.cpf) {
    const conflict = await prisma.produtor.findUnique({ where: { cpf } })
    if (conflict) return NextResponse.json({ error: 'CPF já cadastrado por outro produtor.' }, { status: 400 })
  }

  const produtor = await prisma.produtor.update({
    where: { id },
    data: {
      nome,
      ...(cpf ? { cpf } : {}),
      ...(telefone ? { telefone } : {}),
      parceiros: {
        deleteMany: {},
        create: (parceiros ?? []).map((p: { nome: string; cpf?: string; percentual: number }) => ({ nome: p.nome, percentual: p.percentual, ...(p.cpf ? { cpf: p.cpf } : {}) })),
      },
    },
    include: { parceiros: true },
  })

  memCache.invalidate(KEY)
  return NextResponse.json(produtor)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.produtor.delete({ where: { id } })
  memCache.invalidate(KEY)
  return NextResponse.json({ ok: true })
}
