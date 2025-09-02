import ModuloTalentosA from "./ModulosTalentos/ModuloTalentosA/ModuloTalentosA";
import ModuloTalentosB from "./ModulosTalentos/ModuloTalentosB/ModuloTalentosB";
import ModuloTalentosD from "./ModulosTalentos/ModuloTalentosD/ModuloTalentosD";
import ModuloTalentosE from "./ModulosTalentos/ModuloTalentosE/ModuloTalentosE";
import ModuloTalentosF from "./ModulosTalentos/ModuloTalentosF/ModuloTalentosF";
import ModuloTalentosC from "./ModulosTalentos/ModuloTalentosC/ModuloTalentosC";
import ModuloTalentosG from "./ModulosTalentos/ModuloTalentosG/ModuloTalentosG";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Talentos.css";
import Newsletter from "../../Utils/newsletter/newsletter";
import { useIntersectionObserver } from "../../Utils/ModuleObserver/IntersectionObserver";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import CallToAction from "../../Utils/Buttons/CTA/callToAction";
import { getJobOffers } from "../Services/jobOffers.service";

function Talentos() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isSpanish = currentLanguage.startsWith("es");
  const [jobListings, setJobListings] = useState<any[]>([]);


  const navigateIntoTalent = (hash: string) => {
    setTimeout(() => {
      window.location.href = hash;
    });
  };

  const refC = useRef<HTMLDivElement>(null);
  const refD = useRef<HTMLDivElement>(null);
  const refE = useRef<HTMLDivElement>(null);
  const refF = useRef<HTMLDivElement>(null);
  const refG = useRef<HTMLDivElement>(null);

  const isCVisible = useIntersectionObserver(refC);
  const isDVisible = useIntersectionObserver(refD);
  const isEVisible = useIntersectionObserver(refE);
  const isFVisible = useIntersectionObserver(refF);
  const isGVisible = useIntersectionObserver(refG);

  // Obtener las ofertas de trabajo para el schema
  useEffect(() => {
    const fetchJobListings = async () => {
      try {
        // Usar el mismo servicio que usa JobCardList
        const fetchedJobOffers = await getJobOffers();
        // Filtrar solo las ofertas activas
        const activeJobOffers = fetchedJobOffers
          .reverse()
          .filter((jobOffer) => jobOffer.archived === false);
        setJobListings(activeJobOffers);
      } catch (error) {
        console.error("Error fetching job listings:", error);
      }
    };

    fetchJobListings();
  }, []);

  useEffect(() => {
    if (location.pathname === "/SoyTalento" && location.hash)
      navigateIntoTalent(location.hash);

    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  // Generar el esquema JSON-LD para la página de talentos
  const generateTalentSchema = () => {
    // Schema para la organización
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "LinkIT",
      url: "https://www.linkit-hr.com/",
      logo: "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg",
      description: isSpanish
        ? "LinkIT conecta profesionales IT con las mejores oportunidades laborales del mercado."
        : "LinkIT connects IT professionals with the best job opportunities in the market.",
      sameAs: [
        "https://www.linkedin.com/company/linkit-hr/",
        "https://www.instagram.com/linkit.hr/",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "ary@linkit-hr.com",
        availableLanguage: ["Spanish", "English"],
      },
    };

    // Schema para JobPosting - versión dinámica basada en las ofertas reales
    const jobPostingSchemas = jobListings.map((job) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.description || job.shortDescription,
      datePosted: job.createdAt || new Date().toISOString(),
      validThrough:
        job.expirationDate ||
        new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
      employmentType: job.jobType || "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: job.company || "LinkIT",
        sameAs: "https://www.linkit-hr.com",
        logo: "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: job.location || "Remoto",
        },
      },
      skills: job.skills?.join(", ") || job.tags?.join(", ") || "",
      url: `https://www.linkit-hr.com/soyTalento/Joboffer/${job._id}/${
        job.slug ||
        encodeURIComponent(job.title.replace(/\s+/g, "-").toLowerCase())
      }`,
    }));

    // Schema para el servicio de búsqueda de empleo
    const jobSearchServiceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: isSpanish ? "Búsqueda de Empleo IT" : "IT Job Search",
      description: isSpanish
        ? "Encuentra las mejores oportunidades laborales en el sector tecnológico con LinkIT."
        : "Find the best job opportunities in the technology sector with LinkIT.",
      provider: {
        "@type": "Organization",
        name: "LinkIT",
      },
      serviceType: isSpanish ? "Búsqueda de empleo" : "Job search",
      audience: {
        "@type": "Audience",
        audienceType: "Profesionales IT",
      },
    };

    // Schema para preguntas frecuentes
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: isSpanish
            ? "¿Cómo funciona el proceso de búsqueda de empleo con LinkIT?"
            : "How does the job search process work with LinkIT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "Nuestro proceso comienza con una evaluación de tu perfil y experiencia, seguido de la búsqueda de oportunidades que se ajusten a tus habilidades y expectativas. Te acompañamos durante todo el proceso de selección, desde la preparación para entrevistas hasta la negociación de ofertas."
              : "Our process begins with an assessment of your profile and experience, followed by searching for opportunities that match your skills and expectations. We accompany you throughout the selection process, from interview preparation to offer negotiation.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿Qué tipos de empleos IT puedo encontrar?"
            : "What types of IT jobs can I find?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "Ofrecemos oportunidades en diversas áreas: desarrollo de software, DevOps, ciberseguridad, análisis de datos, gestión de proyectos IT, diseño UX/UI, entre otros."
              : "We offer opportunities in various areas: software development, DevOps, cybersecurity, data analysis, IT project management, UX/UI design, among others.",
          },
        },
        {
          "@type": "Question",
          name: isSpanish
            ? "¿El servicio tiene algún costo para los candidatos?"
            : "Is there any cost for candidates?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isSpanish
              ? "No, nuestro servicio es completamente gratuito para los candidatos. Nuestros ingresos provienen de las empresas que contratan nuestros servicios de reclutamiento."
              : "No, our service is completely free for candidates. Our revenue comes from companies that hire our recruitment services.",
          },
        },
      ],
    };

    // Schema para el proceso de aplicación a empleos
    const actionSchema = {
      "@context": "https://schema.org",
      "@type": "Action",
      name: isSpanish ? "Aplicar a empleos IT" : "Apply to IT jobs",
      description: isSpanish
        ? "Proceso para aplicar a empleos en el sector tecnológico a través de LinkIT."
        : "Process to apply for jobs in the technology sector through LinkIT.",
      agent: {
        "@type": "Person",
        description: isSpanish ? "Profesional IT" : "IT Professional",
      },
      object: {
        "@type": "Thing",
        name: isSpanish ? "Oportunidad laboral" : "Job opportunity",
      },
      result: {
        "@type": "Thing",
        name: isSpanish ? "Aplicación a empleo" : "Job application",
      },
      instrument: {
        "@type": "SoftwareApplication",
        name: "LinkIT Platform",
      },
    };

    return [
      organizationSchema,
      ...jobPostingSchemas,
      jobSearchServiceSchema,
      faqSchema,
      actionSchema,
    ];
  };

  return (
    <>
      {/* Implementación de Schema.org con Helmet */}
      <Helmet>
        <title>
          {isSpanish
            ? "Oportunidades laborales en IT | LinkIT"
            : "IT Job Opportunities | LinkIT"}
        </title>
        <meta
          name="description"
          content={
            isSpanish
              ? "Encuentra las mejores oportunidades laborales en el sector tecnológico. LinkIT conecta profesionales IT con empresas líderes."
              : "Find the best job opportunities in the technology sector. LinkIT connects IT professionals with leading companies."
          }
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://www.linkit-hr.com/talent"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://www.linkit-hr.com/soyTalento"
        />
        <script type="application/ld+json">
          {JSON.stringify(generateTalentSchema())}
        </script>
      </Helmet>

      <div className="overflow-hidden">
        <ModuloTalentosA />
        <section
          id="vacantes"
        >
          <ModuloTalentosG />
        </section>
        <div ref={refC} className="min-h-[300px]">
          {isCVisible && <ModuloTalentosB />}
        </div>
        <div ref={refD} className="min-h-[300px]">
          {isDVisible && <ModuloTalentosC />}
        </div>
        <div ref={refE} className="min-h-[300px]">
          {isEVisible && (
            <section
              id="serviciosT"
            >
              <ModuloTalentosD />
            </section>
          )}
        </div>

        <div ref={refF} className="min-h-[300px]">
          {isFVisible && (
            <section id="procesoT">
              <ModuloTalentosE />
            </section>
          )}
        </div>
        <div ref={refG} className="min-h-[300px]">
          {isGVisible && (
            <div>
              <ModuloTalentosF />
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
              <Newsletter />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Talentos;
