import React, { useState } from 'react'
import { Order } from '@/types'
import { ZapIcon } from './Icons'

const COFFEE_TYPES = [
  '拿铁 (Latte)', 
  '浓缩咖啡 (Espresso)', 
  '卡布奇诺 (Cappuccino)', 
  '美式咖啡 (Americano)', 
  '摩卡 (Mocha)', 
  '玛奇朵 (Macchiato)'
]

interface OrderModalProps {
  tableNumber: number | null
  onClose: () => void
  onPlaceOrder: (order: { tableNumber: number; items: any[] }) => void
  existingOrder?: Order | null
  onUpdateOrder?: (order: Order) => void
}

export const OrderModal: React.FC<OrderModalProps> = ({ 
  tableNumber, 
  onClose, 
  onPlaceOrder, 
  existingOrder, 
  onUpdateOrder 
}) => {
  const isEditMode = !!existingOrder
  
  const [selectedCoffees, setSelectedCoffees] = useState(() => {
    if (!isEditMode) return {}
    const initial: Record<string, { hot: number; iced: number }> = {}
    existingOrder.items.forEach(item => {
      if (!initial[item.name]) {
        initial[item.name] = { hot: 0, iced: 0 }
      }
      initial[item.name][item.temperature]++
    })
    return initial
  })
  
  const [urgentTypes, setUrgentTypes] = useState(() => {
    if (!isEditMode) return new Set<string>()
    const urgent = new Set<string>()
    existingOrder.items.forEach(item => {
      if (item.isUrgent) {
        urgent.add(item.name)
      }
    })
    return urgent
  })

  const handleQuantityChange = (coffee: string, temperature: 'hot' | 'iced', delta: number) => {
    setSelectedCoffees(prev => {
      const newCoffees = JSON.parse(JSON.stringify(prev))
      if (!newCoffees[coffee]) {
        newCoffees[coffee] = { hot: 0, iced: 0 }
      }
      newCoffees[coffee][temperature] = Math.max(0, newCoffees[coffee][temperature] + delta)
      
      if (newCoffees[coffee].hot === 0 && newCoffees[coffee].iced === 0) {
        delete newCoffees[coffee]
        setUrgentTypes(prevUrgent => {
          const newUrgent = new Set(prevUrgent)
          newUrgent.delete(coffee)
          return newUrgent
        })
      }
      return newCoffees
    })
  }

  const toggleUrgent = (coffee: string) => {
    if (!selectedCoffees[coffee] || (selectedCoffees[coffee].hot === 0 && selectedCoffees[coffee].iced === 0)) return
    setUrgentTypes(prev => {
      const newUrgent = new Set(prev)
      newUrgent.has(coffee) ? newUrgent.delete(coffee) : newUrgent.add(coffee)
      return newUrgent
    })
  }

  const handleSubmit = () => {
    const items = Object.entries(selectedCoffees).flatMap(([name, temps]) => {
      const isUrgent = urgentTypes.has(name)
      const hotItems = Array(temps.hot).fill({ name, isUrgent, temperature: 'hot' })
      const icedItems = Array(temps.iced).fill({ name, isUrgent, temperature: 'iced' })
      return [...hotItems, ...icedItems]
    })

    if (items.length === 0) {
      alert('请至少选择一种咖啡！')
      return
    }

    if (isEditMode && onUpdateOrder) {
      onUpdateOrder({
        ...existingOrder,
        items: items.map(item => ({ ...item, status: 'preparing' as const })),
      })
    } else {
      onPlaceOrder({ tableNumber: tableNumber!, items })
    }
    // 移除 onClose() - 让父组件来控制关闭
  }
  
  const totalItems = Object.values(selectedCoffees).reduce((sum, temps) => sum + temps.hot + temps.iced, 0)
  const currentTableNumber = isEditMode ? existingOrder.tableNumber : tableNumber

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl m-4 shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-6">
          {isEditMode ? `修改桌号 ${currentTableNumber} 的订单` : `桌号 ${currentTableNumber} - 点餐`}
        </h2>
        <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2">
          {COFFEE_TYPES.map(coffee => {
            const quantities = selectedCoffees[coffee] || { hot: 0, iced: 0 }
            const isUrgent = urgentTypes.has(coffee)
            const hasSelection = quantities.hot > 0 || quantities.iced > 0
            return (
              <div key={coffee} className={`p-4 rounded-lg transition-colors ${isUrgent ? 'bg-red-900/50' : 'bg-gray-700'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium text-lg ${isUrgent ? 'text-red-300' : 'text-gray-200'}`}>{coffee}</span>
                  <button 
                    onClick={() => toggleUrgent(coffee)} 
                    className={`p-2 rounded-full transition-colors ${isUrgent ? 'bg-red-500 text-white' : 'bg-gray-600 hover:bg-red-500'} ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!hasSelection}
                  >
                    <ZapIcon className="w-5 h-5"/>
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {/* Hot Controls */}
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md">
                    <span className="font-semibold text-orange-300">热</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'hot', -1)} 
                        className="w-7 h-7 rounded-full bg-gray-600 hover:bg-red-600 text-white font-bold text-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xl font-bold">{quantities.hot}</span>
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'hot', 1)} 
                        className="w-7 h-7 rounded-full bg-gray-600 hover:bg-green-600 text-white font-bold text-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Iced Controls */}
                  <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md">
                    <span className="font-semibold text-blue-300">冰</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'iced', -1)} 
                        className="w-7 h-7 rounded-full bg-gray-600 hover:bg-red-600 text-white font-bold text-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xl font-bold">{quantities.iced}</span>
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'iced', 1)} 
                        className="w-7 h-7 rounded-full bg-gray-600 hover:bg-green-600 text-white font-bold text-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between gap-4">
          <button 
            onClick={onClose} 
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit} 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500" 
            disabled={totalItems === 0}
          >
            {isEditMode ? '更新订单' : `确认下单 (${totalItems} 杯)`}
          </button>
        </div>
      </div>
    </div>
  )
}
