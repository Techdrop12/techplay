// src/lib/notifications.ts — Web Push (VAPID) full options
import webPush, { type PushSubscription } from 'web-push'

type PushData = Record<string, any> | string
export type PushSubscriptionLike =
  | PushSubscription
  | { endpoint: string; keys: { auth: string; p256dh: string } }

const CONTACT = process.env.NOTIF_CONTACT || 'mailto:admin@techplay.fr'
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY

let configured = false
export function configureWebPush() {
  if (configured) return
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn('[web-push] VAPID keys missing – push disabled')
    configured = true
    return
  }
  webPush.setVapidDetails(CONTACT, VAPID_PUBLIC, VAPID_PRIVATE)
  configured = true
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC || ''
}

export type SendPushOptions = {
  ttl?: number
  urgency?: 'very-low' | 'low' | 'normal' | 'high'
  topic?: string
}

export async function sendPushNotification(
  subscription: PushSubscriptionLike,
  data: PushData,
  opts: SendPushOptions = {}
) {
  configureWebPush()
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) throw new Error('VAPID keys are not configured')
  if (!subscription || !('endpoint' in subscription)) throw new Error('Invalid subscription')

  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  const { ttl = 3600, urgency = 'normal', topic } = opts

  try {
    const res = await webPush.sendNotification(subscription as any, payload, {
      TTL: ttl,
      headers: { Urgency: urgency, ...(topic ? { Topic: topic } : {}) },
    })
    return res
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 410) (err as any).shouldDelete = true
    throw err
  }
}

export async function broadcastPush(
  subscriptions: PushSubscriptionLike[],
  data: PushData,
  opts?: SendPushOptions
) {
  const results = await Promise.allSettled(
    (subscriptions || []).map((s) => sendPushNotification(s, data, opts))
  )
  const toDelete: PushSubscriptionLike[] = []
  results.forEach((r, i) => {
    if (
      r.status === 'rejected' &&
      (r.reason?.shouldDelete || r.reason?.statusCode === 410 || r.reason?.statusCode === 404)
    ) {
      toDelete.push(subscriptions[i])
    }
  })
  return { results, toDelete }
}

export default sendPushNotification
