// src/app/[locale]/page.tsx
import HomePage, { metadata } from '../page'

export { metadata }

export const revalidate = 300

export default HomePage