import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const nfes = await prisma.notaFiscal.findMany({
    where: { status: 'AUTORIZADA', statusFinanceiro: 'A_RECEBER' },
    include: { cliente: true },
  })

  const existentes = await prisma.tituloFinanceiro.findMany({
    where: { nfeId: { not: null } },
    select: { nfeId: true },
  })
  const nfeIdsCadastrados = new Set(existentes.map(t => t.nfeId))

  const novas = nfes.filter(n => !nfeIdsCadastrados.has(n.id))

  if (novas.length === 0) return NextResponse.json({ criados: 0 })

  await prisma.tituloFinanceiro.createMany({
    data: novas.map(n => ({
      clienteId: n.clienteId,
      descricao: `NF-e ${n.numero ?? n.id.slice(0, 8)} — ${n.cliente.nome}`,
      valor: n.totalValor,
      dataEmissao: n.dataEmissao,
      dataVenc: n.dataVencimento ?? n.dataEmissao,
      origem: 'NFE' as const,
      nfeId: n.id,
    })),
  })

  return NextResponse.json({ criados: novas.length })
}
