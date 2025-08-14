import { redis, REDIS_KEYS } from './redis'
import { OrderService } from './order-service'
import { v4 as uuidv4 } from 'uuid'

interface ArchiveEntry {
  id: string
  date: string
  totalOrders: number
  totalItems: number
  coffeeCounts: Record<string, number>
  tableCounts: Record<number, number>
  weekStartDate: string
  weekEndDate: string
  originalData: any[]
}

export class ArchiveService {
  // 获取所有存档
  static async getAllArchives(): Promise<ArchiveEntry[]> {
    try {
      console.log('ArchiveService.getAllArchives - 开始获取存档')
  const archives = await redis.hgetall(REDIS_KEYS.archives)
      console.log('ArchiveService.getAllArchives - Redis返回的存档数据:', archives)
      
      if (!archives || typeof archives !== 'object') {
        console.log('ArchiveService.getAllArchives - 没有存档数据')
        return []
      }
      
  const result = Object.values(archives)
        .filter(archive => archive !== null && archive !== undefined)
        .map(archive => {
          try {
            // 如果是字符串，解析它；如果已经是对象，直接返回
    if (typeof archive === 'string') {
              return JSON.parse(archive)
            } else {
              return archive as ArchiveEntry
            }
          } catch (e) {
            console.error('Error parsing archive:', archive, e)
            return null
          }
        })
        .filter(archive => archive !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 按日期降序排列
      
      console.log('ArchiveService.getAllArchives - 处理后的存档:', result)
      return result
    } catch (error) {
      console.error('Error getting archives:', error)
      return []
    }
  }

  // 存档当前数据并清空
  static async archiveCurrentData(): Promise<ArchiveEntry> {
    try {
      console.log('ArchiveService.archiveCurrentData - 开始存档当前数据')
      
      // 获取当前所有订单
  const orders = await OrderService.getAllOrders()
      console.log('ArchiveService.archiveCurrentData - 获取到的订单:', orders)
      
      if (orders.length === 0) {
        throw new Error('没有数据可以存档')
      }

      // 计算统计信息
      const coffeeCounts: Record<string, number> = {}
      const tableCounts: Record<string, number> = {}
      let totalItems = 0

      orders.forEach(order => {
        order.items.forEach(item => {
          const key = `${item.name} (${item.temperature === 'iced' ? 'Iced' : 'Hot'})`
          coffeeCounts[key] = (coffeeCounts[key] || 0) + 1
          if (typeof order.tableNumber === 'number') {
            const t = String(order.tableNumber)
            tableCounts[t] = (tableCounts[t] || 0) + 1
          }
          totalItems++
        })
      })

      // 计算周期日期（假设这周是本周）
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)) // 周一
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // 周日

      const archive: ArchiveEntry = {
        id: uuidv4(),
        date: new Date().toLocaleString('zh-CN'),
        totalOrders: orders.length,
        totalItems,
        coffeeCounts,
  tableCounts: Object.fromEntries(Object.entries(tableCounts).sort((a, b) => Number(a[0]) - Number(b[0]))),
        weekStartDate: startOfWeek.toLocaleDateString('zh-CN'),
        weekEndDate: endOfWeek.toLocaleDateString('zh-CN'),
        originalData: orders
      }

      console.log('ArchiveService.archiveCurrentData - 准备保存的存档:', archive)

      // 保存存档
      await redis.hset(REDIS_KEYS.archives, { [archive.id]: JSON.stringify(archive) })
      console.log('ArchiveService.archiveCurrentData - 存档已保存')

      // 清空当前订单数据
      await this.clearCurrentData()
      console.log('ArchiveService.archiveCurrentData - 当前数据已清空')

      return archive
    } catch (error) {
      console.error('Error archiving data:', error)
      throw error
    }
  }

  // 清空当前数据
  static async clearCurrentData(): Promise<void> {
    try {
      console.log('ArchiveService.clearCurrentData - 开始清空当前数据')
      
      // 获取所有订单ID
      const orders = await redis.hgetall(REDIS_KEYS.orders)
      if (orders && typeof orders === 'object') {
        const orderIds = Object.keys(orders)
        console.log('ArchiveService.clearCurrentData - 要删除的订单ID:', orderIds)
        
        // 删除所有订单
        for (const orderId of orderIds) {
          await redis.hdel(REDIS_KEYS.orders, orderId)
        }
      }
      
      // 清空统计数据
      await redis.hdel(REDIS_KEYS.statistics, 'data')
      
      console.log('ArchiveService.clearCurrentData - 数据清空完成')
    } catch (error) {
      console.error('Error clearing current data:', error)
      throw error
    }
  }

  // 删除存档
  static async deleteArchive(archiveId: string): Promise<boolean> {
    try {
      console.log('ArchiveService.deleteArchive - 删除存档:', archiveId)
      await redis.hdel(REDIS_KEYS.archives, archiveId)
      console.log('ArchiveService.deleteArchive - 存档已删除')
      return true
    } catch (error) {
      console.error('Error deleting archive:', error)
      return false
    }
  }
}
