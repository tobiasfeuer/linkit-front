import { useNavigate } from "react-router-dom";
import "./ModuloB.css";
import { useTranslation } from "react-i18next";
import OurServicesCarousel from "../../../../Utils/OurServicesCarousel/OurServicesCarousel";

export default function ModuloB() {
  const navigate = useNavigate();
  const { t } = useTranslation();


  const goSoyEmpresa = () => {
    navigate("/SoyEmpresa");
    setTimeout(() => {
      window.location.href = "#serviciosE";
    }, 0);
  };

  return (
    <div className="overflow-hidden w-screen font-montserrat">
      <div className="skewed-borderB hidden lg:block p-[7%] dark:bg-linkIt-200">
        <div className="contentB grid grid-cols-3 my-[3%] gap-5">
          <h1 className="text-white titles-size col-span-3 text-center justify-center font-manrope mb-[5%] font-bold">
            {t("Nuestros servicios")}
          </h1>
          <img
            className="bg-white rounded-full w-1/4 justify-self-center mb-[5%]"
            src="/Vectores/linkit-web-vectores-03.svg"
            alt="reclutamiento"
          />
          <img
            className="bg-white rounded-full w-1/4 justify-self-center mb-[5%]"
            src="/Vectores/linkit-web-vectores-04.svg"
            alt="contratación"
          />
          <img
            className="bg-white rounded-full w-1/4 justify-self-center mb-[5%]"
            src="/Vectores/linkit-web-vectores-05.svg"
            alt="gestión y beneficios"
          />
          <h2 className=" text-white font-bold text-center subtitles-size font-manrope">
            {t("Reclutamiento y selección")}{" "}
          </h2>
          <h2 className=" text-white font-bold  text-center subtitles-size  font-manrope">
            {t("Contratación")}
          </h2>
          <h2 className=" text-white font-bold text-center subtitles-size  font-manrope ">
            {t("Gestión y beneficios")}
          </h2>
          <p className="text-white px-[15%] text-center text-size font-montserrat">
            {t(
              "Identificamos a profesionales con el stack, habilidades y experiencia adecuada para tus proyectos y así lograr construir un equipo de alto desempeño."
            )}
          </p>
          <p className=" text-white px-[15%] text-center text-size font-montserrat">
            {t(
              "Realizamos la gestión contractual y de pagos del talento. Refuerza tu equipo y aumenta la capacidad productiva sin riesgos."
            )}
          </p>
          <p className="text-white px-[15%] text-center text-size font-montserrat">
            {t(
              "Facilitamos planes de beneficios, asesoramiento en la retención y elaboración de informes y mucho más."
            )}
          </p>
          <button
            className="background-button justify-self-center hover:bg-white hover:text-linkIt-300 "
            onClick={goSoyEmpresa}
          >
            {t("Ver más")}
          </button>
          <button
            className="background-button justify-self-center hover:bg-white hover:text-linkIt-300 "
            onClick={goSoyEmpresa}
          >
            {t("Ver más")}
          </button>
          <button
            className="background-button justify-self-center hover:bg-white hover:text-linkIt-300 "
            onClick={goSoyEmpresa}
          >
            {t("Ver más")}
          </button>
        </div>
      </div>
      <div className="lg:hidden">
        <OurServicesCarousel component="home" />
      </div>
    </div>
  );
}
