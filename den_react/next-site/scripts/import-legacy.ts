import 'dotenv/config'

import fs from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const legacyRoot = path.resolve(process.cwd(), '..')
const blogDir = path.join(legacyRoot, 'src', 'blogs')
const galleryDir = path.join(legacyRoot, 'public', 'img', 'gallery')

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name)
        return entry.isDirectory() ? walk(fullPath) : [fullPath]
      }),
    )
  ).flat()
}

function tags(value: unknown) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  return list.map((tag) => ({ tag: String(tag).trim() })).filter(({ tag }) => tag)
}

async function importPosts() {
  const payload = await getPayload({ config })
  const files = (await walk(blogDir)).filter((file) => file.toLowerCase().endsWith('.md'))
  let created = 0
  let skipped = 0
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const { data, content } = matter(raw)
    const slug = path.basename(file, path.extname(file))
    const existing = await payload.find({
      collection: 'posts',
      limit: 1,
      where: { slug: { equals: slug } },
    })
    if (existing.docs.length) {
      skipped += 1
      continue
    }
    const published = data.published !== false
    await payload.create({
      collection: 'posts',
      draft: !published,
      data: {
        title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : slug,
        slug,
        excerpt: typeof data.introduction === 'string' ? data.introduction.trim() : '',
        contentMarkdown: content,
        tags: tags(data.tags),
        publishedAt: data.date ? new Date(data.date).toISOString() : undefined,
        _status: published ? 'published' : 'draft',
      },
    })
    created += 1
  }
  console.log(`Posts: created ${created}, skipped ${skipped}`)
}

async function importGallery() {
  const payload = await getPayload({ config })
  const supported = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'])
  const files = (await walk(galleryDir)).filter((file) =>
    supported.has(path.extname(file).toLowerCase()),
  )
  let created = 0
  let skipped = 0
  for (const file of files) {
    const relative = path.relative(galleryDir, file).replaceAll('\\', '/')
    const category = relative.toLowerCase().includes('/gore/')
      ? 'gore'
      : relative.toLowerCase().startsWith('nsfw/')
        ? 'nsfw'
        : 'safe'
    const title = path.basename(file, path.extname(file)).replaceAll(/[-_]+/g, ' ')
    const existing = await payload.find({
      collection: 'media',
      limit: 1,
      where: { and: [{ title: { equals: title } }, { category: { equals: category } }] },
    })
    if (existing.docs.length) {
      skipped += 1
      continue
    }
    await payload.create({
      collection: 'media',
      data: { title, alt: title, category, published: true, sortOrder: created },
      filePath: file,
    })
    created += 1
  }
  console.log(`Gallery: created ${created}, skipped ${skipped}`)
}

await importPosts()
await importGallery()
process.exit(0)
