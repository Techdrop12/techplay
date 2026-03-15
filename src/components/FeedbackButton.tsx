'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function FeedbackButton() {
  const t = useTranslations('feedback')
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function handleSend() {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    })
    setSent(true)
    setTimeout(() => setOpen(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-8 bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-4 py-2 rounded-full shadow-[var(--shadow-md)] z-40 hover:opacity-95"
      >
        💬 {t('button')}
      </button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[hsl(var(--surface))] rounded-lg p-6 max-w-sm w-full shadow-lg border border-[hsl(var(--border))]">
            <h2 className="font-bold mb-2 text-[hsl(var(--text))]">{t('title')}</h2>
            {sent ? (
              <div className="text-green-700 dark:text-green-400">{t('thank_you')}</div>
            ) : (
              <>
                <textarea
                  className="w-full border border-[hsl(var(--border))] rounded p-2 mb-2 bg-[hsl(var(--surface))] text-[hsl(var(--text))]"
                  rows={3}
                  placeholder={t('placeholder')}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <button
                  onClick={handleSend}
                  className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-4 py-2 rounded"
                >
                  {t('send')}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-3 text-token-text/70"
                >
                  {t('cancel')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
