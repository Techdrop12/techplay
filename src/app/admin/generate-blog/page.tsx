'use client'

import { useState } from 'react'

import { generateBlog } from '@/lib/openai'

export default function GenerateBlogPage() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = await generateBlog(prompt)
    setOutput(content || '')
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" role="main" aria-labelledby="generate-blog-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 id="generate-blog-title" className="heading-page mb-6">
          Générer un article
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Générer un article de blog">
          <div>
            <label htmlFor="generate-prompt" className="sr-only">
              Sujet ou mot-clé
            </label>
            <textarea
              id="generate-prompt"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              placeholder="Sujet ou mot-clé..."
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-describedby="generate-output"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            Générer
          </button>
        </form>
        {output && (
          <div
            id="generate-output"
            className="mt-6 whitespace-pre-wrap rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 p-4 text-[15px] dark:bg-[hsl(var(--surface))]/40"
            role="status"
          >
            {output}
          </div>
        )}
      </div>
    </main>
  )
}
