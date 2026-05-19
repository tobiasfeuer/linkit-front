export const CONSENT_STORAGE_KEY = "linkit_cookie_consent_v1"

export type CookieConsent = {
  necessary: true
  statistics: boolean
  marketing: boolean
  updatedAt: string
}

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CookieConsent
    if (typeof parsed.statistics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null
    }
    return { necessary: true, statistics: parsed.statistics, marketing: parsed.marketing, updatedAt: parsed.updatedAt }
  } catch {
    return null
  }
}

export function saveConsent(consent: Pick<CookieConsent, "statistics" | "marketing">) {
  const payload: CookieConsent = {
    necessary: true,
    statistics: consent.statistics,
    marketing: consent.marketing,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
  return payload
}