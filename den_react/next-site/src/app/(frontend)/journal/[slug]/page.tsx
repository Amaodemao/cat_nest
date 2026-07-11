import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { CommentForm } from '@/components/CommentForm'
import { MarkdownContent } from '@/components/MarkdownContent'
import { decodeRouteParam } from '@/lib/decodeRouteParam'
import config from '@/payload.config'

export const revalidate = 300

const getPost = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  })
  return result.docs[0] ?? null
})

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1000,
    where: { _status: { equals: 'published' } },
  })
  return posts.docs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug: encodedSlug } = await params
  const slug = decodeRouteParam(encodedSlug)
  const post = await getPost(slug)
  return post
    ? {
        title: post.title,
        description: post.excerpt || undefined,
        alternates: { canonical: `/journal/${post.slug}` },
        openGraph: {
          type: 'article',
          title: post.title,
          description: post.excerpt || undefined,
          url: `/journal/${post.slug}`,
          publishedTime: post.publishedAt || undefined,
          tags: post.tags?.map(({ tag }) => tag),
        },
      }
    : { title: 'Post not found' }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: encodedSlug } = await params
  const slug = decodeRouteParam(encodedSlug)
  const post = await getPost(slug)
  if (!post) notFound()

  const payload = await getPayload({ config })
  const comments = await payload.find({
    collection: 'comments',
    depth: 0,
    limit: 100,
    sort: 'createdAt',
    where: { and: [{ post: { equals: post.id } }, { status: { equals: 'approved' } }] },
  })
  const hasLeadingHeading = /^\s*(?:#{1,6}\s+|[^\n]+\n(?:=+|-+)\s*$)/m.test(post.contentMarkdown)

  return (
    <section className="container post-page">
      {!hasLeadingHeading && <h1 className="article-title">{post.title}</h1>}
      <MarkdownContent content={post.contentMarkdown} />
      <p>
        <Link className="link-inline" href="/journal">
          Back to Journal
        </Link>
      </p>
      <section className="comments" aria-labelledby="comments-title">
        <h2 id="comments-title">评论</h2>
        {comments.docs.length === 0 ? (
          <p>还没有已发布的评论。</p>
        ) : (
          comments.docs.map((comment) => (
            <article className="comment card" key={comment.id}>
              <strong>{comment.nickname}</strong>
              <time dateTime={comment.createdAt}>
                {new Date(comment.createdAt).toLocaleString('zh-CN')}
              </time>
              <p>{comment.content}</p>
            </article>
          ))
        )}
        <h3>留下评论</h3>
        <p>评论提交后需要管理员审核才会显示。</p>
        <CommentForm
          postId={post.id}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
      </section>
    </section>
  )
}
