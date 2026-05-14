import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const origem = searchParams.get('origem')
  const clienteId = searchParams.get('clienteId')
  const de = searchParams.get('de')
  const ate = searchParams.get('ate')

  const titulos = await prisma.tituloFinanceiro.findMany({
    where: {
      ...(status && status !== 'TODOS' ? { status: status as never } : {}),
      ...(origem && origem !== 'TODAS' ? { origem: origem as never } : {}),
      ...(clienteId && clienteId !== 'TODOS' ? { clienteId } : {}),
      ...(de || ate ? {
        dataVenc: {
          ...(de ? { gte: new Date(de) } : {}),
          ...(ate ? { lte: new Date(ate) } : {}),
        }
      } : {}),
    },
    include: { cliente: true },
    orderBy: { dataVenc: 'asc' },
  })
  return NextResponse.json(titulos)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const titulo = await prisma.tituloFinanceiro.create({
    data: {
      clienteId: body.clienteId,
      descricao: body.descricao,
      valor: body.valor,
      dataEmissao: body.dataEmissao ? new Date(body.dataEmissao) : new Date(),
      dataVenc: new Date(body.dataVenc),
      origem: body.origem ?? 'MANUAL',
      nfeId: body.nfeId ?? null,
    },
    include: { cliente: true },
  })
  return NextResponse.json(titulo, { status: 201 })
}
