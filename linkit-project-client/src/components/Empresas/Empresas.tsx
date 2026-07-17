import ModuloA from "./modulosEmpresas/moduloA/ModuloA";
import ModuloB from "./modulosEmpresas/moduloB/moduloBH";
import ModuloC from "./modulosEmpresas/moduloC/ModuloC";
import ModuloD from "./modulosEmpresas/moduloD/ModuloD";
import ModuloE from "./modulosEmpresas/moduloE/ModuloE";
import ModuloF from "./modulosEmpresas/moduloF/ModuloF";
import ModuloG from "./modulosEmpresas/moduloG/ModuloG";
import ModuloH from "./modulosEmpresas/moduloH/ModuloH";
import { useEffect, useState, useMemo } from "react";
import "./Empresas.css";
import Calculadora from "./modulosEmpresas/calculadora/calculadora";
import ContactUs from "../../Utils/contactUs/contactUs";
import GetInTouch from "../../Utils/contactUs/calendly";
import { useHashNavigation } from "../../Utils/ModuleObserver/useHashObserver";
import { Helmet } from "react-helmet-async";
import CallToAction from "../../Utils/Buttons/CTA/callToAction";
import { useTranslation } from "react-i18next";
import AdvisorContactModal from "../LandingPage/AdvisorContactModal";

function Empresas() {
  const [initialLoad, setInitialLoad] = useState(true);
  const activeHash = useHashNavigation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isSpanish = currentLanguage.startsWith("es");

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeHash && !initialLoad) {
      setTimeout(() => {
        const element = document.getElementById(activeHash);
        if (element) {
          const navbarHeight = 100;
          const elementPosition =
            element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: "smooth",
          });
        }
      }, 400);
    }
  }, [activeHash, initialLoad]);

  const generateServiceSchema = (isSpanish: boolean) => {
    // Schema para la organización
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "LinkIT",
      url: "https://www.linkit-hr.com/",
      logo: "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg",
      description:
        "LinkIT conecta empresas con el mejor talento IT del mercado, ofreciendo soluciones de reclutamiento especializadas.",
      sameAs: ["https://www.linkedin.com/company/linkit-hr/"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "ary@linkit-hr.com",
        availableLanguage: ["Spanish", "English"],
      },
    };

    const servicesSchemaES = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Reclutamiento IT",
      provider: {
        "@type": "Organization",
        name: "LinkIT",
      },
      name: "Servicios de Reclutamiento IT",
      description:
        "Conectamos empresas con el mejor talento IT del mercado, ofreciendo soluciones de reclutamiento especializadas y personalizadas.",
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: "https://www.linkit-hr.com/soyEmpresa#serviciosE",
      },
      areaServed: {
        "@type": "Place",
        name: "Todo el mundo",
      },
      availableLanguage: [
        {
          "@type": "Language",
          name: "Español",
          alternateName: "es",
        },
        {
          "@type": "Language",
          name: "Inglés",
          alternateName: "en",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de Reclutamiento IT",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Reclutamiento IT Especializado",
              description:
                "Encontramos los mejores perfiles IT para tu empresa con un proceso de selección riguroso.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Consultoría de Talento IT",
              description:
                "Asesoramiento estratégico para la atracción y retención de talento tecnológico.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Evaluación Técnica de Candidatos",
              description:
                "Evaluamos las habilidades técnicas de los candidatos para asegurar que cumplen con tus requisitos.",
            },
          },
        ],
      },
    };

    const servicesSchemaEN = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "IT Recruitment",
      provider: {
        "@type": "Organization",
        name: "LinkIT",
      },
      name: "IT Recruitment Services",
      description:
        "We connect companies with the best IT talent in the market, offering specialized and personalized recruitment solutions.",
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: "https://www.linkit-hr.com/services",
      },
      areaServed: {
        "@type": "Place",
        name: "Worldwide",
      },
      availableLanguage: [
        {
          "@type": "Language",
          name: "English",
          alternateName: "en",
        },
        {
          "@type": "Language",
          name: "Spanish",
          alternateName: "es",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "IT Recruitment Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Specialized IT Recruitment",
              description:
                "We find the best IT profiles for your company with a rigorous selection process.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "IT Talent Consulting",
              description:
                "Strategic advice for attracting and retaining technological talent.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Technical Candidate Assessment",
              description:
                "We evaluate the technical skills of candidates to ensure they meet your requirements.",
            },
          },
        ],
      },
    };

    const calculatorSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Calculadora de Costos de Reclutamiento IT / IT Recruitment Cost Calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      availableLanguage: [
        {
          "@type": "Language",
          name: "Spanish",
          alternateName: "es",
        },
        {
          "@type": "Language",
          name: "English",
          alternateName: "en",
        },
      ],
    };

    const servicesSchema = isSpanish ? servicesSchemaES : servicesSchemaEN;

    return [organizationSchema, servicesSchema, calculatorSchema];
  };

  const schemaData = useMemo(() => generateServiceSchema(isSpanish), [isSpanish]);

  return (
    <>
      {/* Implementación de Schema.org con Helmet */}
      <Helmet>
        <title>
          {isSpanish
            ? "Servicios de Reclutamiento IT para Empresas | LinkIT"
            : "IT Recruitment Services for Companies | LinkIT"}
        </title>
        <meta
          name="description"
          content={
            isSpanish
              ? "LinkIT ofrece servicios especializados de reclutamiento IT para empresas. Conectamos a las organizaciones con el mejor talento tecnológico del mercado."
              : "LinkIT offers specialized IT recruitment services for companies. We connect organizations with the best tech talent in the market."
          }
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://www.linkit-hr.com/SoyEmpresa#serviciosE"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://www.linkit-hr.com/soyEmpresa"
        />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="overflow-hidden">
        <AdvisorContactModal />
        <ModuloA />

        <div id="contactanosE">
          <ContactUs />
        </div>

        <section id="serviciosE">
          <ModuloB />
        </section>

        <div id="serviciosE">
          <ModuloC />
        </div>

        <div id="casosDeExitoE">
          <ModuloD />
        </div>

        <div id="moduloE">
          <ModuloE />
        </div>

        <div id="moduloF">
          <ModuloF />
        </div>

        <div id="moduloG">
          <ModuloG />
        </div>

        <div id="procesoE">
          <ModuloH />
        </div>

        <div id="calculadora">
          <Calculadora />
        </div>

        <div>
          <GetInTouch />
        </div>

        <div className="container mx-auto px-4 py-8">
          <CallToAction
            variant="default"
            customTitle={
              isSpanish
                ? "¿Listo para encontrar tu próxima oportunidad IT?"
                : "Ready to find your next IT opportunity?"
            }
            buttonStyle="filled"
          />
        </div>
      </div>
    </>
  );
}

export default Empresas;