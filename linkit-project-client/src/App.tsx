import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import Recursos from "./components/recursos/recursos";
import QuienesSomos from "./components/quienesSomos/quienesSomos";
import Home from "./components/Home/Home";
import NavBar from "./components/NavBar/NavBar";
import Empresas from "./components/Empresas/Empresas";
import Talentos from "./components/Talentos/Talentos";
import Register from "./components/register/Register";
import PreRegisterForm from "./components/register/preRegisterForm";
import PreLogin from "./components/Login/pre-login/PreLogin.tsx";
import LoginTalent from "./components/Login/Login-talent/LoginTalent.tsx";
import Libreria from "./components/recursos/Modulos-Recursos/Libreria/Libreria.tsx";
import { useSelector, useDispatch } from "react-redux/es/exports";
import {
  setResources,
  setBlogs,
  setEbooks,
  setEvents,
  setStackTechnologies,
  setCountries,
  setTechStack,
} from "./redux/features/ResourcesSlice.ts";
import { motion, Variants } from "framer-motion";
import axios, { AxiosError } from "axios";
import { useEffect } from "react";
import AdminPanel from "./components/Paneles/AdminProfile/Panel/AdminPanel.tsx";
import LoginCompany from "./components/Login/Login-company/LoginCompany.tsx";
import JobDescription from "./components/Talentos/ModulosTalentos/ModuloTalentosG/JobCard/jobDescription/JobDescription.tsx";
import BlogView from "./components/recursos/Modulos-Recursos/blogs/blogs-view/BlogView.tsx";
import TopButton from "./Utils/TopButton.tsx";
import ReactGA from "react-ga4";
import { setAdmins } from "./redux/features/ApplicationSlice.ts";
import JobForm from "./components/Talentos/ModulosTalentos/ModuloTalentosG/JobCard/jobDescription/job-form/JobForm.tsx";
import Footer from "./Utils/Footer/Footer.tsx";
import ProfileContainer from "./components/Profiles/ProfileContainer.tsx";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy.tsx";
import TermsAndConditions from "./components/TermsAndConditions/TermsAndConditions.tsx";
import SuccesfullForm from "./Utils/contactUs/SuccesfullForm.tsx";
import lightIcon from "/Vectores/Favicon de prueba ph 48x48.png";
import darkIcon from "/Vectores/FaviconDark.svg";
import EbookView from "./components/recursos/Modulos-Recursos/ebooks/ebooksCards/EbooksView.tsx";
import EventsView from "./components/recursos/Modulos-Recursos/eventos/Events-cards/EventsView.tsx";
import LandingPage from "./components/LandingPage/LandingPage.tsx";
import { Helmet } from "react-helmet-async";
import MainNavigation from "./Navigation/mainNavigation.tsx";
import i18n from "./i18";


const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

type registerLoginState = {
  registerLogin: {
    pressSignUp: string;
    pressLogin: string;
    pressRegister: string;
    pressLoginTalent: string;
    pressLoginCompany: string;
  };
};

const registerVariants: Variants = {
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
      delay: 0.5,
      duration: 1,
    },
  },
};

const loginVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "-100vw",
    transition: {
      type: "spring",
      delay: 0.2,
      duration: 1,
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      delay: 0.5,
      duration: 1,
    },
  },
};

function App() {
  const dispatch = useDispatch();


useEffect(() => {
  // Sincronizar sessionStorage con el idioma detectado por i18n
  const syncLanguageWithStorage = () => {
    const currentLang = i18n.language;
    const storedLang = sessionStorage.getItem("lang");
    
    if (!storedLang) {
      // Si no hay idioma guardado, guardar el que detectó i18n
      sessionStorage.setItem("lang", currentLang);
    } else if (storedLang !== currentLang) {
      // Si hay diferencia, actualizar sessionStorage con el idioma actual de i18n
      sessionStorage.setItem("lang", currentLang);
    }
  };

  // Esperar a que i18n esté listo antes de sincronizar
  if (i18n.isInitialized) {
    syncLanguageWithStorage();
  } else {
    i18n.on('initialized', syncLanguageWithStorage);
  }

  return () => {
    i18n.off('initialized', syncLanguageWithStorage);
  };
}, []);

  const pressSignUp = useSelector(
    (state: registerLoginState) => state.registerLogin.pressSignUp
  );
  const pressLogin = useSelector(
    (state: registerLoginState) => state.registerLogin.pressLogin
  );
  const pressRegister = useSelector(
    (state: registerLoginState) => state.registerLogin.pressRegister
  );
  const pressLoginTalent = useSelector(
    (state: registerLoginState) => state.registerLogin.pressLoginTalent
  );
  const pressLoginCompany = useSelector(
    (state: registerLoginState) => state.registerLogin.pressLoginCompany
  );

  //prefers-color-scheme:

  useEffect(() => {
    const handleFaviconChange = () => {
      const favicon = document.getElementById("Favicon") as HTMLLinkElement;
      if (favicon) {
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          favicon.href = darkIcon;
        } else {
          favicon.href = lightIcon;
        }
      }
    };

    // Initial favicon setup
    handleFaviconChange();

    // Listen for changes in color scheme preference
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleFaviconChange);

    // Cleanup listener on component unmount
    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleFaviconChange);
    };
  }, []);

  //* GOOGLE ANALYTICS IN PROGRESS
  useEffect(() => {
    const googleAnalytics = async () => {
      try {
        ReactGA.initialize("G-SJ3KWGF9FD");
      } catch (error) {
        console.log(error);
      }
    };
    googleAnalytics();
  }, []);

  //cambiar este use effect y que se hagan las peticiones en cada componente.
  useEffect(() => {
    /**
     * Fetches data from the server and sets the job offers in the state.
     */
    const fetchData = async () => {
      try {
        const responseResources = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/posts/find`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": "es",
            },
          }
        );

        const responseTechnologies = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/stackList`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        const countries = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/countries`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        const techStack = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/techStack`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        const responseAdmins = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/admins/find`,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );
        dispatch(setCountries(countries.data));
        dispatch(setTechStack(techStack.data));
        dispatch(setStackTechnologies(responseTechnologies.data));
        dispatch(setResources(responseResources.data));
        dispatch(setEvents());
        dispatch(setBlogs());
        dispatch(setEbooks());
        dispatch(setAdmins(responseAdmins.data));
      } catch (error) {
        if (error instanceof AxiosError)
          console.error({ error: error.response?.data });
      }
    };
    fetchData();
  }, [dispatch]);

  const location = useLocation();
  const isLandingPage = location.pathname === "/landing";

  return (
    <div className="w-screen h-full">
        <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "LinkIT",
            url: "https://www.linkit-hr.com/",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://www.linkit-hr.com/recursos?search={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
            sameAs: ["https://www.linkedin.com/company/linkit-hr/", "https://www.instagram.com/linkit.hr/"],
          })}
        </script>
      </Helmet>

      <MainNavigation />
      {!isLandingPage && <NavBar />}
      <motion.div
        variants={loginVariants}
        initial="hidden"
        animate={pressLogin}
        className="fixed w-screen h-screen z-[1000] top-[.0rem]"
      >
        <PreLogin />
      </motion.div>

      <motion.div
        variants={loginVariants}
        initial="hidden"
        animate={pressLoginTalent}
        className="fixed w-screen h-screen z-[100] top-[.0rem]"
      >
        <LoginTalent />
      </motion.div>

      <motion.div
        variants={loginVariants}
        initial="hidden"
        animate={pressLoginCompany}
        className="fixed w-screen h-screen z-[100] top-[.0rem]"
      >
        <LoginCompany />
      </motion.div>

      <motion.div
        variants={registerVariants}
        initial="hidden"
        animate={pressSignUp}
        className="fixed w-screen h-screen z-[100] top-[.0rem]"
      >
        <PreRegisterForm />
      </motion.div>

      {pressRegister === "visible" && (
        <motion.div
          variants={registerVariants}
          initial="hidden"
          animate={pressRegister}
          className="fixed w-screen h-screen z-[100] top-[.0rem]"
        >
          <Register />
        </motion.div>
      )}

      <Routes>
        <Route
          path="/"
          element={<Home Unauth={false} error={false} Verify={false} />}
        />
        <Route path="/soyEmpresa" element={<Empresas />} />
        <Route path="/soyTalento" element={<Talentos />} />

        <Route
          path="/soyTalento/Joboffer/:id/:slug"
          element={<JobDescription />}
        />
        <Route
          path="/soyTalento/Joboffer/:id/:slug/application/"
          element={<JobForm />}
        />
        <Route path="/recursos" element={<Recursos />} />
        <Route path="/recursos/libreria" element={<Libreria />} />
        <Route path="/quienesSomos" element={<QuienesSomos />} />
        <Route path="/AdminDashboard/*" element={<AdminPanel />} />
        <Route path="/dashboard" element={<ProfileContainer />} />
        <Route path="/blog/:id/:slug" element={<BlogView />} />
        <Route path="/ebook/:slug" element={<EbookView />} />
        <Route path="/events/:slug" element={<EventsView />} />

        <Route
          path="/unauthorized"
          element={<Home Unauth={true} error={false} Verify={false} />}
        />
        <Route
          path="/verify"
          element={<Home Verify={true} Unauth={false} error={false} />}
        />
        <Route
          path="*"
          element={<Home Unauth={false} error={true} Verify={false} />}
        />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
        <Route path="/Gracias" element={<SuccesfullForm />} />
        <Route path="/contrata-talento-it" element={<LandingPage />} />
        <Route path="/hire-it-talent" element={<LandingPage />} />
      </Routes>
      {!isLandingPage && <TopButton />}
      {!isLandingPage && <Footer />}
    </div>
  );
}

export default App;
