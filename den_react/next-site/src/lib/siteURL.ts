export function getSiteURL() {
  const configuredURL = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  try {
    return new URL(configuredURL || 'http://localhost:3000')
  } catch {
    return new URL('http://localhost:3000')
  }
}
