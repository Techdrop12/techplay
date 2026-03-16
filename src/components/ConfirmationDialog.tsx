// src/components/ConfirmationDialog.tsx
'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: React.ReactNode;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
}: ConfirmationDialogProps) {
  const t = useTranslations('common');
  const defaultTitle = title ?? t('confirm');
  const defaultMessage = message ?? t('confirm_default_message');
  const defaultConfirm = confirmLabel ?? t('confirm');
  const defaultCancel = cancelLabel ?? t('cancel');
  return (
    <Modal isOpen={open} onClose={onClose} title={defaultTitle} size="sm" closeOnOverlay>
      <Modal.Body>
        <p className="text-sm text-token-text/85">{defaultMessage}</p>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {defaultCancel}
          </Button>
          <Button variant={danger ? 'danger' : 'accent'} onClick={onConfirm}>
            {defaultConfirm}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
