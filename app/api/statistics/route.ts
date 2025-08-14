import { NextResponse } from 'next/server'
import { OrderService } from '@/lib/order-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'edge'

export async function GET() {
  try {
  const statistics = await OrderService.getStatistics()
  return NextResponse.json(statistics, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
