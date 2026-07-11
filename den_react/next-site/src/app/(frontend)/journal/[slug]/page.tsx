import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { CommentForm } from '@/components/CommentForm'
import { MarkdownContent } from '@/components/MarkdownContent'
import config from '@/payload.config'

async function getPost(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  })
  return result.docs[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return post
    ? { title: post.title, description: post.excerpt || undefined }
    : { title: 'Post not found' }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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
