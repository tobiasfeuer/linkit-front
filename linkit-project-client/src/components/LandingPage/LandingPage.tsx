import { motion } from "framer-motion"
import SplitText from "../../Utils/splitText"
import BenefitItem from "./BenefitItem"
import Navbar from "./NavBar"
import ContactForm from "./ContactForm"
import Testimonials from "./Testimonials"

import { ArrowRight, CheckCircle, Zap, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"

// Traducciones específicas para este componente
const translations = {
  es: {
    hero: {
      title1: "¿Buscas",
      title2: "contratar talento ",
      titleConnector: "o ",
      title3: "formar un equipo IT?",
      description:
        "En LinkIT, te conectamos con el mejor talento tech sin costos por adelantado. Solo pagas cuando encuentras al candidato perfecto.",
      demoButton: "¡Demo gratuita!",
    },
    stats: {
      companies: "Empresas confían en nosotros",
      professionals: "Profesionales IT en nuestra red",
      successRate: "Tasa de éxito en contrataciones",
    },
    cta: {
      title: "¿Listo para encontrar el talento que necesitas?",
      description:
        "Nuestro equipo de expertos está listo para ayudarte a formar el equipo IT perfecto para tu empresa.",
      button: "Agendar llamada",
    },
    form: {
      title: "¡Comienza ahora!",
      subtitle: "Completa el formulario y nos pondremos en contacto contigo",
    },
  },
  en: {
    hero: {
      title1: "Looking to",
      title2: " hire talent",
      titleConnector: " or ",
      title3: "build an IT team?",
      description:
        "At LinkIT, we connect you with the best tech talent with no upfront costs. You only pay when you find the perfect candidate.",
      demoButton: "Free demo!",
    },
    stats: {
      companies: "Companies trust us",
      professionals: "IT professionals in our network",
      successRate: "Success rate in hiring",
    },
    cta: {
      title: "Ready to find the talent you need?",
      description: "Our team of experts is ready to help you build the perfect IT team for your company.",
      button: "Schedule a call",
    },
    form: {
      title: "Get Started Now!",
      subtitle: "Fill out the form and we'll get in touch with you",
    },
  },
}

const LandingPage = () => {
  const { i18n } = useTranslation()

  // Determinar el idioma actual (con fallback a español)
  const currentLang = i18n.language.startsWith("en") ? "en" : "es"

  // Función para obtener traducciones
  const t = (key: string) => {
    // Navegar por el objeto de traducciones usando la ruta de la clave
    const keys = key.split(".")
    let translation: any = translations[currentLang]

    for (const k of keys) {
      if (translation[k] === undefined) return key
      translation = translation[k]
    }

    return translation
  }

  return (
    <div className="min-h-screen flex flex-col font-montserrat">
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <main className="flex-grow bg-gradient-to-br from-[#173951] via-[#1c4a6b] to-[#173951] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="lg:w-5/12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h1 className="text-4xl xl:text-5xl lg:text-4xl md:text-4xl xs:text-3xl font-bold mb-6">
                  <span className="inline-block">{t("hero.title1")} </span>
                  <SplitText
                    text={t("hero.title2")}
                    className="text-linkIt-300 font-extrabold"
                    animation="fadeInUp"
                    staggerChildren={0.05}
                  />
                  <span className="inline-block">{t("hero.titleConnector")}</span>
                  <span className="inline-block whitespace-nowrap">{t("hero.title3")}</span>
                </h1>

                <p className="text-lg md:text-xl mb-6 text-gray-100">{t("hero.description")}</p>
              </motion.div>

              <div className="space-y-4 mt-8">
                <BenefitItem
                  icon={<Clock className="w-5 h-5" />}
                  text="Eficientiza tu tiempo"
                  description="Reduce el tiempo de contratación hasta en un 60%"
                  translationKey="benefits.timeEfficiency"
                />
                <BenefitItem
                  icon={<CheckCircle className="w-5 h-5" />}
                  text="Contrata sin riesgos"
                  description="Garantía de reemplazo de 3 meses"
                  translationKey="benefits.riskFree"
                />
                <BenefitItem
                  icon={<Zap className="w-5 h-5" />}
                  text="Optimiza tus recursos"
                  description="Ahorra hasta un 40% en costos de contratación"
                  translationKey="benefits.resourceOptimization"
                />
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:w-7/12">
              <motion.div
                className="bg-white rounded-xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="bg-gradient-to-r from-[#4ECDC4] to-linkIt-300 p-4 text-white">
                  <h2 className="text-2xl font-bold">{t("form.title")}</h2>
                  <p>{t("form.subtitle")}</p>
                </div>
                <div className="p-6">
                  <ContactForm />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              className="p-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-4xl font-bold text-[#173951] mb-2">+500</h3>
              <p className="text-gray-600">{t("stats.companies")}</p>
            </motion.div>

            <motion.div
              className="p-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-4xl font-bold text-[#173951] mb-2">+2000</h3>
              <p className="text-gray-600">{t("stats.professionals")}</p>
            </motion.div>

            <motion.div
              className="p-6 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-4xl font-bold text-[#173951] mb-2">95%</h3>
              <p className="text-gray-600">{t("stats.successRate")}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Call to Action Section */}
      <div className="w-full bg-gradient-to-r from-[#173951] to-[#1c4a6b] py-16 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-5xl mx-auto">
            <motion.div
              className="text-center md:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">{t("cta.title")}</h2>
              <p className="text-gray-200 text-lg mb-4 md:mb-0">{t("cta.description")}</p>
            </motion.div>
            <NavLink to="https://calendly.com/saleslinkit/30min">
              <motion.button
                className="flex items-center gap-2 bg-linkIt-300 hover:bg-[#3dbdb5] text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("cta.button")}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage


