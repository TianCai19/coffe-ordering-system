import React, { useEffect, useRef } from 'react'

interface ActionLogProps {
  logs: string[]
}

export const ActionLog: React.FC<ActionLogProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 right-0 w-full md:w-1/3 max-h-24 overflow-y-auto bg-gray-800 border-t border-l border-gray-700 p-2 text-sm"
    >
      {logs.length === 0 ? (
        <p className="text-gray-400">No actions yet</p>
      ) : (
        <ul className="space-y-1">
          {logs.map((log, idx) => (
            <li key={idx} className="text-gray-300 whitespace-pre-wrap">{log}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
