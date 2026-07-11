import { afterEach, describe, expect, it, vi } from 'vitest'

const { getPayload } = vi.hoisted(() => ({ getPayload: vi.fn() }))

vi.mock('payload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('payload')>()),
  getPayload,
}))

import sitemap from '@/app/(frontend)/sitemap'
import robots from '@/app/robots'
import { getSiteURL } from '@/lib/siteURL'

const originalSiteURL = process.env.NEXT_PUBLIC_SITE_URL

describe('public site metadata', () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteURL
  })

  it('normalizes the configured public URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/base/'
    expect(getSiteURL().toString()).toBe('https://example.com/base/')

    process.env.NEXT_PUBLIC_SITE_URL = 'not a url'
    expect(getSiteURL().toString()).toBe('http://localhost:3000/')
  })

  it('keeps admin and API routes out of search results', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
      sitemap: 'https://example.com/sitemap.xml',
    })
  })

  it('lists the public roots and published journal posts', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    getPayload.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            slug: 'published-post',
            updatedAt: '2026-07-11T00:00:00.000Z',
          },
        ],
      }),
    })
    const entries = await sitemap()
    const urls = entries.map(({ url }) => url)

    expect(urls).toEqual(
      expect.arrayContaining([
        'https://example.com/',
        'https://example.com/gallery',
        'https://example.com/journal',
        'https://example.com/journal/published-post',
      ]),
    )
  })
})
