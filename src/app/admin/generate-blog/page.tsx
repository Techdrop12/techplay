'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { generateBlog } from '@/lib/openai'

export default function GenerateBlogPage() {
  const t = useTranslations('admin')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const content = await generateBlog(prompt)
      setOutput(content || '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" role="main" aria-labelledby="generate-blog-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 id="generate-blog-title" className="heading-page mb-6">
          {t('generate_blog_title')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label={t('generate_blog_title')}>
          <div>
            <label htmlFor="generate-prompt" className="sr-only">
              {t('generate_prompt_label')}
            </label>
            <textarea
              id="generate-prompt"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-[15px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              placeholder={t('generate_prompt_placeholder')}
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-describedby={output ? 'generate-output' : undefined}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {t('generate_button')}
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
