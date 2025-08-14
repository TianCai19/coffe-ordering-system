import React from 'react'

interface ConfirmDeleteModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-sm m-4 shadow-2xl border border-gray-700">
  <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
  <p className="text-gray-300 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel} 
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
