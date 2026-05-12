import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const devolucoes = await prisma.devolucao.findMany({ include: { cliente: true, itens: true }, orderBy: { data: 'desc' } })
  return NextResponse.json(devolucoes)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { clienteId, nfReferencia, data, formaAcerto, observacao, itens } = await req.json()
  const totalValor = itens.reduce((s: number, i: { total: number }) => s + i.total, 0)
  const dev = await prisma.devolucao.create({
    data: { clienteId, nfReferencia, data: new Date(data), formaAcerto, observacao, totalValor, itens: { create: itens } },
    include: { cliente: true, itens: true },
  })
  return NextResponse.json(dev, { status: 201 })
}
