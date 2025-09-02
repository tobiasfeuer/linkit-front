import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { Users, Briefcase, Calculator, ArrowRight, ExternalLink } from "lucide-react"
import { useTranslation } from "react-i18next"

interface CallToActionProps {
  className?: string
  variant?: "default" | "compact" | "expanded"
  showTitle?: boolean
  customTitle?: string
  buttonStyle?: "filled" | "outlined" | "gradient"
  externalLinks?: {
    contractTalent?: string
    findJob?: string
    salaryCal?: string
    resources?: string
  }
}

export default function CallToAction({
  className = "",
  variant = "default",
  showTitle = true,
  customTitle = "¿Qué estás buscando?",
  buttonStyle = "filled",
  externalLinks = {
    contractTalent: "/SoyEmpresa#contactanosE",
    findJob: "/SoyTalento#vacantes",
    salaryCal: "/SoyEmpresa#calculadora",
    resources: "/recursos",
  },
}: CallToActionProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const { t } = useTranslation()

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  }

  
  const isCompact = variant === "compact"
  const isExpanded = variant === "expanded"

  
  const getButtonStyles = () => {
    switch (buttonStyle) {
      case "outlined":
        return "border-2 border-linkIt-300 text-linkIt-300 hover:bg-linkIt-300/10"
      case "gradient":
        return "bg-gradient-to-r from-linkIt-300 to-blue-500 text-white hover:shadow-lg"
      case "filled":
      default:
        return "bg-linkIt-300 text-white hover:bg-linkIt-400"
    }
  }

  const buttonBaseStyles = `
    flex items-center justify-between px-5 py-3 rounded-lg font-medium transition-all duration-300
    ${getButtonStyles()}
  `

  const handleNavigation = (path: string) => {
    if (path.startsWith("http")) {
      window.open(path, "_blank")
      return
    }

    
    if (path.includes("#")) {
      const [basePath, hash] = path.split("#")
      const currentPath = location.pathname

      
      if (currentPath === basePath || (basePath === "/" && currentPath === "")) {
       
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
           
            const navbarHeight = 100 
            const elementPosition = element.getBoundingClientRect().top + window.scrollY
            window.scrollTo({
              top: elementPosition - navbarHeight,
              behavior: "smooth",
            })
          }
        }, 100)
      } else {
        sessionStorage.setItem("scrollToElementId", hash)
        navigate(basePath)
      }
    } else {
      navigate(path)
    }
  }

  useEffect(() => {
    const scrollToElementId = sessionStorage.getItem("scrollToElementId")
    if (scrollToElementId) {
      setTimeout(() => {
        const element = document.getElementById(scrollToElementId)
        if (element) {
          const navbarHeight = 100
          const elementPosition = element.getBoundingClientRect().top + window.scrollY
          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: "smooth",
          })
        }
      
        sessionStorage.removeItem("scrollToElementId")
      }, 500) 
    }
  }, [location.pathname])

  return (
    <motion.div
      className={`w-full rounded-xl p-6 bg-white shadow-md dark:bg-gray-800 ${
        isCompact ? "max-w-2xl" : isExpanded ? "max-w-4xl" : "max-w-3xl"
      } mx-auto ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showTitle && (
        <motion.h3
          className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {customTitle}
        </motion.h3>
      )}

      <div
        className={`grid gap-4 ${
          isCompact
            ? "grid-cols-1 md:grid-cols-3"
            : isExpanded
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        {/* Botón 1: Contrata Talento */}
        <motion.button
          className={buttonBaseStyles}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onHoverStart={() => setHoveredButton("talent")}
          onHoverEnd={() => setHoveredButton(null)}
          onClick={() => handleNavigation(externalLinks.contractTalent || "/SoyEmpresa#contactanosE")}
          aria-label="Contrata Talento"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <Users className="w-5 h-5 text-linkIt-300" />
            </div>
            <span>{t("Contrata Talento")}</span>
          </div>
          <motion.div
            animate={{
              x: hoveredButton === "talent" ? 5 : 0,
              transition: { duration: 0.2 },
            }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.button>

        {/* Botón 2: Busco Trabajo */}
        <motion.button
          className={buttonBaseStyles}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onHoverStart={() => setHoveredButton("job")}
          onHoverEnd={() => setHoveredButton(null)}
          onClick={() => handleNavigation(externalLinks.findJob || "/SoyTalento#vacantes")}
          aria-label="Busco Trabajo"
        >
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
              <Briefcase className="w-5 h-5 text-linkIt-300" />
            </div>
            <span>{t("Busco Trabajo")}</span>
          </div>
          <motion.div
            animate={{
              x: hoveredButton === "job" ? 5 : 0,
              transition: { duration: 0.2 },
            }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.button>

        {/* Botón 3: Calculadora de Salario */}
        <motion.button
          className={buttonBaseStyles}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onHoverStart={() => setHoveredButton("salary")}
          onHoverEnd={() => setHoveredButton(null)}
          onClick={() => handleNavigation(externalLinks.salaryCal || "/SoyEmpresa#calculadora")}
          aria-label="Calculadora de Salario"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
              <Calculator className="w-5 h-5 text-linkIt-300" />
            </div>
              <span>{t("Calculadora de Salario")}</span>
          </div>
          <motion.div
            animate={{
              x: hoveredButton === "salary" ? 5 : 0,
              transition: { duration: 0.2 },
            }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>

      {isExpanded && (
        <motion.p
          className="text-center text-sm text-gray-500 mt-4 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5 } }}
        >
          {t("Descubre todas las herramientas que LinkIT tiene para ti")}
          <a
            href={externalLinks.resources || "/recursos"}
            className="text-linkIt-300 ml-1 inline-flex items-center hover:underline"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation(externalLinks.resources || "/recursos")
            }}
          >
            {t("Ver más recursos")} <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </motion.p>
      )}
    </motion.div>
  )
}

