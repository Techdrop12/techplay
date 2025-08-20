// src/lib/scrollUtils.ts
export function isScrollingDown(lastY: number, currentY: number) {
return currentY > lastY
}


export type ScrollDirection = 'up' | 'down' | 'none'


export function getScrollDirection(lastY: number, currentY: number, threshold = 2): ScrollDirection {
const delta = currentY - lastY
if (Math.abs(delta) <= threshold) return 'none'
return delta > 0 ? 'down' : 'up'
}


export function isNearBottom(offset = 300) {
if (typeof window === 'undefined' || typeof document === 'undefined') return false
const { scrollY, innerHeight } = window
const { scrollHeight } = document.documentElement
return scrollY + innerHeight >= scrollHeight - offset
}


export function lockBodyScroll() {
if (typeof document === 'undefined') return
const scrollBar = window.innerWidth - document.documentElement.clientWidth
document.body.style.overflow = 'hidden'
if (scrollBar) document.body.style.paddingRight = `${scrollBar}px`
}


export function unlockBodyScroll() {
if (typeof document === 'undefined') return
document.body.style.overflow = ''
document.body.style.paddingRight = ''
}


export function throttle<T extends (...args: any[]) => any>(fn: T, wait = 100) {
let last = 0
let timeout: any
return (...args: Parameters<T>) => {
const now = Date.now()
const remaining = wait - (now - last)
if (remaining <= 0) {
last = now
fn(...args)
} else {
clearTimeout(timeout)
timeout = setTimeout(() => {
last = Date.now()
fn(...args)
}, remaining)
}
}
}