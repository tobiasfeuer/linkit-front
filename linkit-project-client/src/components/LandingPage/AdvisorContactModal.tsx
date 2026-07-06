import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { getWhatsAppUrl } from "../../Utils/whatsappContact"

const IDLE_MS = 7000
const COOLDOWN_MS = 4 * 60 * 60 * 1000 // 4 horas
const STORAGE_KEY = "linkit_advisor_modal_last_seen"

const copy = {
  es: {
    title: "¿Querés contactarte con un asesor?",
    description:
      "Nuestro equipo puede ayudarte a encontrar el talento IT que necesitás. Escribinos por WhatsApp y te respondemos a la brevedad.",
    cta: "Contactar con un asesor",
    dismiss: "Ahora no",
  },
  en: {
    title: "Would you like to speak with an advisor?",
    description:
      "Our team can help you find the IT talent you need. Message us on WhatsApp and we'll get back to you shortly.",
    cta: "Contact an advisor",
    dismiss: "Not now",
  },
}

function canShowModal(): boolean {
  try {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    if (!lastSeen) return true
    return Date.now() - Number(lastSeen) >= COOLDOWN_MS
  } catch {
    return true
  }
}

function markModalSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

export default function AdvisorContactModal() {
  const { i18n } = useTranslation()
  const es = i18n.language.startsWith("es")
  const lang = es ? "es" : "en"
  const t = copy[lang]

  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastActivityRef = useRef(Date.now())
  const hasShownRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDismiss = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!canShowModal()) return

    const markActivity = () => {
      if (!hasShownRef.current) {
        lastActivityRef.current = Date.now()
      }
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const
    events.forEach((event) => window.addEventListener(event, markActivity, { passive: true }))

    const interval = window.setInterval(() => {
      if (hasShownRef.current || !canShowModal()) return

      if (Date.now() - lastActivityRef.current >= IDLE_MS) {
        hasShownRef.current = true
        markModalSeen()
        setIsOpen(true)
      }
    }, 500)

    return () => {
      window.clearInterval(interval)
      events.forEach((event) => window.removeEventListener(event, markActivity))
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            className="absolute inset-0 bg-[#173951]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            aria-label={t.dismiss}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="advisor-modal-title"
            className="relative z-[501] w-full max-w-md max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#173951] to-[#1c4a6b] p-5 font-montserrat text-white shadow-2xl sm:p-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label={t.dismiss}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366]">
              <MessageCircle className="h-6 w-6" />
            </div>

            <h2 id="advisor-modal-title" className="mb-2 pr-8 text-lg font-bold sm:text-xl">
              {t.title}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-200">{t.description}</p>

            <div className="flex flex-col gap-3">
              <a
                href={getWhatsAppUrl(lang)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDismiss}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1fb855]"
              >
                {t.cta}
              </a>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full rounded-lg border border-white/25 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                {t.dismiss}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
