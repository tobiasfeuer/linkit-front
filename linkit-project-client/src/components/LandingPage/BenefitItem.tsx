import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

const translations = {
  es: {
    benefits: {
      timeEfficiency: {
        title: "Candidatos en 5 días hábiles",
        description: "Te presentamos candidatos prefiltrados en menos de una semana hábil",
      },
      riskFree: {
        title: "Sólo pagás al contratar",
        description: "Sin costos ocultos ni riesgos. Garantía de reemplazo de 3 meses",
      },
      resourceOptimization: {
        title: "Te asesoramos en estrategias contractuales",
        description: "Modalidades, plazos y compliance alineados a tu operación",
      },
    },
  },
  en: {
    benefits: {
      timeEfficiency: {
        title: "Candidates within 5 business days",
        description: "We present pre-screened candidates in less than one business week",
      },
      riskFree: {
        title: "You only pay when you hire",
        description: "No hidden costs or risks. 3-month replacement guarantee",
      },
      resourceOptimization: {
        title: "We advise you on contracting strategies",
        description: "Engagement models, timelines, and compliance aligned with your operations",
      },
    },
  },
}

interface BenefitItemProps {
  icon: ReactNode
  text: string
  description: string
  translationKey?: string
}

const BenefitItem = ({ icon, text, description, translationKey }: BenefitItemProps) => {
  const { i18n } = useTranslation()

  const currentLang = i18n.language.startsWith("en") ? "en" : "es"

  const t = (key: string) => {
    const keys = key.split(".")
    let translation: any = translations[currentLang]

    for (const k of keys) {
      if (translation[k] === undefined) return null
      translation = translation[k]
    }

    return translation
  }

  let displayText = text
  let displayDescription = description

  if (translationKey) {
    const translatedContent = t(translationKey)
    if (translatedContent) {
      displayText = translatedContent.title
      displayDescription = translatedContent.description
    }
  }

  return (
    <motion.div
      className="flex items-start gap-4 text-white"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ x: 5 }}
    >
      <div className="bg-[#4ECDC4] p-3 rounded-lg shadow-md flex items-center justify-center">{icon}</div>
      <div>
        <h3 className="text-xl font-bold">{displayText}</h3>
        <p className="text-gray-200 text-sm">{displayDescription}</p>
      </div>
    </motion.div>
  )
}

export default BenefitItem
