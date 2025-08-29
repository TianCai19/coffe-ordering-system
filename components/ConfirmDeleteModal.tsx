import React from 'react'

interface ConfirmDeleteModalProps {
  theme?: 'dark' | 'light'
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ theme = 'dark', onConfirm, onCancel }) => {
  const themeClasses = {
    overlay: theme === 'dark' ? 'bg-black bg-opacity-75' : 'bg-black bg-opacity-50',
    modal: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    heading: theme === 'dark' ? 'text-white' : 'text-gray-900',
    text: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    cancelButton: theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    deleteButton: 'bg-red-600 hover:bg-red-700 text-white'
  }

  return (
    <div className={`fixed inset-0 ${themeClasses.overlay} flex justify-center items-center z-50`}>
      <div className={`${themeClasses.modal} rounded-xl p-8 w-full max-w-sm m-4 shadow-2xl border`}>
  <h3 className={`text-xl font-bold ${themeClasses.heading} mb-4`}>Confirm Delete</h3>
  <p className={`${themeClasses.text} mb-6`}>Are you sure you want to delete this order? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel} 
            className={`${themeClasses.cancelButton} font-bold py-2 px-4 rounded-lg transition-colors`}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`${themeClasses.deleteButton} font-bold py-2 px-4 rounded-lg transition-colors`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
