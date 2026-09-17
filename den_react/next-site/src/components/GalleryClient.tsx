'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

export type GalleryViewItem = {
  id: number
  title: string
  category: 'safe' | 'nsfw' | 'gore'
  thumbUrl: string
  displayUrl: string
  originalUrl: string
}

type GalleryCategory = GalleryViewItem['category']

type LightboxState = {
  open: boolean
  src: string
  fallbackSrc: string
  caption: string
}

export function GalleryClient({ items }: { items: GalleryViewItem[] }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const [lightbox, setLightbox] = useState<LightboxState>({
    open: false,
    src: '',
    fallbackSrc: '',
    caption: '',
  })
  const [category, setCategory] = useState<GalleryCategory>('safe')
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const transitionTimers = useRef<number[]>([])
  const visible = items.filter((item) => item.category === category)

  useEffect(() => {
    if (!lightbox.open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox((current) => ({ ...current, open: false }))
    }
    document.addEventListener('keyup', close)
    document.body.classList.add('lightbox-open')
    return () => {
      document.removeEventListener('keyup', close)
      document.body.classList.remove('lightbox-open')
    }
  }, [lightbox.open])

  useEffect(() => {
    return () => transitionTimers.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  function startTransition(nextCategory: GalleryCategory) {
    if (transitionPhase !== 'idle') return
    transitionTimers.current.forEach((timer) => window.clearTimeout(timer))
    transitionTimers.current = []
    setTransitionPhase('out')
    transitionTimers.current.push(
      window.setTimeout(() => {
        setCategory(nextCategory)
        setTransitionPhase('in')
      }, 450),
      window.setTimeout(() => setTransitionPhase('idle'), 900),
    )
  }

  function openLightbox(item: GalleryViewItem) {
    setLightbox({
      open: true,
      src: item.displayUrl,
      fallbackSrc: item.originalUrl,
      caption: item.title,
    })
  }

  return (
    <>
      <div className="gallery-header">
        <h2 id="gallery-title">Gallery</h2>
        <div className="gallery-controls">
          <button
            aria-pressed={category !== 'safe'}
            className={`toggle-btn ${category !== 'safe' ? 'is-active' : ''}`}
            disabled={transitionPhase !== 'idle'}
            onClick={() => startTransition(category === 'safe' ? 'nsfw' : 'safe')}
            type="button"
          >
            NSFW
          </button>
          {category !== 'safe' && (
            <button
              aria-pressed={category === 'gore'}
              className={`toggle-btn ${category === 'gore' ? 'is-active' : ''}`}
              disabled={transitionPhase !== 'idle'}
              onClick={() => startTransition(category === 'gore' ? 'nsfw' : 'gore')}
              type="button"
            >
              Gore
            </button>
          )}
        </div>
      </div>
      <div
        className={`gallery grid ${transitionPhase !== 'idle' ? 'is-transitioning' : ''} is-${transitionPhase}`}
        key={category}
      >
        {visible.map((item) => (
          <figure
            key={item.id}
            onClick={() => openLightbox(item)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') openLightbox(item)
            }}
            role="button"
            tabIndex={0}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={item.title}
              decoding="async"
              loading="lazy"
              onLoad={(event) => {
                event.currentTarget.classList.toggle(
                  'portrait',
                  event.currentTarget.naturalWidth <= event.currentTarget.naturalHeight,
                )
              }}
              sizes="(max-width: 768px) 46vw, (max-width: 1200px) 30vw, 240px"
              src={item.thumbUrl}
              srcSet={`${item.thumbUrl} 640w, ${item.displayUrl} 1600w`}
            />
            <figcaption>{item.title}</figcaption>
          </figure>
        ))}
      </div>
      {mounted &&
        createPortal(
          <div
            aria-hidden={!lightbox.open}
            className={lightbox.open ? 'open' : ''}
            id="lightbox"
            onClick={(event) => {
              if (event.target === event.currentTarget)
                setLightbox((current) => ({ ...current, open: false }))
            }}
          >
            <figure>
              {lightbox.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={lightbox.caption}
                  decoding="async"
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallbackApplied === '1') return
                    event.currentTarget.dataset.fallbackApplied = '1'
                    event.currentTarget.src = lightbox.fallbackSrc
                  }}
                  src={lightbox.src}
                />
              )}
              <figcaption>{lightbox.caption}</figcaption>
            </figure>
          </div>,
          document.body,
        )}
    </>
  )
}
