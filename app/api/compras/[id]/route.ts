import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await props.params
  const body = await req.json()

  const compra = await prisma.compra.update({ where: { id }, data: body })
  return NextResponse.json(compra)
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await props.params
  await prisma.compra.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
