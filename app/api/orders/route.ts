import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/order-service'

export async function GET() {
  try {
    console.log('GET /api/orders - 开始获取订单')
    const orders = await OrderService.getAllOrders()
    console.log('GET /api/orders - 获取到的订单:', orders)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
  console.log('POST /api/orders - creating order')
  const { tableNumber, customerName, items } = await request.json()
  console.log('POST /api/orders - payload:', { tableNumber, customerName, items })
    
  if ((!tableNumber && !customerName) || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

  const order = await OrderService.createOrder(tableNumber, items, customerName)
  console.log('POST /api/orders - created order:', order)
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
