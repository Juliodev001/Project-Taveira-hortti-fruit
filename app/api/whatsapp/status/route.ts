import { NextResponse } from 'next/server'
import { wahaStatus } from '@/lib/waha'

export async function GET() {
  const status = await wahaStatus()
  return NextResponse.json(status)
}
