import type { Metadata } from 'next'
import { getPayload } from 'payload'

import { GalleryClient, type GalleryViewItem } from '@/components/GalleryClient'
import type { Media } from '@/payload-types'
import config from '@/payload.config'

export const metadata: Metadata = { title: 'Gallery' }
export const dynamic = 'force-dynamic'

function mediaURL(media: Media, size: 'thumb' | 'display') {
  return media.sizes?.[size]?.url || media.url || ''
}

export default async function GalleryPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 500,
    sort: 'sortOrder',
    where: { published: { equals: true } },
  })
  const items = result.docs.flatMap<GalleryViewItem>((media) => {
    const thumbUrl = mediaURL(media, 'thumb')
    const displayUrl = mediaURL(media, 'display')
    if (!thumbUrl || !displayUrl) return []
    return [
      {
        id: media.id,
        title: media.title || media.alt,
        category: media.category || 'safe',
        thumbUrl,
        displayUrl,
        originalUrl: media.url || displayUrl,
      },
    ]
  })

  return (
    <section aria-labelledby="gallery-title" className="container" id="gallery">
      <GalleryClient items={items} />
    </section>
  )
}
