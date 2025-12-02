import { useEffect, useState } from "react";
//import "./JobDescription.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { JobDescriptionProps, State } from "./typesJobs";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setFormVisible } from "../../../../../../redux/features/ApplicationSlice";
import Swal from "sweetalert2";
import { setPressLogin } from "../../../../../../redux/features/registerLoginSlice";
import Newsletter from "../../../../../../Utils/newsletter/newsletter";
import blackArrow from "/Vectores/arrowBlackLeft.png";
import whiteArrow from "/Vectores/arrowWhiteLeft.png";
import WhiteLogo from "/Vectores/LinkIt-Logotipo-2024-white.svg";
import BlueLogo from "/Vectores/LinkIt-Logotipo-2024-blue.svg";
import type { RootState } from "../../../../../../redux/types";
import HTMLReactParser from "html-react-parser";
import { Helmet } from "react-helmet-async";
import BreadcrumbsWithSchema from "../../../../../../Utils/Breadcrumbs/Breadcrumbs";
import JobDescriptionSkeleton from "./JobDescriptionSkeleton";
import { Send, ArrowRight, Briefcase, Sparkles } from "lucide-react";


const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

function JobDescription() {
  const { id, slug } = useParams<{ id: string; slug: string }>();

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authentication = useSelector((state: State) => state.Authentication);
  const [jobData, setJobData] = useState<JobDescriptionProps>(
    {} as JobDescriptionProps
  );
  const [loading, isLoading] = useState<boolean>(false);
  const { i18n } = useTranslation();
  const { language } = i18n;
  const navigate = useNavigate();
  const isDarkMode = useSelector((state: RootState) => state.darkMode);
  const isSpanish = language === "es";
  const [translatedJobData, setTranslatedJobData] = useState<any>({});
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!loading) isLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/jds/find?code=${id}`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": isSpanish ? 'es' : 'en',
            },
          }
        );
        // Si response.data es un array, tomar el primer elemento, si no, usar response.data directamente
        const jobDataToSet = Array.isArray(response.data) ? response.data[0] : response.data;
        setJobData(jobDataToSet);
      } catch (error: any) {
        Swal.fire({ title: "Error", text: error.response.data, icon: "error" });
      } finally {
        isLoading(false);
        window.scrollTo(0, 0);
      }
    };
    fetchJob();
    window.scrollTo(0, 0);
  }, [i18n.language, id]);

  // Actualizar translatedJobData cuando jobData o isSpanish cambien
  useEffect(() => {
    if (jobData && Object.keys(jobData).length > 0) {
      setTranslatedJobData({
        title: isSpanish ? jobData.title : jobData.en?.title ?? jobData.title,
        description: isSpanish ? jobData.description : jobData.en?.description ?? jobData.description,
        location: isSpanish ? jobData.location : jobData.en?.location ?? jobData.location,
        modality: isSpanish ? jobData.modality : jobData.en?.modality ?? jobData.modality,
        stack: isSpanish ? jobData.stack ?? [] : jobData.en?.stack ?? [],
        aboutUs: isSpanish ? jobData.aboutUs : jobData.en?.aboutUs || jobData.aboutUs,
        aboutClient: isSpanish ? jobData.aboutClient : jobData.en?.aboutClient || jobData.aboutClient,
        responsabilities: isSpanish ? jobData.responsabilities : jobData.en?.responsabilities ?? [],
        requirements: isSpanish ? jobData.requirements : jobData.en?.requirements ?? [],
        niceToHave: isSpanish ? jobData.niceToHave ?? [] : jobData.en?.niceToHave ?? [],
        benefits: isSpanish ? jobData.benefits ?? [] : jobData.en?.benefits ?? [],
      });
    }
  }, [jobData, isSpanish]);

  // Detectar scroll para mostrar botón flotante
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 400; // Mostrar después de 400px de scroll
      setShowFloatingButton(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  

  const handleGoBack = () => {
    navigate("/soyTalento");
  };

  const handleApply = () => {
    if (!authentication.isAuthenticated) {
      Swal.fire({
        title: "¡Ups!",
        text: "Debes iniciar sesión para poder aplicar a esta vacante",
        icon: "warning",
        confirmButtonText: "Iniciar sesión",
        confirmButtonColor: "#01A28B",
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(setPressLogin("visible"));
        }
      });
      return;
    }

    if (authentication.user.role !== "user") {
      Swal.fire({
        title: "Acceso denegado",
        text: "Esta acción es solo para talentos. Las empresas no pueden aplicar.",
        icon: "error",
        confirmButtonColor: "#F87171",
        confirmButtonText: "Aceptar",
      });
      return;
    }
    if (!authentication.user.active) {
      Swal.fire({
        title: "Cuenta no verificada",
        text: "Debes confirmar tu correo electrónico para poder aplicar.",
        icon: "info",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }
    navigate(`application`);
    dispatch(setFormVisible(true));
  };

  // Extraer texto plano para los schemas
  const getPlainText = (htmlString: string): string => {
    if (!htmlString) return "";
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    return div.textContent || div.innerText || "";
  };

  // Convertir arrays de HTML a texto plano para los schemas
  const getPlainTextFromArray = (arr: string[] | undefined): string => {
    if (!arr || arr.length === 0) return "";
    return arr.map((item) => getPlainText(item)).join(", ");
  };

  // Generar el schema de JobPosting para Schema.org
  const generateJobPostingSchema = () => {
    if (!jobData || !translatedJobData.title) return null;

    // Fecha de publicación (si no está disponible, usar la fecha actual menos 7 días)
    const datePosted =
      jobData.createdAt ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fecha de expiración (si no está disponible, usar la fecha actual más 30 días)
    const validThrough =
      jobData.expirationDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Construir el schema
    const jobPostingSchema: any = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: translatedJobData.title,
      description: getPlainText(translatedJobData.description || ""),
      datePosted: datePosted,
      validThrough: validThrough,
      employmentType: jobData.jobType || "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: jobData.company || "LinkIT",
        sameAs: "https://www.linkit-hr.com",
        logo: "https://www.linkit-hr.com/Linkit-logo/linkit-logo-2024-blue.svg",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: translatedJobData.location || "Remoto",
        },
      },
      applicantLocationRequirements: {
        "@type": "Country",
        name: translatedJobData.location || "Remoto",
      },
      jobLocationType: translatedJobData.location === "Remoto" ? "TELECOMMUTE" : "ONSITE",
      identifier: {
        "@type": "PropertyValue",
        name: "LinkIT Job Code",
        value: id,
      },
    };

    // Añadir requisitos si están disponibles
    if (translatedJobData.requirements && translatedJobData.requirements.length > 0) {
      jobPostingSchema["skills"] = getPlainTextFromArray(translatedJobData.requirements);
      jobPostingSchema["qualifications"] = getPlainTextFromArray(
        translatedJobData.requirements
      );
    }

    // Añadir responsabilidades si están disponibles
    if (translatedJobData.responsabilities && translatedJobData.responsabilities.length > 0) {
      jobPostingSchema["responsibilities"] = getPlainTextFromArray(
        translatedJobData.responsabilities
      );
    }

    // Añadir beneficios si están disponibles
    if (translatedJobData.benefits && translatedJobData.benefits.length > 0) {
      jobPostingSchema["jobBenefits"] = getPlainTextFromArray(translatedJobData.benefits);
    }
    return jobPostingSchema;
  };

  // Utilidad para renderizar arrays mixtos (con o sin HTML)
  const renderList = (arr: string[]) => {
    // Si algún item tiene <ul>, extrae los <li> y los mete en un <ul> propio
    if (arr.some((item) => /<ul[\s>]/i.test(item))) {
      const allLis = arr.flatMap((item) => {
        const matches = item.match(/<li[\s\S]*?<\/li>/gi);
        return matches
          ? matches.map((li, idx) => (
              <li
                key={idx}
                className="font-[600] text-size lg:max-w-[70%] dark:text-white"
              >
                {HTMLReactParser(li.replace(/<\/?li.*?>/gi, ""))}
              </li>
            ))
          : [];
      });
      return <ul className="flex flex-col list-disc pl-6">{allLis}</ul>;
    }
    if (arr.some((item) => /<li[\s>]/i.test(item))) {
      const allLis = arr.flatMap((item) => {
        const matches = item.match(/<li[\s\S]*?<\/li>/gi);
        return matches
          ? matches.map((li, idx) => (
              <li
                key={idx}
                className="font-[600] text-size lg:max-w-[70%] dark:text-white"
              >
                {HTMLReactParser(li.replace(/<\/?li.*?>/gi, ""))}
              </li>
            ))
          : [];
      });
      return <ul className="flex flex-col list-disc pl-6">{allLis}</ul>;
    }
    return (
      <ul className="flex flex-col list-disc pl-6">
        {arr.map((item, idx) => (
          <li
            key={idx}
            className="font-[600] text-size lg:max-w-[70%] dark:text-white"
          >
            {item}
          </li>
        ))}
      </ul>
    );
  };


   // Si no hay datos cargados, mostrar skeleton
   if (!jobData || Object.keys(jobData).length === 0 || !translatedJobData.title) {
     return <JobDescriptionSkeleton lang={language} />;
   }

   return (
    <div className="">
      {/* Schema.org implementation */}
             <Helmet>
         <title>
           {translatedJobData.title
             ? `${translatedJobData.title} | LinkIT`
             : "Oferta de trabajo | LinkIT"}
         </title>
         <meta
           name="description"
           content={
             translatedJobData.description
               ? getPlainText(translatedJobData.description).substring(0, 160)
               : "Descubre esta oportunidad laboral en el sector IT con LinkIT. Aplica ahora y da el siguiente paso en tu carrera profesional."
           }
         />
         {translatedJobData.title && (
           <script type="application/ld+json">
             {JSON.stringify(generateJobPostingSchema())}
           </script>
         )}
       </Helmet>

             <div>
         <article className="font-montserrat text-linkIt-400 dark:bg-linkIt-200 flex flex-col relative p-[7%] pt-[17vh] lg:pt-[23vh]">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <BreadcrumbsWithSchema
              items={[
                { label: isSpanish ? "Inicio" : "Home", path: "/" },
                {
                  label: isSpanish ? "Para Talento" : "For Talent",
                  path: "/soyTalento",
                },
                {
                  label: isSpanish ? "Ofertas de trabajo" : "Job Offers",
                  path: "/soyTalento#vacasntes",
                },
                                 {
                   label:
                     translatedJobData.title ||
                     (isSpanish ? "Oferta de trabajo" : "Job Offer"),
                   path: `/soyTalento/Joboffer/${id}/${slug}`,
                   active: true,
                 },
              ]}
            />
          </div>

          <div className="lg:flex grid relative mb-[10%] w-full">
            <div className="w-full">
              <header className="mb-[3%]">
                <motion.button
                  className="flex flex-row gap-[.5rem] items-center content-center mb-[5%] font-bold text-size text-black dark:text-white"
                  onClick={handleGoBack}
                  whileHover={{ cursor: "pointer", scale: 1.1 }}
                  initial={{ opacity: 0, x: -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <img
                    src={isDarkMode ? whiteArrow : blackArrow}
                    alt="back"
                    className="w-[1.5rem]"
                  />
                  {language === "en" ? "Go back" : "Volver"}
                </motion.button>
                <h3 className="text-black border-[2px] border-linkIt-300 dark:border-linkIt-200 dark:bg-white dark: inline-flex px-2 py-1 text-size font-semibold rounded-[7px] mb-[3%]">
                  CODE: {id}
                </h3>
                                 <h1
                   className="text-black dark:text-white font-bold titles-size"
                   itemProp="title"
                 >
                   {translatedJobData.title}
                 </h1>

                 {/* Job metadata */}
                 <div className="flex flex-wrap gap-2 mt-3">
                   {translatedJobData.location && (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                       <svg
                         className="w-3 h-3 mr-1"
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
                       {translatedJobData.location}
                     </span>
                   )}
                                     {jobData && jobData.jobType && (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                       <svg
                         className="w-3 h-3 mr-1"
                         fill="currentColor"
                         viewBox="0 0 20 20"
                         xmlns="http://www.w3.org/2000/svg"
                       >
                         <path
                           fillRule="evenodd"
                           d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                           clipRule="evenodd"
                         ></path>
                         <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                       </svg>
                       {jobData.jobType}
                     </span>
                   )}
                </div>

                {/* Botón CTA Prominente - Desktop: después del header */}
                <motion.div
                  className="hidden lg:flex mt-6 mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.button
                    onClick={handleApply}
                    className="group relative overflow-hidden bg-gradient-to-r from-linkIt-300 to-[#01B29B] text-white font-bold rounded-lg px-8 py-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#01B29B] to-linkIt-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-3">
                      <Briefcase className="w-5 h-5" />
                      <span className="text-lg">
                        {isSpanish ? "Aplicar Ahora" : "Apply Now"}
                      </span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  </motion.button>
                </motion.div>

                {/* Botón CTA Prominente - Mobile: después del header */}
                <motion.div
                  className="lg:hidden mt-6 mb-6 w-full"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.button
                    onClick={handleApply}
                    className="w-full bg-gradient-to-r from-linkIt-300 to-[#01B29B] text-white font-bold rounded-lg px-6 py-4 flex items-center justify-center gap-3 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="text-base">
                      {isSpanish ? "Aplicar Ahora" : "Apply Now"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </header>
                             <section className="mb-[3%]" itemProp="description">
                 <h3 className="font-bold text-linkIt-300 subtitles-size mb-[1%]">
                   {t("Descripción")}
                 </h3>
                 <p className="font-[600] text-size lg:max-w-[70%] dark:text-white">
                   {translatedJobData.description && HTMLReactParser(translatedJobData.description)}
                 </p>
               </section>
               {translatedJobData.aboutUs && (
                 <section className="mb-[3%]">
                   <h3 className="font-bold text-linkIt-300 subtitles-size mb-[1%]">
                     {t("Acerca de nosotros")}
                   </h3>
                   <p className="font-[600] text-size lg:max-w-[70%] dark:text-white">
                     {translatedJobData.aboutUs && HTMLReactParser(translatedJobData.aboutUs)}
                   </p>
                 </section>
               )}
               {translatedJobData.aboutClient && (
                 <section className="mb-[3%]">
                   <h3 className="font-bold text-linkIt-300 subtitles-size mb-[1%]">
                     {t("Acerca de nuestro cliente")}
                   </h3>
                   <p className="font-[600] text-size lg:max-w-[70%] dark:text-white">
                     {translatedJobData.aboutClient &&
                       HTMLReactParser(translatedJobData.aboutClient)}
                   </p>
                 </section>
               )}

                             {translatedJobData.responsabilities &&
                 translatedJobData.responsabilities.length > 0 && (
                   <section className="mb-[3%]" itemProp="responsibilities">
                     <h3 className="font-bold text-linkIt-300 subtitles-size mb-[1%]">
                       {t("Responsabilidades")}
                     </h3>
                     {renderList(translatedJobData.responsabilities)}
                   </section>
                 )}

               {translatedJobData.requirements && translatedJobData.requirements.length > 0 && (
                 <section className="mb-[3%]" itemProp="qualifications">
                   <h3 className="font-bold text-linkIt-300 subtitles-size mb-[1%]">
                     {t("Requerimientos")}
                   </h3>
                   {renderList(translatedJobData.requirements)}
                 </section>
               )}

               {translatedJobData.niceToHave && translatedJobData.niceToHave.length > 0 && (
                 <section className="mb-[3%]">
                   <h3 className="font-bold text-linkIt-300 subtitles-size mb-[1%]">
                     {t("Deseable")}
                   </h3>
                   {renderList(translatedJobData.niceToHave)}
                 </section>
               )}

               {translatedJobData.benefits && translatedJobData.benefits.length > 0 && (
                 <section className="mb-[3%]" itemProp="jobBenefits">
                   <h3 className="font-bold text-linkIt-300 subtitles-size mb-[1%]">
                     {t("Beneficios")}
                   </h3>
                   {renderList(translatedJobData.benefits)}
                 </section>
               )}
              <section className="mt-[10%] lg:flex grid content-center items-center justify-items-center lg:max-w-[70%] dark:text-white">
                <img
                  src="/Vectores/complete-form.svg"
                  alt="complete-form"
                  className="w-[30px] ssm:w-[40px] lg:w-1/16 mr-2 lg:mr-4 hidden lg:block"
                />
                <h3 className="font-bold text-black dark:text-white subtitles-size row-start-1 text-center lg:text-start">
                  {t("Para aplicar por favor completa")}{" "}
                  {t("el siguiente formulario")}
                </h3>
              </section>
            </div>

            <section className="lg:w-[50%] flex flex-col justify-items-center items-center gap-[1rem]">
              <img
                src={isDarkMode ? WhiteLogo : BlueLogo}
                alt="linkIt-logo"
                className="w-full sticky top-[30%] mb-[20%] hidden lg:block"
              />
              {/* Botón mejorado en sidebar - Desktop */}
              <motion.button
                className="hidden lg:flex relative lg:sticky lg:top-[93%] justify-self-center items-center gap-3 bg-gradient-to-r from-linkIt-300 to-[#01B29B] text-white rounded-lg px-6 py-4 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer font-manrope group"
                onClick={handleApply}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>{isSpanish ? "Postularme" : "Apply for this position"}</span>
                <Sparkles className="w-4 h-4 opacity-70" />
              </motion.button>
            </section>
          </div>

          {/* Call to Action */}
          {/* <div className="mt-8 mb-12">
            <CallToAction
              variant="compact"
              customTitle={
                isSpanish
                  ? "¿Buscas otras oportunidades?"
                  : "Looking for other opportunities?"
              }
              buttonStyle="gradient"
              externalLinks={{
                findJob: "/soyTalento#vacantes",
                resources: "/recursos",
              }}
            />
          </div> */}
        </article>
        <Newsletter />
      </div>

      {/* Botón Flotante Sticky - Aparece al hacer scroll - Mobile centrado */}
      {showFloatingButton && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={handleApply}
            className="bg-gradient-to-r from-linkIt-300 to-[#01B29B] text-white font-bold rounded-full px-6 py-4 flex items-center gap-3 shadow-2xl"
            whileHover={{ scale: 1.1, boxShadow: "0 10px 30px rgba(1, 162, 139, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-sm font-semibold">
              {isSpanish ? "Aplicar" : "Apply"}
            </span>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}

      {/* Botón Flotante Desktop - Aparece al hacer scroll - Centrado en la parte inferior */}
      {showFloatingButton && (
        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 hidden lg:block"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={handleApply}
            className="bg-gradient-to-r from-linkIt-300 to-[#01B29B] text-white font-bold rounded-lg px-8 py-5 flex items-center gap-3 shadow-2xl group"
            whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(1, 162, 139, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Briefcase className="w-6 h-6" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold leading-tight">
                {isSpanish ? "Aplicar Ahora" : "Apply Now"}
              </span>
              <span className="text-xs opacity-90 font-normal">
                {isSpanish ? "No pierdas esta oportunidad" : "Don't miss this opportunity"}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default JobDescription;