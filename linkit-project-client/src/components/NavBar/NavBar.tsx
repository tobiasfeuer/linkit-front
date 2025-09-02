import "./NavBar.css";
import LogoBlue from "/Linkit-logo/linkit-logo-2024-blue.svg";
import LogoWhite from "/Linkit-logo/linkit-logo-2024-white.svg";
import arrow from "/Vectores/arrow.png";
import whiteArrow from "/Vectores/white-arrow.png";

import userGreen from "/Vectores/user-green.svg";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAnimate, stagger, motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  setPressLogin,
  setPressSignUp,
  setPressRegister,
} from "../../redux/features/registerLoginSlice";
import { toggleDarkMode } from "../../redux/features/darkModeSlice";
import { logout } from "../../redux/features/AuthSlice";
import { useTranslation } from "react-i18next";
import { RootState } from "../../redux/types";
import { Avatar, CustomFlowbiteTheme, Dropdown, DropdownDivider} from "flowbite-react";
import Swal from "sweetalert2";

const staggerMenuItems = stagger(0.03, { startDelay: 0.15 });

function useMenuAnimation(isOpen: boolean) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      animate(".arrow", { rotate: isOpen ? 180 : 0 }, { duration: 0.2 });

      animate(
        "ul",
        {
          clipPath: isOpen ? "inset(0% 0% 0% 0%)" : "inset(10% 50% 90% 50% )",
        },
        {
          type: "spring",
          bounce: 0,
          duration: 0.5,
        }
      );

      animate(
        "li",
        isOpen
          ? { opacity: 1, scale: 1, filter: "blur(0px)" }
          : { opacity: 0, scale: 0.3, filter: "blur(20px)" },
        {
          duration: 0.1,
          delay: isOpen ? staggerMenuItems : 0,
        }
      );
    }
  }, [isOpen]);

  return scope;
}

const customTheme: CustomFlowbiteTheme['dropdown'] = {
  "arrowIcon": "ml-2 h-4 w-4",
  "content": "py-1 dark:bg-linkIt-400 bg-white rounded-[7px] border dark:border-linkIt-700",
  "floating": {
    "animation": "transition-opacity",
    "arrow": {
      "base": "absolute z-10 h-2 w-2 rotate-45",
      "style": {
        "dark": "bg-gray-900 dark:bg-gray-700",
        "light": "bg-white",
        "auto": "bg-white dark:bg-gray-700"
      },
      "placement": "-4px"
    },
    "base": "z-10 w-fit rounded divide-y divide-gray-200",
    "content": "py-1 text-sm",
    "divider": "my-1 h-px",
    "header": "block py-2 px-4 text-sm text-gray-700 dark:text-gray-200 text-[0.6rem] ssm:text-[0.9rem] md:text-[1rem] lg:text-[0.8rem] xl:text-[1rem] 2xl:text-[1.3rem]",
    "hidden": "invisible opacity-0",
    "item": {
      "container": "",
      "base": "flex items-center justify-start py-2 px-4 text-sm cursor-pointer w-full dark:bg-linkIt-400 dark:text-white hover:text-linkIt-300 dark:hover:text-linkIt-300",
      "icon": "mr-2 h-4 w-4"
    },
    "style": {
      "dark": "",
      "light": "",
      "auto": " rounded-[7px]"
    },
    "target": "w-full justify-start text-left ",
  },
  "inlineWrapper": "flex items-center w-full h-fit "
};

function NavBar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const pressLogin = useSelector(
    (state: RootState) => state.registerLogin.pressLogin
  );
  const pressSignUp = useSelector(
    (state: RootState) => state.registerLogin.pressSignUp
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpenEmpresa, setIsOpenEmpresa] = useState(false);
  const [isOpenRecursos, setIsOpenRecursos] = useState(false);
  const [isOpenQS, setIsOpenQS] = useState(false);
  const [isOpenSoyTalento, setIsOpenSoyTalento] = useState(false);
  const [burgerMenu, setBurgerMenu] = useState(false);
  const isDarkMode = useSelector(
    (state: RootState) => state.darkMode);

  const scopeQS = useMenuAnimation(isOpenQS);
  const scopeRecursos = useMenuAnimation(isOpenRecursos);
  const scopeEmpresa = useMenuAnimation(isOpenEmpresa);
  const scopeSoyTalento = useMenuAnimation(isOpenSoyTalento);

  const { isAuthenticated, role } = useSelector(
    (state: RootState) => state.Authentication
  );

  // Función para obtener traducciones con fallback
  const getTranslation = (key: string, fallback?: string) => {
    const translation = t(key);
    return translation !== key ? translation : (fallback || key);
  };
  const goAdminDashboard = () => {
    navigate("/AdminDashboard/statistics/OKRs");
  };
  const goHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    dispatch(logout());
    Swal.fire({
      title: getTranslation("Sesión cerrada", "Sesión cerrada"),
      text: getTranslation("Hemos cerrado tu sesión con éxito", "Hemos cerrado tu sesión con éxito"),
      icon: "success",
      showConfirmButton: true,
      confirmButtonText: getTranslation("Confirmar", "Confirmar"),
      confirmButtonColor: "#01A28B",
      timer: 3000
    })
    navigate("/");
  };

  const isActiveHome = location.pathname === "/";
  const goSoyEmpresa = () => {
    navigate("/SoyEmpresa");
  };

  const isActiveEmpresa = location.pathname === "/SoyEmpresa";

  const navigatetoServicesCompany = () => {
    navigate("/SoyEmpresa");
    setTimeout(() => {
      window.location.href = "#serviciosE";
    }, 0);
  };

  const navigatetoProcessCompany = () => {
    navigate("/SoyEmpresa");
    setTimeout(() => {
      window.location.href = "#procesoE";
    }, 0);
  };

  const navigatetoQuoteCompany = () => {
    navigate("/SoyEmpresa");
    setTimeout(() => {
      window.location.href = "#calculadora";
    }, 0);
  };

  const goSoyTalento = () => {
    navigate("/SoyTalento");
  };
  const isActiveTalento = location.pathname === "/SoyTalento";

  const navigatetoServicesTalent = () => {
    navigate("/SoyTalento");
    setTimeout(() => {
      window.location.href = "#serviciosT";
    }, 0);
  };

  const navigatetoProcessTalent = () => {
    navigate("/SoyTalento");
    setTimeout(() => {
      window.location.href = "#procesoT";
    }, 0);
  };

  const navigatetoVacanciesTalent = () => {
    navigate("/SoyTalento");
    setTimeout(() => {
      window.location.href = "#vacantes";
    }, 0);
  };

  const goRecursos = () => {
    navigate("/recursos");
  };
  const isActiveRecursos =
    location.pathname === "/recursos" ||
    location.pathname === "/recursos/libreria";

  const navigatetoBlogs = () => {
    navigate("/recursos");
    setTimeout(() => {
      window.location.href = "#blogs";
    }, 0);
  };

  const navigatetoEbooks = () => {
    navigate("/recursos");
    setTimeout(() => {
      window.location.href = "#ebooks";
    }, 0);
  };

  const navigatetoWebinars = () => {
    navigate("/recursos");
    setTimeout(() => {
      window.location.href = "#webinars";
    }, 0);
  };

  const navigatetoFAQ = () => {
    navigate("/recursos");
    setTimeout(() => {
      window.location.href = "#FAQ";
    }, 0);
  };

  const goQS = () => {
    navigate("/quienesSomos");
  };
  const isActiveQS = location.pathname === "/quienesSomos";

  const navigatetoMission = () => {
    navigate("/quienesSomos");
    setTimeout(() => {
      window.location.href = "#mision";
    }, 0);
  };
  const navigatetoVision = () => {
    navigate("/quienesSomos");
    setTimeout(() => {
      window.location.href = "#vision";
    }, 0);
  };
  const navigatetoValues = () => {
    navigate("/quienesSomos");
    setTimeout(() => {
      window.location.href = "#valores";
    }, 0);
  };
  const navigatetoHistory = () => {
    navigate("/quienesSomos");
    setTimeout(() => {
      window.location.href = "#historia";
    }, 0);
  };
  const navigatetoInternalTalent = () => {
    navigate("/quienesSomos");
    setTimeout(() => {
      window.location.href = "#talento-Interno";
    }, 0);
  };
  const navigatetoHome = () => {
    navigate("/");
    setTimeout(() => {
      window.location.href = "#inicio";
      window.scrollTo({
        top: 0,
      });
    }, 0);
  };

  const darkMode = () => {
    dispatch(toggleDarkMode());
  };

  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  return (
    <div className="h-fit w-full p-0 m-0">
      <div className="preNavbar" id="preNavbar">
        <span className="">
          {getTranslation("Contrata y gestiona talentos de forma global con LinkIT", "Contrata y gestiona talentos de forma global con LinkIT")} |{" "}
        </span>
        <NavLink
          to="https://calendly.com/saleslinkit/30min"
          className="ml-2 underline underline-offset-[3.3px]"
          target="_blank"
        >
          {getTranslation("Comienza ahora!", "Comienza ahora!")} →
        </NavLink>
      </div>

      <div className="navBar" id="Navbar">
        <img
          src={!isDarkMode ? LogoBlue : LogoWhite}
          onClick={() => navigatetoHome()}
          alt="LinkIT-logo"
          className="relative w-[15%] md:w-[10%] lg:w-[5%] xl:w-[6%] xs:left-2 md:left-10 hover:cursor-pointer hover:scale-105 transition duration-300 ease-in-out"
        />

        {windowWidth >= 1024 ? (
          <motion.div className={`container-navigation bg-transparent`}>
            <motion.button
              className={`flex items-center border-b-[4px] hover:border-b-linkIt-300 hover:text-linkIt-300 dark:hover:border-b-white dark:hover:text-white  ${
                isActiveHome
                  ? "text-linkIt-300 border-b-linkIt-300 dark:border-b-white dark:text-white"
                  : "border-b-transparent"
              }`}
              onClick={() => goHome()}
            >
              {getTranslation("Inicio", "Inicio")}
            </motion.button>

            <motion.nav
              className=""
              ref={scopeEmpresa}
              onMouseEnter={() => setIsOpenEmpresa(true)}
              onMouseLeave={() => setIsOpenEmpresa(false)}
            >
              <motion.button
                className={`flex h-full items-center border-b-[4px] border-b-transparent hover:text-linkIt-300 dark:hover:text-white ${
                  isActiveEmpresa ? "text-linkIt-300 dark:text-white " : ""
                }`}
                whileTap={{ scale: 0.97 }}
                onClick={() => goSoyEmpresa()}
              >
                {getTranslation("Soy Empresa", "Soy Empresa")}
                <div className="arrow w-2 xl:w-3 ml-1 xl:ml-2 hidden lg:block">
                  <img src={!isDarkMode ? arrow : whiteArrow} alt="arrow" />
                </div>
              </motion.button>
              <ul
                className="relative right-[10%] bg-white dark:bg-linkIt-400 rounded-b-[7px] w-[120%] h-fit p-2 xl:p-3 font-semibold items-center space-y-2"
                style={{
                  pointerEvents: isOpenEmpresa ? "auto" : "none",
                  clipPath: "inset(10% 50% 90% 50%)",
                }}
              >
                <div className="absolute w-[85%] left-[7.5%] after:h-[4px] after:w-full after:bg-linkIt-300 dark:after:bg-white after:absolute"></div>
                <li className={`hover:text-linkIt-300`}>
                  <button onClick={navigatetoServicesCompany}>
                    {getTranslation("Servicios", "Servicios")}
                  </button>
                </li>
                <hr className="w-[100%]" />
                <li className=" hover:text-linkIt-300">
                  <button onClick={navigatetoProcessCompany}>
                    {getTranslation("Proceso", "Proceso")}
                  </button>
                </li>
                <hr className="w-[100%]" />
                <li className=" hover:text-linkIt-300">
                  <button onClick={navigatetoQuoteCompany}>
                    {getTranslation("Cotiza", "Cotiza")}
                  </button>{" "}
                </li>
              </ul>{" "}
            </motion.nav>

            <motion.nav
              className=""
              ref={scopeSoyTalento}
              onMouseEnter={() => setIsOpenSoyTalento(true)}
              onMouseLeave={() => setIsOpenSoyTalento(false)}
            >
              <motion.button
                className={`flex h-full items-center border-b-[4px] border-b-transparent hover:text-linkIt-300 dark:hover:text-white ${
                  isActiveTalento ? "text-linkIt-300 dark:text-white" : ""
                }`}
                whileTap={{ scale: 0.97 }}
                onClick={() => goSoyTalento()}
              >
                {getTranslation("Soy Talento", "Soy Talento")}
                <div className="arrow w-2 xl:w-3 ml-1 xl:ml-2 hidden lg:block">
                  <img src={!isDarkMode ? arrow : whiteArrow} alt="arrow" />
                </div>
              </motion.button>
              <ul
                className="relative right-[10%] bg-white rounded-b-[7px] dark:bg-linkIt-400 w-[120%] h-fit p-2 xl:p-3 font-semibold items-center space-y-2"
                style={{
                  pointerEvents: isOpenSoyTalento ? "auto" : "none",
                  clipPath: "inset(10% 50% 90% 50%)",
                }}
              >
                <div className="absolute w-[85%] left-[7.5%] after:h-[4px] after:w-full after:bg-linkIt-300 after:absolute dark:after:bg-white"></div>
                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoVacanciesTalent}>
                    {getTranslation("Vacantes", "Vacantes")}
                  </button>
                </li>
                <hr className="w-[100%]" />
                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoServicesTalent}>
                    {getTranslation("Servicios", "Servicios")}
                  </button>
                </li>
                <hr className="w-[100%]" />
                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoProcessTalent}>
                    {getTranslation("Proceso", "Proceso")}
                  </button>
                </li>
              </ul>
            </motion.nav>

            <motion.nav
              className=""
              ref={scopeRecursos}
              onMouseEnter={() => setIsOpenRecursos(true)}
              onMouseLeave={() => setIsOpenRecursos(false)}
            >
              <motion.button
                className={`flex h-full items-center border-b-[4px] border-b-transparent hover:text-linkIt-300 dark:hover:text-white ${
                  isActiveRecursos ? "text-linkIt-300 dark:text-white" : ""
                }`}
                whileTap={{ scale: 0.97 }}
                onClick={() => goRecursos()}
              >
                {getTranslation("Recursos", "Recursos")}
                <div className="arrow w-2 xl:w-3 ml-1 xl:ml-2">
                  <img src={!isDarkMode ? arrow : whiteArrow} alt="arrow" />
                </div>
              </motion.button>
              <ul
                className="bg-white right-[10%] relative rounded-b-[7px] dark:bg-linkIt-400 w-[120%] h-fit p-2 xl:p-3 font-semibold items-center space-y-2"
                style={{
                  pointerEvents: isOpenRecursos ? "auto" : "none",
                  clipPath: "inset(10% 50% 90% 50%)",
                }}
              >
                <div className="absolute w-[85%] left-[7.5%] after:h-[4px] after:w-full after:bg-linkIt-300 after:absolute dark:after:bg-white"></div>
                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoBlogs}>{getTranslation("Blogs", "Blogs")}</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoEbooks}>{getTranslation("Ebooks", "Ebooks")}</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoWebinars}>{getTranslation("Webinars", "Webinars")}</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoFAQ}>FAQ</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button
                    onClick={() => navigate("/recursos/libreria")}
                    className="cursor-pointer"
                  >
                    {getTranslation("Librería", "Librería")}
                  </button>
                </li>
              </ul>
            </motion.nav>

            <motion.nav
              className=""
              ref={scopeQS}
              onMouseEnter={() => setIsOpenQS(true)}
              onMouseLeave={() => setIsOpenQS(false)}
            >
              <motion.button
                className={`flex h-full items-center border-b-[4px] border-b-transparent hover:text-linkIt-300 dark:hover:text-white ${
                  isActiveQS ? "text-linkIt-300 dark:text-white" : ""
                }`}
                whileTap={{ scale: 0.97 }}
                onClick={() => goQS()}
              >
                {getTranslation("Quiénes Somos", "Quiénes Somos")}
                <div className="arrow w-2 xl:w-3 ml-1 xl:ml-2">
                  <img src={!isDarkMode ? arrow : whiteArrow} alt="arrow" />
                </div>
              </motion.button>
              <ul
                className="relative right-[10%] bg-white rounded-b-[7px] dark:bg-linkIt-400 w-[120%] h-fit p-2 xl:p-3 font-semibold items-center space-y-2"
                style={{
                  pointerEvents: isOpenQS ? "auto" : "none",
                  clipPath: "inset(10% 50% 90% 50%)",
                }}
              >
                <div className="absolute w-[85%] left-[7.5%] after:h-[4px] after:w-full after:bg-linkIt-300 after:absolute dark:after:bg-white"></div>
                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoMission}>{getTranslation("Misión", "Misión")}</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoVision}>{getTranslation("Visión", "Visión")}</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoValues}>{getTranslation("Valores", "Valores")}</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoHistory}>{getTranslation("Historia", "Historia")}</button>
                </li>
                <hr className="w-[100%]" />

                <li className="hover:text-linkIt-300">
                  <button onClick={navigatetoInternalTalent}>
                    {getTranslation("Talento interno", "Talento interno")}
                  </button>
                </li>
              </ul>
            </motion.nav>
          </motion.div>
        ) : (
          <AnimatePresence>
            {burgerMenu && (
          <motion.ul
           
            className={`absolute left-0 top-[100%] bg-white dark:bg-linkIt-400 w-full h-fit p-[5%] text-[1.3rem] xs:text-[1.5rem] ssm:text-[2rem] border-b ${
              burgerMenu ? "block" : "hidden"
            }`}
            initial={{ opacity: 0, scale: 0, y: "-50%" }}
            animate={{
              opacity: burgerMenu ? 1 : 0,
              scale: burgerMenu ? 1 : 0,
              y: burgerMenu ? "0%" : "-50%",
            }}
            exit={{ opacity: 0, scale: 0, y: "-50%", transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex justify-between items-center text-[1rem] ssm:text-[1.3rem] ssm:mx-2 ">
              <button onClick={() => setBurgerMenu(false)}>
              
              </button>
              <div className="cl-toggle-switch top-[1px]">
                <label className="cl-switch" id="switchDarkModeOutside" aria-label="Cambiar modo oscuro">
                  <input type="checkbox" readOnly onChange={darkMode} checked={isDarkMode} id="switchDarkmodeInside"/>
                  <span></span>
                </label>
              </div>
            </div>
            <li
              className={`flex cursor-pointer items-center hover:text-linkIt-300  ${
                isActiveHome ? "text-linkIt-300 " : ""
              }`}
              onClick={() => {
                goHome();
                setBurgerMenu(false);}
              }
            >
              {getTranslation("Inicio", "Inicio")}
            </li>
            <li
              className={`flex cursor-pointer items-center my-3 hover:text-linkIt-300  ${
                isActiveEmpresa ? "text-linkIt-300  " : ""
              }`}
              onClick={() => {setBurgerMenu(false); goSoyEmpresa()}}
            >
              {getTranslation("Soy Empresa", "Soy Empresa")}
            </li>
            <li
              className={`flex cursor-pointer items-center my-3 hover:text-linkIt-300  ${
                isActiveTalento ? "text-linkIt-300 " : ""
              }`}
              onClick={() => {setBurgerMenu(false); goSoyTalento()}}
            >
              {" "}
              {getTranslation("Soy Talento", "Soy Talento")}
            </li>
            <li
              className={`flex cursor-pointer items-center my-3 hover:text-linkIt-300  ${
                isActiveRecursos ? "text-linkIt-300 " : ""
              }`}
              onClick={() => {setBurgerMenu(false); goRecursos()}}
            >
              {" "}
              {getTranslation("Recursos", "Recursos")}
            </li>
            <li
              className={`flex cursor-pointer items-center hover:text-linkIt-300  ${
                isActiveQS ? "text-linkIt-300 " : ""
              }`}
              onClick={() => {setBurgerMenu(false); goQS()}}
            >
              {" "}
              {getTranslation("Quiénes Somos", "Quiénes Somos")}
            </li>
          </motion.ul>
            )}
            </AnimatePresence>
        )}

        <div className="containerBtnsNavbar">
          {/* isDarkMode */}

          <div className="cl-toggle-switch hidden lg:flex">
            <label className="cl-switch" id="switchDarkModeOutside" aria-label="Cambiar modo oscuro">
              <input type="checkbox" onChange={darkMode} readOnly checked={isDarkMode} id="switchDarkmodeInside"/>
              <span></span>
            </label>
          </div>

          <motion.button
            className={`background-button`}
            onClick={() => goSoyEmpresa()}
            whileTap={{ scale: 0.9 }}
          >
            {getTranslation("Contrata Talento", "Contrata Talento")}
          </motion.button>
          <motion.button
            className={`transparent-background-button`}
            onClick={() => goSoyTalento()}
            whileTap={{ scale: 0.9 }}
          >
            {getTranslation("Vacantes disponibles", "Vacantes disponibles")}
          </motion.button>
          <div className="relative hidden lg:block 2xl:ml-3">
            
          </div>
          <Dropdown
            label={
                <Avatar
                alt="User settings" 
                img={userGreen} 
                rounded
                className="border-[1px] rounded-full border-linkIt-300 p-1 w-[25px] h-[20px] xs:w-[30px] xs:h-[30px] lg:w-[35px] lg:h-[35px]"
                />
              }
            arrowIcon={false}
            inline
            theme={customTheme}
          >
      {isAuthenticated && role === "user" ? (
                  <div>
                    <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={() => {
                          navigate("/dashboard");
                        }}
                      >
                        {getTranslation("Mis datos", "Mis datos")}
                    </Dropdown.Item>
                    <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={() => navigate("/dashboard#postulations")}
                      >
                        {getTranslation("Postulaciones", "Postulaciones")}
                    </Dropdown.Item>
                    <DropdownDivider/>
                    <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={handleLogout}
                      >
                        {getTranslation("Cerrar sesión", "Cerrar sesión")}
                    </Dropdown.Item>
                  </div>
                ) : isAuthenticated && role === "admin" ? (
                  <div>
                     <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={goAdminDashboard}
                      >
                        {getTranslation("Panel", "Panel")}
                      
                    </Dropdown.Item>
                    <DropdownDivider/>
                    <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={handleLogout}
                      >
                        {getTranslation("Cerrar sesión", "Cerrar sesión")}
                    </Dropdown.Item>
                  </div>
                ) : isAuthenticated && role === "company" ? (
                  <div>
                     <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={() => {
                          navigate("/dashboard");
                        }}
                      >
                        {getTranslation("Mis datos", "Mis datos")}
                    </Dropdown.Item>
                    <Dropdown.Item 
                    className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                    onClick={() => {
                      navigate("/dashboard#misvacantes");
                    }}
                    >
                        {getTranslation("Mis vacantes", "Mis vacantes")}
                    </Dropdown.Item>
                    <DropdownDivider />
                    <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={handleLogout}
                      >
                        {getTranslation("Cerrar sesión", "Cerrar sesión")}
                     
                    </Dropdown.Item>
                  </div>
                ) : (
                  <div>
                    <Dropdown.Item className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                    onClick={() => {
                          pressLogin === "visible"
                            ? dispatch(setPressLogin("hidden"))
                            : dispatch(setPressLogin("visible")),
                            dispatch(setPressSignUp("hidden"));
                        }}>
                        {getTranslation("Inicia Sesión", "Inicia Sesión")}
                    </Dropdown.Item>
                    <Dropdown.Item
                        className="text-[0.6rem] lg:text-[0.9rem] font-montserrat border-none outline-none hover:text-linkIt-300 transition-all duration-200 ease-in-out"
                        onClick={() => {
                          pressSignUp === "visible"
                            ? dispatch(setPressSignUp("hidden"))
                            : dispatch(setPressSignUp("visible")),
                            dispatch(setPressLogin("hidden")),
                            dispatch(setPressRegister("hidden")),
                            setPressRegister("hidden");
                        }}
                      >
                        {getTranslation("Regístrate", "Regístrate")}
                      
                    </Dropdown.Item>
                  </div>
                )}
    </Dropdown>
          <div className="relative flex-col w-[3rem] h-[2rem] justify-start right-[8%] pt-[2.5%] xs:pt-[1.3%] 2xl:ml-6 hidden">
          </div>

          {/* burguerMenu */}

          <button
            className="relative lg:hidden"
            onClick={() => setBurgerMenu(!burgerMenu)}
            aria-label="Open Menu"
          >
            <div
              className={`relative flex overflow-hidden items-center justify-center transform transition-all`}
            >
              <div className="flex flex-col justify-between w-[20px] h-[20px] transform transition-all duration-300 origin-center overflow-hidden">
                <div
                  className={`bg-linkIt-300 h-[2px] w-7 transform transition-all duration-300 origin-left ${
                    burgerMenu ? "translate-x-10" : ""
                  }`}
                ></div>
                <div
                  className={`bg-linkIt-300 h-[2px] w-7 rounded transform transition-all duration-300 ${
                    burgerMenu ? "translate-x-10 delay-75" : ""
                  } `}
                ></div>
                <div
                  className={`bg-linkIt-300 h-[2px] w-7 transform transition-all duration-300 origin-left ${
                    burgerMenu ? "translate-x-10 delay-150" : ""
                  }`}
                ></div>

                <div
                  className={`absolute items-center justify-between transform transition-all duration-500 top-2.5 -translate-x-10 flex  ${
                    burgerMenu ? " w-12 translate-x-0" : " w-0"
                  } `}
                >
                  <div
                    className={`absolute bg-black dark:bg-white h-[2px] w-5 transform transition-all duration-500 rotate-0 delay-300 ${
                      burgerMenu ? "rotate-45" : ""
                    }`}
                  ></div>
                  <div
                    className={`absolute bg-black dark:bg-white h-[2px] w-5 transform transition-all duration-500 -rotate-0 delay-300 ${
                      burgerMenu ? "-rotate-45" : ""
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
