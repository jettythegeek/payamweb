'use client'

import { useEffect, useId, useRef } from 'react'

type TurnstileApi = {
  render: (container: string | HTMLElement, options: Record<string, unknown>) => string
  remove: (widgetId: string) => void
  reset: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_ID = 'payam-turnstile-script'

export function Turnstile({
  onToken,
  resetKey,
}: {
  onToken: (token: string) => void
  resetKey: number
}) {
  const reactId = useId()
  const elementId = `payam-turnstile-${reactId.replace(/:/g, '')}`
  const widgetId = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) return

    let cancelled = false
    const render = () => {
      if (cancelled || widgetId.current || !window.turnstile) return
      widgetId.current = window.turnstile.render(`#${elementId}`, {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      })
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      if (window.turnstile) render()
      else existing.addEventListener('load', render, { once: true })
    } else {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.addEventListener('load', render, { once: true })
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
  }, [elementId, onToken, siteKey])

  useEffect(() => {
    if (widgetId.current && window.turnstile) {
      onToken('')
      window.turnstile.reset(widgetId.current)
    }
  }, [onToken, resetKey])

  if (!siteKey) return null
  return <div id={elementId} className="wl-turnstile" aria-label="Spam protection" />
}
