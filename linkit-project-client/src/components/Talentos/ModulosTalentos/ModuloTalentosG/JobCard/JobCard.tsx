import { motion, useAnimation } from "framer-motion"
import { type FunctionComponent, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import RenderizarElementos from "./renderStack"
import HasH3TwoLines from "./hasH3TwoLines"
import { useTranslation } from "react-i18next"
import { useInView } from "react-intersection-observer"

export type JobCardProps = {
  _id: string
  title: string
  description: string
  modality: string
  type: string
  location: string
  archived: boolean
  code: string
  createdDate: Date
  stack?: string[]
  index: number
  current: number
  company?: string
  salary?: string
  currency?: string
  en?: {
    title: string
    stack: string[]
    location: string
  }
}

export const JobCard: FunctionComponent<JobCardProps> = ({
  title,
  location,
  modality,
  type,
  code,
  stack = [],
  index,
  current,
  description,
  company = "LinkIT",
  createdDate,
  en,
}) => {
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isSpanish = language === "es"
  const bigContainer = useRef<HTMLDivElement>(null)
  // Nuevo ref para el contenedor mobile
  const mobileContainer = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const generateSlug = (text: string): string => {
    return text
      ? text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : "sin-titulo"
  }

  const handleClick = async () => {
    const slug = generateSlug(title)
    navigate(`/soyTalento/Joboffer/${code}/${slug}`)
  }

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: index * 0.1 + current * 0.05,
        },
      })
    }
  }, [controls, inView, index, current])

  const translateModality = (modality: string): string => {
    if (modality === "remote-regional") {
      return isSpanish ? "Remoto (Regional)" : t("Remoto (Regional)")
    } else if (modality === "remote-local") {
      return isSpanish ? "Remoto (Local)" : t("Remoto (Local)")
    } else if (modality === "hybrid") {
      return isSpanish ? "Híbrido" : t("Híbrido")
    } else if (modality === "on-site") {
      return isSpanish ? "Presencial" : "On-site"
    } else return modality
  }

  const cardVariants = {
    initial: { scale: 1, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  }

  const titleVariants = {
    initial: { color: "#FFFFFF" },
    hover: { color: "#01A28B", transition: { duration: 0.2 } },
  }

  const formattedDate = createdDate
    ? new Date(createdDate).toISOString()
    : new Date().toISOString()
  const expirationDate = createdDate
    ? new Date(new Date(createdDate).setMonth(new Date(createdDate).getMonth() + 6)).toISOString()
    : new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()

  return (
    <div ref={ref} itemScope itemType="https://schema.org/JobPosting">
      {/* Metadatos Schema.org (ocultos) */}
      <meta itemProp="title" content={title} />
      <meta itemProp="description" content={description} />
      <meta itemProp="datePosted" content={formattedDate} />
      <meta itemProp="validThrough" content={expirationDate} />
      <meta itemProp="employmentType" content={type} />
      <meta itemProp="jobLocation" content={location} />
      <meta itemProp="hiringOrganization" content={company} />
      <meta itemProp="identifier" content={code} />
      <meta itemProp="applicantLocationRequirements" content={translateModality(modality)} />

      {/* Versión de escritorio */}
      <motion.div
        className="relative hidden lg:block w-full h-[250px] bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-linkIt-300 rounded-lg p-5 font-montserrat shadow-lg cursor-pointer overflow-hidden"
        onClick={handleClick}
        ref={bigContainer}
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        variants={cardVariants}
        whileHover="hover"
        aria-label={`Oferta de trabajo: ${title} en ${location}`}
        role="button"
      >
        {/* Imagen de fondo con opacidad 70% (modifica la URL por la de tu logo o imagen deseada) */}
        <div
          className="absolute inset-0 bg-center bg-contain bg-no-repeat opacity-10"
          style={{ backgroundImage: "url('/Vectores/LinkIt-Logotipo-2024-white.svg')" }}
        />
        {/* Contenido por encima de la imagen */}
        <div className="relative w-full h-full flex flex-col" id={`big-container-${index}`}>
          <div className="h-[100px]">
            <motion.div variants={titleVariants}>
              <HasH3TwoLines text={isSpanish ? title : en?.title || title} />
            </motion.div>
            <div className="flex items-center mt-2 space-x-2">
              <svg
                className="w-4 h-4 text-linkIt-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-white text-sm font-medium">{isSpanish ? location : en?.location || location}</span>
              <span className="text-gray-400">•</span>
              <p className="text-white text-sm font-medium">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
              <motion.div
                className="px-2 py-0.5 rounded-md bg-gray-700 text-white text-xs font-medium"
                whileHover={{ backgroundColor: "#4B5563" }}
              >
                {translateModality(modality)}
              </motion.div>
            </div>
          </div>

          <div className="flex-grow">
            <div className="h-[90px] w-full overflow-hidden mt-4">
              <div className="flex flex-col h-full">
                <div className="flex flex-wrap gap-2 mb-3">
                  <RenderizarElementos
                    stack={isSpanish ? stack : en?.stack || stack}
                    index={index}
                    bigContainer={bigContainer}
                    current={current}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Botón posicionado siempre al fondo */}
          <div className="absolute bottom-4 left-0 w-full flex justify-center">
            <motion.button
              className="px-6 py-1 bg-linkIt-300 text-white rounded-md font-medium"
              whileHover={{ scale: 1.05, backgroundColor: "#01B29B" }}
              whileTap={{ scale: 0.95 }}
            >
              {isSpanish ? "Ver detalles" : "View details"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Versión móvil */}
      <motion.div
        className="lg:hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-md mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative p-4 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white font-montserrat mb-1">{title}</h3>
              <div className="flex items-center text-sm text-gray-300 mb-2">
                <svg
                  className="w-4 h-4 text-linkIt-300 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>{`${location}, ${translateModality(modality)}`}</span>
              </div>
            </div>
            <motion.button
              className="bg-linkIt-300 text-white p-3 rounded-full flex items-center justify-center"
              onClick={handleClick}
              whileHover={{ scale: 1.1, backgroundColor: "#01B29B" }}
              whileTap={{ scale: 0.9 }}
              aria-label={isSpanish ? "Ver detalles" : "View details"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </motion.button>
          </div>
          {/* Contenedor para RenderizarElementos en versión mobile */}
          <div ref={mobileContainer} className="mt-3">
            <RenderizarElementos
              stack={stack}
              index={index}
              bigContainer={mobileContainer}
              current={current}
            />
          </div>
        </div>

        <motion.div
          className="relative p-3 bg-gray-800 flex justify-between items-center"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.button
            className="text-linkIt-300 text-sm font-medium flex items-center"
            whileHover={{ scale: 1.05, color: "#01B29B" }}
            onClick={handleClick}
          >
            {isSpanish ? "Ver detalles" : "View details"}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default JobCard
