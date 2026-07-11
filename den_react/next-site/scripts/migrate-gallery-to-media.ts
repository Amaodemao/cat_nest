import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const payload = await getPayload({ config })
const galleryItems = await payload.find({
  collection: 'gallery-items',
  depth: 0,
  limit: 1000,
  sort: 'sortOrder',
})

let migrated = 0
let skipped = 0

for (const item of galleryItems.docs) {
  const mediaID = typeof item.image === 'number' ? item.image : item.image.id
  const media = await payload.findByID({ collection: 'media', id: mediaID })

  if (
    media.title === item.title &&
    media.category === item.category &&
    media.sortOrder === item.sortOrder &&
    media.published === item.published
  ) {
    skipped += 1
    continue
  }

  await payload.update({
    collection: 'media',
    id: mediaID,
    data: {
      title: item.title,
      alt: media.alt || item.title,
      category: item.category,
      sortOrder: item.sortOrder ?? 0,
      published: item.published ?? true,
    },
  })
  migrated += 1
}

const allMedia = await payload.find({ collection: 'media', depth: 0, limit: 1000 })
for (const media of allMedia.docs) {
  if (media.title) continue
  const fallback = media.alt || media.filename?.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ') || 'Untitled image'
  await payload.update({
    collection: 'media',
    id: media.id,
    data: { title: fallback, category: media.category || 'safe', published: media.published ?? false },
  })
  migrated += 1
}

console.log(`Gallery metadata: migrated ${migrated}, skipped ${skipped}`)
process.exit(0)
