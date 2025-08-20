// src/models/Order.js
// ✅ Modèle Commande complet, compatible webhook + ancien code
import mongoose from 'mongoose'

const { Schema, models, model } = mongoose
const Mixed = Schema.Types.Mixed
const ObjectId = Schema.Types.ObjectId

// ---------- Line Item ----------
const LineItemSchema = new Schema(
  {
    // Compat ancien code
    product: { type: ObjectId, ref: 'Product' }, // si on relie plus tard
    title: { type: String, trim: true },
    image: { type: String, trim: true },

    // Stripe-like
    description: { type: String, trim: true },
    quantity: { type: Number, default: 1, min: 1, max: 999 },
    currency: { type: String, uppercase: true, default: 'EUR' }, // EUR, etc.
    unit_amount: { type: Number, min: 0 }, // en cents
    amount_subtotal: { type: Number, min: 0 }, // en cents
    amount_total: { type: Number, min: 0 }, // en cents

    // Prix en euros (compat UI historique)
    price: { type: Number, min: 0 }, // € (facultatif; certain ancien code l’utilise)
    sku: { type: String, trim: true },
    productSlug: { type: String, trim: true },
  },
  { _id: false }
)

// ---------- Order ----------
const OrderSchema = new Schema(
  {
    // Numéro lisible (best-effort unique)
    orderNumber: { type: String, index: true, unique: true, sparse: true },

    // Stripe / Paiement
    stripeSessionId: { type: String, index: true, unique: true, sparse: true },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'no_payment_required', 'failed', 'refunded', 'processing', 'requires_action', 'canceled', null],
      default: null,
    },
    currency: { type: String, uppercase: true, default: 'EUR' },

    // Totaux (en cents pour cohérence Stripe)
    amountTotal: { type: Number, min: 0 },         // total TTC (cents)
    amountSubtotal: { type: Number, min: 0 },      // sous-total (cents)
    amountDiscount: { type: Number, min: 0 },      // remises cumulées (cents)
    amountShipping: { type: Number, min: 0 },      // livraison (cents)
    amountTax: { type: Number, min: 0 },           // taxes (cents)

    // Compat ancien champ (euros) – sera rempli automatiquement si possible
    total: { type: Number, min: 0 },

    // Client
    customerEmail: { type: String, trim: true, lowercase: true, index: true },
    user: {
      email: { type: String, trim: true, lowercase: true }, // ancien champ
      name: { type: String, trim: true },
      address: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    email: { type: String, trim: true, lowercase: true }, // fallback historico-compat

    // Adresses
    shippingAddress: { type: String, trim: true },
    billingAddress: { type: String, trim: true },

    // Livraison / Fulfillment
    status: {
      type: String,
      enum: ['en cours', 'pending', 'processing', 'shipped', 'delivered', 'canceled', 'refunded', 'failed'],
      default: 'en cours',
      index: true,
    },
    shippingProvider: { type: String, trim: true },
    trackingNumber: { type: String, trim: true, index: true },
    shippingDetails: { type: Mixed }, // Stripe shipping_details, etc.
    deliveredAt: { type: Date },

    // Promo / méta
    coupon: { type: String, trim: true },
    metadata: { type: Mixed }, // tout champ libre

    // Lignes
    items: [LineItemSchema],
  },
  { timestamps: true }
)

// ---------- Index utiles ----------
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ customerEmail: 1, createdAt: -1 })
OrderSchema.index({ 'user.email': 1, createdAt: -1 })

// ---------- Helpers ----------
function centsToEuro(n) {
  if (typeof n !== 'number') return undefined
  return Math.round(n) / 100
}

// Génère un numéro lisible: TP-YYYYMMDD-XXXXXX (random base36)
function makeOrderNumber() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TP-${yyyy}${mm}${dd}-${rnd}`
}

// Normalisations avant save
OrderSchema.pre('save', async function normalize(next) {
  try {
    // currency en MAJ
    if (this.currency) this.currency = String(this.currency).toUpperCase()

    // fallback emails
    if (!this.customerEmail) {
      this.customerEmail = this.user?.email || this.email || undefined
    }
    if (!this.email && this.customerEmail) {
      this.email = this.customerEmail
    }

    // Calcul 'total' en € si amountTotal en cents présent
    if ((this.total == null || Number.isNaN(this.total)) && typeof this.amountTotal === 'number') {
      this.total = centsToEuro(this.amountTotal)
    }

    // Génère orderNumber si absent (best-effort unicité)
    if (!this.orderNumber) {
      let candidate = makeOrderNumber()
      // tente 3 fois en cas de collision improbable
      for (let i = 0; i < 3; i++) {
        // @ts-ignore
        const exists = await this.constructor.findOne({ orderNumber: candidate }).lean()
        if (!exists) break
        candidate = makeOrderNumber()
      }
      this.orderNumber = candidate
    }

    next()
  } catch (e) {
    next(e)
  }
})

// Sérialisation propre (retire __v, garde id virtuel)
OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    // compat API propre
    if (ret.amountTotal != null && (ret.total == null || Number.isNaN(ret.total))) {
      ret.total = centsToEuro(ret.amountTotal)
    }
    return ret
  },
})

export default models.Order || model('Order', OrderSchema)
