import { prisma } from '@/lib/prisma'
import EstoqueClient from './estoque-client'

export type EntradaHistorico = {
  data: string
  quantidade: number
  descarte: number
  preco: number
  total: number
}

export type ProdutoEstoque = {
  produto: { id: string; nome: string; unidade: string; categoria: string | null }
  totalQtd: number
  totalDescarte: number
  totalEntradas: number
  mediaPreco: number
  precoMin: number
  precoMax: number
  ultimoPreco: number
  trend: 'up' | 'down' | 'stable'
  historicoPrecos: number[]
  ultimaColheita: string | null
  historico: EntradaHistorico[]
}

export default async function EstoquePage() {
  const colheitas = await prisma.colheitaDiaria.findMany({
    include: { produto: true },
    orderBy: { data: 'asc' },
  })

  const map = new Map<string, {
    produto: { id: string; nome: string; unidade: string; categoria: string | null }
    entradas: { data: Date; quantidade: number; descarte: number; preco: number }[]
  }>()

  for (const c of colheitas) {
    if (!map.has(c.produtoId)) {
      map.set(c.produtoId, {
        produto: {
          id: c.produto.id,
          nome: c.produto.nome,
          unidade: c.produto.unidade,
          categoria: c.produto.categoria,
        },
        entradas: [],
      })
    }
    map.get(c.produtoId)!.entradas.push({
      data: c.data,
      quantidade: c.quantidadeTotal,
      descarte: c.descarte,
      preco: c.preco,
    })
  }

  const produtos: ProdutoEstoque[] = []

  for (const [, { produto, entradas }] of map) {
    const liquidas = entradas.map(e => ({ ...e, liquido: e.quantidade - e.descarte }))
    const totalQtd = liquidas.reduce((s, e) => s + e.liquido, 0)
    const totalDescarte = liquidas.reduce((s, e) => s + e.descarte, 0)
    const totalValor = liquidas.reduce((s, e) => s + e.liquido * e.preco, 0)
    const mediaPreco = totalQtd > 0 ? totalValor / totalQtd : 0

    const comPreco = liquidas.filter(e => e.preco > 0)
    const precoMin = comPreco.length ? Math.min(...comPreco.map(e => e.preco)) : 0
    const precoMax = comPreco.length ? Math.max(...comPreco.map(e => e.preco)) : 0
    const ultimoPreco = liquidas[liquidas.length - 1]?.preco ?? 0
    const trend: 'up' | 'down' | 'stable' =
      ultimoPreco > mediaPreco * 1.02 ? 'up'
      : ultimoPreco < mediaPreco * 0.98 ? 'down'
      : 'stable'

    produtos.push({
      produto,
      totalQtd,
      totalDescarte,
      totalEntradas: entradas.length,
      mediaPreco,
      precoMin,
      precoMax,
      ultimoPreco,
      trend,
      historicoPrecos: liquidas.map(e => e.preco),
      ultimaColheita: entradas[entradas.length - 1]?.data?.toISOString() ?? null,
      historico: liquidas
        .slice(-20)
        .reverse()
        .map(e => ({
          data: e.data.toISOString(),
          quantidade: e.liquido,
          descarte: e.descarte,
          preco: e.preco,
          total: e.liquido * e.preco,
        })),
    })
  }

  produtos.sort((a, b) => b.totalQtd - a.totalQtd)

  return <EstoqueClient produtos={produtos} />
}
