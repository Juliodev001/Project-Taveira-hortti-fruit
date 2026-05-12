import { prisma } from '@/lib/prisma'
import LavouraClient from './lavoura-client'

export default async function LavouraPage() {
  const [colheitas, produtos] = await Promise.all([
    prisma.colheitaDiaria.findMany({
      include: { produto: true, responsavel: { select: { id: true, name: true, role: true } } },
      orderBy: { data: 'desc' },
    }),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
  ])

  const hoje = new Date()
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1)
    return { label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), mes: d.getMonth(), ano: d.getFullYear(), total: 0, dono: 0, parceiro: 0 }
  })
  colheitas.forEach((c) => {
    const d = new Date(c.data)
    const m = meses.find((x) => x.mes === d.getMonth() && x.ano === d.getFullYear())
    if (m) { m.total += c.quantidadeTotal; m.dono += c.quantidadeDono; m.parceiro += c.quantidadeParceiro }
  })

  return (
    <LavouraClient
      meses={meses}
      colheitasRecentes={colheitas.slice(0, 8).map(c => ({
        id: c.id, data: new Date(c.data).toISOString(), produto: c.produto.nome,
        total: c.quantidadeTotal, dono: c.quantidadeDono, parceiro: c.quantidadeParceiro,
        responsavel: c.responsavel.name,
      }))}
      produtos={produtos.map(p => ({ id: p.id, nome: p.nome }))}
    />
  )
}
