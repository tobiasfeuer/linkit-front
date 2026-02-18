import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  setPressLogin,
  setPressSignUp,
  setPressRegister,
} from "../../redux/features/registerLoginSlice";
import { useSelector, useDispatch } from "react-redux/es/exports";

export default function Footer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pressLogin = useSelector(
    (state: any) => state.registerLogin.pressLogin
  );
  const pressSignUp = useSelector(
    (state: any) => state.registerLogin.pressSignUp
  );

  const navigatetoHowItWorks = () => {
    navigate('/SoyEmpresa')
    setTimeout(() => {
      window.location.href = '#procesoE';
    }, 0);
    }

  const navigatetoSuccessStories = () => {
    navigate('/SoyEmpresa')
    setTimeout(() => {
      window.location.href = '#casosDeExitoE';
    }, 0);
    }
    const navigatetoQuoteCompany = () => {
      navigate("/SoyEmpresa");
      setTimeout(() => {
        window.location.href = "#calculadora";
      }, 1000);
    };

  const navigatetoBlogs = () => {
    navigate('/recursos')
    setTimeout(() => {
      window.location.href = '#blogs';
    }, 0);
    }

  const navigatetoFAQ = () => {
    navigate('/recursos')
    setTimeout(() => {
      window.location.href = '#FAQ';
    }, 0);
  }
  const navigatetoEbooks = () => {
    navigate('/recursos')
    setTimeout(() => {
      window.location.href = '#ebooks';
    }, 0);
    }
  const navigatetoEvents = () => {
    navigate('/recursos')
    setTimeout(() => {
      window.location.href = '#webinars';
    }, 0);
    }

  const navigatetoMission = () => {
    navigate('/quienesSomos')
    setTimeout(() => {
      window.location.href = '#mision';
    }, 0);
    }
  const navigatetoVision = () => {
    navigate('/quienesSomos')
    setTimeout(() => {
      window.location.href = '#vision';
    }, 0);
    }
  const navigatetoValues = () => {
    navigate('/quienesSomos')
    setTimeout(() => {
      window.location.href = '#valores';
    }, 0);
    }

  const navigatetoInternalTalent = () => {
    navigate('/quienesSomos')
    setTimeout(() => {
      window.location.href = '#talento-Interno';
    }, 0);
    }
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
    const navigatetoPrivacyPolicy = () => {
      navigate("/privacyPolicy");
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    };
    const navigatetoTermsAndConditions = () => {
      navigate("/termsAndConditions");
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    };
  

  const {t} = useTranslation();
  return (
    <div className="bg-linkIt-200 text-white font-montserrat overflow-hidden w-screen px-[5%] py-[2%]">
      <div className="flex">
    <img className="w-1/4 xl:w-1/5" src="/Vectores/LinkIt-Logotipo-2024-white.svg" alt="" loading="lazy"/>
      <div className="flex gap-[5%] lg:gap-[10%] m-[5%] w-full font-montserrat justify-center">

                  <div className="flex flex-col ">
                  <p className="font-semibold text-[0.6rem] ssm:text-[0.8rem] lg:text-[0.9rem]">{t('Empresa')}</p>
                  
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start " onClick={navigatetoHowItWorks}> {t('Cómo funciona')}</button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start " onClick={navigatetoSuccessStories}>{t('Casos de éxito')} </button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start " onClick={navigatetoQuoteCompany}>{t('Cotiza')}</button>
                
                
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start"  onClick={() => {
                        pressSignUp === "visible"
                          ? dispatch(setPressSignUp("hidden"))
                          : dispatch(setPressSignUp("visible")),
                          dispatch(setPressLogin("hidden")),
                          dispatch(setPressRegister("hidden")),
                          setPressRegister("hidden");
                      }}>{t('Regístrate')}</button>
                
                
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={() => {
                        pressLogin === "visible"
                          ? dispatch(setPressLogin("hidden"))
                          : dispatch(setPressLogin("visible")),
                          dispatch(setPressSignUp("hidden"));
                      }}>{t('Inicia Sesión')}</button>
                </div>
            

            <div className="flex flex-col">
              <p className="font-semibold text-[0.6rem] ssm:text-[0.8rem] lg:text-[0.9rem]">{t('Talento')} </p>
              <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoServicesTalent}>{t('Servicios')}</button>
              <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoProcessTalent}>{t('Proceso')}</button>
              <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoVacanciesTalent}>{t('Vacantes')}</button>
              <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start"  onClick={() => {
                        pressSignUp === "visible"
                          ? dispatch(setPressSignUp("hidden"))
                          : dispatch(setPressSignUp("visible")),
                          dispatch(setPressLogin("hidden")),
                          dispatch(setPressRegister("hidden")),
                          setPressRegister("hidden");
                      }}>{t('Regístrate')}</button>
                
                
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={() => {
                        pressLogin === "visible"
                          ? dispatch(setPressLogin("hidden"))
                          : dispatch(setPressLogin("visible")),
                          dispatch(setPressSignUp("hidden"));
                      }}>{t('Inicia Sesión')}</button>
            
            </div>


            <div className="flex flex-col">
              <p className="font-semibold text-[0.6rem] ssm:text-[0.8rem] lg:text-[0.9rem]">{t('Recursos')} </p>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoBlogs}> Blogs </button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoEbooks}> Ebooks </button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoEvents}> {t('Eventos')} </button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoFAQ}> FAQ </button>
                  
            </div>


            <div className="flex flex-col">
              <p className="font-semibold text-[0.6rem] ssm:text-[0.8rem] lg:text-[0.9rem]">{t('Quiénes Somos')} </p>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoMission}>{t('Misión')} </button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoVision}> {t('Visión')} </button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoValues}> {t('Valores e historia')} </button>
                  <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  text-start" onClick={navigatetoInternalTalent}> {t('Talento interno')} </button>
            </div>
            </div>
        </div>

          <div className="flex ssm:grid col-span-full items-center">
          <div className="col-start-1">
            <p className="font-semibold my-1 text-[0.6rem] ssm:text-[0.8rem] lg:text-[0.9rem]">LinkIT</p>
            <p className="text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem] w-[90%] ssm:w-[50%] xl:w-[35%] font-montserrat">{t('Conectando al talento más destacado con los mejores proyectos IT')}</p>
            <div className="flex  mt-2">
              <a href="https://mail.google.com/mail/?view=cm&to=feuertobias@gmail.com" aria-label="Contact us by Email" target="_blank" className="w-[20%] ssm:w-[7%] lg:w-[5%] xl:w-[4%]"><img className="w-[100%]" src="/Vectores/linkit-web-vectores-12.svg" alt="" ></img></a>
              <a href="https://www.linkedin.com/company/linkit-hr/" target="_blank" aria-label="Contact us by LinkedIn" className="w-[20%] ssm:w-[7%] lg:w-[5%] xl:w-[4%]"><img className="w-[100%]" src="/Vectores/linkit-web-vectores-13.svg" alt="" /></a>
              <a href="https://www.youtube.com/channel/UC1OAeKZFyUpbaImzSTI68qQ" target="_blank" aria-label="Contact us by LinkedIn" className="w-[20%] ssm:w-[7%] lg:w-[5%] xl:w-[4%]"><img className="w-[80%] rounded-[45px] mt-[10%] ml-[10%] " src="/Vectores/linkit-web-vectores-youtube-icon.png" alt="" /></a>
            </div>
        </div>
        <div className="flex-col flex ssm:flex-row ssm:mt-3 justify-between items-center whitespace-nowrap">
            <p className="text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem]  font-montserrat"> ©2024 | {t('Todos los derechos reservados')}
            </p>
            
            
              <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem] font-montserrat" onClick={navigatetoPrivacyPolicy}> {t('Política de Privacidad')}</button>
            
              <button className="hover:underline text-[0.5rem] ssm:text-[0.7rem] md:text-[0.9rem] font-montserrat" onClick={navigatetoTermsAndConditions}> {t('Términos y condiciones')}</button>
            
            </div>
      </div>
    </div >
  )
}
