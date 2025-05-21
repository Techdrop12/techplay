'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LocalizedLink({ href, ...props }) {
  const { locale } = useParams()
  return <Link href={`/${locale}${href}`} {...props} />
}
