import JobCards from "./JobCard/JobCards";
import JobCardsMobile from "./JobCard/JobCardsMobile";
import JobFilters from "./JobFilters/JobFilters";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Slug y role code para "Súmate a nuestra base de datos" (campaña / base de datos)
const BASE_DATOS_RECRUITER_SLUG = "linkit";
const BASE_DATOS_ROLE_CODE = "880";

export default function ModuloTalentosG() {
  const { t, i18n } = useTranslation();
  const jobOffers = useSelector((state: any) => state.jobCard.jobOffers);

  // Generar el esquema JSON-LD para las ofertas de trabajo
  const generateJobPostingSchema = () => {
    const currentLanguage = i18n.language; 
    const jobPostingSchema = jobOffers.map((job: any) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.description,
      datePosted: job.createdDate,
      employmentType: job.type,
      hiringOrganization: {
        "@type": "Organization",
        name: "LinkIT HR",
        sameAs: "https://www.linkit-hr.com",
      },
      jobLocation: [
        {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Remote",
            addressRegion: currentLanguage === "es" ? "Sudamérica" : "South America",
            addressCountry: currentLanguage === "es" ? "Latinoamérica" : "Latin America",
          },
        },
        {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Remote",
            addressRegion: currentLanguage === "es" ? "Europa" : "Europe",
            addressCountry: currentLanguage === "es" ? "España" : "Spain",
          },
        },
      ],
      jobLocationType: "TELECOMMUTE", 
      validThrough: job.validThrough || "2025-12-31",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: currentLanguage === "es" ? "EUR" : "USD",
        value: {
          "@type": "QuantitativeValue",
          value:  0,
          unitText: "YEAR",
        },
      },
      inLanguage: currentLanguage,
    }));
  
    return jobPostingSchema;
  };

  return (
    <div className="bg-linkIt-200 p-[7%] md:p-[7%] sm:p-[5%] justify-center dark:bg-linkIt-400 overflow-hidden h-max">
      {/* Helmet para inyectar el esquema JSON-LD */}
      <Helmet>
        <title>{t("Vacantes disponibles")} | LinkIT</title>
        <meta
          name="description"
          content={t(
            "Explora nuestras vacantes disponibles en el rubro IT. Encuentra tu próximo desafío profesional con LinkIT."
          )}
        />
        <script type="application/ld+json">
          {JSON.stringify(generateJobPostingSchema())}
        </script>
      </Helmet>

      <h2 className="titles-size text-center justify-center font-montserrat font-bold text-white mb-6">
        {t("Vacantes disponibles")}
      </h2>
      <div>
        <JobFilters />
      </div>
      <div className="hidden lg:block w-full h-max">
        <JobCards />
      </div>
      <div className="lg:hidden">
        <JobCardsMobile />
      </div>
      <p className="text-center font-montserrat text-size font-semibold text-white xs:text-[17px] xs:p-[3vh] sm:p-0">
        {t(
          "Si ninguna de estas vacantes es para tí, no te preocupes, ¡vendrán muchas más!"
        )}
      </p>
      <div className="w-full flex justify-center xs:p-[3vh] sm:p-0 ">
        <Link
          className="background-button mt-[2%] hover:text-linkIt-200 hover:bg-white justify-self-center xs:text-[14px] ssm:text-base xs:px-[3.5vh]"
          to={`/apply/${BASE_DATOS_RECRUITER_SLUG}?roleCode=${BASE_DATOS_ROLE_CODE}`}
        >
          {t("Súmate a nuestra base de datos")}
        </Link>
      </div>
    </div>
  );
}