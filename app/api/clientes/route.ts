import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } })
  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const cliente = await prisma.cliente.create({ data: body })
  return NextResponse.json(cliente, { status: 201 })
}
