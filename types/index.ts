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
  tableNumber?: number
  customerName?: string
  remark?: string
  items: CoffeeItem[]
  timestamp: number
  status: 'pending' | 'completed'
}

export interface OrderStats {
  coffeeCounts: Record<string, number>
  tableCounts: Record<string, number>
}

export interface CreateOrderRequest {
  tableNumber?: number
  customerName?: string
  remark?: string
  items: Array<{
    name: string
    temperature: 'hot' | 'iced'
    isUrgent: boolean
  }>
}

export interface UpdateOrderRequest {
  orderId: string
  remark?: string
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
