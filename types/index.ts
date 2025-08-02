export interface CoffeeItem {
  id: string
  name: string
  temperature: 'hot' | 'iced'
  status: 'preparing' | 'ready'
  isUrgent: boolean
  orderId: string
  originalIndex: number
}

export interface Order {
  id: string
  tableNumber: number
  items: CoffeeItem[]
  timestamp: number
  status: 'pending' | 'completed'
}

export interface OrderStats {
  coffeeCounts: Record<string, number>
  tableCounts: Record<string, number>
}

export interface CreateOrderRequest {
  tableNumber: number
  items: Array<{
    name: string
    temperature: 'hot' | 'iced'
    isUrgent: boolean
  }>
}

export interface UpdateOrderRequest {
  orderId: string
  items: Array<{
    name: string
    temperature: 'hot' | 'iced'
    isUrgent: boolean
  }>
}

export interface UpdateItemStatusRequest {
  orderId: string
  itemIndex: number
}
