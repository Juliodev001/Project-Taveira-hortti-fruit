import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const produtoId = searchParams.get('produtoId')
  const inicio = searchParams.get('inicio')
  const fim = searchParams.get('fim')

  const saidas = await prisma.saidaLavoura.findMany({
    where: {
      ...(produtoId && { produtoId }),
      ...(inicio && fim && { data: { gte: new Date(inicio), lte: new Date(fim) } }),
    },
    include: { produto: true, responsavel: { select: { id: true, name: true, role: true } } },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(saidas)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, produtoId, quantidade, valorUnit, observacao } = await req.json()
  if (!produtoId || !quantidade || valorUnit === undefined) {
    return NextResponse.json({ error: 'Produto, quantidade e valor obrigatórios' }, { status: 400 })
  }
  const saida = await prisma.saidaLavoura.create({
    data: {
      data: new Date(data),
      produtoId,
      quantidade,
      valorUnit,
      totalValor: quantidade * valorUnit,
      responsavelId: session.userId,
      observacao: observacao || null,
    },
    include: { produto: true, responsavel: { select: { id: true, name: true, role: true } } },
  })
  return NextResponse.json(saida, { status: 201 })
}
