import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { memCache } from '@/lib/mem-cache'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const de = searchParams.get('de')
  const ate = searchParams.get('ate')
  const categoria = searchParams.get('categoria')
  const status = searchParams.get('status')
  const q = searchParams.get('q')

  const cacheKey = `compras:${de}:${ate}:${categoria}:${status}:${q}`
  const compras = await memCache.fetch(
    cacheKey,
    () => prisma.compra.findMany({
      where: {
        ...(de && { data: { gte: new Date(de) } }),
        ...(ate && { data: { lte: new Date(ate) } }),
        ...(categoria && categoria !== 'TODOS' && { categoria: categoria as never }),
        ...(status && status !== 'TODOS' && { status: status as never }),
        ...(q && {
          OR: [
            { fornecedor: { nome: { contains: q, mode: 'insensitive' } } },
            { observacao: { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      include: { fornecedor: true, itens: true, centroCusto: true },
      orderBy: { data: 'desc' },
    }),
    30_000
  )
  return NextResponse.json(compras)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { fornecedorId, data, categoria, centroCustoId, observacao, condicao, vencimento, formaPagamento, status, itens } = body

  const totalValor = itens.reduce((s: number, i: { total: number }) => s + i.total, 0)

  const compra = await prisma.compra.create({
    data: {
      fornecedorId,
      data: new Date(data),
      categoria,
      centroCustoId: centroCustoId || null,
      observacao,
      condicao,
      vencimento: new Date(vencimento),
      formaPagamento,
      status,
      totalValor,
      itens: {
        create: itens.map((i: { produto: string; unidade: string; quantidade: number; valorUnit: number; total: number }) => ({
          produto: i.produto,
          unidade: i.unidade,
          quantidade: i.quantidade,
          valorUnit: i.valorUnit,
          total: i.total,
        })),
      },
    },
    include: { fornecedor: true, itens: true },
  })

  revalidateTag('compras', 'max')
  memCache.invalidate('compras')
  return NextResponse.json(compra, { status: 201 })
}
