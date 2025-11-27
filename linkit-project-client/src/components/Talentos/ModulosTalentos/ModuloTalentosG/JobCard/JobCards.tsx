// JobCardList.tsx
import { FunctionComponent, useEffect, useState } from "react";
import JobCard, { JobCardProps } from "./JobCard";
import { getJobOffers } from "../../../../Services/jobOffers.service";
import { useDispatch, useSelector } from "react-redux";
import { setJobOffers } from "../../../../../redux/features/JobCardsSlice";
import { motion } from "framer-motion";
import whiteArrow from "/Vectores/white-arrow.png";
import { useTranslation } from "react-i18next";
import JobCardSkeleton from "./JobCardSkeleton";

const JobCards: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const jobOffers = useSelector(
    (state: any) => state.jobCard.jobOffers as JobCardProps[]
  );
  const jobsPerPage = 6;
  const maxPages = Math.ceil(jobOffers.length / jobsPerPage);
  const handlePrev = () =>
    setCurrent(current === 0 ? maxPages - 1 : current - 1);
  const handleNext = () =>
    setCurrent(current === maxPages - 1 ? 0 : current + 1);

  const fetchedJobOffers = async () => {
    try {
      setIsLoading(true);
      // Fetch my job offers from backend api
      const fetchedJobOffers = await getJobOffers();
      const activeJobOffers = fetchedJobOffers
        .reverse()
        .filter((jobOffer) => jobOffer.archived === false);
      dispatch(setJobOffers(activeJobOffers));
    } catch (error) {
      console.error("Error al cargar las vacantes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchedJobOffers();
  }, []);

  // Resetear a la primera página cuando cambian las vacantes (por ejemplo, al aplicar filtros)
  useEffect(() => {
    setCurrent(0);
  }, [jobOffers.length]);

  const jobOffersToShow = jobOffers.slice(
    current * jobsPerPage,
    (current + 1) * jobsPerPage
  );


  return (
    <div className="flex w-full items-center justify-center mb-[10%] h-max">
      <button onClick={handlePrev} className="" disabled={isLoading}>
        <img
          src={whiteArrow}
          alt="previus"
          className="rotate-90 w-[20px] justify-self-start ssm:justify-self-center cursor-pointer"
        />
      </button>
      <div className="mx-[5%] w-full h-full justify-items-center">
        {isLoading ? (
          <div
            className="grid grid-cols-3 gap-x-[2%] gap-y-[10%] h-full w-full"
          >
            <JobCardSkeleton count={jobsPerPage} />
          </div>
        ) : jobOffers.length === 0 ? (
          <div className="flex justify-center items-center content-center w-full h-full text-white my-[10%]">
            <motion.p
              className="font-montserrat text-[1rem] ssm:text-[1.5rem] xl:text-[1.5rem] whitespace-nowrap"
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
          <div
            className={`${
              jobOffers.length > 3 ? "grid-rows-2" : "grid-rows-2"
            } grid grid-cols-3 gap-x-[2%] gap-y-[10%] h-full w-full`}
          >
          {jobOffersToShow.map((jobDescription, index) => (
            <JobCard key={`card-${jobDescription._id}`} {...jobDescription} index={index} current={current}/>
          ))}
          </div>
        )}
      </div>
      <button onClick={handleNext} className="" disabled={isLoading}>
        <img
          src={whiteArrow}
          alt="next"
          className="-rotate-90 w-[20px] justify-self-end ssm:justify-self-center cursor-pointer"
        />
      </button>
    </div>
  );
};

export default JobCards;
