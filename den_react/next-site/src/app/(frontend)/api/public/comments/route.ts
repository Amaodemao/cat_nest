import { createHmac } from 'node:crypto'

import { getPayload } from 'payload'
import { z } from 'zod'

import config from '@/payload.config'

const schema = z.object({
  postId: z.number().int().positive(),
  nickname: z.string().trim().min(1).max(40),
  content: z.string().trim().min(2).max(2000),
  website: z.string().max(0).optional().default(''),
  turnstileToken: z.string().optional(),
})

const attempts = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

function isRateLimited(key: string) {
  const now = Date.now()
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS)
  recent.push(now)
  attempts.set(key, recent)
  return recent.length > MAX_ATTEMPTS
}

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token, remoteip: ip })
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })
  const result = (await response.json()) as { success?: boolean }
  return result.success === true
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && host && new URL(origin).host !== host) {
    return Response.json({ message: '请求来源无效。' }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ message: '请检查昵称和评论内容。' }, { status: 400 })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip))
    return Response.json({ message: '提交过于频繁，请稍后再试。' }, { status: 429 })
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return Response.json({ message: '人机验证失败。' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    where: { and: [{ id: { equals: parsed.data.postId } }, { _status: { equals: 'published' } }] },
  })
  if (!posts.docs[0]) return Response.json({ message: '文章不存在。' }, { status: 404 })

  const hashSecret =
    process.env.COMMENT_HASH_SECRET || process.env.PAYLOAD_SECRET || 'development-only'
  await payload.create({
    collection: 'comments',
    data: {
      post: parsed.data.postId,
      nickname: parsed.data.nickname,
      content: parsed.data.content,
      status: 'pending',
      ipHash: createHmac('sha256', hashSecret).update(ip).digest('hex'),
    },
  })
  return Response.json({ message: '评论已提交，审核后会显示。' }, { status: 202 })
}
