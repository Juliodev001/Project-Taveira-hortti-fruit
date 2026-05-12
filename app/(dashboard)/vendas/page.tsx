import { prisma } from '@/lib/prisma'
import VendasClient from './vendas-client'

export default async function VendasPage() {
  const nfes = await prisma.notaFiscal.findMany({
    where: { status: 'AUTORIZADA' },
    include: { cliente: true },
    orderBy: { dataEmissao: 'desc' },
  })

  const receita = nfes.reduce((s, n) => s + n.totalValor, 0)
  const aReceber = nfes.filter((n) => n.statusFinanceiro === 'A_RECEBER').reduce((s, n) => s + n.totalValor, 0)
  const recebido = nfes.filter((n) => n.statusFinanceiro === 'RECEBIDO').reduce((s, n) => s + n.totalValor, 0)

  return <VendasClient nfes={nfes} receita={receita} aReceber={aReceber} recebido={recebido} />
}
