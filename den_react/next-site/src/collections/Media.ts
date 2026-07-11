import path from 'node:path'

import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { revalidateGallery } from '../lib/revalidateContent'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['filename', 'title', 'category', 'published', 'updatedAt'],
    description: '在这里统一上传、编辑、分类、排序和发布 Gallery 图片。',
    useAsTitle: 'title',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { description: '显示在 Gallery 图片下方的标题。' },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: '供屏幕阅读器使用；留空时自动采用标题。' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'safe',
      index: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Safe', value: 'safe' },
        { label: 'NSFW', value: 'nsfw' },
        { label: 'Gore', value: 'gore' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: { description: '数字越小越靠前。', position: 'sidebar' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: { description: '关闭后不会显示在公开 Gallery。', position: 'sidebar' },
    },
  ],
  hooks: {
    afterChange: [({ doc, req }) => {
      if (!req.context.skipRevalidation) revalidateGallery()
      return doc
    }],
    afterDelete: [({ doc, req }) => {
      if (!req.context.skipRevalidation) revalidateGallery()
      return doc
    }],
    beforeValidate: [
      ({ data, req }) => {
        const uploadedName = req.file?.name?.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
        const fallback = data?.title || data?.alt || uploadedName || 'Untitled image'
        return { ...data, title: data?.title || fallback, alt: data?.alt || fallback }
      },
    ],
  },
  upload: {
    staticDir: path.resolve(process.env.MEDIA_DIR || 'media'),
    imageSizes: [
      { name: 'thumb', width: 640, height: 640, fit: 'inside', withoutEnlargement: true },
      { name: 'display', width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true },
    ],
    mimeTypes: ['image/*'],
  },
}
