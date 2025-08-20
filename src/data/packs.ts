export interface PackLite {
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
}

export const packs: PackLite[] = [
  { slug: 'starter',  title: 'Pack Starter',  description: 'Les essentiels à prix réduit', image: '/packs/starter.jpg',  price: 29.99 },
  { slug: 'premium',  title: 'Pack Premium',  description: 'Pour les pros du confort tech', image: '/packs/premium.jpg', price: 59.99 },
];
