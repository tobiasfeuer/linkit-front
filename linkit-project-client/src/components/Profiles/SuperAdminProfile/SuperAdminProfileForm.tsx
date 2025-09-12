import { FunctionComponent, useEffect, useState } from "react";
import { IAdmin, UserRoleEnum } from "../types";
import { changePassword, editAdmin } from "../api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/types";
import { setUser } from "../../../redux/features/AuthSlice";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Loading from "../../Loading/Loading";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import CloudinaryUploadWidget from "../../Services/cloudinaryWidget";

const SuperAdminProfileForm: FunctionComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector(
    (state: RootState) => state.Authentication.user as IAdmin
  );
  const { token } = useSelector((state: RootState) => state.Authentication);
  const [country, setCountry] = useState(admin.country);
  const [firstName, setFirstName] = useState(admin.firstName);
  const [lastName, setLastName] = useState(admin.lastName);
  const [countries, setCountries] = useState([]);
  const [loading, isLoading] = useState(false);
  const [filePublicId, setFilePublicId] = useState(admin.image ?? "");
  const [fileName, setFileName] = useState("");

  //TODO Erase this once is used, only for deployment purposes
  if (fileName) {
    null;
  }

  async function profileChangePassword() {
    try {
      const response:string = await changePassword(admin);
        Swal.fire({
          title: t("Exitoso"),
          text: response,
          icon: "success",
          confirmButtonText: "Ok",
          confirmButtonColor: "#01A28B",

        });
    } catch (error: any) {
      Swal.fire({
        title:"Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#01A28B",

      });
    }
  }

  useEffect(() => {
    if (!token) navigate("/unauthorized");
    const fetchData = async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_ENDPOINT_URL}/resources/countries`
      );
      const countries = data.map((country: any) => country.name);
      setCountries(countries);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      isLoading(true);
      const newUser = {
        ...admin,
        firstName,
        lastName,
        country,
        image: filePublicId,
      };

      const updatedUser = await editAdmin(newUser, token as string);
      dispatch(setUser(updatedUser));

      Swal.fire({
        title: t("Datos actualizados"), //!
        icon: "success",
        confirmButtonColor: "#01A28B"
      });
      isLoading(false);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.response.data,
        icon: "error",
      });
      isLoading(false);
    }
  };
  const { t } = useTranslation();

  return (
    <div className="flex flex-col bg-linkIt-500 mx-5 p-10 rounded-[20px] md:mx-10 md:p-20 md:pb-10 lg:flex-row">
      <div className="flex p-3 flex-col md:flex-row w-full mb-5">
        <div className="flex flex-col md:flex-col w-full pt-10 md:justify-evenly md:pt-0 relative">
          <div className="relative w-full flex justify-center md:w-[50%]">
            <div
              className={`relative rounded-full w-[250px] h-[250px] bg-gray-300 ${
                admin.image
                  ? "flex flex-col justify-center items-center content-center"
                  : ""
              }`}
            >
              <CloudinaryUploadWidget
                setFilePublicId={setFilePublicId}
                setFileName={setFileName}
                className="flex absolute bottom-0 right-0 bg-white  rounded-full ring-2 ring-black w-9 h-9 justify-center items-center cursor pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  height={20}
                  width={20}
                >
                  <g>
                    <path
                      d="M13.491666666666669 2.925a0.42500000000000004 0.42500000000000004 0 0 0 -0.5916666666666667 0L3.391666666666667 12.433333333333334a0.4166666666666667 0.4166666666666667 0 0 0 0 0.5916666666666667l3.566666666666667 3.566666666666667a0.4 0.4 0 0 0 0.5833333333333334 0L17.058333333333334 7.083333333333334a0.42500000000000004 0.42500000000000004 0 0 0 0 -0.5916666666666667Z"
                      fill="#000000"
                      strokeWidth={0.8333333333333334}
                    />
                    <path
                      d="M2.5 13.925a0.42500000000000004 0.42500000000000004 0 0 0 -0.39166666666666666 -0.10833333333333334 0.4 0.4 0 0 0 -0.3 0.275L0 19.441666666666666a0.4083333333333333 0.4083333333333333 0 0 0 0.1 0.42500000000000004 0.4166666666666667 0.4166666666666667 0 0 0 0.45000000000000007 0.13333333333333333l5.3500000000000005 -1.7833333333333334a0.43333333333333335 0.43333333333333335 0 0 0 0.275 -0.3 0.4083333333333333 0.4083333333333333 0 0 0 -0.11666666666666668 -0.4166666666666667Z"
                      fill="#000000"
                      strokeWidth={0.8333333333333334}
                    />
                    <path
                      d="M19.166666666666668 0.8333333333333334a3 3 0 0 0 -4.166666666666667 0l-0.5916666666666667 0.5916666666666667a0.4166666666666667 0.4166666666666667 0 0 0 0 0.5916666666666667l3.566666666666667 3.566666666666667a0.42500000000000004 0.42500000000000004 0 0 0 0.5833333333333334 0L19.166666666666668 5a2.9416666666666664 2.9416666666666664 0 0 0 0 -4.166666666666667Z"
                      fill="#000000"
                      strokeWidth={0.8333333333333334}
                    />
                  </g>
                </svg>
              </CloudinaryUploadWidget>
              {admin.image && (
                <img
                  src={`https://res.cloudinary.com/dquhriqz3/image/upload/${filePublicId}`}
                  alt=""
                  className=" h-full w-full rounded-full"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col pt-5 gap-3 self-center place-self-center">
            {admin.provider === "email" ? <button
              className="text-white border-[.125rem] border-linkIt-300 bg-linkIt-300 w-[11.75rem] h-[2.75rem] rounded-[10px] border-solid"
              onClick={profileChangePassword}
            >
              {t("Cambiar contraseña")}
            </button> : null}

          </div>
        </div>
      </div>
      {loading && <Loading text={t("Enviando los cambios")} />}
      {admin.role === UserRoleEnum.ADMIN && (
        <form action="" onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center flex-col gap-5 md:flex-row md:flex-wrap justify-content: center;">
            <div className="flex flex-col">
              <label className="ml-2">{t("Nombre")}</label>
              <input
                defaultValue={admin.firstName}
                onChange={(event) => setFirstName(event.target.value)}
                type="text"
                placeholder={t("Nombre")}
                className="placeholder:font-[500] placeholder:text-opacity-80 placeholder:text-linkIt-400 bg-transparent pl-[1rem] border-[.125rem] border-linkIt-400 md:w-[24rem] h-[2.75rem] rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <label className="ml-2">{t("Apellido")}</label>
              <input
                defaultValue={admin.lastName}
                onChange={(event) => setLastName(event.target.value)}
                type="text"
                placeholder={t("Apellido")}
                className="placeholder:font-[500] placeholder:text-opacity-80 placeholder:text-linkIt-400 bg-transparent pl-[1rem] border-[.125rem] border-linkIt-400 md:w-[24rem] h-[2.75rem] rounded-[10px]"
              />
            </div>
            <div className="flex flex-col">
              <label className="ml-2">{t("Email")}</label>
              <input
                defaultValue={admin.email}
                disabled
                className="bg-transparent pl-[1rem] border-[.125rem] border-linkIt-400 md:w-[24rem] h-[2.75rem] rounded-[10px] text-linkIt-400 text-opacity-80 hover:cursor-not-allowed min-w-[15rem]"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <label className="ml-2">{t("País")}</label>
              <select
                onChange={(event) => setCountry(event.target.value)}
                value={country ?? "-"}
                className="border-[.125rem] border-linkIt-400 bg-transparent pl-[1rem] md:w-[24rem] h-[2.75rem] rounded-[10px] min-w-[15rem]"
              >
                <option value=""></option>
                {countries.map((country, index) => (
                  <option key={index}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-row justify-center mt-8 gap-5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-linkIt-400 border-[.125rem] border-linkIt-300 bg-white w-[11.75rem] h-[2.75rem] rounded-[10px] border-solid"
            >
              {t("Descartar")}
            </button>
            <button
              type="submit"
              className="text-white border-[.125rem] border-linkIt-300 bg-linkIt-300 w-[11.75rem] h-[2.75rem] rounded-[10px] border-solid"
            >
              {t("Guardar")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SuperAdminProfileForm;
