import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const titulo = await prisma.tituloFinanceiro.update({
    where: { id },
    data: {
      status: body.status,
      dataPagamento: body.status === 'RECEBIDO' ? new Date() : null,
    },
    include: { cliente: true },
  })
  return NextResponse.json(titulo)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.tituloFinanceiro.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
