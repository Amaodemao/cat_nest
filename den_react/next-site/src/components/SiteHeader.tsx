'use client'

import Link from 'next/link'
import { useState } from 'react'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header>
      <div className="container">
        <nav aria-label="Primary">
          <Link className="logo" href="/#top" onClick={() => setMenuOpen(false)}>
            {' '}
            Amao&apos;s Den ✦
          </Link>
          <input
            aria-label="Open menu"
            checked={menuOpen}
            id="menuToggle"
            onChange={(event) => setMenuOpen(event.target.checked)}
            type="checkbox"
          />
          <label htmlFor="menuToggle" id="hamburger">
            ☰
          </label>
          <ul>
            <li>
              <Link href="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/gallery" onClick={() => setMenuOpen(false)}>
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/journal" onClick={() => setMenuOpen(false)}>
                Journal
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
