'use client';

export default function ConfirmationDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full space-y-4">
        <p>{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Annuler</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirmer</button>
        </div>
      </div>
    </div>
  );
}
