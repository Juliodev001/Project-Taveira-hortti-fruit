import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const romaneio = await prisma.romaneio.findUnique({ where: { id }, include: { cliente: true, itens: true } })
  if (!romaneio) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(romaneio)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json()
  const romaneio = await prisma.romaneio.update({ where: { id }, data: { status } })
  return NextResponse.json(romaneio)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.romaneio.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
