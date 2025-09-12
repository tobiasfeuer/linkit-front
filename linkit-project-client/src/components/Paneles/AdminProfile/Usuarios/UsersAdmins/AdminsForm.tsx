import { useSelector } from "react-redux";
import { IUser } from "../../../../Profiles/types";
import { useTranslation } from "react-i18next";
import { Admin } from "../../../admin.types";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

type OnCloseFunction = () => void;
interface FormAdminProps {
  onClose: OnCloseFunction;
  setSaveStatus: (status: boolean) => void;
}

export type stateProps = {
  Authentication: {
    user: IUser;
  };
};

export default function AdminsForm({ onClose, setSaveStatus }: FormAdminProps) {
  const token = useSelector(
    (state: stateProps) => state.Authentication.user._id
  );
  const { t } = useTranslation();

  const [information, setInformation] = useState<Partial<Admin>>({
    role: "admin",
    provider: "email",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<Admin>>({}); // Estado para manejar errores

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setInformation({
      ...information,
      [name]: value,
    });

    // Limpiar errores al escribir
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Admin> = {};

    if (!information.firstName?.trim())
      newErrors.firstName = t("El nombre es obligatorio");
    if (!information.lastName?.trim())
      newErrors.lastName = t("El apellido es obligatorio");
    if (!information.email?.trim())
      newErrors.email = t("El correo electrónico es obligatorio");
    else if (!/\S+@\S+\.\S+/.test(information.email))
      newErrors.email = t("El correo electrónico no es válido");
    if (!information.password?.trim())
      newErrors.password = t("La contraseña es obligatoria");
    else if (information.password.length < 6)
      newErrors.password = t("La contraseña debe tener al menos 6 caracteres");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Si no hay errores, el formulario es válido
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      setSaveStatus(false);
  
      // 1) Muestro loading
      Swal.fire({
        title: t("Creando admin..."),
        text: t("Por favor espera..."),
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });
  
      // 2) Llamada al API
      const response = await axios.post(
        `${import.meta.env.VITE_ENDPOINT_URL}/auth/register`,
        information,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang") || "es",
          },
        }
      );
  
      // 3) Cierro el loading antes de mostrar éxito
      Swal.close();
  
      // 4) Muestro éxito y espero a que el usuario cierre
      await Swal.fire({
        title: t("¡Éxito!"),
        text: t("El administrador ha sido creado correctamente."),
        icon: "success",
        confirmButtonText: t("Cerrar"),
        customClass: { confirmButton: "background-button" },
      });
  
      // 5) Limpio formulario, cierro modal y reactivo botón
      setInformation({
        role: "admin",
        provider: "email",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      onClose();
      setSaveStatus(true);
  
      return response.data;
    } catch (err: any) {
      // Log completo para depurar
      console.error("Error creando admin:", err);
      console.error("Response error:", err.response);
  
      Swal.fire({
        title: t("Error"),
        text: t(
          `Hubo un problema al crear el administrador: ${
            err.response?.data?.message || t("Inténtalo de nuevo.")
          }`
        ),
        icon: "error",
        confirmButtonText: t("Cerrar"),
        customClass: { confirmButton: "background-button" },
      });
  
      setSaveStatus(true);
    }
  };
  

  return (
    <div className="fixed flex justify-center p-24 top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex flex-col justify-center items-center bg-linkIt-500 w-fit h-fit rounded-[7px] border-[3px] border-linkIt-300 p-8">
        <div className="flex w-full justify-end">
          <button className="background-button m-2" onClick={onClose}>
            X
          </button>
        </div>
        <div>
          <h1 className="text-3xl mb-6">{t("Datos Nuevo Admin")}</h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center"
        >
          <div className="flex flex-row flex-wrap w-[110vh]">
            {/* Nombre */}
            <div className="w-fit mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Nombre")}
              </label>
              <input
                className={`appearance-none block w-fit bg-linkIt-500 text-black border ${
                  errors.firstName ? "border-red-500" : "border-linkIt-300"
                } rounded py-3 px-4 mb-1 focus:outline-none focus:bg-white`}
                type="text"
                name="firstName"
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs italic">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Apellido")}
              </label>
              <input
                className={`appearance-none block w-fit bg-linkIt-500 text-black border ${
                  errors.lastName ? "border-red-500" : "border-linkIt-300"
                } rounded py-3 px-4 mb-1 focus:outline-none focus:bg-white`}
                type="text"
                name="lastName"
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs italic">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("E-mail")}
              </label>
              <input
                className={`appearance-none block w-fit bg-linkIt-500 text-black border ${
                  errors.email ? "border-red-500" : "border-linkIt-300"
                } rounded py-3 px-4 mb-1 focus:outline-none focus:bg-white`}
                type="text"
                name="email"
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs italic">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="w-fit px-3 mb-6">
              <label className="block uppercase tracking-wide text-black text-xs font-bold mb-2">
                {t("Contraseña")}
              </label>
              <input
                className={`appearance-none block w-fit bg-linkIt-500 text-black border ${
                  errors.password ? "border-red-500" : "border-linkIt-300"
                } rounded py-3 px-4 mb-1 focus:outline-none focus:bg-white`}
                type="password"
                name="password"
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-xs italic">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex m-4">
            <button
              onClick={onClose}
              className="transparent-background-button mr-2"
            >
              {t("Volver")}
            </button>
            <button
              type="submit"
              className="background-button ml-2"
              disabled={!setSaveStatus}
            >
              {t("Crear")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
