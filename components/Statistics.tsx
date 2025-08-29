import React from 'react'
import { OrderStats } from '@/types'
import { PieChartIcon } from './Icons'

interface StatisticsProps {
  stats: OrderStats
  theme?: 'dark' | 'light'
}

export const Statistics: React.FC<StatisticsProps> = ({ stats, theme = 'dark' }) => {
  const { coffeeCounts, tableCounts } = stats
  const totalPendingItems = Object.values(coffeeCounts).reduce((sum, count) => sum + count, 0)
  
  const sortedCoffeeCounts = Object.entries(coffeeCounts).sort((a, b) => a[0].localeCompare(b[0]))
  const sortedTableCounts = Object.entries(tableCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))

  const themeClasses = {
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    subText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    mutedText: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    emptyText: theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
  }

  return (
    <div className={`${themeClasses.card} p-4 rounded-lg border`}>
      <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.text}`}>
        <PieChartIcon className="w-6 h-6"/> 
  Pending Statistics ({totalPendingItems} items)
      </h3>
      <div className="space-y-4">
        <div>
    <h4 className={`font-bold ${themeClasses.subText} mb-1`}>By category:</h4>
          {sortedCoffeeCounts.length > 0 ? (
            <ul className={`text-sm ${themeClasses.mutedText} space-y-1`}>
              {sortedCoffeeCounts.map(([name, count]) => (
                <li key={name} className="flex justify-between">
      <span>{name}:</span> 
      <span>{count}</span>
                </li>
              ))}
            </ul>
          ) : (
      <p className={`text-sm ${themeClasses.emptyText}`}>None</p>
          )}
        </div>
        <div>
    <h4 className={`font-bold ${themeClasses.subText} mb-1`}>By table:</h4>
          {sortedTableCounts.length > 0 ? (
            <ul className={`text-sm ${themeClasses.mutedText} space-y-1`}>
              {sortedTableCounts.map(([table, count]) => (
                <li key={table} className="flex justify-between">
      <span>Table {table}:</span> 
      <span>{count} items</span>
                </li>
              ))}
            </ul>
          ) : (
      <p className={`text-sm ${themeClasses.emptyText}`}>None</p>
          )}
        </div>
      </div>
    </div>
  )
}
