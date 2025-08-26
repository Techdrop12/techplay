'use client'
import { cn } from '@/lib/utils'
import {
  Headphones, Keyboard, Mouse, Camera, BatteryCharging, Gift,
  ShoppingCart, Heart, Search, User, Sparkles
} from 'lucide-react'

const MAP = {
  headphones: Headphones,
  keyboard: Keyboard,
  mouse: Mouse,
  webcam: Camera,
  battery: BatteryCharging,
  gift: Gift,
  cart: ShoppingCart,
  heart: Heart,
  search: Search,
  user: User,
  sparkles: Sparkles,
} as const

export type IconName = keyof typeof MAP
type Props = { name: IconName; size?: number; className?: string }

export default function Icon({ name, size = 20, className }: Props) {
  const C = MAP[name]
  return <C aria-hidden="true" size={size} className={cn('shrink-0', className)} />
}
