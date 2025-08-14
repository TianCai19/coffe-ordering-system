import { NextRequest, NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'
import { DEFAULT_MENU, MenuItem } from '@/lib/menu'

const MENU_KEY = `${REDIS_KEYS.statistics}:menu`
const ADMIN_TOKEN = process.env.MENU_ADMIN_TOKEN || 'abcd1234'

export async function GET() {
  try {
    const raw = await redis.hget(MENU_KEY, 'current')
    let menu: MenuItem[]
    if (!raw) {
      menu = DEFAULT_MENU
      await redis.hset(MENU_KEY, { current: JSON.stringify(menu) })
    } else if (typeof raw === 'string') {
      menu = JSON.parse(raw)
    } else {
      menu = raw as MenuItem[]
    }
    return NextResponse.json({ menu })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('x-admin-token') || ''
    if (auth !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const menu = body?.menu as MenuItem[]
    if (!Array.isArray(menu) || menu.some(m => typeof m.name !== 'string' || typeof m.hot !== 'boolean' || typeof m.iced !== 'boolean')) {
      return NextResponse.json({ error: 'Invalid menu' }, { status: 400 })
    }
    await redis.hset(MENU_KEY, { current: JSON.stringify(menu) })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save menu' }, { status: 500 })
  }
}
