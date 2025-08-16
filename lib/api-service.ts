import { Order, OrderStats, CreateOrderRequest, UpdateOrderRequest } from '@/types'
import type { MenuItem } from '@/lib/menu'

const API_BASE = ''

export class ApiService {
  static async getMenu(): Promise<MenuItem[]> {
    try {
      const res = await fetch(`/api/menu`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch menu')
      const data = await res.json()
      return data.menu as MenuItem[]
    } catch (e) {
      console.error('Error fetching menu:', e)
      throw e
    }
  }

  static async setMenu(menu: MenuItem[], adminToken: string): Promise<void> {
    const res = await fetch(`/api/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({ menu }),
    })
    if (!res.ok) throw new Error('Failed to update menu')
  }
  static async getAllOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE}/api/orders`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      return data.orders
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  static async createOrder(request: CreateOrderRequest): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) throw new Error('Failed to create order')
      const data = await response.json()
      return data.order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  static async updateOrder(request: UpdateOrderRequest): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${request.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
  body: JSON.stringify({ items: request.items, remark: request.remark }),
      })
      
      if (!response.ok) throw new Error('Failed to update order')
      const data = await response.json()
      return data.order
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete order')
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  static async updateItemStatus(orderId: string, itemIndex: number): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/items/${itemIndex}`, {
        method: 'PUT',
      })
      
      if (!response.ok) throw new Error('Failed to update item status')
      const data = await response.json()
      return data.order
    } catch (error) {
      console.error('Error updating item status:', error)
      throw error
    }
  }

  static async getStatistics(): Promise<OrderStats> {
    try {
      const response = await fetch(`${API_BASE}/api/statistics`)
      if (!response.ok) throw new Error('Failed to fetch statistics')
      return await response.json()
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw error
    }
  }

  static async getArchives(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/api/archives`)
      if (!response.ok) throw new Error('Failed to fetch archives')
      const data = await response.json()
      return data.archives
    } catch (error) {
      console.error('Error fetching archives:', error)
      throw error
    }
  }

  static async archiveCurrentData(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/api/archives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) throw new Error('Failed to archive data')
      return await response.json()
    } catch (error) {
      console.error('Error archiving data:', error)
      throw error
    }
  }
}
