import { useEffect } from 'react'; 
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: {
      push: (event: any) => void;
    };
  }
}

export default function SuccesfullForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {

    if (window.dataLayer) {
      window.dataLayer.push({ event: 'formularioCompleto' });
    }

    const timer = setTimeout(() => {
      navigate(-1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-linkIt-200 text-white font-montserrat overflow-hidden w-full px-[5%] pt-[11%] pb-[6%] flex justify-center">
      <div className="text-center">
        <h1 className="font-bold font-manrope mt-2 xs:mt-28 xs:text-[1.0rem] ssm:text-[1.8rem] sm:text-[2rem] md:text-[2.6rem] w-[100%] ssm:w-[100%] sm:w-[100%] lg:w-[100%] lg:text-[3rem] xl:text-[3.5rem] xl:w-[100%] 2xl:text-[4.5rem] 2xl:w-[100%] leading-tight 2xl:mb-12 mb-12 xs:mb-6">
          {t("¡Gracias por completar el formulario!")}
        </h1>
        <p className="font-montserrat text-[0.8rem] mt-12 xs:mt-2 xs:text-[0.7rem] ssm:text-[0.9rem] sm:text-[1rem] lg:text-[1.5rem] md:text-[1.4rem] xl:text-[1.8rem] 2xl:text-[2rem] leading-tight mb-12 xs:mb-6">
          {t("En breve nos contactaremos contigo.")} <br />
          {t("¡No te olvides de revisar tu correo!")}
        </p>
        <p className="font-montserrat text-[0.7rem] xs:text-[0.6rem] ssm:text-[0.8rem] sm:text-[0.9rem] lg:text-[1.2rem] md:text-[1.1rem] xl:text-[1.4rem] 2xl:text-[1.6rem] mt-8">
          {t("Serás redirigido automáticamente en 5 segundos...")}
        </p>
      </div>
    </div>
  );
}

