import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

type Bucket = { key: string; label: string; inicio: Date; fim: Date }

function getDailyBuckets(days: number): Bucket[] {
  const buckets: Bucket[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
    const fim = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
    buckets.push({
      key: inicio.toISOString().slice(0, 10),
      label: inicio.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).replace('.', ''),
      inicio,
      fim,
    })
  }
  return buckets
}

function getWeeklyBuckets(weeks: number): Bucket[] {
  const buckets: Bucket[] = []
  const hoje = new Date()
  const inicioSemanaAtual = new Date(hoje)
  inicioSemanaAtual.setDate(hoje.getDate() - hoje.getDay())
  inicioSemanaAtual.setHours(0, 0, 0, 0)

  for (let i = weeks - 1; i >= 0; i--) {
    const inicio = new Date(inicioSemanaAtual)
    inicio.setDate(inicioSemanaAtual.getDate() - i * 7)
    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)
    fim.setHours(23, 59, 59)
    buckets.push({
      key: inicio.toISOString().slice(0, 10),
      label: inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      inicio,
      fim,
    })
  }
  return buckets
}

function getMonthlyBuckets(months: number): Bucket[] {
  const buckets: Bucket[] = []
  const hoje = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0, 23, 59, 59)
    buckets.push({
      key: `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, '0')}`,
      label: inicio.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      inicio,
      fim,
    })
  }
  return buckets
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const filtro = req.nextUrl.searchParams.get('filtro') ?? 'semana'

  let buckets: Bucket[]
  switch (filtro) {
    case '3_meses': buckets = getWeeklyBuckets(13); break
    case '6_meses': buckets = getMonthlyBuckets(6); break
    case 'ano':     buckets = getMonthlyBuckets(12); break
    default:        buckets = getDailyBuckets(7)
  }

  const inicio = buckets[0].inicio
  const fim = buckets[buckets.length - 1].fim

  const produtorId = req.nextUrl.searchParams.get('produtorId') ?? null

  const [colheitas, saidas] = await Promise.all([
    prisma.colheitaDiaria.findMany({
      where: {
        data: { gte: inicio, lte: fim },
        ...(produtorId ? { produtorId } : {}),
      },
      select: { data: true, quantidadeTotal: true },
    }),
    produtorId
      ? Promise.resolve([])
      : prisma.saidaLavoura.findMany({
          where: { data: { gte: inicio, lte: fim } },
          select: { data: true, quantidade: true },
        }),
  ])

  const result = buckets.map(b => {
    const colhido = colheitas
      .filter(c => new Date(c.data) >= b.inicio && new Date(c.data) <= b.fim)
      .reduce((s, c) => s + c.quantidadeTotal, 0)
    const vendido = saidas
      .filter(s => new Date(s.data) >= b.inicio && new Date(s.data) <= b.fim)
      .reduce((s, c) => s + c.quantidade, 0)
    return { label: b.label, colhido, vendido }
  })

  return NextResponse.json(result)
}
