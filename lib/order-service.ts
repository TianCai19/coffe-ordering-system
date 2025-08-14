import { redis, REDIS_KEYS } from './redis'
import { Order, OrderStats } from '@/types'

export class OrderService {
  // 获取所有订单
  static async getAllOrders(): Promise<Order[]> {
    try {
      console.log('OrderService.getAllOrders - 开始获取订单')
      const orders = await redis.hgetall(REDIS_KEYS.orders)
      console.log('OrderService.getAllOrders - Redis返回的数据:', orders)
      if (!orders || typeof orders !== 'object') {
        console.log('OrderService.getAllOrders - 没有订单数据或数据格式错误')
        return []
      }
      
      const result = Object.values(orders)
        .filter(order => order !== null && order !== undefined)
        .map(order => {
          try {
            // 如果是字符串，解析它；如果已经是对象，直接返回
            if (typeof order === 'string') {
              return JSON.parse(order)
            } else {
              return order as Order
            }
          } catch (e) {
            console.error('Error parsing order:', order, e)
            return null
          }
        })
        .filter(order => order !== null)
      
      console.log('OrderService.getAllOrders - 处理后的订单:', result)
      return result
    } catch (error) {
      console.error('Error getting orders:', error)
      return []
    }
  }

  // 创建新订单
  static async createOrder(
    tableNumber: number | undefined,
    items: Array<{ name: string; temperature: 'hot' | 'iced'; isUrgent: boolean }>,
    customerName?: string
  ): Promise<Order> {
    console.log('OrderService.createOrder - 开始创建订单:', { tableNumber, customerName, items })
    const orderId = (globalThis as any).crypto && 'randomUUID' in (globalThis as any).crypto
      ? (globalThis as any).crypto.randomUUID()
      : Math.random().toString(36).slice(2)
    const timestamp = Date.now()
    
    const order: Order = {
      id: orderId,
      tableNumber,
      customerName,
      timestamp,
      status: 'pending',
      items: items.map((item, index) => ({
        id: `${orderId}-${index}`,
        ...item,
        status: 'preparing' as const,
        orderId,
        originalIndex: index,
      }))
    }

    console.log('OrderService.createOrder - 准备保存的订单:', order)
    await redis.hset(REDIS_KEYS.orders, { [orderId]: JSON.stringify(order) })
    console.log('OrderService.createOrder - 订单已保存到Redis')
    return order
  }

  // 更新订单
  static async updateOrder(orderId: string, items: Array<{
    name: string
    temperature: 'hot' | 'iced'
    isUrgent: boolean
  }>): Promise<Order | null> {
    try {
      console.log('OrderService.updateOrder - 开始更新订单:', { orderId, items })
      const orderData = await redis.hget(REDIS_KEYS.orders, orderId)
      console.log('OrderService.updateOrder - 获取到的订单数据:', orderData)
      if (!orderData) {
        console.log('OrderService.updateOrder - 订单不存在')
        return null
      }

      // 处理数据格式：如果是字符串则解析，如果是对象则直接使用
      let order: Order
      if (typeof orderData === 'string') {
        order = JSON.parse(orderData)
      } else {
        order = orderData as Order
      }
      
      console.log('OrderService.updateOrder - 解析后的订单:', order)
      
      order.items = items.map((item, index) => ({
        id: `${orderId}-${index}`,
        ...item,
        status: 'preparing' as const,
        orderId,
        originalIndex: index,
      }))

      console.log('OrderService.updateOrder - 更新后的订单:', order)
      await redis.hset(REDIS_KEYS.orders, { [orderId]: JSON.stringify(order) })
      console.log('OrderService.updateOrder - 订单已保存')
      return order
    } catch (error) {
      console.error('Error updating order:', error)
      return null
    }
  }

  // 删除订单
  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      await redis.hdel(REDIS_KEYS.orders, orderId)
      return true
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }

  // 更新单个咖啡项目状态
  static async updateItemStatus(orderId: string, itemIndex: number): Promise<Order | null> {
    try {
      console.log('OrderService.updateItemStatus - 开始更新项目状态:', { orderId, itemIndex })
      const orderData = await redis.hget(REDIS_KEYS.orders, orderId)
      console.log('OrderService.updateItemStatus - 获取到的订单数据:', orderData)
      if (!orderData) {
        console.log('OrderService.updateItemStatus - 订单不存在')
        return null
      }

      // 处理数据格式：如果是字符串则解析，如果是对象则直接使用
      let order: Order
      if (typeof orderData === 'string') {
        order = JSON.parse(orderData)
      } else {
        order = orderData as Order
      }
      
      console.log('OrderService.updateItemStatus - 解析后的订单:', order)
      
      if (itemIndex >= order.items.length) {
        console.log('OrderService.updateItemStatus - 项目索引超出范围')
        return null
      }

      const currentStatus = order.items[itemIndex].status
      order.items[itemIndex].status = currentStatus === 'preparing' ? 'ready' : 'preparing'
      
      console.log('OrderService.updateItemStatus - 更新后的订单:', order)
      await redis.hset(REDIS_KEYS.orders, { [orderId]: JSON.stringify(order) })
      console.log('OrderService.updateItemStatus - 订单已保存')
      return order
    } catch (error) {
      console.error('Error updating item status:', error)
      return null
    }
  }

  // 获取统计信息
  static async getStatistics(): Promise<OrderStats> {
    try {
      const orders = await this.getAllOrders()
      const coffeeCounts: Record<string, number> = {}
      const tableCounts: Record<string, number> = {}

      orders.forEach(order => {
        if (order.status === 'completed') return
        
        let pendingItemsInOrder = 0
        order.items.forEach(item => {
          if (item.status === 'preparing') {
            pendingItemsInOrder++
            const key = `${item.name} (${item.temperature === 'iced' ? 'Iced' : 'Hot'})`
            coffeeCounts[key] = (coffeeCounts[key] || 0) + 1
          }
        })
        
        if (pendingItemsInOrder > 0) {
          if (typeof order.tableNumber === 'number') {
            tableCounts[order.tableNumber.toString()] = 
              (tableCounts[order.tableNumber.toString()] || 0) + pendingItemsInOrder
          }
        }
      })

      return { coffeeCounts, tableCounts }
    } catch (error) {
      console.error('Error getting statistics:', error)
      return { coffeeCounts: {}, tableCounts: {} }
    }
  }
}
