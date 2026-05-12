import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { memCache } from '@/lib/mem-cache'

const KEY = 'caixa'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contas = await memCache.fetch(
    KEY,
    () => prisma.contaBancaria.findMany({ include: { movimentacoes: { orderBy: { data: 'desc' }, take: 200 } } }),
    15_000
  )
  return NextResponse.json(contas)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { contaBancariaId, data, descricao, tipo, valor } = await req.json()
  const mov = await prisma.movimentacao.create({ data: { contaBancariaId, data: new Date(data), descricao, tipo, valor } })
  memCache.invalidate(KEY)
  return NextResponse.json(mov, { status: 201 })
}
