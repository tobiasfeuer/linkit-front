import "./Register.css";
import { useState, useEffect } from "react";
import validations from "./registerValidations";
import "react-phone-number-input/style.css";
import { useDispatch } from "react-redux";
import {
  setPressLogin,
  setPressRegister,
} from "../../redux/features/registerLoginSlice";
import axios, { AxiosError } from "axios";
import { auth } from "../../helpers/authentication/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  
} from "firebase/auth";
import saveUserThirdAuth from "../../helpers/authentication/thirdPartyUserSave";
import { FirebaseError } from "firebase/app";
//import { SUPERADMN_ID } from "../../env";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import "sweetalert2/dist/sweetalert2.min.css";
import Loading from "../Loading/Loading";
import { motion } from "framer-motion";
import { loginSuccess } from "../../redux/features/AuthSlice.ts";



const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID

function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [thirdParty, setThirdParty] = useState<boolean | undefined>(false);

  const [visiblePassword, setVisiblePassword] = useState<string>("password");
  const [visibleConfirmPassword, setVisibleConfirmPassword] =
    useState<string>("password");
  const [lock, setLock] = useState<string>("/Vectores/lock.svg");
  const [lockConfirm, setLockConfirm] = useState<string>("/Vectores/lock.svg");
  const [open, setOpen] = useState<string>("closed");
  const [openConfirm, setOpenConfirm] = useState<string>("closed");
  const [loading, isLoading] = useState(false);

  const handlePressAlreadyRegistered = () => {
    dispatch(setPressRegister("hidden"));
    dispatch(setPressLogin("visible"));
  };

  const handleVisiblePassword = () => {
    if (visiblePassword === "password") {
      setVisiblePassword("text");
      setLock("/Vectores/lock-open.svg");
      setOpen("open");
    } else {
      setVisiblePassword("password");
      setLock("/Vectores/lock.svg");
      setOpen("closed");
    }
  };

  const handleVisibleConfirmPassword = () => {
    if (visibleConfirmPassword === "password") {
      setVisibleConfirmPassword("text");
      setLockConfirm("/Vectores/lock-open.svg");
      setOpenConfirm("open");
    } else {
      setVisibleConfirmPassword("password");
      setLockConfirm("/Vectores/lock.svg");
      setOpenConfirm("closed");
    }
  };

  const [user, setUser] = useState({
    firstName: "",
    companyName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
    provider: "",
    role: sessionStorage.getItem("RegisterType"),
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("RegisterType");
    };
  }, []);

  useEffect(() => {
    if (thirdParty) {
      dispatch(setPressRegister("hidden"));
      Swal.fire({
        icon: "info",
        title: t("Espera un momento"),
        text: t("Estamos registrando tu cuenta"),
        confirmButtonText: t("Continuar"),
        confirmButtonColor: "#01A28B",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showCloseButton: false,
        showCancelButton: false,
        showDenyButton: false,
        showConfirmButton: true,
        didOpen: () => {
          Swal.showLoading();
        },
        didClose: () => {
          dispatch(setPressRegister("hidden"));
        },
      });
    }
  }, [thirdParty]);

  const handleInputChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const fieldErrors = validations({
      ...user,
      [target.name]: target.value,
    });

    setUser({
      ...user,
      [target.name]: target.value,
    });

    setErrors({
      ...errors,
      [target.name]: fieldErrors[target.name as keyof typeof fieldErrors],
    });
  };

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  isLoading(true);
  try {
    if (user.role === "company") user.companyName = user.firstName;
    user.provider = "email";

    // 1. Crear usuario en Firebase Auth
    const firebaseUserCredential = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );

    // TEMPORAL: Comentado para deshabilitar envío de email de verificación
    // 2. Enviar email de verificación
    // await sendEmailVerification(firebaseUserCredential.user);

    // 3. Guardar usuario en la base de datos
   const response = await axios.post(
      "https://linkit-server.onrender.com/auth/register",
      {
        ...user,
        firebaseId: firebaseUserCredential.user.uid,
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERADMN_ID}`,
          "Accept-Language": sessionStorage.getItem("lang"),
        },
      }
    );

    if (response.data._id) {
      // 4. Login automático usando el token de Firebase
      const token = await firebaseUserCredential.user.getIdToken();
      const loginResponse = await axios.post(
        "https://linkit-server.onrender.com/auth/login",
        { role: user.role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": sessionStorage.getItem("lang"),
            "Content-Type": "application/json",
          },
        }
      );

      // 5. Actualizar estado de autenticación y cerrar modal
      const loggedUser = loginResponse.data;
      isLoading(false);
      Swal.fire({
        icon: "success",
        title: t("¡Registro e inicio de sesión exitoso!"),
        text: `${t("Bienvenido/a a LinkIT")}, ${user.firstName}. ${t(
          "Has iniciado sesión automáticamente."
        )}`,
        confirmButtonText: t("Confirmar"),
        confirmButtonColor: "#01A28B",
        allowOutsideClick: true,
        allowEscapeKey: false,
        allowEnterKey: false,
        showCloseButton: false,
        showCancelButton: false,
        showDenyButton: false,
        showConfirmButton: true,
        timer: 3000,
        timerProgressBar: true,
      });
      dispatch(loginSuccess(loggedUser));
      dispatch(setPressRegister("hidden"));
    }
    return response;
  } catch (error: any) {
    isLoading(false);
    let errorMsg = t("Ocurrió un error. Intenta nuevamente.");
    if (error instanceof FirebaseError) {
      // Errores comunes de Firebase Auth
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMsg = t("El email ya está registrado.");
          setErrors({ ...errors, email: "Email en uso" });
          break;
        case "auth/invalid-email":
          errorMsg = t("El email no es válido.");
          setErrors({ ...errors, email: "Email inválido" });
          break;
        case "auth/weak-password":
          errorMsg = t("La contraseña es muy débil. Debe tener al menos 6 caracteres.");
          setErrors({ ...errors, password: "Contraseña débil" });
          break;
        default:
          errorMsg = error.message;
      }
    } else if (error instanceof AxiosError) {
      errorMsg = error.response?.data || error.message;
      if (
        error.response?.data === "This email is already registered" ||
        error.response?.data === "El email ya esta registrado"
      ) {
        setErrors({ ...errors, email: "Email en uso" });
      }
    }
    Swal.fire({
      icon: "error",
      title: "¡Error!",
      text: errorMsg,
      confirmButtonText: t("Aceptar"),
      confirmButtonColor: "#01A28B",
      allowOutsideClick: true,
      allowEscapeKey: false,
      allowEnterKey: false,
      showCloseButton: false,
      showCancelButton: false,
      showDenyButton: false,
      showConfirmButton: true,
      timer: 2500,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }
};

  const handleAuthLogin = async (prov: string) => {
    try {
      let provider;
      let externalProvider;
      if (prov === "github" || prov === "google") {
        setThirdParty(true);
        if (prov === "github") {
          provider = new GithubAuthProvider();
          externalProvider = "github";
        } else {
          provider = new GoogleAuthProvider();
          externalProvider = "google";
        }
        const response = await signInWithPopup(auth, provider);
        // @ts-expect-error: Private property is not readable for typescript valiadtion.
        if (!response._tokenResponse.isNewUser) {
          //* In case trying to register with google but user already exists
          const result = await axios.get(
            `https://linkit-server.onrender.com/users/find?email=${response.user.email}`,
            {
              headers: {
                Authorization: `Bearer ${SUPERADMN_ID}`,
                "Accept-Language": sessionStorage.getItem("lang"),
              },
            }
          );
          if (result.data.length)
            throw Error(`El usuario ya existe, para acceder inicia sesion`);
          else {
            const result = await axios.get(
              `https://linkit-server.onrender.com/companies/find?email=${response.user.email}`,
              {
                headers: {
                  Authorization: `Bearer ${SUPERADMN_ID}`,
                  "Accept-Language": sessionStorage.getItem("lang"),
                },
              }
            );
            if (result.data.length)
              throw Error(`La empresa ya existe, para acceder inicia sesion`);
          }
        }
        //* In case user does not exist enters here
        const DBresponse = await saveUserThirdAuth(
          response.user,
          String(user.role),
          externalProvider
        );

        // Login automático con token de Firebase
        const token = await response.user.getIdToken();
        const loginResponse = await axios.post(
          "https://linkit-server.onrender.com/auth/login",
          { role: String(user.role) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": sessionStorage.getItem("lang"),
              "Content-Type": "application/json",
            },
          }
        );

        const loggedUser = loginResponse.data;
        Swal.fire({
          icon: "success",
          title: t("¡Registro e inicio de sesión exitoso!"),
          text: `${t("Bienvenido/a a LinkIT")} ${
            DBresponse.role === "company"
              ? DBresponse.companyName
              : DBresponse.firstName
          }`,
          confirmButtonText: t("Confirmar"),
          confirmButtonColor: "#01A28B",
        });
        dispatch(loginSuccess(loggedUser));
        dispatch(setPressRegister("hidden"));
        setThirdParty(false);
      }
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: `${error.message}`,
          confirmButtonText: t("Aceptar"),
          confirmButtonColor: "#01A28B",
          allowOutsideClick: true,
          allowEscapeKey: false,
          allowEnterKey: false,
          showCloseButton: true,
          showCancelButton: false,
          showDenyButton: false,
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          },
          didClose: () => {
            dispatch(setPressRegister("hidden"));
          },
        });
      } else if (error.response) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: `${error.response.data}`,
          confirmButtonText: t("Aceptar"),
          confirmButtonColor: "#01A28B",
          allowOutsideClick: true,
          allowEscapeKey: false,
          allowEnterKey: false,
          showCloseButton: true,
          showCancelButton: false,
          showDenyButton: false,
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          },
          didClose: () => {
            dispatch(setPressRegister("hidden"));
          },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: error,
          confirmButtonText: t("Aceptar"),
          confirmButtonColor: "#01A28B",
          allowOutsideClick: true,
          allowEscapeKey: false,
          allowEnterKey: false,
          showCloseButton: true,
          showCancelButton: false,
          showDenyButton: false,
          showConfirmButton: true,
          timer: 5000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          },
          didClose: () => {
            dispatch(setPressRegister("hidden"));
          },
        });
      }
    }
    dispatch(setPressRegister("hidden"));
  };
  return (
    <>
      <div
        className="bg-white bg-opacity-[85%] fixed top-0 left-0 w-screen h-screen"
        onClick={() => dispatch(setPressRegister("hidden"))}
      ></div>
      {loading && <Loading text={t("Creando tu cuenta")} />}
      <div className=" bg-linkIt-500 absolute left-1/2 top-1/2 translate-x-[-50%] rounded-[1.3rem] translate-y-[-50%] min-h-[50vh] min-w-[300px] p-[2%] w-[30%] flex flex-col flex-grow items-center gap-[1.5rem] font-montserrat overflow-hidden">
        <form
          className=" flex flex-col flex-grow items-center gap-[1.5rem] font-montserrat overflow-hidden w-full"
          onSubmit={handleSubmit}
        >
          <img
            src="/Linkit-logo/linkit-logo-blue.svg"
            alt="linkIT-Logo"
            className="w-[40%] mb-[-1rem] mt-[-3%]"
          />
          <div className="flex flex-col justify-center items-center text-center">
            <h1 className="font-bold text-linkIt-400 text-[.9rem] 2xl:text-[1.4rem]">
              {t("¡Te damos la bienvenida a LinkIT!")}
            </h1>
          </div>
          <fieldset className="flex flex-col w-full content-center justify-center items-center gap-[.5rem]">
            <input
              type="text"
              className="border-[.125rem] bg-white border-linkIt-300 w-[90%] rounded-[10px] p-[3px] flex flex-row items-center content-center gap-[.4rem] pl-[.7rem] bg-transparent placeholder:text-[.9rem] placeholder:text-linkIt-400 font-[500] focus:border-linkIt-300 focus:ring-0"
              placeholder={
                user.role === "user" ? t("Nombre") : t("Nombre de la empresa")
              }
              name="firstName"
              value={user.firstName}
              onChange={handleInputChange}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs italic">{errors.firstName}</p>
            )}
            {user.role === "user" && (
              <input
                type="text"
                className="border-[.125rem] bg-white border-linkIt-300 w-[90%] rounded-[10px] p-[3px] flex flex-row items-center content-center gap-[.4rem] pl-[.7rem] bg-transparent focus:outline-none placeholder:text-[.9rem] placeholder:text-linkIt-400 font-[500]  focus:border-linkIt-300 focus:ring-0"
                // className="border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[.9rem] placeholder:text-linkIt-400 font-[500] w-[90%]"
                placeholder={t("Apellido")}
                name="lastName"
                value={user.lastName}
                onChange={handleInputChange}
              />
            )}
            {errors.lastName && (
              <p className="text-red-500 text-xs italic">{errors.lastName}</p>
            )}
            <div className="border-[.125rem] bg-white border-linkIt-300 w-[90%] rounded-[10px] p-[3px] flex flex-row items-center content-center gap-[.4rem] pl-[.7rem]">
              <img
                src="/Vectores/email-icon.svg"
                alt=""
                className="w-[.9rem]"
              />
              <input
                type="text"
                placeholder={t("Email corporativo")}
                name="email"
                value={user.email}
                onChange={handleInputChange}
                className="bg-transparent focus:outline-none placeholder:text-[.9rem] placeholder:text-linkIt-400 font-[500] w-[90%] border-none focus:ring-0"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email}</p>
            )}
            <div className="border-[.125rem] bg-white border-linkIt-300 w-[90%] rounded-[10px] p-[3px] flex flex-row items-center content-center gap-[.4rem] pl-[.7rem]">
              <img src={lock} alt="email" className="w-[.9rem]" />
              <input
                type={visiblePassword}
                placeholder={t("Contraseña")}
                name="password"
                value={user.password}
                onChange={handleInputChange}
                className="border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[.9rem] placeholder:text-linkIt-400 font-[500] w-[90%]"
              />
              <button onClick={handleVisiblePassword} type="button">
                <img
                  src={`/Vectores/eye-${open}.svg`}
                  alt="show-password"
                  className="w-[.9rem] mr-[.5rem]"
                />
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs italic">{errors.password}</p>
            )}
            <div className="border-[.125rem] bg-white border-linkIt-300 w-[90%] rounded-[10px] p-[3px] flex flex-row items-center content-center gap-[.4rem] pl-[.7rem]">
              <img src={lockConfirm} alt="email" className="w-[.9rem]" />
              <input
                type={visibleConfirmPassword}
                placeholder={t("Confirmar contraseña")}
                name="confirm_password"
                value={user.confirm_password}
                onChange={handleInputChange}
                className="border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[.9rem] placeholder:text-linkIt-400 font-[500] w-[90%]"
              />
              <button onClick={handleVisibleConfirmPassword} type="button">
                <img
                  src={`/Vectores/eye-${openConfirm}.svg`}
                  alt="show-password"
                  className="w-[.9rem] mr-[.5rem]"
                />
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-xs italic">
                {errors.confirm_password}
              </p>
            )}
          </fieldset>
          <div className="flex flex-col w-full items-center gap-[.5rem]">
            <button
              className="bg-linkIt-300 text-white font-semibold text-[.9rem] p-[.2rem] w-[90%] rounded-[.7rem] border-[.125rem] border-linkIt-300 hover:bg-linkIt-500 hover:text-linkIt-300 transition-all duration-300 ease-in-out disabled:opacity-80"
              type="submit"
              disabled={
                user.role === "user"
                  ? errors.firstName ||
                    errors.email ||
                    errors.password ||
                    errors.confirm_password ||
                    user.confirm_password !== user.password ||
                    user.password.length < 8 ||
                    user.firstName === "" ||
                    user.email === "" ||
                    user.password === "" ||
                    user.confirm_password === ""
                    ? true
                    : false
                  : errors.firstName ||
                    errors.email ||
                    errors.password ||
                    errors.confirm_password ||
                    user.confirm_password !== user.password ||
                    user.password.length < 8 ||
                    user.firstName === "" ||
                    user.email === "" ||
                    user.password === "" ||
                    user.confirm_password === ""
                  ? true
                  : false
              }
            >
              {t("Crear Cuenta")}
            </button>
            <motion.button
              className="w-[90%] bg-white p-[.2rem] font-[500] border-[2px] border-linkIt-300 rounded-[.7rem] flex flex-row justify-center items-center gap-[.2rem]"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleAuthLogin("google")}
              type="button"
            >
              {" "}
              <img
                src="/images/google.png"
                alt="sign-in with google"
                className="w-[1.2rem]"
              />
              {t("Registrate con Google")}
            </motion.button>
            <motion.button
              className="w-[90%] bg-white p-[.2rem] font-[500] border-[2px] border-linkIt-300 rounded-[.7rem] flex flex-row justify-center items-center gap-[.2rem]"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleAuthLogin("github")}
              type="button"
            >
              {" "}
              <img
                src="/images/github.png"
                alt="sign-in with github"
                className="w-[1.2rem]"
              />
              {t("Registrate con Github")}
            </motion.button>
          </div>
          <p className="text-[.7rem] font-[500] mb-[3%] lg:mb-[6%]">
            {t("¿Ya tienes una cuenta?")} {""}
            <span
              className="text-linkIt-300 underline cursor-pointer"
              onClick={handlePressAlreadyRegistered}
            >
              {t("Ingresa aquí")}
            </span>
          </p>
          <h3 className="bg-linkIt-200 text-white font-semibold w-full text-center text-[.7rem] absolute bottom-0 top-[95%] p-[.4rem]">
            {`${t("REGISTRO PARA")} ${
              user.role === "user" ? t("TALENTOS") : t("EMPRESAS")
            }`}
          </h3>
        </form>
      </div>
    </>
  );
}

export default Register;
