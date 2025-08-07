import * as React from 'react'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
}

let toasts: Toast[] = []
const listeners: Array<(toast: Toast) => void> = []

export function toast({ message, type = 'success' }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2)
  const newToast = { id, message, type }
  toasts.push(newToast)
  listeners.forEach((listener) => listener(newToast))
}

export function useToast() {
  const [toastList, setToastList] = React.useState<Toast[]>([])

  React.useEffect(() => {
    const listener = (toast: Toast) => {
      setToastList((prev) => [...prev, toast])
      setTimeout(() => {
        setToastList((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3000)
    }
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    toastList,
    toast,
  }
}
