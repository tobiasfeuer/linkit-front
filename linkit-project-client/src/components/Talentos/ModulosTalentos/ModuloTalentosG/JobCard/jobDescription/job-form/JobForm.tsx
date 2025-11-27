import { FormEvent, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setUncompletedStep,
  setCompletedStep,
  resetForm,
} from "../../../../../../../redux/features/ApplicationSlice";
import "./JobForm.css";
import JobFormProgress from "./jobForm-progress/jobForm-progress";
import { SelectCountryFormEs } from "./jobFormCountry/JobFormSelectCountry";
import { JobValidations } from "./jobFormValidations/JobValidations";
import CloudinaryUploadWidget from "../../../../../../Services/cloudinaryWidget";
import { AnimatePresence, Variants, motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { handleRecruiterChange } from "./job-form-types-handlers/jobFormHandlers";
import Select from "react-select";
import FormTransition from "./job-form-types-handlers/FormTransition";
import { useTranslation } from "react-i18next";
//import { SUPERADMN_ID } from "../../../../../../../env";
import {
  setUser,
  loginSuccess,
} from "../../../../../../../redux/features/AuthSlice";
import { RootState } from "../../../../../../../redux/types";
import { IUser } from "../../../../../../Profiles/types";
import Loading from "../../../../../../Loading/Loading";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

const formVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "-100vw",
    transition: {
      type: "spring",
      delay: 0.3,
      duration: 1,
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      delay: 0.2,
      duration: 0.5,
    },
  },
};

function JobForm() {
  const dispatch = useDispatch();
  const isAPostulation = true;

  const isFormVisible = useSelector(
    (state: any) => state.application.isFormVisible
  );

  const { t } = useTranslation();

  const userData = useSelector(
    (state: RootState) => state.Authentication.user as IUser
  );

  const objectsTechnologies = useSelector(
    (state: any) => state.resources.stackTechnologies
  );

  const technologies = objectsTechnologies.map((tech: any) => {
    return { value: tech.name, label: tech.name };
  });

  const technicalStack = useSelector(
    (state: RootState) => state.resources.techStack
  ).map((tech: any) => {
    return { value: tech.name, label: tech.name };
  });

  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [filePublicId, setFilePublicId] = useState<string>(
    userData.cv.cloudinaryId
  );
  const [fileName, setFileName] = useState<string>(userData.cv.fileName);
  const [country, setCountry] = useState<string>(userData.country ?? "");
  const [englishLevel, setEnglishLevel] = useState<string>(() =>
    t("Selecciona tu nivel de inglés")
  );
  const [openEnglishLevel, setOpenEnglishLevel] = useState<boolean>(false);
  const [userStack, setUserStack] = useState<string[]>([]);
  const [openRecruiter, setOpenRecruiter] = useState<boolean>(false);
  const [recruiter, setRecruiter] = useState<string>("");
  const [userTechnologies, setUserTechnologies] = useState<string[]>(
    userData.technologies
  );
  const [loading, isLoading] = useState(false);

  const englishLevelRef = useRef<HTMLButtonElement>(null);
  const recruiterRef = useRef<HTMLButtonElement>(null);

  const [user, setLocalUser] = useState({
    cv: [
      {
        filename: userData.cv.fileName,
        url: `https://res.cloudinary.com/dquhriqz3/image/upload/${userData.cv.cloudinaryId}`,
      },
    ],
    firstName: userData.firstName,
    lastName: userData.lastName ?? "",
    email: userData.email,
    country: country,
    linkedin: userData.linkedin ?? "",
    englishLevel: englishLevel,
    salary: Number(),
    technicalStack: userStack,
    recruiter: recruiter,
    availability: "",
    technologies: userTechnologies,
    reason: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    linkedin: "",
    englishLevel: "",
    salary: "",
    technicalStack: "",
    recruiter: "",
    availability: "",
    technologies: "",
    reason: "",
  });

  const handleNextStep = (step: number) => {
    if (step === 4) return;
    setCurrentStep(step + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    isLoading(true);
    const userApplicationObject = {
      cv: user.cv,
      email: user.email,
      reason: user.reason,
      availability: user.availability,
      salary: Number(user.salary),
      country: user.country,
      linkedin: user.linkedin,
      stack: user.technologies,
      techStack: user.technicalStack,
      english: user.englishLevel,
      firstName: user.firstName,
      lastName: user.lastName,
      recruiter: user.recruiter !== "-" ? user.recruiter : undefined,
      code: window.location.href.split("Joboffer/")[1].split("/")[0],
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_ENDPOINT_URL}/postulations/create?user=${userData._id}`,
        userApplicationObject,
        { headers: { "Accept-Language": sessionStorage.getItem("lang") } }
      );
      if (response.status > 200 && response.status < 400) {
        dispatch(setUser(response.data));
        isLoading(false);
        Swal.fire({
          icon: "success",
          title: t("¡Postulación enviada!"),
          text: t("Tu postulación ha sido enviada exitosamente"),
          confirmButtonText: t("Seguir viendo vacantes"),
          confirmButtonColor: "#01A28B",
        }).then(async (result) => {
          if (result.isConfirmed) {
            const getUserData = await axios.get(
              `${import.meta.env.VITE_ENDPOINT_URL}/users/find?email=${userData.email}`,
              {
                headers: {
                  Authorization: `Bearer ${SUPERADMN_ID}`,
                  "Accept-Language": sessionStorage.getItem("lang"),
                },
              }
            );
            if (getUserData.data[0]) {
              dispatch(loginSuccess(getUserData.data[0]));
            }
            dispatch(resetForm());
            navigate("/soyTalento");
            navigate("/SoyTalento");
            setTimeout(() => {
              window.location.href = "#vacantes";
            }, 0);
          }
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response.data,
        confirmButtonColor: "#01A28B",
      });
      isLoading(false);
    }
  };

  const handlePreviousStep = (step: number) => {
    if (step === 1) return;
    setCurrentStep(step - 1);
  };

  const handleEnglishLevelChange = (level: string) => {
    setEnglishLevel(level);
    setLocalUser((prevUser) => ({ ...prevUser, englishLevel: level }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLocalUser((prevUser) => {
      const updatedUser = { ...prevUser, [e.target.name]: e.target.value };
      const fieldErrors = JobValidations(updatedUser);

      setErrors({
        ...errors,
        [e.target.name]: fieldErrors[e.target.name as keyof typeof fieldErrors],
      });

      return updatedUser;
    });
  };

  useEffect(() => {
    setLocalUser((prevUser) => ({
      ...prevUser,
      cv: [
        {
          filename: fileName,
          url: `https://res.cloudinary.com/dquhriqz3/image/upload/${filePublicId}`,
        },
      ],
    }));
  }, [filePublicId]);

  useEffect(() => {
    const handler = (event: any) => {
      if (
        !englishLevelRef.current?.contains(event.target) &&
        !event.target.matches(".englishDropdown *")
      ) {
        setOpenEnglishLevel(false);
      }
      if (
        !recruiterRef.current?.contains(event.target) &&
        !event.target.matches(".recruiterDropdown *")
      ) {
        setOpenRecruiter(false);
      }
    };
    document.addEventListener("mousedown", handler);
  }, []);

  const handleGoBack = () => {
    Swal.fire({
      title: t("¿Estás seguro/a?"),
      text: t("Si vuelves atrás perderás todo el progreso"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Volver atrás"),
      cancelButtonText: t("Seguir postulando"),
      confirmButtonColor: "#01A28B",
      cancelButtonColor: "#173951",
      iconColor: "#F87171",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(resetForm());
        navigate(-1);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: t("Cancelado"),
          text: t("Tu postulación sigue en curso"),
          icon: "info",
          confirmButtonText: "OK",
          confirmButtonColor: "#01A28B",
        });
      }
    });
  };

  return (
    <>
      {loading && <Loading text={t("Enviando tu postulación")} />}
      <AnimatePresence mode="wait">
        {isFormVisible && (
          <>
            <FormTransition />
            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className=" bg-white absolute w-full h-full flex flex-col pt-[6%] justify-center items-center content-center z-[300] overflow-x-hidden"
              onSubmit={handleSubmit}
            >
              <button
                type="button"
                className="font-montserrat font-[500] text-linkIt-400 text-[1.3rem] absolute top-[5%] left-[1rem] hover:cursor-pointer hover:scale-105 transition-all duration-150 ease-in-out flex flex-row justify-center items-center gap-[.5rem]"
                onClick={() => handleGoBack()}
              >
                <img
                  src="/Vectores/left-arrow.svg"
                  alt="go-back"
                  className="w-[1.5rem]"
                />{" "}
                {t("Volver")}
              </button>
              <section className="absolute top-[8%] left-[50%] translate-x-[-50%] ">
                <JobFormProgress />
              </section>

              {/*-----------------------------------------------------------------STEP 1-----------------------------------------------------------*/}

              {currentStep === 1 && (
                <motion.section
                  className="w-full max-w-[420px] mx-auto flex flex-col items-center justify-center gap-6 px-4 py-6 bg-white rounded-xl shadow-md"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <motion.h2
                    className="font-montserrat text-[1.4rem] text-linkIt-400 font-bold mb-2 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {t("Información Personal")}
                  </motion.h2>

                  {/* Nombre */}
                  <motion.label
                    htmlFor="firstName"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <span>
                      {t("Nombre")}
                      <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="text"
                      name="firstName"
                      value={user.firstName}
                      onChange={handleInputChange}
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 focus:outline-linkIt-400 bg-white text-linkIt-400"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.firstName}
                      </p>
                    )}
                  </motion.label>

                  {/* Apellido */}
                  <motion.label
                    htmlFor="lastName"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 }}
                  >
                    <span>
                      {t("Apellido")}
                      <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="text"
                      name="lastName"
                      value={user.lastName}
                      onChange={handleInputChange}
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 focus:outline-linkIt-400 bg-white text-linkIt-400"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.lastName}
                      </p>
                    )}
                  </motion.label>

                  {/* Email */}
                  <motion.label
                    htmlFor="email"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.21 }}
                  >
                    <span>
                      Email
                      <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleInputChange}
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 focus:outline-linkIt-400 bg-white text-linkIt-400"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.email}
                      </p>
                    )}
                  </motion.label>

                  {/* País */}
                  <motion.label
                    htmlFor="country"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24 }}
                  >
                    <span>
                      {t("País")}
                      <span className="text-red-400">*</span>
                    </span>
                    <SelectCountryFormEs
                      setCountry={setCountry}
                      country={country}
                      setUser={setLocalUser}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.country}
                      </p>
                    )}
                  </motion.label>

                  {/* Botón Siguiente */}
                  <motion.div
                    className="flex w-full justify-end gap-3 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.27 }}
                  >
                    <motion.button
                      type="button"
                      className="w-full bg-linkIt-400 text-white font-semibold py-2 rounded-lg border-2 border-linkIt-400 hover:bg-linkIt-200 hover:text-linkIt-400 transition-all duration-200 active:scale-95 disabled:opacity-60"
                      onClick={() => {
                        handleNextStep(currentStep);
                        dispatch(setCompletedStep(currentStep));
                      }}
                      disabled={
                        Boolean(errors.firstName) ||
                        Boolean(errors.lastName) ||
                        Boolean(errors.email) ||
                        Boolean(errors.country) ||
                        user.firstName === "" ||
                        user.lastName === "" ||
                        user.email === "" ||
                        country === "" ||
                        country === "Ubicación"
                      }
                      whileTap={{ scale: 0.97 }}
                    >
                      {t("Siguiente")}
                    </motion.button>
                  </motion.div>
                </motion.section>
              )}

              {/*-----------------------------------------------------------------STEP 2-----------------------------------------------------------*/}

              {currentStep === 2 && (
                <motion.section
                  className="w-full max-w-[420px] mx-auto flex flex-col items-center justify-center gap-6 px-4 py-6 bg-white rounded-xl shadow-md"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <motion.h2
                    className="font-montserrat text-[1.4rem] text-linkIt-400 font-bold mb-2 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {t("Información Profesional")}
                  </motion.h2>

                  {/* CV */}
<motion.label
  htmlFor="cv"
  className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.15 }}
>
  <span className="flex items-center gap-1">
    <svg
      width="20"
      height="20"
      fill="#01A28B"
      viewBox="0 0 24 24"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM5 5v14h14V9h-5V5H5zm7 0v4h4l-4-4z" />
    </svg>
    CV<span className="text-red-400">*</span>
  </span>

  {/* Nuevo bloque UX */}
  {(userData.cv?.fileName && fileName === userData.cv.fileName) ? (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-linkIt-50 border-2 border-linkIt-200 rounded-lg px-3 py-2">
        <svg width="20" height="20" fill="#01A28B" viewBox="0 0 24 24">
          <path d="M12 16.5l4-4h-3V3h-2v9.5H8l4 4zM20 18v2H4v-2H2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2h-2z" />
        </svg>
        <span className="truncate max-w-[140px] font-semibold">{userData.cv.fileName}</span>
        <a
          href={`https://res.cloudinary.com/dquhriqz3/image/upload/${userData.cv.cloudinaryId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-linkIt-400 underline text-sm ml-2"
        >
          {t("Ver CV")}
        </a>
      </div>
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          className="px-3 py-1 rounded bg-linkIt-200 text-white font-semibold hover:bg-linkIt-400 transition"
          onClick={() => {
            // Usar el CV actual, no hacer nada
          }}
        >
          {t("Usar mi CV actual")}
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border border-linkIt-200 text-linkIt-400 font-semibold hover:bg-linkIt-50 transition"
          onClick={() => setFileName("")}
        >
          {t("Cargar uno nuevo")}
        </button>
      </div>
    </div>
  ) : (
    <CloudinaryUploadWidget
      isAPostulation={isAPostulation}
      setFilePublicId={setFilePublicId}
      setFileName={setFileName}
    >
      <span
        className="flex items-center justify-center gap-2 border-2 border-linkIt-200 bg-linkIt-50 text-linkIt-400 font-semibold w-full h-12 rounded-lg shadow-sm hover:bg-linkIt-200 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer select-none"
        style={{ fontSize: "1.08rem", letterSpacing: ".01em" }}
      >
        <svg
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="mr-1"
        >
          <path d="M12 16.5l4-4h-3V3h-2v9.5H8l4 4zM20 18v2H4v-2H2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2h-2z" />
        </svg>
        {fileName === "" ? (
          <span>
            <span className="font-bold">{t("Subir CV")}</span>
            <span className="ml-2 text-linkIt-300 text-[.98rem]">
              (PDF o imagen)
            </span>
          </span>
        ) : (
          <span className="truncate max-w-[180px]">
            {fileName}
          </span>
        )}
      </span>
    </CloudinaryUploadWidget>
  )}
</motion.label>

                  {/* LinkedIn */}
                  <motion.label
                    htmlFor="linkedin"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 }}
                  >
                    <span>
                      LinkedIn<span className="text-red-400">*</span>
                    </span>
                    <input
                      type="url"
                      name="linkedin"
                      onChange={handleInputChange}
                      value={user.linkedin}
                      placeholder="https://www.linkedin.com/in/username/"
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 focus:outline-linkIt-400 bg-white text-linkIt-400 placeholder:text-linkIt-300"
                    />
                    {errors.linkedin && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.linkedin}
                      </p>
                    )}
                  </motion.label>

                  {/* Nivel de inglés */}
                  <motion.label
                    htmlFor="englishLevel"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.21 }}
                  >
                    <span>
                      {t("Nivel de inglés")}
                      <span className="text-red-400">*</span>
                    </span>
                    <button
                      type="button"
                      name="englishLevel"
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 flex items-center justify-between bg-white text-linkIt-400"
                      onClick={() => setOpenEnglishLevel(!openEnglishLevel)}
                      ref={englishLevelRef}
                    >
                      {englishLevel}
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>
                    <motion.ul
                      className={`${
                        !openEnglishLevel ? "hidden" : "englishDropdown"
                      } font-montserrat bg-white border border-linkIt-100 rounded-lg shadow-md mt-1 absolute z-50 w-full`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: openEnglishLevel ? 1 : 0,
                        y: openEnglishLevel ? 0 : -10,
                      }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setOpenEnglishLevel(false)}
                    >
                      {[
                        "Basic",
                        "Intermediate",
                        "intermediate (B1)",
                        "intermediate (B2)",
                        "Advanced",
                        "Professional",
                      ].map((level, idx) => (
                        <li
                          key={level}
                          className="p-2 hover:bg-linkIt-100 hover:text-linkIt-400 cursor-pointer"
                          onClick={() => handleEnglishLevelChange(level)}
                        >
                          {level}
                          {idx < 5 && <hr className="my-1 border-linkIt-50" />}
                        </li>
                      ))}
                    </motion.ul>
                    {errors.englishLevel && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.englishLevel}
                      </p>
                    )}
                  </motion.label>

                  {/* Expectativa Salarial */}
                  <motion.label
                    htmlFor="salary"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24 }}
                  >
                    <span>
                      {t("Expectativa Salarial mensual en USD")}
                      <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="number"
                      name="salary"
                      onChange={handleInputChange}
                      placeholder="USD"
                      value={user.salary}
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 focus:outline-linkIt-400 bg-white text-linkIt-400 placeholder:text-linkIt-300"
                    />
                    {errors.salary && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.salary}
                      </p>
                    )}
                  </motion.label>

                  {/* Botones de navegación */}
                  <motion.div
                    className="flex w-full justify-between gap-3 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.27 }}
                  >
                    <motion.button
                      type="button"
                      className="w-1/2 bg-linkIt-100 text-linkIt-400 font-semibold py-2 rounded-lg border-2 border-linkIt-200 hover:bg-linkIt-200 hover:text-white transition-all duration-200 active:scale-95"
                      onClick={() => {
                        dispatch(setUncompletedStep(currentStep - 1));
                        handlePreviousStep(currentStep);
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {t("Anterior")}
                    </motion.button>
                    <motion.button
                      type="button"
                      className="w-1/2 bg-linkIt-400 text-white font-semibold py-2 rounded-lg border-2 border-linkIt-400 hover:bg-linkIt-200 hover:text-linkIt-400 transition-all duration-200 active:scale-95 disabled:opacity-60"
                      onClick={() => {
                        dispatch(setCompletedStep(currentStep));
                        handleNextStep(currentStep);
                      }}
                      disabled={
                        !fileName ||
                        Boolean(errors.linkedin) ||
                        Boolean(errors.englishLevel) ||
                        Boolean(errors.salary) ||
                        user.linkedin === "" ||
                        englishLevel === "" ||
                        Number(user.salary) === 0 ||
                        !user.salary
                      }
                      whileTap={{ scale: 0.97 }}
                    >
                      {t("Siguiente")}
                    </motion.button>
                  </motion.div>
                </motion.section>
              )}

              {/*-----------------------------------------------------------------STEP 3-----------------------------------------------------------*/}

              {currentStep === 3 && (
                <motion.section
                  className="w-full max-w-[420px] mx-auto flex flex-col items-center justify-center gap-6 px-4 py-6 bg-white rounded-xl shadow-md"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <motion.h2
                    className="font-montserrat text-[1.4rem] text-linkIt-400 font-bold mb-2 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {t("Información Profesional")}
                  </motion.h2>

                  {/* Tecnologías */}
                  <motion.label
                    htmlFor="technologies"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <span>
                      {t("Selecciona Tus Tecnologías")}
                      <span className="text-red-400">*</span>
                    </span>
                    <Select
                      options={technologies}
                      isMulti={true}
                      name="technologies"
                      closeMenuOnSelect={false}
                      value={user.technologies.map((tech: any) => ({
                        value: tech,
                        label: tech,
                      }))}
                      styles={{
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: "#01A28B",
                          color: "#FFF",
                          borderRadius: "5px",
                          height: "1.3rem",
                          fontSize: ".8rem",
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: "#FFF",
                        }),
                        control: (provided) => ({
                          ...provided,
                          maxHeight: "6rem",
                          overflowY: "scroll",
                          border: "2px solid #CBDAE8",
                          ":hover": {
                            border: "2px solid #173951",
                          },
                        }),
                      }}
                      onChange={(e) => {
                        setUserTechnologies(e?.map((tech: any) => tech.value));
                        setLocalUser((prevUser) => ({
                          ...prevUser,
                          technologies: e?.map((tech: any) => tech.value),
                        }));
                      }}
                    />
                    {errors.technologies && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.technologies}
                      </p>
                    )}
                  </motion.label>

                  {/* Stack Técnico */}
                  <motion.label
                    htmlFor="technicalStack"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 }}
                  >
                    <span>
                      {t("Selecciona Stack Técnico")}
                      <span className="text-red-400">*</span>
                    </span>
                    <Select
                      options={technicalStack}
                      isMulti={true}
                      name="technicalStack"
                      value={user.technicalStack.map((tech: any) => ({
                        value: tech,
                        label: tech,
                      }))}
                      closeMenuOnSelect={false}
                      styles={{
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: "#01A28B",
                          color: "#FFF",
                          borderRadius: "5px",
                          height: "1.3rem",
                          fontSize: ".8rem",
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: "#FFF",
                        }),
                        control: (provided) => ({
                          ...provided,
                          maxHeight: "6rem",
                          overflowY: "scroll",
                          border: "2px solid #CBDAE8",
                          ":hover": {
                            border: "2px solid #173951",
                          },
                          ":focus": {
                            border: "2px solid #173951",
                          },
                        }),
                      }}
                      onChange={(e) => {
                        setUserStack(e?.map((tech: any) => tech.value));
                        setLocalUser((prevUser) => ({
                          ...prevUser,
                          technicalStack: e?.map((tech: any) => tech.value),
                        }));
                      }}
                    />
                    {errors.technicalStack && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.technicalStack}
                      </p>
                    )}
                  </motion.label>

                  {/* Reclutador */}
                  <motion.label
                    htmlFor="Recruiter"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.21 }}
                  >
                    <span>
                      {t("¿Estás haciendo el proceso con algún reclutador/a?")}
                      <span className="text-red-400">*</span>
                    </span>
                    <button
                      type="button"
                      name="Recruiter"
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 flex items-center justify-between bg-white text-linkIt-400"
                      onClick={() => {
                        setOpenRecruiter(!openRecruiter);
                        setOpenEnglishLevel(false);
                      }}
                      ref={recruiterRef}
                    >
                      {recruiter === "" ? t("Seleccionar") : recruiter}
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7 10l5 5 5-5z" />
                      </svg>
                    </button>
                    <motion.ul
                      className={`${
                        !openRecruiter ? "hidden" : "recruiterDropdown"
                      } font-montserrat bg-white border border-linkIt-100 rounded-lg shadow-md mt-1 absolute z-50 w-full`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: openRecruiter ? 1 : 0,
                        y: openRecruiter ? 0 : -10,
                      }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setOpenRecruiter(false)}
                    >
                      <li
                        className="p-2 hover:bg-linkIt-100 hover:text-linkIt-400 cursor-pointer"
                        onClick={() =>
                          handleRecruiterChange("-", setRecruiter, setLocalUser)
                        }
                      >
                        Ninguno
                      </li>
                      {["Julieta", "Shayna", "Ramiro", "Tobias"].map(
                        (recruiterName: string, index: number) => (
                          <li
                            key={index}
                            className="p-2 hover:bg-linkIt-100 hover:text-linkIt-400 cursor-pointer"
                            onClick={() =>
                              handleRecruiterChange(
                                recruiterName,
                                setRecruiter,
                                setLocalUser
                              )
                            }
                          >
                            {recruiterName}
                          </li>
                        )
                      )}
                    </motion.ul>
                    {errors.recruiter && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.recruiter}
                      </p>
                    )}
                  </motion.label>

                  {/* Botones de navegación */}
                  <motion.div
                    className="flex w-full justify-between gap-3 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.27 }}
                  >
                    <motion.button
                      type="button"
                      className="w-1/2 bg-linkIt-100 text-linkIt-400 font-semibold py-2 rounded-lg border-2 border-linkIt-200 hover:bg-linkIt-200 hover:text-white transition-all duration-200 active:scale-95"
                      onClick={() => {
                        dispatch(setUncompletedStep(currentStep - 1));
                        handlePreviousStep(currentStep);
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {t("Anterior")}
                    </motion.button>
                    <motion.button
                      type="button"
                      className="w-1/2 bg-linkIt-400 text-white font-semibold py-2 rounded-lg border-2 border-linkIt-400 hover:bg-linkIt-200 hover:text-linkIt-400 transition-all duration-200 active:scale-95 disabled:opacity-60"
                      onClick={() => {
                        dispatch(setCompletedStep(currentStep));
                        handleNextStep(currentStep);
                      }}
                      disabled={
                        Boolean(errors.technicalStack) ||
                        Boolean(errors.technologies) ||
                        Boolean(errors.recruiter) ||
                        !user.technologies.length ||
                        !recruiter
                      }
                      whileTap={{ scale: 0.97 }}
                    >
                      {t("Siguiente")}
                    </motion.button>
                  </motion.div>
                </motion.section>
              )}

              {/*-----------------------------------------------------------------STEP 4-----------------------------------------------------------*/}

              {currentStep === 4 && (
                <motion.section
                  className="w-full max-w-[420px] mx-auto flex flex-col items-center justify-center gap-6 px-4 py-6 bg-white rounded-xl shadow-md"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <motion.h2
                    className="font-montserrat text-[1.4rem] text-linkIt-400 font-bold mb-2 text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {t("Información Profesional")}
                  </motion.h2>

                  {/* Periodo de aviso */}
                  <motion.label
                    htmlFor="availability"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <span>
                      {t("Periodo de aviso")}
                      <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="text"
                      name="availability"
                      onChange={handleInputChange}
                      value={user.availability}
                      className="border-2 border-linkIt-200 rounded-lg h-11 px-3 focus:outline-linkIt-400 bg-white text-linkIt-400"
                    />
                    {errors.availability && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.availability}
                      </p>
                    )}
                  </motion.label>

                  {/* Motivo de cambio */}
                  <motion.label
                    htmlFor="reason"
                    className="font-montserrat text-[1.05rem] w-full flex flex-col gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 }}
                  >
                    <span>
                      {t(
                        "¿Por qué estás buscando una nueva oportunidad laboral?"
                      )}
                      <span className="text-red-400">*</span>
                    </span>
                    <textarea
                      name="reason"
                      id="reason"
                      rows={6}
                      value={user.reason}
                      placeholder={t("Escribe aquí tu respuesta")}
                      onChange={handleInputChange}
                      className="resize-none border-2 border-linkIt-200 rounded-lg px-3 py-2 focus:outline-linkIt-400 bg-white text-linkIt-400"
                    ></textarea>
                    {errors.reason && (
                      <p className="text-red-500 text-[.85rem]">
                        {errors.reason}
                      </p>
                    )}
                  </motion.label>

                  {/* Botones de navegación */}
                  <motion.div
                    className="flex w-full justify-between gap-3 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.27 }}
                  >
                    <motion.button
                      type="button"
                      className="w-1/2 bg-linkIt-100 text-linkIt-400 font-semibold py-2 rounded-lg border-2 border-linkIt-200 hover:bg-linkIt-200 hover:text-white transition-all duration-200 active:scale-95"
                      onClick={() => {
                        dispatch(setUncompletedStep(currentStep - 1));
                        handlePreviousStep(currentStep);
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {t("Anterior")}
                    </motion.button>

                    <motion.button
                      type="submit"
                      className="w-1/2 bg-linkIt-400 text-white font-semibold py-2 rounded-lg border-2 border-linkIt-400 hover:bg-linkIt-200 hover:text-linkIt-400 transition-all duration-200 active:scale-95 disabled:opacity-60"
                      disabled={
                        Boolean(errors.availability) ||
                        Boolean(errors.reason) ||
                        !user.availability ||
                        !user.reason
                      }
                      whileTap={{ scale: 0.97 }}
                    >
                      {t("Enviar")}
                    </motion.button>
                  </motion.div>
                </motion.section>
              )}
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default JobForm;
