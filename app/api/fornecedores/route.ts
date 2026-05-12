import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const fornecedores = await prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } })
  return NextResponse.json(fornecedores)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const fornecedor = await prisma.fornecedor.create({ data: body })
  return NextResponse.json(fornecedor, { status: 201 })
}
