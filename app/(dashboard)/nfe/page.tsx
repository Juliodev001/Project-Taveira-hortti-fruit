import { prisma } from '@/lib/prisma'
import NfeClient from './nfe-client'

export default async function NFePage() {
  const [rascunhos, emitidas] = await Promise.all([
    prisma.notaFiscal.findMany({ where: { status: 'RASCUNHO' }, include: { cliente: true }, orderBy: { createdAt: 'desc' } }),
    prisma.notaFiscal.findMany({ where: { status: { not: 'RASCUNHO' } }, include: { cliente: true }, orderBy: { dataEmissao: 'desc' } }),
  ])

  return <NfeClient rascunhos={rascunhos} emitidas={emitidas} />
}
