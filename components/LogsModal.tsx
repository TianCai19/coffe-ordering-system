import React, { useState, useEffect } from 'react'
import { ApiService } from '@/lib/api-service'
import { CoffeeCupIcon, CloseIcon, DownloadIcon } from './Icons'

interface ArchiveEntry {
  id: string
  date: string
  totalOrders: number
  totalItems: number
  coffeeCounts: Record<string, number>
  tableCounts: Record<number, number>
  weekStartDate: string
  weekEndDate: string
}

interface LogsModalProps {
  onClose: () => void
}

export const LogsModal: React.FC<LogsModalProps> = ({ onClose }) => {
  const [archives, setArchives] = useState<ArchiveEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArchive, setSelectedArchive] = useState<ArchiveEntry | null>(null)

  useEffect(() => {
    loadArchives()
  }, [])

  const loadArchives = async () => {
    try {
      const data = await ApiService.getArchives()
      setArchives(data)
    } catch (error) {
      console.error('Error loading archives:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportArchive = (archive: ArchiveEntry) => {
    let content = `Coffee Orders Archive Report\n`
    content += `Archived at: ${archive.date}\n`
    content += `Period: ${archive.weekStartDate} - ${archive.weekEndDate}\n`
    content += `Total orders: ${archive.totalOrders}\n`
    content += `Total drinks: ${archive.totalItems}\n`
    content += "====================================\n\n"

    content += "### Coffee Types ###\n"
    const sortedCoffeeTypes = Object.entries(archive.coffeeCounts).sort((a, b) => b[1] - a[1])
    sortedCoffeeTypes.forEach(([name, count]) => {
      content += `- ${name}: ${count}\n`
    })
    content += "\n====================================\n\n"

    content += "### By Table ###\n"
    const sortedTables = Object.entries(archive.tableCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    sortedTables.forEach(([tableNumber, count]) => {
      content += `- Table ${tableNumber}: ${count}\n`
    })

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `coffee-archive-${archive.weekStartDate}-${archive.weekEndDate}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-xl p-8 w-full max-w-4xl m-4 shadow-2xl border border-gray-700">
          <div className="text-center">
            <CoffeeCupIcon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-white">Loading history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-6xl m-4 shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <CoffeeCupIcon className="w-8 h-8"/>
            History Archives
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 hover:bg-red-600 text-white transition-colors"
          >
            <CloseIcon className="w-6 h-6"/>
          </button>
        </div>

        {archives.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No history yet</p>
            <p className="text-gray-500 mt-2">After the first archive, history will appear here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {!selectedArchive ? (
              <div className="h-full overflow-y-auto">
                <div className="grid gap-4">
                  {archives.map((archive) => (
                    <div 
                      key={archive.id}
                      className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedArchive(archive)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {archive.weekStartDate} 至 {archive.weekEndDate}
                          </h3>
                          <p className="text-gray-300 mb-1">Archived: {archive.date}</p>
                          <div className="flex gap-6 text-sm text-gray-400">
                            <span>Orders: {archive.totalOrders}</span>
                            <span>Drinks: {archive.totalItems}</span>
                            <span>Types: {Object.keys(archive.coffeeCounts).length}</span>
                            <span>Active tables: {Object.keys(archive.tableCounts).length}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            exportArchive(archive)
                          }}
                          className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                          title="Export report"
                        >
                          <DownloadIcon className="w-5 h-5"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedArchive(null)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ← Back to list
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {selectedArchive.weekStartDate} - {selectedArchive.weekEndDate}
                      </h3>
                      <p className="text-gray-300">Archived: {selectedArchive.date}</p>
                    </div>
                    <button
                      onClick={() => exportArchive(selectedArchive)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <DownloadIcon className="w-5 h-5"/>
                      Export report
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Coffee types</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedArchive.coffeeCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([name, count]) => (
                          <div key={name} className="flex justify-between text-gray-300">
                            <span>{name}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">By table</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedArchive.tableCounts)
                          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                          .map(([tableNumber, count]) => (
                          <div key={tableNumber} className="flex justify-between text-gray-300">
                            <span>Table {tableNumber}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-600">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">{selectedArchive.totalOrders}</div>
                        <div className="text-gray-400">Total orders</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">{selectedArchive.totalItems}</div>
                        <div className="text-gray-400">Total drinks</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-400">{Object.keys(selectedArchive.coffeeCounts).length}</div>
                        <div className="text-gray-400">Types</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-400">{Object.keys(selectedArchive.tableCounts).length}</div>
                        <div className="text-gray-400">Active tables</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
