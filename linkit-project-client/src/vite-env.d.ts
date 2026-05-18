/// <reference types="vite/client" />

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    gtag_report_conversion?: (url?: string) => boolean
  }
}

export {}
