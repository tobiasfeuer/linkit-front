import { useEffect, useRef, useState } from "react";
import validations from "./validations";
import { validateContact } from "./errors/validation";
import { ValidationError } from "./errors/errors";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

// Animaciones para los elementos del formulario
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Animaciones para el botón
const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};


// Tipo para los contactos
interface Contacts {
  firstName: string;
  lastName: string;
  company: string;
  service: string[];
  email: string;
  message: string;
  web: string;
}

export default function ContactUs() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contacts>({
    firstName: "",
    lastName: "",
    company: "",
    service: [] as string[],
    email: "",
    message: "",
    web: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    company: "",
    service: "",
    email: "",
    message: "",
    web: "",
  });

  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    const fieldErrors = validations({
      ...contacts,
      [name]: value,
    });

    if (isCheckbox) {
      if (checked) {
        setContacts((prevContacts) => {
          if (!prevContacts.service.includes(value)) {
            return {
              ...prevContacts,
              service: [...prevContacts.service, value],
            };
          } else {
            return prevContacts;
          }
        });
      } else {
        setContacts((prevContacts) => ({
          ...prevContacts,
          service: prevContacts.service.filter((service) => service !== value),
        }));
      }
    } else {
      setContacts({
        ...contacts,
        [name]: value,
      });
    }

    setErrors({
      ...errors,
      [name]: fieldErrors[name as keyof typeof fieldErrors],
    });
  };

  const handleFocus = (name: string) => {
    setFocused(name);
  };

  const handleBlur = () => {
    setFocused(null);
  };

  const contactsBtn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const confirmMessage = await Swal.fire({
        icon: "info",
        title: t("Por favor confirma los servicios"),
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonColor: "#01A28B",
        confirmButtonText: t("Confirmar"),
        cancelButtonText: t("Cancelar"),
        reverseButtons: true,
      });

      if (confirmMessage.isConfirmed) {
        validateContact(contacts);
        const response = await axios.post(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/contactus`,
          contacts,
          {
            headers: {
              Authorization: `Bearer ${SUPERADMN_ID}`,
              "Accept-Language": sessionStorage.getItem("lang"),
            },
          }
        );

        if (response.status === 200) {
          setContacts({
            firstName: "",
            lastName: "",
            company: "",
            service: [] as string[],
            email: "",
            message: "",
            web: "",
          });
        }
        navigate("/Gracias");
      }
    } catch (error) {
      Swal.fire({
        customClass: {
          confirmButton: "background-button",
        },
        title: (error as Error).message,
        icon: "error",
        showConfirmButton: true,
        buttonsStyling: false,
      });
      throw new ValidationError(
        `Faltan datos del formulario: ${(error as Error).message}`
      );
    }
  };

  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        servicesOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [servicesOpen]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isFormValid =
    !errors.firstName &&
    !errors.lastName &&
    !errors.company &&
    !errors.service &&
    !errors.email &&
    !errors.message &&
    !errors.web &&
    contacts.firstName !== "" &&
    contacts.lastName !== "" &&
    contacts.company !== "" &&
    contacts.service.length !== 0 &&
    contacts.email !== "" &&
    contacts.web !== "" &&
    contacts.message !== "";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-linkIt-300 to-linkIt-200 font-montserrat text-white py-16 px-6 md:px-10 lg:px-16 shadow-2xl dark:from-linkIt-400 dark:to-linkIt-300">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Columna de título y descripción */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.9 }}
            className="space-y-6"
          >
            <h2 className="font-bold text-3xl xs:text-4xl md:text-5xl xl:text-6xl leading-tight font-manrope">
              {t("Contáctanos para escalar tu equipo")}
            </h2>
            <p className="text-white/80 text-lg md:text-xl max-w-lg">
              {t(
                "Completa el formulario y nuestro equipo se pondrá en contacto contigo para ayudarte a encontrar el talento que necesitas."
              )}
            </p>
          </motion.div>

          {/* Formulario */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <form
              className="bg-white/10 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-lg space-y-6"
              onSubmit={contactsBtn}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                {/* Nombre */}
                <div className="relative">
                  <motion.input
                    className={`w-full bg-transparent rounded-lg border-b-2 ${
                      errors.firstName
                        ? "border-red-400"
                        : focused === "firstName"
                        ? "border-white"
                        : "border-white/50"
                    } px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300`}
                    type="text"
                    placeholder={t("Nombre")}
                    name="firstName"
                    value={contacts.firstName}
                    onChange={handleChange}
                    onFocus={() => handleFocus("firstName")}
                    onBlur={(e) => {
                      handleBlur();
                      handleChange(e);
                    }}
                  />
                  {errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-300 text-xs mt-1"
                    >
                      {errors.firstName}
                    </motion.p>
                  )}
                </div>

                {/* Apellido */}
                <div className="relative">
                  <motion.input
                    className={`w-full bg-transparent border-b-2 rounded-lg ${
                      errors.lastName
                        ? "border-red-400"
                        : focused === "lastName"
                        ? "border-white"
                        : "border-white/50"
                    } px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300`}
                    type="text"
                    placeholder={t("Apellido")}
                    name="lastName"
                    value={contacts.lastName}
                    onChange={handleChange}
                    onFocus={() => handleFocus("lastName")}
                    onBlur={(e) => {
                      handleBlur();
                      handleChange(e);
                    }}
                  />
                  {errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-300 text-xs mt-1"
                    >
                      {errors.lastName}
                    </motion.p>
                  )}
                </div>

                {/* Empresa */}
                <div className="relative">
                  <motion.input
                    className={`w-full bg-transparent border-b-2 rounded-lg ${
                      errors.company
                        ? "border-red-400"
                        : focused === "company"
                        ? "border-white"
                        : "border-white/50"
                    } px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300`}
                    type="text"
                    placeholder={t("Empresa")}
                    name="company"
                    value={contacts.company}
                    onChange={handleChange}
                    onFocus={() => handleFocus("company")}
                    onBlur={(e) => {
                      handleBlur();
                      handleChange(e);
                    }}
                  />
                  {errors.company && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-300 text-xs mt-1"
                    >
                      {errors.company}
                    </motion.p>
                  )}
                </div>

                {/* Servicios */}
                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown de servicios */}
                  <div className="relative w-full">
                    {/* Campo de selección principal */}
                    <div
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className={`w-full bg-transparent border-2 rounded-lg ${
                        errors.service
                          ? "border-red-400"
                          : focused === "service"
                          ? "border-white"
                          : "border-white/50"
                      } px-3 py-2 text-white flex justify-between items-center cursor-pointer transition-all duration-300`}
                    >
                      <span
                        className={
                          contacts.service.length
                            ? "text-white"
                            : "text-white/60"
                        }
                      >
                        {contacts.service.length
                          ? contacts.service.length > 1
                            ? `${t(contacts.service[0])} +${
                                contacts.service.length - 1
                              }`
                            : t(contacts.service[0])
                          : t("¿Qué servicio te interesa?")}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          servicesOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {/* Panel desplegable de opciones */}
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {[
                            "Gestión y beneficios",
                            "Reclutamiento y selección",
                            "Contratación",
                          ].map((service) => (
                            <label
                              key={service}
                              className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                name={service}
                                value={service}
                                checked={contacts.service.includes(service)}
                                onChange={handleChange}
                                className="w-4 h-4 text-linkIt-300 border-gray-300 rounded focus:ring-linkIt-300"
                              />
                              <span className="ml-2 text-gray-800 font-medium">
                                {t(service)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {errors.service && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-300 text-xs mt-1"
                    >
                      {errors.service}
                    </motion.p>
                  )}
                </div>

                {/* Web */}
                <div className="relative">
                  <motion.input
                    className={`w-full bg-transparent border-b-2 rounded-lg ${
                      errors.web
                        ? "border-red-400"
                        : focused === "web"
                        ? "border-white"
                        : "border-white/50"
                    } px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300`}
                    type="text"
                    placeholder="Web"
                    name="web"
                    value={contacts.web}
                    onChange={handleChange}
                    onFocus={() => handleFocus("web")}
                    onBlur={(e) => {
                      handleBlur();
                      handleChange(e);
                    }}
                  />
                  {errors.web && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-300 text-xs mt-1"
                    >
                      {errors.web}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <motion.input
                    className={`w-full bg-transparent border-b-2 rounded-lg ${
                      errors.email
                        ? "border-red-400"
                        : focused === "email"
                        ? "border-white"
                        : "border-white/50"
                    } px-3 py-2 text-white placeholder-white/60 focus:outline-none transition-all duration-300`}
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={contacts.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={(e) => {
                      handleBlur();
                      handleChange(e);
                    }}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-300 text-xs mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Mensaje */}
              <div className="relative">
                <textarea
                  className={`w-full bg-transparent border-2 ${
                    errors.message
                      ? "border-red-400"
                      : focused === "message"
                      ? "border-white"
                      : "border-white/50"
                  } rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none transition-all duration-300 min-h-[120px] resize-none`}
                  placeholder={t("Mensaje")}
                  name="message"
                  value={contacts.message}
                  onChange={handleChange as any}
                  onFocus={() => handleFocus("message")}
                  onBlur={(e) => {
                    handleBlur();
                    handleChange(e as any);
                  }}
                />
                {errors.message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-300 text-xs mt-1"
                  >
                    {errors.message}
                  </motion.p>
                )}
              </div>

              {/* Botón de envío */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
                  isFormValid
                    ? "bg-white text-linkIt-300 hover:bg-opacity-90"
                    : "bg-white/50 text-white/70 cursor-not-allowed"
                }`}
                type="submit"
                disabled={!isFormValid}
              >
                {t("Enviar")}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
