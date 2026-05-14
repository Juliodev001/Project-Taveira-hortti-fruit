import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const romaneios = await prisma.romaneio.findMany({
    include: { cliente: true, itens: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(romaneios)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { clienteId, data, observacao, itens } = body

  const last = await prisma.romaneio.findFirst({ orderBy: { numero: 'desc' } })
  const numero = (last?.numero ?? 0) + 1
  const totalValor = (itens as { total: number }[]).reduce((s, it) => s + it.total, 0)

  const romaneio = await prisma.romaneio.create({
    data: {
      numero,
      clienteId,
      data: new Date(data),
      observacao: observacao || null,
      totalValor,
      itens: { create: itens },
    },
    include: { cliente: true, itens: true },
  })
  return NextResponse.json(romaneio, { status: 201 })
}
