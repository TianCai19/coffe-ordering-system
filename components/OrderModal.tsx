"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Order, CreateOrderRequest, UpdateOrderRequest } from '@/types'
import { ZapIcon } from './Icons'
import { DEFAULT_MENU, MenuItem } from '@/lib/menu'
import { ApiService } from '@/lib/api-service'

interface OrderModalProps {
  tableNumber: number | null
  theme?: 'dark' | 'light'
  onClose: () => void
  onPlaceOrder: (order: { tableNumber?: number; customerName?: string; remark?: string; items: CreateOrderRequest['items'] }) => void
  existingOrder?: Order | null
  onUpdateOrder?: (payload: { orderId: string; items: UpdateOrderRequest['items']; remark?: string }) => void
}

export const OrderModal: React.FC<OrderModalProps> = (props: OrderModalProps) => {
  const { tableNumber, theme = 'dark', onClose, onPlaceOrder, existingOrder, onUpdateOrder } = props
  const isEditMode = !!existingOrder
  const [customerName, setCustomerName] = useState<string>(existingOrder?.customerName || '')
  const [remark, setRemark] = useState<string>(existingOrder?.remark || '')
  
  const [selectedCoffees, setSelectedCoffees] = useState<Record<string, { hot: number; iced: number }>>(() => {
    if (!isEditMode || !existingOrder) return {}
    const initial: Record<string, { hot: number; iced: number }> = {}
    existingOrder.items.forEach(item => {
      if (!initial[item.name]) {
        initial[item.name] = { hot: 0, iced: 0 }
      }
      initial[item.name][item.temperature]++
    })
    return initial
  })
  const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU)
  const menuMap = useMemo(() => Object.fromEntries(menu.map(m => [m.name, m])), [menu])

  useEffect(() => {
    (async () => {
      try {
        const m = await ApiService.getMenu()
        if (Array.isArray(m) && m.length > 0) setMenu(m)
      } catch {}
    })()
  }, [])
  
  const [urgentTypes, setUrgentTypes] = useState<Set<string>>(() => {
    if (!isEditMode || !existingOrder) return new Set<string>()
    const urgent = new Set<string>()
    existingOrder.items.forEach(item => {
      if (item.isUrgent) {
        urgent.add(item.name)
      }
    })
    return urgent
  })

  const handleQuantityChange = (coffee: string, temperature: 'hot' | 'iced', delta: number) => {
    const allow = temperature === 'hot' ? menuMap[coffee]?.hot : menuMap[coffee]?.iced
    if (!allow) return
    setSelectedCoffees((prev: Record<string, { hot: number; iced: number }>) => {
      const newCoffees = JSON.parse(JSON.stringify(prev)) as Record<string, { hot: number; iced: number }>
      if (!newCoffees[coffee]) {
        newCoffees[coffee] = { hot: 0, iced: 0 }
      }
      newCoffees[coffee][temperature] = Math.max(0, newCoffees[coffee][temperature] + delta)
      
      if (newCoffees[coffee].hot === 0 && newCoffees[coffee].iced === 0) {
        delete newCoffees[coffee]
        setUrgentTypes((prevUrgent: Set<string>) => {
          const newUrgent = new Set<string>(prevUrgent)
          newUrgent.delete(coffee)
          return newUrgent
        })
      }
      return newCoffees
    })
  }

  const toggleUrgent = (coffee: string) => {
    if (!selectedCoffees[coffee] || (selectedCoffees[coffee].hot === 0 && selectedCoffees[coffee].iced === 0)) return
    setUrgentTypes((prev: Set<string>) => {
      const newUrgent = new Set<string>(prev)
      newUrgent.has(coffee) ? newUrgent.delete(coffee) : newUrgent.add(coffee)
      return newUrgent
    })
  }

  const handleSubmit = () => {
    const items = (Object.entries(selectedCoffees) as Array<[string, { hot: number; iced: number }]>).reduce<Array<{ name: string; isUrgent: boolean; temperature: 'hot' | 'iced' }>>((acc, [name, temps]) => {
      const isUrgent = urgentTypes.has(name)
      for (let i = 0; i < temps.hot; i++) acc.push({ name, isUrgent, temperature: 'hot' })
      for (let i = 0; i < temps.iced; i++) acc.push({ name, isUrgent, temperature: 'iced' })
      return acc
    }, [])

    if (items.length === 0) {
      alert('Please select at least one drink!')
      return
    }

    if (isEditMode && onUpdateOrder && existingOrder) {
      const updateItems: UpdateOrderRequest['items'] = items.map(i => ({ name: i.name, temperature: i.temperature, isUrgent: i.isUrgent }))
      onUpdateOrder({ orderId: existingOrder.id, items: updateItems, remark })
    } else {
      // If no table selected, require a customer name for priority orders
      if (!tableNumber && !customerName.trim()) {
        alert('Please enter a customer name for priority orders.')
        return
      }
  onPlaceOrder({ tableNumber: tableNumber ?? undefined, customerName: customerName.trim() || undefined, remark: remark.trim() || undefined, items })
    }
  }
  
  const totalItems = (Object.values(selectedCoffees) as Array<{ hot: number; iced: number }>).reduce((sum, temps) => sum + temps.hot + temps.iced, 0)
  const currentTableNumber = isEditMode ? existingOrder?.tableNumber ?? null : tableNumber

  // Theme-aware classes
  const themeClasses = {
    overlay: theme === 'dark' ? 'bg-black bg-opacity-75' : 'bg-black bg-opacity-50',
    modal: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    heading: theme === 'dark' ? 'text-white' : 'text-gray-900',
    label: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
    input: theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900',
    button: theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    primaryButton: 'bg-green-600 hover:bg-green-700 text-white',
    itemCard: theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100',
    itemText: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
    countButton: theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    countDisplay: theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border-gray-300'
  }

  return (
    <div className={`fixed inset-0 ${themeClasses.overlay} flex justify-center items-center z-50`}>
      <div className={`${themeClasses.modal} rounded-xl p-8 w-full max-w-2xl m-4 shadow-2xl border`}>
        <h2 className={`text-3xl font-bold ${themeClasses.heading} mb-6`}>
          {isEditMode 
            ? `Edit order for ${existingOrder?.customerName ? `Customer ${existingOrder?.customerName}` : `Table ${currentTableNumber}`}`
            : currentTableNumber 
              ? `Table ${currentTableNumber} - Order`
              : 'Priority Order (Name Only)'}
        </h2>
        {!currentTableNumber && (
          <div className="mb-4">
            <label className={`block text-sm ${themeClasses.label} mb-1`}>Customer Name</label>
            <input 
              value={customerName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
              placeholder="Enter name"
              className={`w-full px-3 py-2 rounded ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        )}
        {/* Remark */}
        <div className="mb-4">
          <label className={`block text-sm ${themeClasses.label} mb-1`}>Remark</label>
          <textarea
            value={remark}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemark(e.target.value)}
            placeholder="Add any special notes (e.g., extra sugar, less ice)"
            className={`w-full px-3 py-2 rounded ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px]`}
          />
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            {['Extra sugar', 'Less ice', 'No sugar', 'Oat milk', 'Decaf'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRemark(r => r ? `${r} | ${preset}` : preset)}
                className={`px-2 py-1 rounded ${themeClasses.button}`}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2">
          {menu.map(coffeeItem => {
            const coffee = coffeeItem.name
            const quantities = (selectedCoffees as Record<string, { hot: number; iced: number }>)[coffee] || { hot: 0, iced: 0 }
            const isUrgent = urgentTypes.has(coffee)
            const hasSelection = quantities.hot > 0 || quantities.iced > 0
            return (
              <div key={coffee} className={`p-4 rounded-lg transition-colors ${isUrgent ? 
                (theme === 'dark' ? 'bg-red-900/50' : 'bg-red-50') : 
                (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium text-lg ${isUrgent ? 
                    (theme === 'dark' ? 'text-red-300' : 'text-red-700') : 
                    themeClasses.itemText}`}>{coffee}</span>
                  <button 
                    onClick={() => toggleUrgent(coffee)} 
                    className={`p-2 rounded-full transition-colors ${isUrgent ? 'bg-red-500 text-white' : 
                      (theme === 'dark' ? 'bg-gray-600 hover:bg-red-500' : 'bg-gray-200 hover:bg-red-500 hover:text-white')} ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!hasSelection}
                  >
                    <ZapIcon className="w-5 h-5"/>
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {/* Hot Controls */}
                  <div className={`flex items-center justify-between ${themeClasses.itemCard} p-2 rounded-md opacity-100`}>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`}>Hot</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'hot', -1)} 
                        className={`w-7 h-7 rounded-full ${themeClasses.countButton} font-bold text-lg transition-colors`}
                        disabled={!coffeeItem.hot}
                      >
                        -
                      </button>
                      <span className={`w-8 text-center text-xl font-bold ${themeClasses.itemText} ${!coffeeItem.hot ? 'opacity-50' : ''}`}>{quantities.hot}</span>
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'hot', 1)} 
                        className={`w-7 h-7 rounded-full ${themeClasses.countButton} hover:bg-green-600 hover:text-white font-bold text-lg transition-colors disabled:opacity-50`}
                        disabled={!coffeeItem.hot}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Iced Controls */}
                  <div className={`flex items-center justify-between ${themeClasses.itemCard} p-2 rounded-md`}>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Iced</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'iced', -1)} 
                        className={`w-7 h-7 rounded-full ${themeClasses.countButton} font-bold text-lg transition-colors disabled:opacity-50`}
                        disabled={!coffeeItem.iced}
                      >
                        -
                      </button>
                      <span className={`w-8 text-center text-xl font-bold ${themeClasses.itemText} ${!coffeeItem.iced ? 'opacity-50' : ''}`}>{quantities.iced}</span>
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'iced', 1)} 
                        className={`w-7 h-7 rounded-full ${themeClasses.countButton} hover:bg-green-600 hover:text-white font-bold text-lg transition-colors disabled:opacity-50`}
                        disabled={!coffeeItem.iced}
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
            className={`w-full ${themeClasses.button} font-bold py-3 px-4 rounded-lg transition-colors`}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className={`w-full ${themeClasses.primaryButton} font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed`}
            disabled={totalItems === 0}
          >
            {isEditMode ? 'Update Order' : `Place Order (${totalItems})`}
          </button>
        </div>
      </div>
    </div>
  )
}
