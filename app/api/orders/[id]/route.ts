import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/order-service'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT /api/orders/[id] - 开始更新订单')
    const { items } = await request.json()
    const orderId = params.id
    console.log('PUT /api/orders/[id] - 请求数据:', { orderId, items })
    
    if (!items || !Array.isArray(items)) {
      console.log('PUT /api/orders/[id] - 无效的请求数据')
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const order = await OrderService.updateOrder(orderId, items)
    console.log('PUT /api/orders/[id] - 更新结果:', order)
    
    if (!order) {
      console.log('PUT /api/orders/[id] - 订单未找到')
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('PUT /api/orders/[id] - 更新成功')
    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const success = await OrderService.deleteOrder(orderId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
