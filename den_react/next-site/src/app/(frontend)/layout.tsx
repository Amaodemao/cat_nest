import type { Metadata } from 'next'
import React, { ViewTransition } from 'react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getSiteURL } from '@/lib/siteURL'
import './styles.css'

export const metadata: Metadata = {
  metadataBase: getSiteURL(),
  description: 'Amao 的个人站、文章和画廊。',
  icons: { icon: '/img/avatar.png' },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: "Amao's Den",
    title: "Amao's Den | 阿猫的猫的猫窝",
    description: 'Amao 的个人站、文章和画廊。',
    url: '/',
    images: [{ url: '/img/avatar-512.jpg', width: 512, height: 512, alt: 'Amao' }],
  },
  title: { default: "Amao's Den | 阿猫的猫的猫窝", template: "%s | Amao's Den" },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <ViewTransition name="page">
          <main id="top">{children}</main>
        </ViewTransition>
        <SiteFooter />
      </body>
    </html>
  )
}
