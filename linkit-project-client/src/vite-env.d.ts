/// <reference types="vite/client" />

interface Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  gtag_report_conversion?: (url?: string) => boolean
}
