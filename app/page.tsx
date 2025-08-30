'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Order, OrderStats, UpdateOrderRequest, CreateOrderRequest, CoffeeItem } from '@/types'
import { ApiService } from '@/lib/api-service'
import { OrderCard } from '@/components/OrderCard'
import { OrderModal } from '@/components/OrderModal'
import { Statistics } from '@/components/Statistics'
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal'
import { LogsModal } from '@/components/LogsModal'
import { ActionLog } from '@/components/ActionLog'
import { CoffeeCupIcon, DownloadIcon, HistoryIcon, ArchiveIcon } from '@/components/Icons'

const TABLE_COUNT = 24

export default function HomePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statistics, setStatistics] = useState<OrderStats>({ coffeeCounts: {}, tableCounts: {} })
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'table' | 'table-desc' | 'time'>('time')
  const [loading, setLoading] = useState(true)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [actionLogs, setActionLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setActionLogs(prev => [...prev, `${timestamp} - ${msg}`])
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setShowOrderModal(true)
    addLog(`Editing order${typeof order.tableNumber === 'number' ? ` for table ${order.tableNumber}` : order.customerName ? ` for ${order.customerName}` : ''}`)
  }

  const handleRequestDeleteOrder = (orderId: string) => {
    setDeletingOrderId(orderId)
    const order = orders.find(o => o.id === orderId)
    if (order) {
      addLog(`Requested delete order${typeof order.tableNumber === 'number' ? ` for table ${order.tableNumber}` : order.customerName ? ` for ${order.customerName}` : ''}`)
    }
  }

  const handleSortChange = (sort: 'table' | 'table-desc' | 'time') => {
    setSortBy(sort)
    const label = sort === 'table' ? 'table' : sort === 'table-desc' ? 'table (desc)' : 'time'
    addLog(`Sorted by ${label}`)
  }

  // Fast local stats calculator to avoid extra round-trips
  const computeStats = (src: Order[]): OrderStats => {
    const coffeeCounts: Record<string, number> = {}
    const tableCounts: Record<string, number> = {}
    for (const order of src) {
      // Only count items still preparing
      let pending = 0
      for (const item of order.items) {
        if (item.status === 'preparing') {
          pending++
          const key = `${item.name} (${item.temperature === 'iced' ? 'Iced' : 'Hot'})`
          coffeeCounts[key] = (coffeeCounts[key] || 0) + 1
        }
      }
      if (pending > 0 && typeof order.tableNumber === 'number') {
        tableCounts[order.tableNumber.toString()] = (tableCounts[order.tableNumber.toString()] || 0) + pending
      }
    }
    return { coffeeCounts, tableCounts }
  }

  // Load data
  const loadData = async () => {
    try {
      console.log('Start loading data...')
      const [ordersData, statsData] = await Promise.all([
        ApiService.getAllOrders(),
        ApiService.getStatistics()
      ])
      console.log('Orders loaded:', ordersData)
      console.log('Stats loaded:', statsData)
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
    
    // Auto refresh every 10s
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Place order
  const handlePlaceOrder = async ({ tableNumber, customerName, remark, items }: { tableNumber?: number; customerName?: string; remark?: string; items: CreateOrderRequest['items'] }) => {
    try {
  console.log('Placing order...', { tableNumber, customerName, remark, items })
  const created = await ApiService.createOrder({ tableNumber, customerName, remark, items })
      // Optimistic: merge created order locally and recompute stats
      setOrders(prev => {
        const next = [...prev, created]
        setStatistics(computeStats(next))
        return next
      })
      setSelectedTable(null)
      setShowOrderModal(false)
      addLog(`Placed order with ${items.length} item(s)${tableNumber ? ` for table ${tableNumber}` : ''}${customerName ? ` (customer: ${customerName})` : ''}`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  // Update order
  const handleUpdateOrder = async (payload: { orderId: string; items: UpdateOrderRequest['items'] }) => {
    try {
      const updated = await ApiService.updateOrder(payload)
      setOrders(prev => {
        const next = prev.map(o => (o.id === updated.id ? updated : o))
        setStatistics(computeStats(next))
        return next
      })
      setEditingOrder(null)
      setShowOrderModal(false)
      addLog(`Updated order${typeof updated.tableNumber === 'number' ? ` for table ${updated.tableNumber}` : updated.customerName ? ` for ${updated.customerName}` : ''}`)
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order. Please try again.')
    }
  }
  
  // Delete order
  const handleDeleteOrder = async () => {
    if (!deletingOrderId) return
    const orderToDelete = orders.find(o => o.id === deletingOrderId)

    try {
      await ApiService.deleteOrder(deletingOrderId)
      setOrders(prev => {
        const next = prev.filter(o => o.id !== deletingOrderId)
        setStatistics(computeStats(next))
        return next
      })
      setDeletingOrderId(null)
      if (orderToDelete) {
        addLog(`Deleted order${typeof orderToDelete.tableNumber === 'number' ? ` for table ${orderToDelete.tableNumber}` : orderToDelete.customerName ? ` for ${orderToDelete.customerName}` : ''}`)
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Failed to delete order. Please try again.')
    }
  }

  // Toggle single coffee item status
  const handleUpdateItemStatus = async (orderId: string, itemIndex: number) => {
    const order = orders.find(o => o.id === orderId)
    const item = order?.items[itemIndex]
    const newStatus = item?.status === 'preparing' ? 'ready' : 'preparing'
    if (item) {
      addLog(`${newStatus === 'ready' ? 'Completed' : 'Reverted'} ${item.name}${typeof order?.tableNumber === 'number' ? ` for table ${order.tableNumber}` : order?.customerName ? ` for ${order.customerName}` : ''}`)
    }
    // Optimistic toggle
    let reverted = false
    setOrders((prev: Order[]) => {
      const next = prev.map(o => {
        if (o.id !== orderId) return o
        const items = o.items.map((it, idx) =>
          idx === itemIndex
            ? { ...it, status: (it.status === 'preparing' ? 'ready' : 'preparing') as 'preparing' | 'ready' }
            : it
        )
        return { ...o, items }
      })
      setStatistics(computeStats(next))
      return next
    })
    try {
      await ApiService.updateItemStatus(orderId, itemIndex)
    } catch (error) {
      console.error('Error updating item status, reloading to revert:', error)
      reverted = true
      await loadData()
      alert('Failed to update status. Refreshed data.')
      addLog('Failed to update item status and reverted change')
    }
  }

  // Export data as TXT
  const handleExportData = () => {
    if (orders.length === 0) {
      alert("No orders to export.")
      return
    }

    const totalCoffeeSummary: Record<string, number> = {}
    const tableSummary: Record<string, Record<string, number>> = {}

    orders.forEach((order: Order) => {
      order.items.forEach((item: CoffeeItem) => {
        const key = `${item.name} (${item.temperature === 'iced' ? 'Iced' : 'Hot'})`
        totalCoffeeSummary[key] = (totalCoffeeSummary[key] || 0) + 1
        if (typeof order.tableNumber === 'number') {
          if (!tableSummary[order.tableNumber]) {
            tableSummary[order.tableNumber] = {}
          }
          tableSummary[order.tableNumber][key] = (tableSummary[order.tableNumber][key] || 0) + 1
        }
      })
    })

    let content = "Coffee Orders Summary Report\n"
    content += `Exported At: ${new Date().toLocaleString()}\n`
    content += "====================================\n\n"

    content += "### Totals ###\n"
    const sortedTotalSummary = Object.entries(totalCoffeeSummary).sort((a, b) => a[0].localeCompare(b[0]))
    sortedTotalSummary.forEach(([name, count]) => {
      content += `- ${name}: ${count}\n`
    })
    content += "\n====================================\n\n"

    content += "### By Table ###\n"
    const sortedTableNumbers = Object.keys(tableSummary).sort((a, b) => parseInt(a) - parseInt(b))
    sortedTableNumbers.forEach(tableNumber => {
      content += `\n--- Table: ${tableNumber} ---\n`
      const sortedItems = Object.entries(tableSummary[parseInt(tableNumber)]).sort((a, b) => a[0].localeCompare(b[0]))
      sortedItems.forEach(([name, count]) => {
        content += `  - ${name}: ${count}\n`
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
    addLog('Exported current data')
  }

  // Archive current data and clear
  const handleArchiveData = async () => {
    if (orders.length === 0) {
      alert('No data to archive')
      return
    }

    const confirmMessage = `Archive this week's data?\n\nThis will:\n1. Save all current orders to History\n2. Clear existing data\n3. Start a new cycle\n\nCurrent orders: ${orders.length}`
    
    if (!confirm(confirmMessage)) {
      addLog('Cancelled archive prompt')
      return
    }

    // Prompt for password
    const password = prompt('Please enter the archive password:')
    if (!password) {
      addLog('Archive cancelled: no password')
      return
    }

    setArchiving(true)
    try {
  console.log('Archiving data...')
      const result = await ApiService.archiveCurrentData(password)
  console.log('Archive done:', result)

  // Reload (should be empty)
      await loadData()
      addLog('Archived current data')

  alert(`Archived successfully!\n\nSaved ${result.archive?.totalOrders || 0} orders to history.`)
    } catch (error) {
  console.error('Archive failed:', error)
      if (error instanceof Error && error.message === 'Invalid password') {
        alert('Invalid password. Archive cancelled.')
      } else {
        alert('Failed to archive. Please try again.')
      }
      addLog('Failed to archive data')
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
      if (order.items.every((item: CoffeeItem) => item.status === 'ready')) {
        ready.push(order)
        continue
      }
      
      const decoratedItems = order.items.map((item: CoffeeItem, index: number) => ({
        ...item,
        orderId: order.id,
        originalIndex: index,
      }))

      const isUrgent = order.items.some((i: CoffeeItem) => i.isUrgent && i.status === 'preparing')
      // Name-only orders (no table) should appear in the urgent list as well
      if (isUrgent || typeof order.tableNumber !== 'number') {
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
      nonUrgentList.sort((a, b) => (a.tableNumber! - b.tableNumber!))
    } else if (sortBy === 'table-desc') {
      nonUrgentList.sort((a, b) => (b.tableNumber! - a.tableNumber!))
    } else {
      nonUrgentList.sort((a, b) => a.timestamp - b.timestamp)
    }
    
    ready.sort((a, b) => b.timestamp - a.timestamp)

    return { 
      preparingOrders: [...urgentOrders, ...nonUrgentList], 
      readyOrders: ready
    }
  }, [orders, sortBy])

  const totalPendingItems = (Object.values(statistics.coffeeCounts) as number[]).reduce((sum, count) => sum + count, 0)

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CoffeeCupIcon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => { setShowLogsModal(true); addLog('Opened history modal') }}
            className="p-2 rounded-md bg-gray-700 hover:bg-blue-600 text-white transition-colors"
            title="View history"
          >
            <HistoryIcon className="w-6 h-6"/>
          </button>
          <button 
            onClick={handleArchiveData}
            disabled={archiving || orders.length === 0}
            className="p-2 rounded-md bg-gray-700 hover:bg-orange-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title={archiving ? "Archiving..." : "Archive this week"}
          >
            <ArchiveIcon className="w-6 h-6"/>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          <CoffeeCupIcon className="w-8 h-8"/>
          Coffee Order Manager
        </h1>
        <button 
          onClick={handleExportData} 
          className="p-2 rounded-md bg-gray-700 hover:bg-green-600 text-white transition-colors" 
          title="Export data"
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
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-gray-700">Select a table to order</h2>
            <div className="mb-4">
              <button
                onClick={() => { setSelectedTable(null); setShowOrderModal(true); addLog('Started priority order') }}
                className="w-full px-3 py-2 rounded-md bg-red-700 hover:bg-red-600 text-white transition-colors"
                title="Create a name-only priority order"
              >
                Priority order (name only)
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map(tableNum => (
                <button
                  key={tableNum}
                  onClick={() => { setSelectedTable(tableNum); setShowOrderModal(true); addLog(`Started order for table ${tableNum}`) }}
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
              Preparing Queue ({totalPendingItems} pending)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('table')}
                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
              >
                By table
              </button>
              <button
                onClick={() => handleSortChange('table-desc')}
                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'table-desc' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
              >
                By table (desc)
              </button>
              <button
                onClick={() => handleSortChange('time')}
                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'time' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
              >
                By time
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
                  onEdit={handleEditOrder}
                  onDelete={handleRequestDeleteOrder}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
              <p className="text-gray-400">No orders are pending.</p>
            </div>
          )}
          
          <h2 className="text-2xl font-semibold mt-12 mb-4 pb-2 border-b-2 border-gray-700">
            Completed ({readyOrders.length})
          </h2>
          {readyOrders.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdateItemStatus={handleUpdateItemStatus} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
              <p className="text-gray-400">No completed orders yet.</p>
            </div>
          )}
        </section>
      </main>

    {(showOrderModal || editingOrder) && (
        <OrderModal
          tableNumber={selectedTable}
          existingOrder={editingOrder}
      onClose={() => { setSelectedTable(null); setEditingOrder(null); setShowOrderModal(false); addLog('Closed order modal') }}
          onPlaceOrder={handlePlaceOrder}
          onUpdateOrder={handleUpdateOrder}
        />
      )}

      {deletingOrderId && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteOrder}
          onCancel={() => { setDeletingOrderId(null); addLog('Cancelled delete order') }}
        />
      )}

      {showLogsModal && (
  <LogsModal onClose={() => { setShowLogsModal(false); addLog('Closed history modal') }} />
      )}
      <ActionLog logs={actionLogs} />
    </div>
  )
}
