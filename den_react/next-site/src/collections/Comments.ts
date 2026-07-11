import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { revalidateCommentPost } from '../lib/revalidateContent'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    defaultColumns: ['nickname', 'post', 'status', 'createdAt'],
    useAsTitle: 'nickname',
  },
  access: {
    create: () => false,
    delete: isAdmin,
    read: ({ req: { user } }) => (user ? true : { status: { equals: 'approved' } }),
    update: isAdmin,
  },
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true, index: true },
    { name: 'nickname', type: 'text', required: true, maxLength: 40 },
    { name: 'content', type: 'textarea', required: true, maxLength: 2000 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: '待审核', value: 'pending' },
        { label: '已批准', value: 'approved' },
        { label: '垃圾内容', value: 'spam' },
      ],
    },
    { name: 'ipHash', type: 'text', admin: { hidden: true } },
  ],
  hooks: {
    afterChange: [async ({ doc, req }) => {
      if (!req.context.skipRevalidation) await revalidateCommentPost(doc.post, req.payload)
      return doc
    }],
    afterDelete: [async ({ doc, req }) => {
      if (!req.context.skipRevalidation) await revalidateCommentPost(doc.post, req.payload)
      return doc
    }],
  },
  timestamps: true,
}
