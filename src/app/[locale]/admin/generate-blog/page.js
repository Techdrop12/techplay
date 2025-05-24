'use client'

import GenerateBlogPost from '@/components/GenerateBlogPost'

export default function GenerateBlogAdminPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Générateur d’articles IA</h1>
      <GenerateBlogPost />
    </div>
  )
}
