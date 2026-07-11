import { revalidatePath } from 'next/cache'
import type { Payload } from 'payload'

type RelatedPost = number | { id: number; slug?: string | null }

export function revalidateGallery() {
  revalidatePath('/gallery')
}

export function revalidateJournal(...slugs: Array<string | null | undefined>) {
  revalidatePath('/journal')
  revalidatePath('/sitemap.xml')
  for (const slug of new Set(slugs.filter((value): value is string => Boolean(value)))) {
    revalidatePath(`/journal/${slug}`)
  }
}

export async function revalidateCommentPost(post: RelatedPost, payload: Payload) {
  const populatedSlug = typeof post === 'object' ? post.slug : undefined
  if (populatedSlug) {
    revalidatePath(`/journal/${populatedSlug}`)
    return
  }

  const postId = typeof post === 'object' ? post.id : post
  const relatedPost = await payload.findByID({ collection: 'posts', id: postId, depth: 0 })
  if (relatedPost.slug) revalidatePath(`/journal/${relatedPost.slug}`)
}
