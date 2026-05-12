import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { memCache } from '@/lib/mem-cache'

const KEY = 'produtos'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const produtos = await memCache.fetch(KEY, () => prisma.produto.findMany({ orderBy: { nome: 'asc' } }), 60_000)
  return NextResponse.json(produtos)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { nome, unidade, categoria } = await req.json()
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
  const produto = await prisma.produto.create({ data: { nome, unidade: unidade || 'CAIXA', categoria: categoria || null } })
  memCache.invalidate(KEY)
  return NextResponse.json(produto, { status: 201 })
}
