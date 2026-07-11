import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'

export const metadata: Metadata = { title: 'Journal' }
export const dynamic = 'force-dynamic'

function formatDate(value: string) {
  const date = new Date(value)
  return [
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
    date.getUTCFullYear(),
  ].join('/')
}

export default async function JournalPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 100,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  return (
    <section aria-labelledby="journal-title" className="container" id="journal">
      <h2 id="journal-title">Journal</h2>
      <div className="post-list">
        {result.docs.length === 0 && <p>No posts yet.</p>}
        {result.docs.map((post) => (
          <Link className="post" href={`/journal/${post.slug}`} key={post.id}>
            <h3>{post.title}</h3>
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            )}
            {post.excerpt && <p>{post.excerpt}</p>}
            <div className="post-tags">
              {post.tags?.map(({ id, tag }) => (
                <span className="tag" key={id ?? tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
