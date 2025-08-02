import React from 'react'

interface ConfirmDeleteModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-sm m-4 shadow-2xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">确认删除</h3>
        <p className="text-gray-300 mb-6">您确定要删除这个订单吗？此操作无法撤销。</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel} 
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  )
}
