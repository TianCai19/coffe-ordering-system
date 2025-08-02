import React from 'react'
import { OrderStats } from '@/types'
import { PieChartIcon } from './Icons'

interface StatisticsProps {
  stats: OrderStats
}

export const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  const { coffeeCounts, tableCounts } = stats
  const totalPendingItems = Object.values(coffeeCounts).reduce((sum, count) => sum + count, 0)
  
  const sortedCoffeeCounts = Object.entries(coffeeCounts).sort((a, b) => a[0].localeCompare(b[0]))
  const sortedTableCounts = Object.entries(tableCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <PieChartIcon className="w-6 h-6"/> 
        待制作统计 ({totalPendingItems} 项)
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-gray-300 mb-1">按种类:</h4>
          {sortedCoffeeCounts.length > 0 ? (
            <ul className="text-sm text-gray-400 space-y-1">
              {sortedCoffeeCounts.map(([name, count]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}:</span> 
                  <span>{count} 杯</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">无</p>
          )}
        </div>
        <div>
          <h4 className="font-bold text-gray-300 mb-1">按桌号:</h4>
          {sortedTableCounts.length > 0 ? (
            <ul className="text-sm text-gray-400 space-y-1">
              {sortedTableCounts.map(([table, count]) => (
                <li key={table} className="flex justify-between">
                  <span>桌号 {table}:</span> 
                  <span>{count} 项</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">无</p>
          )}
        </div>
      </div>
    </div>
  )
}
