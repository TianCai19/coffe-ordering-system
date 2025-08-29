export interface CoffeeItem {
  id: string
  name: string
  temperature: 'hot' | 'iced'
  status: 'preparing' | 'ready'
  isUrgent: boolean
  orderId: string
  originalIndex: number
  remark?: string
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
    remark?: string
  }>
}

export interface UpdateOrderRequest {
  orderId: string
  remark?: string
  items: Array<{
    name: string
    temperature: 'hot' | 'iced'
    isUrgent: boolean
    remark?: string
  }>
}

export interface UpdateItemStatusRequest {
  orderId: string
  itemIndex: number
}
