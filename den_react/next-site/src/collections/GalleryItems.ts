import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  admin: {
    hidden: true,
    defaultColumns: ['title', 'category', 'sortOrder', 'published'],
    useAsTitle: 'title',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => (user ? true : { published: { equals: true } }),
    update: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'image', type: 'relationship', relationTo: 'media', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'safe',
      options: [
        { label: 'Safe', value: 'safe' },
        { label: 'NSFW', value: 'nsfw' },
        { label: 'Gore', value: 'gore' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, index: true },
    { name: 'published', type: 'checkbox', defaultValue: true, index: true },
  ],
}
