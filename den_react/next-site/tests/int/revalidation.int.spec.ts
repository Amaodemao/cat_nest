import { afterEach, describe, expect, it, vi } from 'vitest'

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }))

vi.mock('next/cache', () => ({ revalidatePath }))

import {
  revalidateCommentPost,
  revalidateGallery,
  revalidateJournal,
} from '@/lib/revalidateContent'

describe('content revalidation', () => {
  afterEach(() => revalidatePath.mockClear())

  it('invalidates gallery and journal paths', () => {
    revalidateGallery()
    revalidateJournal('new-slug', 'old-slug', 'new-slug')

    expect(revalidatePath.mock.calls).toEqual([
      ['/gallery'],
      ['/journal'],
      ['/journal/[slug]', 'page'],
      ['/sitemap.xml'],
      ['/journal/new-slug'],
      ['/journal/old-slug'],
    ])
  })

  it('resolves an unpopulated comment relationship before invalidating the post', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValue({ slug: 'commented-post' }),
    }

    await revalidateCommentPost(42, payload as never)

    expect(payload.findByID).toHaveBeenCalledWith({ collection: 'posts', id: 42, depth: 0 })
    expect(revalidatePath).toHaveBeenCalledWith('/journal/commented-post')
  })
})
