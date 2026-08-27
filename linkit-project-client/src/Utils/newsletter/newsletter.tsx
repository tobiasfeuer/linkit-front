import topLines from "/Vectores/linkit-linea-banner-suscripcion-superior.svg"
import topLinesMobile from "/Vectores/M_linkit-linea-banner-suscripcion-superior_grueso.svg"
import bottomLinesMobile from "/Vectores/M_linkit-linea-banner-suscripcion-inferior_grueso.svg"
import bottomLines from "/Vectores/linkit-linea-banner-suscripcion-inferior.svg"
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { WebsiteUser } from "../../components/Profiles/types";
import Swal from "sweetalert2";
import { setPressLogin } from "../../redux/features/registerLoginSlice";

// Desactiva temporalmente el requisito de autenticación sin eliminar su lógica.
const REQUIRE_NEWSLETTER_AUTH = false;

export default function Newsletter() {
  const {t}= useTranslation()
  const dispatch = useDispatch();
  const user: WebsiteUser = useSelector((state: any) => state.Authentication.user);

  const handleOnClickButton = () => {
    if (!REQUIRE_NEWSLETTER_AUTH || user) {
      window.open("https://airtable.com/appPc8zZP29ez9V2O/shrX7MQRZlgmqP6bq", '_blank');
    }else {
      Swal.fire({
        title: "Error",
        text: t("¡Debes iniciar sesión para suscribirte a nuestro newsletter!"),
        icon: "error",
        confirmButtonText: t("Iniciar sesión"),
        confirmButtonColor: "#01A28B",
      }).then((result) => {
        if (result.isConfirmed){
          dispatch(setPressLogin('visible'))
        }
      })
    }
  }

 return (
  <div className="bg-linkIt-300 pt-[7%] relative overflow-x-hidden">
    <img
      src={topLines}
      alt="lines"
      className="w-full absolute top-[17%] left-0 hidden lg:block"
    />
    <img
      src={topLinesMobile}
      alt="lines"
      className="w-full absolute top-[17%] left-0 lg:hidden"
    />
    <h4
      className="font-manrope font-bold titles-size text-center text-white mt-[6%]">
        {t('¡Suscríbete para recibir novedades!')}
    </h4>
    <div className="relative w-full items-center justify-center flex">
      <img
        src={bottomLines}
        alt="lines"
        className="absolute max-w-full w-[75%] h-full top-[5%] left-1/2 -translate-x-1/2 hidden lg:block"
      />
      <img
        src={bottomLinesMobile}
        alt="lines"
        className="absolute max-w-full w-[75%] h-full top-[5%] left-1/2 -translate-x-1/2 lg:hidden"
      />
      <button
        onClick={handleOnClickButton}
        className="font-manrope relative z-10 border border-white bg-white text-linkIt-200 rounded-[7px] p-1 xs:p-1.5 sm:p-2 2xl:p-3 px-1 xs:px-2 text-[0.45rem] xs:text-[0.5rem] sm:text-[0.6rem] xl:text-[0.9rem] 2xl:text-[1rem] hover:bg-linkIt-200 hover:border-linkIt-200 hover:text-white transition-all duration-300 ease-in-out font-bold dark:hover:border-white dark:hover:bg-white dark:hover:text-linkIt-300 cursor-pointer my-[5%]">
          {t('Suscribirme')}
      </button>
    </div>
  </div>
)
}