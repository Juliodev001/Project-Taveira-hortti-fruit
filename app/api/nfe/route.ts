import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const ambiente = searchParams.get('ambiente')
  const nfes = await prisma.notaFiscal.findMany({
    where: { ...(ambiente && ambiente !== 'TODOS' && { ambiente: ambiente as never }) },
    include: { cliente: true, itens: true },
    orderBy: { dataEmissao: 'desc' },
  })
  return NextResponse.json(nfes)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { clienteId, numero, serie, dataEmissao, dataVencimento, ambiente, itens } = await req.json()
  const totalValor = itens.reduce((s: number, i: { total: number }) => s + i.total, 0)
  const nfe = await prisma.notaFiscal.create({
    data: {
      clienteId, numero: numero || null, serie: serie || '1',
      dataEmissao: new Date(dataEmissao), dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
      ambiente, totalValor,
      itens: { create: itens },
    },
    include: { cliente: true, itens: true },
  })
  return NextResponse.json(nfe, { status: 201 })
}
