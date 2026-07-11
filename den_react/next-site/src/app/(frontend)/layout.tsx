import React, { ViewTransition } from 'react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import './styles.css'

export const metadata = {
  description: 'Amao 的个人站、文章和画廊。',
  icons: { icon: '/img/avatar.png' },
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
