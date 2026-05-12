import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const registros = await prisma.registroProducao.findMany({ include: { entradas: true, saidas: true }, orderBy: { data: 'desc' } })
  return NextResponse.json(registros)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, descricao, observacao, status, entradas, saidas } = await req.json()
  const registro = await prisma.registroProducao.create({
    data: {
      data: new Date(data), descricao, observacao, status,
      entradas: { create: entradas },
      saidas: { create: saidas },
    },
    include: { entradas: true, saidas: true },
  })
  return NextResponse.json(registro, { status: 201 })
}
