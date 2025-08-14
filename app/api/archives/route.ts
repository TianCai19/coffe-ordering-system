import { NextRequest, NextResponse } from 'next/server'
import { ArchiveService } from '@/lib/archive-service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('GET /api/archives - 开始获取存档')
    const archives = await ArchiveService.getAllArchives()
    console.log('GET /api/archives - 获取到的存档:', archives)
  return NextResponse.json({ archives }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching archives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archives' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    console.log('POST /api/archives - 开始存档当前数据')
    const archive = await ArchiveService.archiveCurrentData()
    console.log('POST /api/archives - 存档完成:', archive)
  return NextResponse.json({ archive, message: '数据已成功存档' }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error archiving data:', error)
    return NextResponse.json(
      { error: 'Failed to archive data' },
      { status: 500 }
    )
  }
}
