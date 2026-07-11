import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container not-found">
      <h2>Page not found</h2>
      <p>这里没有你要找的页面。</p>
      <Link className="link-inline" href="/">
        Back to Home
      </Link>
    </section>
  )
}
