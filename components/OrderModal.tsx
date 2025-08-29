"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Order, CreateOrderRequest, UpdateOrderRequest } from '@/types'
import { ZapIcon } from './Icons'
import { DEFAULT_MENU, MenuItem } from '@/lib/menu'
import { ApiService } from '@/lib/api-service'

interface OrderModalProps {
  tableNumber: number | null
  onClose: () => void
  onPlaceOrder: (order: { tableNumber?: number; customerName?: string; remark?: string; items: CreateOrderRequest['items'] }) => void
  existingOrder?: Order | null
  onUpdateOrder?: (payload: { orderId: string; items: UpdateOrderRequest['items']; remark?: string }) => void
}

export const OrderModal: React.FC<OrderModalProps> = (props: OrderModalProps) => {
  const { tableNumber, onClose, onPlaceOrder, existingOrder, onUpdateOrder } = props
  const isEditMode = !!existingOrder
  const [customerName, setCustomerName] = useState<string>(existingOrder?.customerName || '')
  const [remark, setRemark] = useState<string>(existingOrder?.remark || '')
  
  // State for individual item remarks: coffeeName -> { hot: remark, iced: remark }
  const [itemRemarks, setItemRemarks] = useState<Record<string, { hot: string; iced: string }>>(() => {
    if (!isEditMode || !existingOrder) return {}
    const initial: Record<string, { hot: string; iced: string }> = {}
    existingOrder.items.forEach(item => {
      if (!initial[item.name]) {
        initial[item.name] = { hot: '', iced: '' }
      }
      if (item.remark) {
        initial[item.name][item.temperature] = item.remark
      }
    })
    return initial
  })
  
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

  const updateItemRemark = (coffeeName: string, temperature: 'hot' | 'iced', remark: string) => {
    setItemRemarks(prev => ({
      ...prev,
      [coffeeName]: {
        hot: prev[coffeeName]?.hot || '',
        iced: prev[coffeeName]?.iced || '',
        [temperature]: remark
      }
    }))
  }

  const addQuickRemarkToItem = (coffeeName: string, temperature: 'hot' | 'iced', quickRemark: string) => {
    setItemRemarks(prev => {
      const current = prev[coffeeName]?.[temperature] || ''
      const newRemark = current ? `${current} | ${quickRemark}` : quickRemark
      return {
        ...prev,
        [coffeeName]: {
          hot: prev[coffeeName]?.hot || '',
          iced: prev[coffeeName]?.iced || '',
          [temperature]: newRemark
        }
      }
    })
  }

  // Get quick remark options based on drink name
  const getQuickRemarks = (drinkName: string): string[] => {
    const lowerName = drinkName.toLowerCase()
    if (lowerName.includes('black') || lowerName.includes('white')) {
      return ['More shot', 'Less shot', 'More ice', 'Less ice', 'Extra sugar']
    } else if (lowerName.includes('mocha') || lowerName.includes('choc')) {
      return ['More choc', 'Less choc', 'More milk', 'Less milk', 'More ice', 'Less ice']
    }
    return []
  }

  const handleSubmit = () => {
    const items = (Object.entries(selectedCoffees) as Array<[string, { hot: number; iced: number }]>).reduce<Array<{ name: string; isUrgent: boolean; temperature: 'hot' | 'iced'; remark?: string }>>((acc, [name, temps]) => {
      const isUrgent = urgentTypes.has(name)
      const remarks = itemRemarks[name] || { hot: '', iced: '' }
      
      for (let i = 0; i < temps.hot; i++) {
        acc.push({ 
          name, 
          isUrgent, 
          temperature: 'hot',
          remark: remarks.hot.trim() || undefined
        })
      }
      for (let i = 0; i < temps.iced; i++) {
        acc.push({ 
          name, 
          isUrgent, 
          temperature: 'iced',
          remark: remarks.iced.trim() || undefined
        })
      }
      return acc
    }, [])

    if (items.length === 0) {
      alert('Please select at least one drink!')
      return
    }

    if (isEditMode && onUpdateOrder && existingOrder) {
      const updateItems: UpdateOrderRequest['items'] = items.map(i => ({ name: i.name, temperature: i.temperature, isUrgent: i.isUrgent, remark: i.remark }))
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-3xl m-4 shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-6">
          {isEditMode 
            ? `Edit order for ${existingOrder?.customerName ? `Customer ${existingOrder?.customerName}` : `Table ${currentTableNumber}`}`
            : currentTableNumber 
              ? `Table ${currentTableNumber} - Order`
              : 'Priority Order (Name Only)'}
        </h2>
        {!currentTableNumber && (
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">Customer Name</label>
            <input 
              value={customerName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {/* Remark */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Remark</label>
          <textarea
            value={remark}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemark(e.target.value)}
            placeholder="Add any special notes (e.g., extra sugar, less ice)"
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[70px]"
          />
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            {['Extra sugar', 'Extra shot', 'Less ice', 'Less milk'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRemark(r => r ? `${r} | ${preset}` : preset)}
                className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white"
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
                {/* Temperature labels at the top */}
                <div className="mt-3 mb-2 grid grid-cols-2 gap-4 text-center">
                  <div className="font-semibold text-orange-300">Hot</div>
                  <div className="font-semibold text-blue-300">Iced</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Hot Controls */}
                  <div className="flex items-center justify-center bg-orange-900/20 p-3 rounded-md border border-orange-800/30">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'hot', -1)} 
                        className="w-12 h-12 rounded-full bg-gray-600 hover:bg-red-600 text-white font-bold text-lg transition-colors"
                        disabled={!coffeeItem.hot}
                      >
                        -
                      </button>
                      <span className={`w-8 text-center text-xl font-bold ${!coffeeItem.hot ? 'opacity-50' : ''}`}>{quantities.hot}</span>
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'hot', 1)} 
                        className="w-12 h-12 rounded-full bg-gray-600 hover:bg-green-600 text-white font-bold text-lg transition-colors disabled:opacity-50"
                        disabled={!coffeeItem.hot}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Iced Controls */}
                  <div className="flex items-center justify-center bg-blue-900/20 p-3 rounded-md border border-blue-800/30">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'iced', -1)} 
                        className="w-12 h-12 rounded-full bg-gray-600 hover:bg-red-600 text-white font-bold text-lg transition-colors disabled:opacity-50"
                        disabled={!coffeeItem.iced}
                      >
                        -
                      </button>
                      <span className={`w-8 text-center text-xl font-bold ${!coffeeItem.iced ? 'opacity-50' : ''}`}>{quantities.iced}</span>
                      <button 
                        onClick={() => handleQuantityChange(coffee, 'iced', 1)} 
                        className="w-12 h-12 rounded-full bg-gray-600 hover:bg-green-600 text-white font-bold text-lg transition-colors disabled:opacity-50"
                        disabled={!coffeeItem.iced}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Individual Remarks Section - only show if drink has quantity or available quick remarks */}
                {(hasSelection || getQuickRemarks(coffee).length > 0) && (
                  <div className="mt-3 space-y-2">
                    {quantities.hot > 0 && (
                      <div className="bg-gray-800/30 p-2 rounded">
                        <label className="block text-xs text-orange-300 mb-1">Hot Remark</label>
                        <textarea
                          value={itemRemarks[coffee]?.hot || ''}
                          onChange={(e) => updateItemRemark(coffee, 'hot', e.target.value)}
                          placeholder="Notes for hot version..."
                          className="w-full px-2 py-1 text-xs rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          rows={1}
                        />
                        {getQuickRemarks(coffee).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getQuickRemarks(coffee).map((quickRemark) => (
                              <button
                                key={`${coffee}-hot-${quickRemark}`}
                                type="button"
                                onClick={() => addQuickRemarkToItem(coffee, 'hot', quickRemark)}
                                className="px-1.5 py-0.5 text-xs rounded bg-orange-800 hover:bg-orange-700 text-orange-200"
                              >
                                + {quickRemark}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {quantities.iced > 0 && coffeeItem.iced && (
                      <div className="bg-gray-800/30 p-2 rounded">
                        <label className="block text-xs text-blue-300 mb-1">Iced Remark</label>
                        <textarea
                          value={itemRemarks[coffee]?.iced || ''}
                          onChange={(e) => updateItemRemark(coffee, 'iced', e.target.value)}
                          placeholder="Notes for iced version..."
                          className="w-full px-2 py-1 text-xs rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows={1}
                        />
                        {getQuickRemarks(coffee).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getQuickRemarks(coffee).map((quickRemark) => (
                              <button
                                key={`${coffee}-iced-${quickRemark}`}
                                type="button"
                                onClick={() => addQuickRemarkToItem(coffee, 'iced', quickRemark)}
                                className="px-1.5 py-0.5 text-xs rounded bg-blue-800 hover:bg-blue-700 text-blue-200"
                              >
                                + {quickRemark}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between gap-4">
          <button 
            onClick={onClose} 
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500" 
            disabled={totalItems === 0}
          >
            {isEditMode ? 'Update Order' : `Place Order (${totalItems})`}
          </button>
        </div>
      </div>
    </div>
  )
}
