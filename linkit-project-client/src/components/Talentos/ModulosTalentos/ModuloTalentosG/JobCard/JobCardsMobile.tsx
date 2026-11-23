// JobCardList.tsx
import { FunctionComponent, useEffect, useState } from "react";
import JobCard, { JobCardProps } from "./JobCard";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import whiteArrow from "/Vectores/white-arrow.png";
import { useTranslation } from "react-i18next";
import { JobCardSkeletonMobile } from "./JobCardSkeleton";

type JobCardsMobileProps = {
  isLoading?: boolean;
};

const JobCardsMobile: FunctionComponent<JobCardsMobileProps> = ({
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const jobOffers = useSelector(
    (state: any) => state.jobCard.jobOffers as JobCardProps[]
  );
  const jobsPerPage = 3;
  const maxPages = Math.ceil(jobOffers.length / jobsPerPage) || 1;
  const handlePrev = () =>
    setCurrent(current === 0 ? maxPages - 1 : current - 1);
  const handleNext = () =>
    setCurrent(current === maxPages - 1 ? 0 : current + 1);

  // Resetear a la primera página cuando cambian las vacantes (por ejemplo, al aplicar filtros)
  useEffect(() => {
    setCurrent(0);
  }, [jobOffers.length]);

  const jobOffersToShow = jobOffers.slice(
    current * jobsPerPage,
    (current + 1) * jobsPerPage
  );
  
  return (
    <div className="flex flex-col items-center my-[5%]">
      <div className="flex justify-between w-full px-[5%] lg:w-auto lg:px-0">
        <button onClick={handlePrev} className="hidden lg:block" disabled={isLoading}>
          <img
            src={whiteArrow}
            alt="previous"
            className="rotate-90 w-[20px] cursor-pointer"
          />
        </button>
        <div className="w-full lg:w-auto">
          {isLoading ? (
            <div className="grid gap-[3%] mb-10">
              <JobCardSkeletonMobile count={jobsPerPage} />
            </div>
          ) : jobOffers.length === 0 ? (
            <div className="flex flex-row justify-center items-center my-[10%] mx-2 text-white">
              <motion.p
                className="font-montserrat subtitles-size text-center"
                initial={{ opacity: 0, x: -1000 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.25 }}
              >
                {t(
                  "No se encontraron vacantes disponibles con las opciones seleccionadas. Prueba nuevos filtros!"
                )}
              </motion.p>
            </div>
          ) : (
            <div className="grid gap-[3%] mb-10">
              {jobOffersToShow.map((jobDescription, index) => (
                <JobCard key={`card-${jobDescription._id}`} {...jobDescription} index={index} current={current} />
              ))}
            </div>
          )}
        </div>
        <button onClick={handleNext} className="hidden lg:block" disabled={isLoading}>
          <img
            src={whiteArrow}
            alt="next"
            className="-rotate-90 w-[20px] cursor-pointer"
          />
        </button>
      </div>
      {/* mobile version */}
      <div className="flex items-center mt-4 lg:hidden">
        <button onClick={handlePrev} disabled={isLoading}>
          <img
            src={whiteArrow}
            alt="previous"
            className="rotate-90 w-[20px] cursor-pointer mr-4"
          />
        </button>
        <p className="my-2 text-white font-semibold text-xl">
          {isLoading ? "..." : `${current + 1} de ${maxPages}`}
        </p>
        <button onClick={handleNext} disabled={isLoading}>
          <img
            src={whiteArrow}
            alt="next"
            className="-rotate-90 w-[20px] cursor-pointer ml-4"
          />
        </button>
      </div>
    </div>
  );
  
};

export default JobCardsMobile;
