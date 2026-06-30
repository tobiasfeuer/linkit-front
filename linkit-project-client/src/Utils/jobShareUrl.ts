const DEFAULT_SITE_URL = 'https://www.linkit-hr.com'

export function generateJobTitleSlug (title: string): string {
  if (!title) return 'oferta'
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * URL corta para compartir (WhatsApp, etc.)
 * Ej: https://www.linkit-hr.com/j/1036/WhatsApp
 */
export function buildShortJobShareUrl (
  jobCode: string,
  recruiterSlug?: string,
  baseUrl = DEFAULT_SITE_URL
): string {
  const base = baseUrl.replace(/\/$/, '')
  const code = jobCode.trim()
  const slug = recruiterSlug?.trim()

  if (slug) {
    return `${base}/j/${encodeURIComponent(code)}/${encodeURIComponent(slug)}`
  }

  return `${base}/j/${encodeURIComponent(code)}`
}

/**
 * URL larga con slug de título (SEO, sitemap)
 */
export function buildLongJobUrl (
  jobCode: string,
  title?: string,
  recruiterSlug?: string,
  baseUrl = DEFAULT_SITE_URL
): string {
  const base = baseUrl.replace(/\/$/, '')
  const code = jobCode.trim()
  const titleSlug = title ? generateJobTitleSlug(title) : ''
  const path = titleSlug
    ? `/soyTalento/Joboffer/${encodeURIComponent(code)}/${titleSlug}`
    : `/soyTalento/Joboffer/${encodeURIComponent(code)}`

  const slug = recruiterSlug?.trim()
  if (slug) {
    return `${base}${path}?recruiterSlug=${encodeURIComponent(slug)}`
  }

  return `${base}${path}`
}
