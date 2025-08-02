import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '咖啡订单管理系统',
  description: '一个现代化的咖啡店订单管理系统，支持实时订单处理和统计',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
