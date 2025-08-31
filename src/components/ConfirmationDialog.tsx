// src/components/ConfirmationDialog.tsx
'use client'

import * as React from 'react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'

export interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: React.ReactNode
  message?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer',
  message = 'Voulez-vous continuer ?',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger,
}: ConfirmationDialogProps) {
  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="sm" closeOnOverlay>
      <Modal.Body>
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'accent'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
