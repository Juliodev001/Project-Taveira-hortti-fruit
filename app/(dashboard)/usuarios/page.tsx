import { prisma } from '@/lib/prisma'
import UsuariosClient from './usuarios-client'

export default async function UsuariosPage() {
  const usuarios = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, ativo: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
  return <UsuariosClient usuarios={usuarios} />
}
