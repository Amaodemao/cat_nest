import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { revalidateJournal } from '../lib/revalidateContent'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'publishedAt'],
    useAsTitle: 'title',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    update: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea' },
    {
      name: 'contentMarkdown',
      type: 'textarea',
      required: true,
      admin: { description: '支持 GFM、数学公式和代码块。' },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    { name: 'publishedAt', type: 'date', index: true },
  ],
  hooks: {
    afterChange: [({ doc, previousDoc, req }) => {
      if (!req.context.skipRevalidation) revalidateJournal(doc.slug, previousDoc?.slug)
      return doc
    }],
    afterDelete: [({ doc, req }) => {
      if (!req.context.skipRevalidation) revalidateJournal(doc.slug)
      return doc
    }],
    beforeChange: [
      ({ data }) => {
        if (data?._status === 'published' && !data.publishedAt) {
          return { ...data, publishedAt: new Date().toISOString() }
        }
        return data
      },
    ],
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
}
