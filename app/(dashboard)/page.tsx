import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

async function getDashboardData() {
  const hoje = new Date()
  const em7 = new Date(hoje.getTime() + 7 * 86400000)
  const em15 = new Date(hoje.getTime() + 15 * 86400000)
  const em30 = new Date(hoje.getTime() + 30 * 86400000)

  const [compras, nfes, contasBancarias, fechamentos] = await Promise.all([
    prisma.compra.findMany({ select: { status: true, totalValor: true, vencimento: true } }),
    prisma.notaFiscal.findMany({ select: { statusFinanceiro: true, totalValor: true } }),
    prisma.contaBancaria.findMany({ select: { nome: true, saldoInicial: true, movimentacoes: { select: { tipo: true, valor: true } } } }),
    prisma.fechamentoPagamento.findMany({
      include: { produtor: { select: { nome: true, cpf: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  const contasAPagar = {
    total: compras.filter((c) => c.status !== 'PAGO').reduce((s, c) => s + c.totalValor, 0),
    em7: compras.filter((c) => c.status !== 'PAGO' && new Date(c.vencimento) <= em7).reduce((s, c) => s + c.totalValor, 0),
    em15: compras.filter((c) => c.status !== 'PAGO' && new Date(c.vencimento) <= em15).reduce((s, c) => s + c.totalValor, 0),
    em30: compras.filter((c) => c.status !== 'PAGO' && new Date(c.vencimento) <= em30).reduce((s, c) => s + c.totalValor, 0),
    acima30: compras.filter((c) => c.status !== 'PAGO' && new Date(c.vencimento) > em30).reduce((s, c) => s + c.totalValor, 0),
  }

  const contasAReceber = {
    total: nfes.filter((n) => n.statusFinanceiro === 'A_RECEBER').reduce((s, n) => s + n.totalValor, 0),
    em7: 0, em15: 0, em30: 0, acima30: 0,
  }

  const saldoBancario = contasBancarias.map((cb) => {
    const entradas = cb.movimentacoes.filter((m) => m.tipo === 'ENTRADA').reduce((s, m) => s + m.valor, 0)
    const saidas = cb.movimentacoes.filter((m) => m.tipo === 'SAIDA').reduce((s, m) => s + m.valor, 0)
    return { nome: cb.nome, saldo: cb.saldoInicial + entradas - saidas }
  })
  const totalSaldo = saldoBancario.reduce((s, c) => s + c.saldo, 0)

  const fechamentosResumo = {
    pendentes: fechamentos.filter((f) => f.status === 'PENDENTE').length,
    pagos: fechamentos.filter((f) => f.status === 'PAGO').length,
    lista: fechamentos.slice(0, 5).map((f) => ({
      id: f.id,
      produtor: f.produtor.nome,
      cpf: f.produtor.cpf,
      dataInicio: f.dataInicio.toISOString(),
      dataFim: f.dataFim.toISOString(),
      dataPagamento: f.dataPagamento.toISOString(),
      status: f.status,
    })),
  }

  return { contasAPagar, contasAReceber, saldoBancario, totalSaldo, fechamentosResumo }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
