'use client'

import Script from 'next/script'
import { FormEvent, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { callback: (token: string) => void; sitekey: string },
      ) => void
    }
  }
}

export function CommentForm({
  postId,
  turnstileSiteKey,
}: {
  postId: number
  turnstileSiteKey?: string
}) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>()
  const turnstileContainer = useRef<HTMLDivElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/public/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        postId,
        nickname: form.get('nickname'),
        content: form.get('content'),
        website: form.get('website'),
        turnstileToken,
      }),
    })
    const result = (await response.json()) as { message?: string }
    setMessage(result.message ?? (response.ok ? '评论已提交。' : '提交失败，请稍后再试。'))
    if (response.ok) event.currentTarget.reset()
    setSubmitting(false)
  }

  return (
    <>
      {turnstileSiteKey && (
        <Script
          onReady={() => {
            if (turnstileContainer.current && window.turnstile) {
              turnstileContainer.current.replaceChildren()
              window.turnstile.render(turnstileContainer.current, {
                sitekey: turnstileSiteKey,
                callback: setTurnstileToken,
              })
            }
          }}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        />
      )}
      <form className="comment-form card" onSubmit={submit}>
        <label>
          昵称
          <input maxLength={40} name="nickname" required />
        </label>
        <label>
          评论
          <textarea maxLength={2000} name="content" required rows={5} />
        </label>
        <label className="honeypot" aria-hidden="true">
          Website
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
        {turnstileSiteKey && <div ref={turnstileContainer} />}
        <button className="btn" disabled={submitting} type="submit">
          {submitting ? '提交中…' : '提交评论'}
        </button>
        {message && <p aria-live="polite">{message}</p>}
      </form>
    </>
  )
}
