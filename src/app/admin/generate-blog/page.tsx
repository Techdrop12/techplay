'use client'

import { useState } from 'react'
// Choisis import nommé ou défaut en fonction de l'export

// Import nommé (à privilégier ici)
import { generateBlog } from '@/lib/openai'

// Si tu préfères import par défaut, alors :
// import generateBlog from '@/lib/openai'

export default function GenerateBlogPage() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = await generateBlog(prompt)
    setOutput(content || '')
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Générer un article</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border rounded p-2"
          placeholder="Sujet ou mot-clé..."
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="submit" className="bg-brand text-white px-4 py-2 rounded">
          Générer
        </button>
      </form>
      {output && (
        <div className="mt-6 whitespace-pre-wrap bg-gray-100 p-4 rounded">
          {output}
        </div>
      )}
    </main>
  )
}
