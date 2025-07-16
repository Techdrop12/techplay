import webPush from 'web-push'

webPush.setVapidDetails(
  'mailto:admin@techplay.fr',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(subscription: any, data: any) {
  await webPush.sendNotification(subscription, JSON.stringify(data))
}
