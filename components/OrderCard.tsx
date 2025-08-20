import React, { useMemo } from 'react'
import { Order, CoffeeItem } from '@/types'
import { CheckCircleIcon, ZapIcon, EditIcon, TrashIcon } from './Icons'

interface OrderCardProps {
  order: Order
  theme?: 'dark' | 'light'
  onUpdateItemStatus?: (orderId: string, itemIndex: number) => void
  onEdit?: (order: Order) => void
  onDelete?: (orderId: string) => void
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  theme = 'dark',
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
  
  // Theme-aware colors
  const getCardStyles = () => {
    if (isOrderReady) {
      return {
        cardBg: theme === 'dark' ? 'bg-green-900/50' : 'bg-green-50',
        borderColor: 'border-green-500'
      }
    }
    if (isUrgentCard) {
      return {
        cardBg: theme === 'dark' ? 'bg-red-900/60' : 'bg-red-50',
        borderColor: 'border-red-500'
      }
    }
    return {
      cardBg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      borderColor: theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
    }
  }
  
  const { cardBg, borderColor } = getCardStyles()
  
  // Theme-aware text and button colors
  const themeClasses = {
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    mutedText: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    highlightText: theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600',
    button: theme === 'dark' ? 'bg-gray-600 hover:bg-blue-600 text-gray-400' : 'bg-gray-200 hover:bg-blue-500 text-gray-600',
    buttonActive: 'bg-green-500 text-white',
    actionButton: theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
  }

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
      <h3 className={`font-bold text-xl ${themeClasses.text}`}>{order.customerName ? `Customer: ${order.customerName}` : `Table: ${tableNumber}`}</h3>
      <p className={`text-xs ${themeClasses.mutedText}`}>First item at: {new Date(timestamp).toLocaleTimeString()}</p>
      {order.remark && (
        <p className={`text-xs mt-1 ${themeClasses.highlightText}`}>Remark: {order.remark}</p>
      )}
        </div>
        <div className="flex items-center gap-2">
          {isUrgentCard && (
            <div className={`flex items-center gap-1 text-red-400 ${theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'} px-2 py-1 rounded-full text-sm`}>
              <ZapIcon className="w-4 h-4" />
        <span>Urgent</span>
            </div>
          )}
          {isOrderReady && (
            <div className={`flex items-center gap-1 text-green-400 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'} px-2 py-1 rounded-full text-sm`}>
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
              <span className={`transition-colors flex items-center gap-1.5 ${allInGroupReady ? `${themeClasses.mutedText} line-through` : themeClasses.text}`}>
                {group.details.some(d => d.isUrgent) && <ZapIcon className="w-4 h-4 text-red-400" />}
                {group.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${group.temperature === 'iced' ? 
                  (theme === 'dark' ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-700') : 
                  (theme === 'dark' ? 'bg-orange-800 text-orange-300' : 'bg-orange-100 text-orange-700')}`}>
          {group.temperature === 'iced' ? 'Iced' : 'Hot'}
                </span>
                <span className={`${themeClasses.mutedText} text-sm`}>x{group.details.length}</span>
              </span>
              
              {onUpdateItemStatus && (
                group.details.length > 4 ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5">
                      {group.details.slice(0, 4).map((detail, index: number) => (
                        <button
                          key={index}
                          onClick={() => onUpdateItemStatus(detail.orderId, detail.originalIndex)}
                          className={`p-1 rounded-full transition-colors relative ${detail.status === 'ready' ? themeClasses.buttonActive : themeClasses.button}`}
                        >
                          {detail.isUrgent && detail.status === 'preparing' && <ZapIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-400 fill-current" />}
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      {group.details.slice(4).map((detail, index: number) => (
                        <button
                          key={index + 4}
                          onClick={() => onUpdateItemStatus(detail.orderId, detail.originalIndex)}
                          className={`p-1 rounded-full transition-colors relative ${detail.status === 'ready' ? themeClasses.buttonActive : themeClasses.button}`}
                        >
                          {detail.isUrgent && detail.status === 'preparing' && <ZapIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-400 fill-current" />}
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-nowrap gap-1.5">
                    {group.details.map((detail, index: number) => (
                      <button
                        key={index}
                        onClick={() => onUpdateItemStatus(detail.orderId, detail.originalIndex)}
                        className={`p-1 rounded-full transition-colors relative ${detail.status === 'ready' ? themeClasses.buttonActive : themeClasses.button}`}
                      >
                        {detail.isUrgent && detail.status === 'preparing' && <ZapIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-400 fill-current" />}
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )
              )}
            </li>
          )
        })}
      </ul>
      {!isMerged && !isOrderReady && onEdit && onDelete && (
        <div className={`mt-4 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-2`}>
          <button onClick={() => onEdit(order)} className={`p-2 rounded-md ${themeClasses.actionButton} hover:bg-yellow-600 hover:text-white transition-colors`}>
            <EditIcon className="w-5 h-5"/>
          </button>
          <button onClick={() => onDelete(order.id)} className={`p-2 rounded-md ${themeClasses.actionButton} hover:bg-red-600 hover:text-white transition-colors`}>
            <TrashIcon className="w-5 h-5"/>
          </button>
        </div>
      )}
    </div>
  )
}
