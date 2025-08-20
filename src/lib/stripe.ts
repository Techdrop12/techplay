// src/lib/stripe.ts
import Stripe from 'stripe'


const apiVersion = (process.env.STRIPE_API_VERSION || '2024-06-20') as Stripe.LatestApiVersion
const secret = process.env.STRIPE_SECRET_KEY
if (!secret) throw new Error('STRIPE_SECRET_KEY manquante')


export const stripe = new Stripe(secret, {
apiVersion,
maxNetworkRetries: 2,
appInfo: { name: 'TechPlay', version: '1.0.0' },
})


export default stripe