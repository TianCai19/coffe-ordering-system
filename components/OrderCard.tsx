import React, { useMemo } from 'react'
import { Order, CoffeeItem } from '@/types'
import { CheckCircleIcon, ZapIcon, EditIcon, TrashIcon } from './Icons'

interface OrderCardProps {
  order: Order
  onUpdateItemStatus?: (orderId: string, itemIndex: number) => void
  onEdit?: (order: Order) => void
  onDelete?: (orderId: string) => void
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onUpdateItemStatus, 
  onEdit, 
  onDelete 
}) => {
  const { tableNumber, items, timestamp } = order
  const isMerged = !order.id

  const isOrderReady = items.every(item => item.status === 'ready')
  const isUrgentOrder = items.some(item => item.isUrgent && item.status === 'preparing')
  // Name-only (priority) orders should always render as urgent/red
  const isNameOnlyPriority = !!order.customerName && typeof order.tableNumber !== 'number'
  const isUrgentCard = isUrgentOrder || isNameOnlyPriority
  
  const cardBg = isOrderReady ? 'bg-green-900/50' : (isUrgentCard ? 'bg-red-900/60' : 'bg-gray-800')
  const borderColor = isOrderReady ? 'border-green-500' : (isUrgentCard ? 'border-red-500' : 'border-gray-600')

  const groupedItems = useMemo<Array<{
    name: string
    temperature: 'hot' | 'iced'
    details: Array<{
      status: 'preparing' | 'ready'
      orderId: string
      originalIndex: number
      isUrgent: boolean
    }>
  }>>(() => {
    const groups: Record<string, {
      name: string
      temperature: 'hot' | 'iced'
      details: Array<{
        status: 'preparing' | 'ready'
        orderId: string
        originalIndex: number
        isUrgent: boolean
      }>
    }> = {}
    
    items.forEach((item: CoffeeItem) => {
      const key = `${item.name}-${item.temperature}`
      if (!groups[key]) {
        groups[key] = {
          name: item.name,
          temperature: item.temperature,
          details: [],
        }
      }
      groups[key].details.push({
        status: item.status,
        orderId: item.orderId,
        originalIndex: item.originalIndex,
        isUrgent: item.isUrgent,
      })
    })
    return Object.values(groups)
  }, [items])

  return (
    <div className={`p-4 rounded-lg border ${borderColor} ${cardBg} transition-all duration-300 shadow-lg flex flex-col`}>
      <div className="flex justify-between items-start">
        <div>
      <h3 className="font-bold text-xl text-white">{order.customerName ? `Customer: ${order.customerName}` : `Table: ${tableNumber}`}</h3>
      <p className="text-xs text-gray-400">First item at: {new Date(timestamp).toLocaleTimeString()}</p>
      {order.remark && (
        <p className="text-xs mt-1 text-yellow-300">Remark: {order.remark}</p>
      )}
        </div>
        <div className="flex items-center gap-2">
          {isUrgentCard && (
            <div className="flex items-center gap-1 text-red-400 bg-red-900/50 px-2 py-1 rounded-full text-sm">
              <ZapIcon className="w-4 h-4" />
        <span>Urgent</span>
            </div>
          )}
          {isOrderReady && (
            <div className="flex items-center gap-1 text-green-400 bg-green-900/50 px-2 py-1 rounded-full text-sm">
              <CheckCircleIcon className="w-4 h-4" />
        <span>Completed</span>
            </div>
          )}
        </div>
      </div>
      <ul className="mt-3 space-y-2 flex-grow">
        {groupedItems.map((group: { name: string; temperature: 'hot' | 'iced'; details: Array<{ status: 'preparing' | 'ready'; orderId: string; originalIndex: number; isUrgent: boolean }> }) => {
          const allInGroupReady = group.details.every(d => d.status === 'ready')
          return (
            <li key={`${group.name}-${group.temperature}`} className="flex justify-between items-center">
              <span className={`transition-colors flex items-center gap-1.5 ${allInGroupReady ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                {group.details.some(d => d.isUrgent) && <ZapIcon className="w-4 h-4 text-red-400" />}
                {group.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${group.temperature === 'iced' ? 'bg-blue-800 text-blue-300' : 'bg-orange-800 text-orange-300'}`}>
          {group.temperature === 'iced' ? 'Iced' : 'Hot'}
                </span>
                <span className="text-gray-400 text-sm">x{group.details.length}</span>
              </span>
              
              {onUpdateItemStatus && (
                <div className="flex flex-nowrap gap-1.5">
                  {group.details.map((detail, index: number) => (
                    <button 
                      key={index} 
                      onClick={() => onUpdateItemStatus(detail.orderId, detail.originalIndex)}
                      className={`p-1 rounded-full transition-colors relative ${detail.status === 'ready' ? 'bg-green-500 text-white' : 'bg-gray-600 hover:bg-blue-600 text-gray-400'}`}
                    >
                      {detail.isUrgent && detail.status === 'preparing' && <ZapIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-400 fill-current" />}
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {!isMerged && !isOrderReady && onEdit && onDelete && (
        <div className="mt-4 pt-3 border-t border-gray-700 flex justify-end gap-2">
          <button onClick={() => onEdit(order)} className="p-2 rounded-md bg-gray-600 hover:bg-yellow-600 text-white transition-colors">
            <EditIcon className="w-5 h-5"/>
          </button>
          <button onClick={() => onDelete(order.id)} className="p-2 rounded-md bg-gray-600 hover:bg-red-600 text-white transition-colors">
            <TrashIcon className="w-5 h-5"/>
          </button>
        </div>
      )}
    </div>
  )
}
