import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ReactGA from "react-ga4"
import { applyTrackingConsent } from "./consentScripts"
import { getStoredConsent, saveConsent } from "./consentStorage"

const GA_INTERNAL_ID = "G-SJ3KWGF9FD"
export const OPEN_COOKIE_PREFERENCES_EVENT = "linkit:open-cookie-preferences"

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))
}

export default function CookieConsentBar() {
  const { i18n } = useTranslation()
  const es = i18n.language.startsWith("es")
  const gaInitialized = useRef(false)

  const [barOpen, setBarOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [statistics, setStatistics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const initReactGAIfAllowed = useCallback((allowsStatistics: boolean) => {
    if (!allowsStatistics || gaInitialized.current) return
    try {
      ReactGA.initialize(GA_INTERNAL_ID)
      gaInitialized.current = true
    } catch {
      /* ignore */
    }
  }, [])

  const applyConsent = useCallback(
    (next: { statistics: boolean; marketing: boolean }) => {
      saveConsent(next)
      applyTrackingConsent(next)
      initReactGAIfAllowed(next.statistics)
      setBarOpen(false)
      setShowPreferences(false)
    },
    [initReactGAIfAllowed]
  )

  useEffect(() => {
    const stored = getStoredConsent()
    if (stored) {
      setStatistics(stored.statistics)
      setMarketing(stored.marketing)
      applyTrackingConsent(stored)
      initReactGAIfAllowed(stored.statistics)
      return
    }
    setBarOpen(true)
  }, [initReactGAIfAllowed])

  useEffect(() => {
    const openPreferences = () => {
      const stored = getStoredConsent()
      setStatistics(stored?.statistics ?? false)
      setMarketing(stored?.marketing ?? false)
      setShowPreferences(true)
      setBarOpen(true)
    }

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences)
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences)
  }, [])

  if (!barOpen) return null

  const barShellClass =
    "fixed bottom-0 left-0 right-0 z-[9997] border-t border-white/10 bg-gradient-to-r from-[#173951] to-[#1c4a6b] px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] font-montserrat text-white"

  return (
    <div className={barShellClass} role="dialog" aria-label={es ? "Consentimiento de cookies" : "Cookie consent"}>
      <div className="mx-auto max-w-6xl">
        {!showPreferences ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
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
            <CookieBarActions
              es={es}
              onManage={() => setShowPreferences(true)}
              onNecessaryOnly={() => applyConsent({ statistics: false, marketing: false })}
              onAcceptAll={() => applyConsent({ statistics: true, marketing: true })}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-white">{es ? "Preferencias de cookies" : "Cookie preferences"}</p>
            <label className="flex items-center gap-2 text-sm text-gray-100">
              <input type="checkbox" checked disabled className="accent-linkIt-300" />
              {es ? "Necesarias (siempre activas)" : "Necessary (always active)"}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-100">
              <input
                type="checkbox"
                checked={statistics}
                onChange={(e) => setStatistics(e.target.checked)}
                className="accent-linkIt-300"
              />
              {es ? "Estadísticas / analítica" : "Statistics / analytics"}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-100">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="accent-linkIt-300"
              />
              {es ? "Marketing / publicidad" : "Marketing / advertising"}
            </label>
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-lg border border-white/30 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 sm:text-sm"
              >
                {es ? "Volver" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => applyConsent({ statistics, marketing })}
                className="rounded-lg bg-linkIt-300 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-[#3dbdb5] sm:text-sm"
              >
                {es ? "Guardar preferencias" : "Save preferences"}
              </button>
            </div>
            </div>
        )}
      </div>
    </div>
  )
}

function CookieBarActions({
  es,
  onManage,
  onNecessaryOnly,
  onAcceptAll,
}: {
  es: boolean
  onManage: () => void
  onNecessaryOnly: () => void
  onAcceptAll: () => void
}) {
  return (
    <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={onManage}
        className="rounded-lg border border-linkIt-300/50 px-3 py-2 text-xs font-bold text-linkIt-300 transition hover:bg-white/10 sm:text-sm"
      >
        {es ? "Gestionar" : "Manage"}
      </button>
      <button
        type="button"
        onClick={onNecessaryOnly}
        className="rounded-lg border border-white/30 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 sm:text-sm"
      >
        {es ? "Solo necesarias" : "Necessary only"}
      </button>
      <button
        type="button"
        onClick={onAcceptAll}
        className="rounded-lg bg-linkIt-300 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-[#3dbdb5] sm:text-sm"
      >
        {es ? "Aceptar todas" : "Accept all"}
      </button>
    </div>
  )
}
