import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { getSiteURL } from '@/lib/siteURL'
import config from '@/payload.config'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteURL = getSiteURL()
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1000,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  return [
    { url: new URL('/', siteURL).toString(), changeFrequency: 'monthly', priority: 1 },
    { url: new URL('/gallery', siteURL).toString(), changeFrequency: 'weekly', priority: 0.8 },
    { url: new URL('/journal', siteURL).toString(), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.docs.map((post) => ({
      url: new URL(`/journal/${post.slug}`, siteURL).toString(),
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
