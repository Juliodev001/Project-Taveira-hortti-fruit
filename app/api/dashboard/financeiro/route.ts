import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

function getMonthsInRange(inicio: Date, fim: Date) {
  const months: { key: string; label: string }[] = []
  const cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  const end = new Date(fim.getFullYear(), fim.getMonth(), 1)
  while (cur <= end) {
    months.push({
      key: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`,
      label: cur.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

function getPeriodRange(periodo: string): { inicio: Date; fim: Date } {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  switch (periodo) {
    case 'mes_passado':
      return { inicio: new Date(ano, mes - 1, 1), fim: new Date(ano, mes, 0, 23, 59, 59) }
    case 'ultimos_3_meses':
      return { inicio: new Date(ano, mes - 2, 1), fim: new Date(ano, mes + 1, 0, 23, 59, 59) }
    case 'ultimos_6_meses':
      return { inicio: new Date(ano, mes - 5, 1), fim: new Date(ano, mes + 1, 0, 23, 59, 59) }
    case 'ano_atual':
      return { inicio: new Date(ano, 0, 1), fim: new Date(ano, 11, 31, 23, 59, 59) }
    case 'ano_passado':
      return { inicio: new Date(ano - 1, 0, 1), fim: new Date(ano - 1, 11, 31, 23, 59, 59) }
    default:
      return { inicio: new Date(ano, mes, 1), fim: new Date(ano, mes + 1, 0, 23, 59, 59) }
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const periodo = req.nextUrl.searchParams.get('periodo') ?? 'mes_atual'
  const { inicio, fim } = getPeriodRange(periodo)

  const [nfes, compras] = await Promise.all([
    prisma.notaFiscal.findMany({
      where: { dataEmissao: { gte: inicio, lte: fim } },
      select: { statusFinanceiro: true, totalValor: true, dataEmissao: true },
    }),
    prisma.compra.findMany({
      where: { data: { gte: inicio, lte: fim } },
      select: { status: true, totalValor: true, categoria: true, data: true },
    }),
  ])

  const receita = nfes.filter(n => n.statusFinanceiro === 'RECEBIDO').reduce((s, n) => s + n.totalValor, 0)
  const despesa = compras.filter(c => c.status === 'PAGO').reduce((s, c) => s + c.totalValor, 0)

  const catMap: Record<string, number> = {}
  compras.forEach(c => { catMap[c.categoria] = (catMap[c.categoria] ?? 0) + c.totalValor })
  const comprasPorCategoria = Object.entries(catMap)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)

  const months = getMonthsInRange(inicio, fim)
  const monthlyMap: Record<string, { receita: number; despesa: number }> = {}
  months.forEach(m => { monthlyMap[m.key] = { receita: 0, despesa: 0 } })

  nfes.forEach(n => {
    const d = new Date(n.dataEmissao)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap[key] && n.statusFinanceiro === 'RECEBIDO') monthlyMap[key].receita += n.totalValor
  })
  compras.forEach(c => {
    const d = new Date(c.data)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyMap[key] && c.status === 'PAGO') monthlyMap[key].despesa += c.totalValor
  })

  const porMes = months.map(m => ({
    label: m.label,
    receita: monthlyMap[m.key].receita,
    despesa: monthlyMap[m.key].despesa,
  }))

  return NextResponse.json({ receita, despesa, comprasPorCategoria, porMes })
}
