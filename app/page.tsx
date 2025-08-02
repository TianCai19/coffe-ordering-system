'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Order, OrderStats } from '@/types'
import { ApiService } from '@/lib/api-service'
import { OrderCard } from '@/components/OrderCard'
import { OrderModal } from '@/components/OrderModal'
import { Statistics } from '@/components/Statistics'
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal'
import { LogsModal } from '@/components/LogsModal'
import { CoffeeCupIcon, DownloadIcon, HistoryIcon, ArchiveIcon } from '@/components/Icons'

const TABLE_COUNT = 20

export default function HomePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statistics, setStatistics] = useState<OrderStats>({ coffeeCounts: {}, tableCounts: {} })
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'table' | 'time'>('table')
  const [loading, setLoading] = useState(true)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [archiving, setArchiving] = useState(false)

  // 加载数据
  const loadData = async () => {
    try {
      console.log('开始加载数据...')
      const [ordersData, statsData] = await Promise.all([
        ApiService.getAllOrders(),
        ApiService.getStatistics()
      ])
      console.log('获取到的订单数据:', ordersData)
      console.log('获取到的统计数据:', statsData)
      setOrders(ordersData)
      setStatistics(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // 设置定时刷新
    const interval = setInterval(loadData, 10000) // 每10秒刷新一次
    return () => clearInterval(interval)
  }, [])

  // 处理下单
  const handlePlaceOrder = async ({ tableNumber, items }: { tableNumber: number; items: any[] }) => {
    try {
      console.log('开始下单...', { tableNumber, items })
      await ApiService.createOrder({ tableNumber, items })
      console.log('下单成功，开始重新加载数据...')
      await loadData() // 重新加载数据
      console.log('数据重新加载完成，关闭模态框...')
      setSelectedTable(null) // 关闭模态框
    } catch (error) {
      console.error('Error placing order:', error)
      alert('下单失败，请重试')
    }
  }

  // 处理更新订单
  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      await ApiService.updateOrder({
        orderId: updatedOrder.id,
        items: updatedOrder.items.map(item => ({
          name: item.name,
          temperature: item.temperature,
          isUrgent: item.isUrgent
        }))
      })
      await loadData()
      setEditingOrder(null)
    } catch (error) {
      console.error('Error updating order:', error)
      alert('更新订单失败，请重试')
    }
  }
  
  // 处理删除订单
  const handleDeleteOrder = async () => {
    if (!deletingOrderId) return
    
    try {
      await ApiService.deleteOrder(deletingOrderId)
      await loadData()
      setDeletingOrderId(null)
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('删除订单失败，请重试')
    }
  }

  // 更新单个咖啡项目的状态
  const handleUpdateItemStatus = async (orderId: string, itemIndex: number) => {
    try {
      await ApiService.updateItemStatus(orderId, itemIndex)
      await loadData()
    } catch (error) {
      console.error('Error updating item status:', error)
      alert('更新状态失败，请重试')
    }
  }

  // 导出数据为TXT文件
  const handleExportData = () => {
    if (orders.length === 0) {
      alert("没有可导出的订单数据。")
      return
    }

    const totalCoffeeSummary: Record<string, number> = {}
    const tableSummary: Record<number, Record<string, number>> = {}

    orders.forEach(order => {
      const tableNumber = order.tableNumber
      if (!tableSummary[tableNumber]) {
        tableSummary[tableNumber] = {}
      }

      order.items.forEach(item => {
        const key = `${item.name} (${item.temperature === 'iced' ? '冰' : '热'})`
        totalCoffeeSummary[key] = (totalCoffeeSummary[key] || 0) + 1
        tableSummary[tableNumber][key] = (tableSummary[tableNumber][key] || 0) + 1
      })
    })

    let content = "咖啡订单统计报告\n"
    content += `导出时间: ${new Date().toLocaleString()}\n`
    content += "====================================\n\n"

    content += "### 总计 ###\n"
    const sortedTotalSummary = Object.entries(totalCoffeeSummary).sort((a, b) => a[0].localeCompare(b[0]))
    sortedTotalSummary.forEach(([name, count]) => {
      content += `- ${name}: ${count} 杯\n`
    })
    content += "\n====================================\n\n"

    content += "### 按桌号分计 ###\n"
    const sortedTableNumbers = Object.keys(tableSummary).sort((a, b) => parseInt(a) - parseInt(b))
    sortedTableNumbers.forEach(tableNumber => {
      content += `\n--- 桌号: ${tableNumber} ---\n`
      const sortedItems = Object.entries(tableSummary[parseInt(tableNumber)]).sort((a, b) => a[0].localeCompare(b[0]))
      sortedItems.forEach(([name, count]) => {
        content += `  - ${name}: ${count} 杯\n`
      })
    })

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    link.download = `coffee-summary-${timestamp}.txt`

    link.click()
    URL.revokeObjectURL(url)
  }

  // 结算功能 - 存档当前数据并清空
  const handleArchiveData = async () => {
    if (orders.length === 0) {
      alert('没有数据可以结算')
      return
    }

    const confirmMessage = `确定要结算本周数据吗？\n\n这将：\n1. 保存当前所有订单到历史记录\n2. 清空现有数据\n3. 重新开始统计\n\n当前共有 ${orders.length} 个订单`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setArchiving(true)
    try {
      console.log('开始结算数据...')
      const result = await ApiService.archiveCurrentData()
      console.log('结算完成:', result)
      
      // 重新加载数据（应该是空的）
      await loadData()
      
      alert(`结算成功！\n\n已将 ${result.archive?.totalOrders || 0} 个订单存档到历史记录中。`)
    } catch (error) {
      console.error('结算失败:', error)
      alert('结算失败，请重试')
    } finally {
      setArchiving(false)
    }
  }

  // 排序和过滤订单
  const { preparingOrders, readyOrders } = useMemo(() => {
    const urgentOrders: Order[] = []
    const mergedNonUrgent: Record<number, Order> = {}
    const ready: Order[] = []

    for (const order of orders) {
      if (order.items.every(item => item.status === 'ready')) {
        ready.push(order)
        continue
      }
      
      const decoratedItems = order.items.map((item, index) => ({
        ...item,
        orderId: order.id,
        originalIndex: index,
      }))

      const isUrgent = order.items.some(i => i.isUrgent)
      if (isUrgent) {
        urgentOrders.push({ ...order, items: decoratedItems })
      } else {
        if (!mergedNonUrgent[order.tableNumber]) {
          mergedNonUrgent[order.tableNumber] = {
            ...order,
            items: [],
            timestamp: order.timestamp,
          }
        }
        const tableOrder = mergedNonUrgent[order.tableNumber]
        tableOrder.items.push(...decoratedItems)
        tableOrder.timestamp = Math.min(tableOrder.timestamp, order.timestamp)
      }
    }
    
    urgentOrders.sort((a, b) => a.timestamp - b.timestamp)
    let nonUrgentList = Object.values(mergedNonUrgent)
    
    if (sortBy === 'table') {
      nonUrgentList.sort((a, b) => a.tableNumber - b.tableNumber)
    } else {
      nonUrgentList.sort((a, b) => a.timestamp - b.timestamp)
    }
    
    ready.sort((a, b) => b.timestamp - a.timestamp)

    return { 
      preparingOrders: [...urgentOrders, ...nonUrgentList], 
      readyOrders: ready
    }
  }, [orders, sortBy])

  const totalPendingItems = Object.values(statistics.coffeeCounts).reduce((sum, count) => sum + count, 0)

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CoffeeCupIcon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            onClick={() => setShowLogsModal(true)} 
            className="p-2 rounded-md bg-gray-700 hover:bg-blue-600 text-white transition-colors" 
            title="查看历史记录"
          >
            <HistoryIcon className="w-6 h-6"/>
          </button>
          <button 
            onClick={handleArchiveData}
            disabled={archiving || orders.length === 0}
            className="p-2 rounded-md bg-gray-700 hover:bg-orange-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title={archiving ? "结算中..." : "结算本周数据"}
          >
            <ArchiveIcon className="w-6 h-6"/>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          <CoffeeCupIcon className="w-8 h-8"/>
          咖啡订单管理系统
        </h1>
        <button 
          onClick={handleExportData} 
          className="p-2 rounded-md bg-gray-700 hover:bg-green-600 text-white transition-colors" 
          title="导出数据"
        >
          <DownloadIcon className="w-6 h-6"/>
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        {/* Left Side: Tables & Statistics */}
        <div className="lg:col-span-1 space-y-8">
          <section>
            <Statistics stats={statistics} />
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-gray-700">选择餐桌下单</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map(tableNum => (
                <button
                  key={tableNum}
                  onClick={() => setSelectedTable(tableNum)}
                  className="aspect-square flex items-center justify-center text-xl font-bold rounded-lg bg-gray-700 hover:bg-blue-600 hover:scale-105 transition-all duration-200 shadow-md"
                >
                  {tableNum}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Order Queue */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold pb-2 border-b-2 border-gray-700 flex-grow">
              订单队列 ({totalPendingItems} 待制作)
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortBy('table')} 
                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
              >
                按桌号
              </button>
              <button 
                onClick={() => setSortBy('time')} 
                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'time' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
              >
                按时间
              </button>
            </div>
          </div>

          {preparingOrders.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {preparingOrders.map(order => (
                <OrderCard 
                  key={order.id || order.tableNumber} 
                  order={order} 
                  onUpdateItemStatus={handleUpdateItemStatus}
                  onEdit={setEditingOrder}
                  onDelete={setDeletingOrderId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
              <p className="text-gray-400">当前没有待制作的订单。</p>
            </div>
          )}
          
          <h2 className="text-2xl font-semibold mt-12 mb-4 pb-2 border-b-2 border-gray-700">
            已完成 ({readyOrders.length})
          </h2>
          {readyOrders.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
              <p className="text-gray-400">还没有已完成的订单。</p>
            </div>
          )}
        </section>
      </main>

      {(selectedTable || editingOrder) && (
        <OrderModal
          tableNumber={selectedTable}
          existingOrder={editingOrder}
          onClose={() => { setSelectedTable(null); setEditingOrder(null) }}
          onPlaceOrder={handlePlaceOrder}
          onUpdateOrder={handleUpdateOrder}
        />
      )}

      {deletingOrderId && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteOrder}
          onCancel={() => setDeletingOrderId(null)}
        />
      )}

      {showLogsModal && (
        <LogsModal onClose={() => setShowLogsModal(false)} />
      )}
    </div>
  )
}
