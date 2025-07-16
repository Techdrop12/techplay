'use client'

export default function PushSubscribe() {
  const handleSubscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub),
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return (
    <button onClick={handleSubscribe} className="text-sm text-blue-600 underline">
      Activer les notifications
    </button>
  )
}
