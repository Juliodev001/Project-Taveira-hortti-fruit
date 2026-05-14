import { prisma } from '@/lib/prisma'
import ClientesClient from './clientes-client'

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { nfes: true } } },
  })

  return <ClientesClient clientes={clientes.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))} />
}
