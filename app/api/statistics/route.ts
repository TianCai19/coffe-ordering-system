import { NextResponse } from 'next/server'
import { OrderService } from '@/lib/order-service'

export async function GET() {
  try {
    const statistics = await OrderService.getStatistics()
    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
