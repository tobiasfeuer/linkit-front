import Blogs from "./Modulos-Recursos/blogs/Blogs"
import Ebooks from "./Modulos-Recursos/ebooks/Ebooks"
import Events from "./Modulos-Recursos/eventos/Events"
import CV from "./Modulos-Recursos/cv/CV"
import FAQ from "./Modulos-Recursos/FAQ/FAQ"
import { useTranslation } from "react-i18next"
import Newsletter from "../../Utils/newsletter/newsletter"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import useWindowWidth from "../../Utils/useWindowWidth"
import { Helmet } from "react-helmet-async"
import BreadcrumbsWithSchema from "../../Utils/Breadcrumbs/Breadcrumbs"

export default function Recursos() {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language
  const isSpanish = currentLanguage.startsWith("es")

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const [fixedHeight, setFixedHeight] = useState(0)
  const windowWidth = useWindowWidth()
  useEffect(() => {
    const updateFixedHeight = (): void => {
      const fixedNavbar = document.getElementById("Navbar")
      const fixedPreNavbar = document.getElementById("preNavbar")

      if (fixedNavbar && fixedPreNavbar) {
        setFixedHeight(fixedNavbar.offsetHeight + fixedPreNavbar.offsetHeight)
      }
    }

    updateFixedHeight()

    window.addEventListener("resize", updateFixedHeight)
    return () => {
      window.removeEventListener("resize", updateFixedHeight)
    }
  }, [])


  // Generar el schema JSON-LD para la página de recursos
  const generateResourcesSchema = () => {
    // Schema para la página web
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: isSpanish
        ? "Recursos para profesionales IT y empresas | LinkIT"
        : "Resources for IT professionals and companies | LinkIT",
      description: isSpanish
        ? "Blogs, ebooks y webinars para profesionales IT y empresas. Contenido sobre desarrollo profesional, contratación, temas impositivos y más."
        : "Blogs, ebooks and webinars for IT professionals and companies. Content on professional development, hiring, tax issues and more.",
      url: "https://www.linkit-hr.com/recursos",
      isPartOf: {
        "@type": "WebSite",
        name: "LinkIT",
        url: "https://www.linkit-hr.com",
      },
      about: {
        "@type": "Thing",
        name: isSpanish
          ? "Recursos de desarrollo profesional y empresarial IT"
          : "IT professional and business development resources",
      },
      audience: [
        {
          "@type": "Audience",
          audienceType: isSpanish ? "Profesionales IT" : "IT Professionals",
        },
        {
          "@type": "Audience",
          audienceType: isSpanish ? "Empresas y reclutadores" : "Companies and recruiters",
        },
      ],
      provider: {
        "@type": "Organization",
        name: "LinkIT",
        url: "https://www.linkit-hr.com",
        logo: "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg",
      },
    }

    // Schema para la organización
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "LinkIT",
      url: "https://www.linkit-hr.com",
      logo: "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg",
      description: isSpanish
        ? "LinkIT es tu recruitment partner que, sin importar las distancias, conecta a las empresas con el mejor talento tech a lo largo del mundo."
        : "LinkIT is your recruitment partner that, regardless of distances, connects companies with the best tech talent throughout the world.",
      sameAs: ["https://www.linkedin.com/company/linkit-hr/", "https://www.instagram.com/linkit.hr/"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "ary@linkit-hr.com",
        availableLanguage: ["Spanish", "English"],
      },
    }


    // Schema para el newsletter
    const newsletterSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: isSpanish ? "Newsletter de LinkIT" : "LinkIT Newsletter",
      description: isSpanish
        ? "Suscríbete a nuestro newsletter para recibir las últimas noticias, recursos y oportunidades laborales en el sector IT."
        : "Subscribe to our newsletter to receive the latest news, resources and job opportunities in the IT sector.",
      provider: {
        "@type": "Organization",
        name: "LinkIT",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    }

    // Schema para FAQPage con las preguntas reales
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: isSpanish ? "¿Qué es LinkIT?" : "What is LinkIT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "LinkIT es tu recruitment partner que, sin importar las distancias, conecta a las empresas con el mejor talento tech a lo largo del mundo."
              : "LinkIT is your recruitment partner that, regardless of distances, connects companies with the best tech talent throughout the world.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish ? "¿Por qué LinkIT?" : "Why LinkIT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "LinkIT no es una agencia de recursos humanos, es tu partner que te ayudará a escalar en tu negocio. Nuestros pilares son agilidad, calidad y excelencia."
              : "LinkIT is not a human resources agency, it is your partner that will help you scale your business. Our pillars are agility, quality and excellence.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿De qué parte del mundo encuentran talento?"
            : "From which part of the world do you find talent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "LinkIT no tiene barrera, busca talento en todo el globo sin importar la ubicación ni la nacionalidad, el foco está en el talento, la experiencia y el match con los objetivos marcados."
              : "LinkIT has no barrier, it seeks talent throughout the globe regardless of location or nationality, the focus is on talent, experience and matching with the marked objectives.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿Piden pagos antes de concretar el servicio?"
            : "Do you request payments before finalizing the service?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "Una de las cosas que hace único a LinkIT es que se centra 100% en la confianza y la transparencia con sus partners, es por esto por lo que no hay ningún pago hasta que el talento comience a trabajar."
              : "One of the things that makes LinkIT unique is that it focuses 100% on trust and transparency with its partners, which is why there is no payment until the talent begins to work.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿Cómo encontrar talento en un mercado tan competitivo como el de la tecnología?"
            : "How to find talent in such a competitive market as technology?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "Gracias a nuestro gran equipo experto y multidisciplinario, junto con el dominio en herramientas de búsqueda y bolsas de datos internas, logramos cruzar las barreras del talento y de ubicación yendo a indagar sobre a candidatos en búsqueda activa así como también a aquellos que no lo estén."
              : "Thanks to our great expert and multidisciplinary team, together with mastery in search tools and internal data pools, we manage to cross the barriers of talent and location by investigating active job seekers as well as those who are not.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿Qué tipo de roles son los más trabajados por LinkIT?"
            : "What type of roles are most worked on by LinkIT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "LinkIT llega en un 360º de perfiles técnicos, encontrando los mejores diseñadores de producto, front-end, back-end, full-stack y mucho más."
              : "LinkIT reaches a 360º of technical profiles, finding the best product designers, front-end, back-end, full-stack and much more.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿En cuánto tiempo presentan los primeros candidatos cualificados?"
            : "How long does it take to present the first qualified candidates?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "Tardamos solo 5 días en presentar los primeros candidatos, previamente seleccionados y entrevistados."
              : "We take only 5 days to present the first candidates, previously selected and interviewed.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish ? "¿Sólo se dedican a reclutamiento Tech?" : "Do you only dedicate to Tech recruitment?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "No, si bien nos especializamos en este área, tenemos una red de partners que están dispuestos a brindar el servicio para otras áreas otorgando los mismos beneficios que nosotros."
              : "No, although we specialize in this area, we have a network of partners who are willing to provide the service for other areas, granting the same benefits as us.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿Qué modalidades de contratación se trabajan?"
            : "What hiring modalities do you work with?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "Gracias a los partners que tenemos con distintas empresas del mundo, podemos alinear los requisitos legales del país donde radique la empresa, así como donde esté el talento. Los tipos de relaciones laborales más frecuentes pueden ser: - Como trabajador autónomo modalidad freelance - Mediante un contrato temporal - En relación de dependencia"
              : "Thanks to the partners we have with different companies around the world, we can align the legal requirements of the country where the company is based, as well as where the talent is. The most frequent types of labor relationships can be: - As a self-employed freelancer - Through a temporary contract - In an employment relationship",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "En caso de no avanzar con el proceso, ¿me tendrán en cuenta futuras oportunidades?"
            : "In case of not advancing with the process, will you consider me for future opportunities?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "Por supuesto! Aceptando los términos y condiciones entrarás en nuestra gran base de datos para poder asignarte el proyecto a tu medida, alineado con tus talentos y necesidades."
              : "Of course! By accepting the terms and conditions, you will enter our large database to be able to assign you the project tailored to you, aligned with your talents and needs.",
          },
        },
      ],
    }

    return [webPageSchema, organizationSchema, newsletterSchema, faqSchema]
  }

  return (
    <>
      {/* Implementación de Schema.org con Helmet */}
      <Helmet>
        <title>
          {isSpanish ? "Recursos para profesionales IT | LinkIT" : "Resources for IT professionals | LinkIT"}
        </title>
        <meta
          name="description"
          content={
            isSpanish
              ? "Blogs, ebooks y webinars para crecer como profesional en el mundo tech. Impulsa tu carrera en IT con los mejores tips y recursos."
              : "Blogs, ebooks and webinars to grow as a professional in the tech world. Boost your IT career with the best tips and resources."
          }
        />
        <link rel="alternate" hrefLang="en" href="https://www.linkit-hr.com/resources" />
        <link rel="alternate" hrefLang="es" href="https://www.linkit-hr.com/recursos" />
        <script type="application/ld+json">{JSON.stringify(generateResourcesSchema())}</script>
      </Helmet>

      {/* Breadcrumbs para mejorar la navegación y SEO */}
      <div className="w-full pt-[17vh] lg:pt-[22vh] hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <BreadcrumbsWithSchema
            items={[
              { label: isSpanish ? "Inicio" : "Home", path: "/" },
              {
                label: isSpanish ? "Recursos" : "Resources",
                path: "/recursos",
                active: true,
              },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden">
        <section id="moduloA">
          <div
            className="md:hidden flex justify-center w-screen bg-linkIt-500 dark:bg-linkIt-200 dark:text-white md:pt-[17vh] lg:pt-[22vh]"
            style={
              windowWidth <= 767
                ? {
                    marginTop: `${fixedHeight}px`,
                    paddingTop: (fixedHeight * 29) / 100,
                  }
                : undefined
            }
          >
            <h1 className="font-bold font-manrope md:hidden xs:text-[1rem] min-[340px]:text-[1.1rem] min-[360px]:text-[1.2rem] min-[390px]:text-[1.2rem] min-[410px]:text-[1.4rem] min-[435px]:text-[1.4rem] min-[465px]:text-[1.5rem] min-[500px]:text-[1.7rem] ssm:text-[1.9rem] min-[570px]:text-[2rem] min-[600px]:text-[2.1rem] sm:text-[2.2rem] min-[670px]:text-[2.3rem] min-[700px]:text-[2.4rem] w-[90%] leading-tight">
              {t("Impulsa tu carrera en IT con los")} <br />
              {t("mejores tips y recursos!")}
            </h1>
          </div>
          <div className="grid grid-cols-2 h-max md:h-max w-screen overflow-hidden bg-linkIt-500 dark:bg-linkIt-200 dark:text-white min-[768px]:pt-[22vh] lg:pt-[22vh]">
            <div className="space-y-[5%] p-[7%] pl-[6%] min-[300px]:ml-[8px] min-[350px]:ml-[9px] min-[400px]:ml-[10px] min-[450px]:ml-3 min-[500px]:ml-3 ssm:ml-4 md:ml-4">
              <h1 className="hidden md:block font-bold font-manrope md:text-[2.3rem] w-[150%] ssm:w-[130%] sm:w-[115%] lg:w-[130%] lg:text-[3rem] xl:text-[3.5rem] xl:w-[112%] 2xl:text-[5rem] leading-tight -pb-[20vh]">
                {t("Impulsa tu carrera")} {t("en IT con los mejores")} {t("tips y recursos!")}
              </h1>
              <h2 className="ont-montserrat hidden md:block md:text-[1.7rem] min-[800px]:text-[1.8rem] min-[850px]:text-[1.9rem] lg:text-[1.5rem] xl:text-[1.8rem] 2xl:text-[2.5rem] w-[110%] ssm:w-[115%] sm:w-[110%] md:w-[110%] lg:w-[90%] xl:w-[85%] leading-tight">
                {t("Blogs, ebooks y webinars para crecer como profesional en el mundo tech.")}{" "}
              </h2>
              <div className="relative top-[5%]">
                <motion.a
                  className="md:mb-20 lg:mb-0 background-button xs:text-[0.4rem] min-[350px]:text-[0.4rem] min-[400px]:text-[0.5rem] [430px]:text-[0.6rem] min-[465px]:text-[0.7rem] min-[500px]:text-[0.8rem] ssm:text-[0.9rem] min-[600px]:text-[0.9rem] sm:text-[1.1rem] min-[700px]:text-[1.2rem] md:text-[1rem]"
                  whileTap={{ scale: 0.9 }}
                  href="https://airtable.com/appPc8zZP29ez9V2O/shrX7MQRZlgmqP6bq"
                >
                  {t("Suscríbete al newsletter")}
                </motion.a>
              </div>
            </div>
            <img
              className="relative self-end h-full w-[90%] left-[15%] xs:left-[6%] xs:w-[80%] xs:mt-4 ssm:w-[80%] ssm:bottom-0 ssm:top[5%] ssm:left-[8%] sm:mt-6 md:self-end md:left-0 md:w-[95%] lg:mb-0 lg:self-end lg:top-4 lg:w-[85%] lg:left-[7%] xl:-mt-4 xl:w-[83%] 2xl:h-full"
              src="/2025/Recursos/ModuleA/linkit-slider-soy-recursos.webp"
              loading="eager"
              alt="Profesional IT consultando recursos de desarrollo profesional"
            />
          </div>
        </section>

        {/* Renderizar directamente los módulos */}
        <section id="blogs">
          <Blogs />
        </section>

        <section id="ebooks">
          <Ebooks />
        </section>

        <section id="webinars">
          <Events />
        </section>

        <section id="CV" >
          <CV />
        </section>

        <section id="FAQ" itemScope itemType="https://schema.org/FAQPage">
          <FAQ />
        </section>

        <section id="form" itemScope itemType="https://schema.org/Service">
          <Newsletter />
        </section>
      </div>
    </>
  );
}
