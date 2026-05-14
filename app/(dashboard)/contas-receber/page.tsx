import { prisma } from '@/lib/prisma'
import ContasReceberClient from './contas-receber-client'

export default async function ContasReceberPage() {
  const [titulos, clientes] = await Promise.all([
    prisma.tituloFinanceiro.findMany({
      include: { cliente: true },
      orderBy: { dataVenc: 'asc' },
    }),
    prisma.cliente.findMany({ orderBy: { nome: 'asc' } }),
  ])

  const hoje = new Date()
  const titulosComStatus = titulos.map(t => ({
    ...t,
    dataEmissao: t.dataEmissao.toISOString(),
    dataVenc: t.dataVenc.toISOString(),
    dataPagamento: t.dataPagamento?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    status: t.status === 'A_RECEBER' && t.dataVenc < hoje ? 'VENCIDO' : t.status,
  }))

  return <ContasReceberClient titulos={titulosComStatus} clientes={clientes} />
}
