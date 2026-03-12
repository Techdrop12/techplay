// src/lib/stripe.ts
import Stripe from 'stripe'

import { serverEnv } from '@/env.server'

const apiVersion = (serverEnv.STRIPE_API_VERSION || '2024-06-20') as Stripe.LatestApiVersion
const secret = serverEnv.STRIPE_SECRET_KEY

export const stripe = new Stripe(secret, {
  apiVersion,
  maxNetworkRetries: 2,
  appInfo: { name: 'TechPlay', version: '1.0.0' },
})

export default stripe