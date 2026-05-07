import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ReactGA from "react-ga4"

const GA_INTERNAL_ID = "G-SJ3KWGF9FD"

type CookiebotApi = {
  consent: {
    necessary: boolean
    preferences: boolean
    statistics: boolean
    marketing: boolean
  }
  hasResponse: boolean
  submitCustomConsent: (preferences: boolean, statistics: boolean, marketing: boolean) => void
  renew: () => void
  runScripts?: () => void
}

declare global {
  interface Window {
    Cookiebot?: CookiebotApi
  }
}

const hasCookiebotConfig = Boolean(import.meta.env.VITE_COOKIEBOT_DOMAIN_GROUP_ID)

export default function CookieConsentBar() {
  const { i18n } = useTranslation()
  const es = i18n.language.startsWith("es")
  const gaInitialized = useRef(false)
  const [barOpen, setBarOpen] = useState<boolean | null>(null)

  const initReactGAIfAllowed = useCallback(() => {
    const C = window.Cookiebot
    if (!C?.consent?.statistics) return
    if (gaInitialized.current) return
    try {
      ReactGA.initialize(GA_INTERNAL_ID)
      gaInitialized.current = true
    } catch {
      /* ignore */
    }
  }, [])

  const syncFromCookiebot = useCallback(() => {
    const C = window.Cookiebot
    if (!C) return
    document.body.classList.add("cookiebot-ui-custom")
    setBarOpen(!C.hasResponse)
    initReactGAIfAllowed()
    C.runScripts?.()
  }, [initReactGAIfAllowed])

  useEffect(() => {
    if (!hasCookiebotConfig) {
      try {
        ReactGA.initialize(GA_INTERNAL_ID)
        gaInitialized.current = true
      } catch {
        /* ignore */
      }
      return
    }

    const onConsentReady = () => syncFromCookiebot()
    window.addEventListener("CookiebotOnConsentReady", onConsentReady)
    window.addEventListener("CookiebotOnLoad", onConsentReady)
    window.addEventListener("CookiebotOnAccept", onConsentReady)

    if (window.Cookiebot) syncFromCookiebot()

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", onConsentReady)
      window.removeEventListener("CookiebotOnLoad", onConsentReady)
      window.removeEventListener("CookiebotOnAccept", onConsentReady)
    }
  }, [syncFromCookiebot])

  const acceptAll = () => {
    window.Cookiebot?.submitCustomConsent(true, true, true)
    setBarOpen(false)
  }

  const necessaryOnly = () => {
    window.Cookiebot?.submitCustomConsent(false, false, false)
    setBarOpen(false)
  }

  const openCookiebotSettings = () => {
    document.body.classList.remove("cookiebot-ui-custom")
    window.Cookiebot?.renew()
  }

  if (!hasCookiebotConfig) return null

  if (barOpen === null) return null

  return (
    <>
      {barOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[9997] border-t border-white/10 bg-gradient-to-r from-[#173951] to-[#1c4a6b] px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] font-montserrat text-white"
          role="dialog"
          aria-label={es ? "Consentimiento de cookies" : "Cookie consent"}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-sm leading-snug text-gray-100 sm:max-w-[58%]">
              {es ? (
                <>
                  Usamos cookies propias y de terceros para analítica y campañas. Podés aceptar todas, usar solo las
                  necesarias o gestionar preferencias. Más info en nuestra{" "}
                  <Link to="/PrivacyPolicy" className="font-semibold text-linkIt-300 underline underline-offset-2">
                    política de privacidad
                  </Link>
                  .
                </>
              ) : (
                <>
                  We use first and third party cookies for analytics and marketing. You can accept all, use only
                  strictly necessary cookies, or manage preferences. See our{" "}
                  <Link to="/PrivacyPolicy" className="font-semibold text-linkIt-300 underline underline-offset-2">
                    privacy policy
                  </Link>
                  .
                </>
              )}
            </p>
            <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={openCookiebotSettings}
                className="rounded-lg border border-linkIt-300/50 px-3 py-2 text-xs font-bold text-linkIt-300 transition hover:bg-white/10 sm:text-sm"
              >
                {es ? "Gestionar" : "Manage"}
              </button>
              <button
                type="button"
                onClick={necessaryOnly}
                className="rounded-lg border border-white/30 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 sm:text-sm"
              >
                {es ? "Solo necesarias" : "Necessary only"}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-lg bg-linkIt-300 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-[#3dbdb5] sm:text-sm"
              >
                {es ? "Aceptar todas" : "Accept all"}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
