// src/lib/notifications.ts — Web Push (VAPID) full options
import webPush, { type PushSubscription as WebPushSubscription } from 'web-push'

import { warn } from '@/lib/logger'

type PushData = Record<string, unknown> | string

export type PushSubscriptionLike =
  | WebPushSubscription
  | {
      endpoint: string
      keys: {
        auth: string
        p256dh: string
      }
    }

const CONTACT = process.env.NOTIF_CONTACT || 'mailto:admin@techplay.fr'
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY

type PushError = Error & {
  statusCode?: number
  shouldDelete?: boolean
}

let configured = false

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSubscriptionLike(value: unknown): value is PushSubscriptionLike {
  if (!isRecord(value)) return false
  if (typeof value.endpoint !== 'string' || value.endpoint.trim() === '') return false
  if (!isRecord(value.keys)) return false
  return (
    typeof value.keys.auth === 'string' &&
    value.keys.auth.trim() !== '' &&
    typeof value.keys.p256dh === 'string' &&
    value.keys.p256dh.trim() !== ''
  )
}

function normalizeSubscription(subscription: PushSubscriptionLike): WebPushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
    },
  }
}

function shouldDeleteSubscription(reason: unknown): boolean {
  if (!isRecord(reason)) return false

  const statusCode =
    typeof reason.statusCode === 'number' ? reason.statusCode : undefined

  return reason.shouldDelete === true || statusCode === 404 || statusCode === 410
}

export function configureWebPush() {
  if (configured) return

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    warn('[web-push] VAPID keys missing – push disabled')
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

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    throw new Error('VAPID keys are not configured')
  }

  if (!isSubscriptionLike(subscription)) {
    throw new Error('Invalid subscription')
  }

  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  const { ttl = 3600, urgency = 'normal', topic } = opts

  try {
    const normalizedSubscription = normalizeSubscription(subscription)

    const res = await webPush.sendNotification(normalizedSubscription, payload, {
      TTL: ttl,
      headers: {
        Urgency: urgency,
        ...(topic ? { Topic: topic } : {}),
      },
    })

    return res
  } catch (err: unknown) {
    if (err instanceof Error) {
      const pushErr = err as PushError
      if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
        pushErr.shouldDelete = true
      }
      throw pushErr
    }

    const fallbackError: PushError = new Error('Unknown web-push error')
    throw fallbackError
  }
}

export async function broadcastPush(
  subscriptions: PushSubscriptionLike[],
  data: PushData,
  opts?: SendPushOptions
) {
  const list = Array.isArray(subscriptions) ? subscriptions : []

  const results = await Promise.allSettled(
    list.map((subscription) => sendPushNotification(subscription, data, opts))
  )

  const toDelete: PushSubscriptionLike[] = []

  results.forEach((result, index) => {
    if (result.status === 'rejected' && shouldDeleteSubscription(result.reason)) {
      const subscription = list[index]
      if (subscription) toDelete.push(subscription)
    }
  })

  return { results, toDelete }
}

export default sendPushNotification