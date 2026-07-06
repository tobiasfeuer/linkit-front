import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { getStoredConsent } from "./CookieConsent/consentStorage"
import { getWhatsAppUrl } from "./whatsappContact"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const FAB_SIZE = 50
const FAB_RIGHT = 40
const FAB_GAP = 14
const FAB_BASE_BOTTOM = 40

function computeBottomOffset(): number {
  const topButtonVisible = window.scrollY > 200
  const cookieBarVisible = getStoredConsent() === null

  let bottom = FAB_BASE_BOTTOM
  if (topButtonVisible) bottom = FAB_BASE_BOTTOM + FAB_SIZE + FAB_GAP
  if (cookieBarVisible) bottom = Math.max(bottom, 140)

  return bottom
}

export default function WhatsAppFloatingButton() {
  const { i18n } = useTranslation()
  const es = i18n.language.startsWith("es")
  const lang = es ? "es" : "en"
  const [bottomOffset, setBottomOffset] = useState(FAB_BASE_BOTTOM)

  useEffect(() => {
    const updatePosition = () => setBottomOffset(computeBottomOffset())

    updatePosition()
    window.addEventListener("scroll", updatePosition, { passive: true })
    window.addEventListener("resize", updatePosition)

    const onConsentChange = () => updatePosition()
    window.addEventListener("storage", onConsentChange)
    window.addEventListener("linkit:consent-updated", onConsentChange)

    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("storage", onConsentChange)
      window.removeEventListener("linkit:consent-updated", onConsentChange)
    }
  }, [])

  const label = es ? "Contactar con un asesor" : "Contact an advisor"

  return (
    <motion.a
      href={getWhatsAppUrl(lang)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group fixed z-[9990] flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 hover:shadow-[0_12px_32px_rgba(37,211,102,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      style={{ bottom: bottomOffset, right: FAB_RIGHT, width: FAB_SIZE, height: FAB_SIZE }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
      whileTap={{ scale: 0.95 }}
    >
      <WhatsAppIcon className="h-[26px] w-[26px]" />
      <span className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#173951] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        {label}
      </span>
    </motion.a>
  )
}
