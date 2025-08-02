import { Redis } from '@upstash/redis'

// 临时内存存储，用于开发测试
class MemoryStore {
  private hashData: Record<string, Record<string, any>> = {}

  async hgetall(key: string) {
    return this.hashData[key] || {}
  }

  async hget(key: string, field: string) {
    const hash = this.hashData[key]
    return hash ? hash[field] || null : null
  }

  async hset(key: string, data: Record<string, any>) {
    if (!this.hashData[key]) {
      this.hashData[key] = {}
    }
    Object.assign(this.hashData[key], data)
    return Object.keys(data).length
  }

  async hdel(key: string, field: string) {
    const hash = this.hashData[key]
    if (hash && hash[field] !== undefined) {
      delete hash[field]
      return 1
    }
    return 0
  }
}

// 使用内存存储作为临时解决方案
const memoryStore = new MemoryStore()

export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : memoryStore as any

// Redis keys
export const REDIS_KEYS = {
  orders: 'coffee:orders',
  orderCounter: 'coffee:order_counter',
  statistics: 'coffee:statistics',
  archives: 'coffee:archives',
}
