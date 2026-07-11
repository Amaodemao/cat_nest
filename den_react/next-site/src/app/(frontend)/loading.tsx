export default function Loading() {
  return (
    <section aria-busy="true" aria-live="polite" className="container route-loading">
      <span className="sr-only">Loading page</span>
      <div className="loading-heading" />
      <div className="loading-row" />
      <div className="loading-row loading-row-short" />
      <div className="loading-grid">
        <div />
        <div />
        <div />
      </div>
    </section>
  )
}
