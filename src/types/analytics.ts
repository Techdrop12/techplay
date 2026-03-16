export type GAParams = Record<string, unknown>;

export type GAEvent = {
  name: string;
  params?: GAParams;
};

export type FBQEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | string;
