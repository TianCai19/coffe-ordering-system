import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/order-service'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; index: string } }
) {
  try {
    const orderId = params.id
    const itemIndex = parseInt(params.index)
    
    if (isNaN(itemIndex)) {
      return NextResponse.json(
        { error: 'Invalid item index' },
        { status: 400 }
      )
    }

    const order = await OrderService.updateItemStatus(orderId, itemIndex)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order or item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating item status:', error)
    return NextResponse.json(
      { error: 'Failed to update item status' },
      { status: 500 }
    )
  }
}
