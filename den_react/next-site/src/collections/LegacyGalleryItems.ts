import type { CollectionConfig } from 'payload'

const denyAccess = () => false

// Keep the migrated table in the schema until a database migration removes it.
export const LegacyGalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  admin: { hidden: true },
  access: {
    create: denyAccess,
    delete: denyAccess,
    read: denyAccess,
    update: denyAccess,
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
