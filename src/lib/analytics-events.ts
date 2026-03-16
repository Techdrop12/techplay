/**
 * Schéma d’événements business pour pilotage et croissance.
 * Utilisé par GA, dataLayer, dashboards et automatisations.
 */

/** Étapes du tunnel e-commerce (pour rapports funnel). */
export const FUNNEL_STEPS = {
  VIEW_LIST: 'view_list',
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  VIEW_CART: 'view_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_SHIPPING: 'add_shipping_info',
  PURCHASE: 'purchase',
} as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[keyof typeof FUNNEL_STEPS];

/** Noms de listes pour segmenter les sources (recommandations, cross-sell, etc.). */
export const LIST_NAMES = {
  CATALOGUE: 'catalogue',
  CATEGORY: 'category',
  HOME_FEATURED: 'home_featured',
  HOME_PACKS: 'home_packs',
  RECOMMENDED: 'recommended',
  RECENTLY_VIEWED: 'recently_viewed',
  CROSS_SELL: 'cross_sell',
  UPSELL: 'upsell',
  SEARCH_RESULTS: 'search_results',
  WISHLIST: 'wishlist',
  CART_REMINDER: 'cart_reminder',
  PRODUCT_GRID: 'product_grid',
  RELATED: 'related',
} as const;

export type ListName = (typeof LIST_NAMES)[keyof typeof LIST_NAMES];

/** Événements business pour relances et CRM (email, panier abandonné, etc.). */
export const BUSINESS_EVENTS = {
  CART_ABANDON_ELIGIBLE: 'cart_abandon_eligible',
  CART_SAVED: 'cart_saved',
  EMAIL_CAPTURE: 'email_capture',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',
} as const;

/** Contexte A/B pour mesurer les conversions par variante. */
export type ABContext = {
  experiment: string;
  variant: string;
};

/** Payload minimal pour un événement funnel (dashboards). */
export type FunnelEventPayload = {
  funnel_step: FunnelStep;
  currency?: string;
  value?: number;
  item_list_name?: ListName | string;
  items?: Array<{ item_id: string; item_name: string; price?: number; quantity?: number }>;
  /** Pour CRM / relances */
  email?: string;
  /** A/B testing */
  ab_experiment?: string;
  ab_variant?: string;
};
