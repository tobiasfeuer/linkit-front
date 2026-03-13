import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import {
  COUNTRY_CODE_TO_AIRTABLE,
  PAIS_SIN_ESPECIFICAR,
} from "./countryCodeToAirtable";
import { useGoogleReCaptcha } from "react-google-recaptcha-hook";
import "react-phone-number-input/style.css";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Traducciones específicas para este componente
const translations = {
  es: {
    nombre: "Nombre",
    apellido: "Apellido",
    correo: "Correo corporativo",
    telefono: "Número de teléfono",
    empresa: "Empresa",
    web: "Web",
    buscandoTalento: "¿Qué servicios te interesan?",
    perfilBuscando: "¿Qué perfiles estás buscando?",
    terminos: "He leído y acepto los",
    terminosLink: "Términos y condiciones",
    privacidadLink: "Política de privacidad",
    y: "y la",
    empezarAhora: "Empezar ahora",
    enviando: "Enviando...",
    confirmarServicios: "Por favor confirma los servicios",
    confirmar: "Confirmar",
    cancelar: "Cancelar",
    placeholder: {
      nombre: "Ingresar nombre",
      apellido: "Apellido",
      correo: "ejemplo@mail.com",
      telefono: "+54 000 000000",
      empresa: "Ingresa nombre de empresa",
      web: "https://ejemplo.com",
      perfiles: "Ej: Frontend, Backend, Fullstack...",
      seleccionar: "Seleccionar perfiles",
      buscar: "Buscar perfiles...",
    },
    opciones: {
      contratarPersonal: "Quiero contratar personal para mi empresa",
      talentoProyecto: "Necesito talento para un proyecto",
      subcontratar: "Me interesa sub-contratar talento",
      conversar: "Me interesa conversar y saber más detalles",
    },
    perfiles: {
      frontend: "Frontend Developer",
      backend: "Backend Developer",
      fullstack: "Fullstack Developer",
      devops: "DevOps Engineer",
      qa: "QA Engineer",
      mobile: "Mobile Developer",
      data: "Data Scientist/Engineer",
      ui: "UI/UX Designer",
    },
    errores: {
      requerido: "Este campo es obligatorio",
      email: "Por favor ingresa un correo electrónico válido",
      telefono: "Por favor ingresa un número de teléfono válido",
      web: "Por favor ingresa una URL válida (ej: https://ejemplo.com)",
      terminos: "Debes aceptar los términos y condiciones",
      recaptcha: "Error en la verificación de seguridad. Intenta de nuevo.",
      generico:
        "Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.",
      faltanDatos: "Faltan datos del formulario",
      errorRed: "No se pudo conectar con el servidor. Verifica tu conexión a internet o que el servicio esté disponible.",
    },
  },
  en: {
    nombre: "First Name",
    apellido: "Last Name",
    correo: "Corporate Email",
    telefono: "Phone Number",
    empresa: "Company",
    web: "Website",
    buscandoTalento: "What services are you interested in?",
    perfilBuscando: "What profiles are you looking for?",
    terminos: "I have read and accept the",
    terminosLink: "Terms and Conditions",
    privacidadLink: "Privacy Policy",
    y: "and the",
    empezarAhora: "Get Started Now",
    enviando: "Sending...",
    confirmarServicios: "Please confirm the services",
    confirmar: "Confirm",
    cancelar: "Cancel",
    placeholder: {
      nombre: "Enter first name",
      apellido: "Last name",
      correo: "example@mail.com",
      telefono: "+54 000 000000",
      empresa: "Enter company name",
      web: "https://example.com",
      perfiles: "E.g.: Frontend, Backend, Fullstack...",
      seleccionar: "Select profiles",
      buscar: "Search profiles...",
    },
    opciones: {
      contratarPersonal: "I want to hire staff for my company",
      talentoProyecto: "I need talent for a project",
      subcontratar: "I am interested in sub-contracting talent",
      conversar: "I am interested in talking and learning more details",
    },
    perfiles: {
      frontend: "Frontend Developer",
      backend: "Backend Developer",
      fullstack: "Fullstack Developer",
      devOps: "DevOps Engineer",
      qa: "QA Engineer",
      mobile: "Mobile Developer",
      data: "Data Scientist/Engineer",
      ui: "UI/UX Designer",
    },
    errores: {
      requerido: "This field is required",
      email: "Please enter a valid email address",
      telefono: "Please enter a valid phone number",
      web: "Please enter a valid URL (e.g. https://example.com)",
      terminos: "You must accept the terms and conditions",
      recaptcha: "Security verification failed. Please try again.",
      generico: "There was an error submitting the form. Please try again.",
      faltanDatos: "Missing form data",
      errorRed: "Could not connect to the server. Check your internet connection or that the service is available.",
    },
  },
};

interface FormData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  empresa: string;
  web: string;
  pais: string; // Derivado del prefijo del teléfono (oculto)
  buscandoTalento: string[];
  perfiles: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  empresa?: string;
  web?: string;
  perfiles?: string;
  buscandoTalento?: string;
  recaptcha?: string;
}

interface ContactFormProps {
  executeRecaptcha?: (action: string) => Promise<string>;
}

const ContactFormBase = ({ executeRecaptcha }: ContactFormProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    empresa: "",
    web: "",
    pais: "",
    buscandoTalento: [],
    perfiles: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  //GTM
  const pushToDataLayer = () => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "LandingForm",
      });
    }
  };

  // Determinar el idioma actual (con fallback a español)
  const currentLang = i18n.language.startsWith("en") ? "en" : "es";

  // Función para obtener traducciones
  const t = (key: string, params?: Record<string, any>) => {
    // Navegar por el objeto de traducciones usando la ruta de la clave
    const keys = key.split(".");
    let translation: any = translations[currentLang];

    for (const k of keys) {
      if (translation[k] === undefined) return key;
      translation = translation[k];
    }

    if (typeof translation !== "string") return key;

    if (params) {
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) =>
          acc.replace(`{{${paramKey}}}`, paramValue.toString()),
        translation
      );
    }
    return translation;
  };

  // Cargar datos guardados del localStorage al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem("talentFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Normalizar perfiles: si viene como array (formato antiguo), convertir a string
        if (Array.isArray(parsedData.perfiles)) {
          parsedData.perfiles = parsedData.perfiles.join(", ");
        } else if (typeof parsedData.perfiles !== "string") {
          parsedData.perfiles = "";
        }
        // Asegurar que web y pais existan
        if (!("web" in parsedData)) parsedData.web = "";
        if (!("pais" in parsedData)) parsedData.pais = "";
        // Derivar país del teléfono guardado si es válido
        if (
          parsedData.telefono &&
          isValidPhoneNumber(parsedData.telefono) &&
          !parsedData.pais
        ) {
          try {
            const parsed = parsePhoneNumber(parsedData.telefono);
            const countryCode = parsed?.country;
            parsedData.pais = countryCode
              ? COUNTRY_CODE_TO_AIRTABLE[countryCode] ?? PAIS_SIN_ESPECIFICAR
              : PAIS_SIN_ESPECIFICAR;
          } catch {
            /* ignorar */
          }
        }
        setFormData(parsedData);
      } catch {
        localStorage.removeItem("talentFormData");
      }
    }
  }, []);

  // Validar el formulario
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Validar campos requeridos (web y pais -derivado del teléfono- son opcionales)
    if (!formData.nombre) newErrors.nombre = t("errores.requerido");
    if (!formData.apellido) newErrors.apellido = t("errores.requerido");
    if (!formData.empresa?.trim()) newErrors.empresa = t("errores.requerido");
    if (formData.buscandoTalento.length === 0) {
      newErrors.buscandoTalento = t("errores.requerido");
    }
    if (!formData.correo) {
      newErrors.correo = t("errores.requerido");
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = t("errores.email");
    }
    if (!formData.telefono) {
      newErrors.telefono = t("errores.requerido");
    } else if (!isValidPhoneNumber(formData.telefono)) {
      newErrors.telefono = t("errores.telefono");
    }
    if (formData.web.trim()) {
      try {
        const url = formData.web.trim();
        const toTest = url.startsWith("http") ? url : `https://${url}`;
        new URL(toTest);
      } catch {
        newErrors.web = t("errores.web");
      }
    }
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "buscandoTalento" && type === "checkbox") {
      setFormData((prev) => {
        let updatedServices = [...prev.buscandoTalento];

        if (checked) {
          if (!updatedServices.includes(value)) {
            updatedServices.push(value);
          }
        } else {
          updatedServices = updatedServices.filter(
            (service) => service !== value
          );
        }

        const updatedData = { ...prev, buscandoTalento: updatedServices };

        // Actualiza los errores si el usuario ha interactuado con el campo
        setErrors((prevErrors) => ({
          ...prevErrors,
          buscandoTalento:
            updatedServices.length === 0 ? t("errores.requerido") : undefined,
        }));

        return updatedData;
      });
    } else {
      const newValue = type === "checkbox" ? checked : value;

      setFormData((prev) => {
        const updatedData = { ...prev, [name]: newValue };

        return updatedData;
      });
    }

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldErrors = validateForm();
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name as keyof FormErrors],
    }));
  };

  const contactsBtn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar todo el formulario
    const formErrors = validateForm();
    setErrors(formErrors);

    // Verificar si hay errores
    if (Object.keys(formErrors).length > 0) {
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    try {
      setIsSubmitting(true);

      // reCAPTCHA v3 - ejecutar al enviar (invisible)
      let recaptchaToken: string | null = null;
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha("submit");
        } catch {
          setErrors((prev) => ({ ...prev, recaptcha: t("errores.recaptcha") }));
          setIsSubmitting(false);
          return;
        }
      }

      // Derivar país del teléfono si aún no está (ej: pegar y enviar rápido)
      let paisToSend = formData.pais || PAIS_SIN_ESPECIFICAR;
      if (formData.telefono && isValidPhoneNumber(formData.telefono)) {
        try {
          const parsed = parsePhoneNumber(formData.telefono);
          paisToSend = parsed?.country
            ? COUNTRY_CODE_TO_AIRTABLE[parsed.country] ?? PAIS_SIN_ESPECIFICAR
            : PAIS_SIN_ESPECIFICAR;
        } catch {
          /* ignorar */
        }
      }
      const formDataToSend = { ...formData, pais: paisToSend };
      const dataToSend = {
        ...formDataToSend,
        perfil: formData.perfiles,
      };
      delete (dataToSend as any).perfiles;

      const payload = { ...dataToSend };
      if (recaptchaToken) {
        (payload as Record<string, unknown>).recaptchaToken = recaptchaToken;
      }

      const prodResponse = await axios.post(
        `${import.meta.env.VITE_ENDPOINT_URL}/resources/contactus/form`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${SUPERADMN_ID}`,
            "Accept-Language":
              sessionStorage.getItem("lang") || currentLang,
          },
        }
      );

      if (prodResponse.status === 200) {
        setFormData({
          nombre: "",
          apellido: "",
          correo: "",
          telefono: "",
          empresa: "",
          web: "",
          pais: "",
          buscandoTalento: [],
          perfiles: "",
        });
        // Google Ads: reportar conversión de formulario de clientes potenciales
        if (typeof (window as any).gtag_report_conversion === "function") {
          (window as any).gtag_report_conversion();
        }
        pushToDataLayer();
        localStorage.removeItem("talentFormData");
        navigate("/Gracias");
      }
    } catch (prodError: any) {
      setIsSubmitting(false);

      const isNetworkError =
        prodError.code === "ERR_NETWORK" ||
        prodError.message === "Network Error";
      const errorMessage = isNetworkError
        ? t("errores.errorRed")
        : prodError.response?.data?.message || prodError.message;
      const errorDetails = isNetworkError
        ? ""
        : prodError.response?.data?.error || "No hay detalles adicionales";

      Swal.fire({
        customClass: {
          confirmButton: "background-button",
        },
        title: "Error al enviar el formulario",
        html: errorDetails
          ? `<p>${errorMessage}</p><p class="text-sm text-gray-500 mt-2">Detalles técnicos: ${errorDetails}</p>`
          : `<p>${errorMessage}</p>`,
        icon: "error",
        showConfirmButton: true,
        buttonsStyling: false,
      });

    }
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClass =
      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-sm transition-all text-black";
    return `${baseClass} ${
      touched[fieldName] && errors[fieldName as keyof FormErrors]
        ? "border-red-500 bg-red-50"
        : touched[fieldName] && !errors[fieldName as keyof FormErrors]
        ? "border-green-500 bg-green-50"
        : "border-gray-300"
    }`;
  };

  return (
    <form
      onSubmit={contactsBtn}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 font-montserrat"
      noValidate
    >
      {/* Nombre */}
      <div className="space-y-1">
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-gray-700"
        >
          {t("nombre")} <span className="text-red-500">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("placeholder.nombre")}
          className={getInputClassName("nombre")}
          aria-invalid={touched.nombre && !!errors.nombre}
          aria-describedby={errors.nombre ? "nombre-error" : undefined}
          required
        />
        {touched.nombre && errors.nombre && (
          <p
            id="nombre-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.nombre}
          </p>
        )}
      </div>

      {/* Apellido */}
      <div className="space-y-1">
        <label
          htmlFor="apellido"
          className="block text-sm font-medium text-gray-700"
        >
          {t("apellido")} <span className="text-red-500">*</span>
        </label>
        <input
          id="apellido"
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("placeholder.apellido")}
          className={getInputClassName("apellido")}
          aria-invalid={touched.apellido && !!errors.apellido}
          aria-describedby={errors.apellido ? "apellido-error" : undefined}
          required
        />
        {touched.apellido && errors.apellido && (
          <p
            id="apellido-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.apellido}
          </p>
        )}
      </div>

      {/* Correo corporativo */}
      <div className="space-y-1">
        <label
          htmlFor="correo"
          className="block text-sm font-medium text-gray-700"
        >
          {t("correo")} <span className="text-red-500">*</span>
        </label>
        <input
          id="correo"
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("placeholder.correo")}
          className={getInputClassName("correo")}
          aria-invalid={touched.correo && !!errors.correo}
          aria-describedby={errors.correo ? "correo-error" : undefined}
          required
        />
        {touched.correo && errors.correo && (
          <p
            id="correo-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.correo}
          </p>
        )}
      </div>

      {/* Número de teléfono */}
      <div className="space-y-1">
        <label
          htmlFor="telefono"
          className="block text-sm font-medium text-gray-700"
        >
          {t("telefono")} <span className="text-red-500">*</span>
        </label>
        <div className={`phone-input-container-contact ${touched.telefono && errors.telefono ? "error" : ""}`}>
          <PhoneInput
            international
            defaultCountry="CL"
            value={formData.telefono}
            onChange={(value) => {
              const telefonoValue = value || "";
              let paisValue = PAIS_SIN_ESPECIFICAR;
              if (telefonoValue && isValidPhoneNumber(telefonoValue)) {
                try {
                  const parsed = parsePhoneNumber(telefonoValue);
                  const countryCode = parsed?.country;
                  paisValue = countryCode
                    ? COUNTRY_CODE_TO_AIRTABLE[countryCode] ?? PAIS_SIN_ESPECIFICAR
                    : PAIS_SIN_ESPECIFICAR;
                } catch {
                  /* ignorar si no se puede parsear */
                }
              }
              setFormData((prev) => ({
                ...prev,
                telefono: telefonoValue,
                pais: paisValue,
              }));
              setTouched((prev) => ({ ...prev, telefono: true }));
              if (telefonoValue && isValidPhoneNumber(telefonoValue)) {
                setErrors((prev) => ({ ...prev, telefono: undefined }));
              }
            }}
            onBlur={handleBlur}
            placeholder={t("placeholder.telefono")}
            className="phone-input-wrapper-contact"
            numberInputProps={{
              className: "phone-input-contact",
              id: "telefono",
              name: "telefono",
              "aria-invalid": touched.telefono && !!errors.telefono,
              "aria-describedby": errors.telefono ? "telefono-error" : undefined,
              required: true,
            }}
            countrySelectProps={{
              className: "phone-country-select-contact",
            }}
          />
        </div>
        {touched.telefono && errors.telefono && (
          <p
            id="telefono-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.telefono}
          </p>
        )}
      </div>

      {/* Empresa */}
      <div className="space-y-1">
        <label
          htmlFor="empresa"
          className="block text-sm font-medium text-gray-700"
        >
          {t("empresa")} <span className="text-red-500">*</span>
        </label>
        <input
          id="empresa"
          type="text"
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("placeholder.empresa")}
          className={getInputClassName("empresa")}
          aria-invalid={touched.empresa && !!errors.empresa}
          aria-describedby={errors.empresa ? "empresa-error" : undefined}
          required
        />
        {touched.empresa && errors.empresa && (
          <p
            id="empresa-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.empresa}
          </p>
        )}
      </div>

      {/* Web */}
      <div className="space-y-1">
        <label
          htmlFor="web"
          className="block text-sm font-medium text-gray-700"
        >
          {t("web")}
        </label>
        <input
          id="web"
          type="url"
          name="web"
          value={formData.web}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("placeholder.web")}
          className={getInputClassName("web")}
          aria-invalid={touched.web && !!errors.web}
          aria-describedby={errors.web ? "web-error" : undefined}
        />
        {touched.web && errors.web && (
          <p
            id="web-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.web}
          </p>
        )}
      </div>

      {/* ¿Qué servicios te interesan? */}
      <div className="space-y-2 col-span-1 md:col-span-2">
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700">
            {t("buscandoTalento")} <span className="text-red-500">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-3 text-sm text-black mt-2">
            <div className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-200 hover:border-[#4ECDC4] transition-colors">
              <input
                type="checkbox"
                id="contratarPersonal"
                name="buscandoTalento"
                value="Quiero contratar personal para mi empresa"
                checked={formData.buscandoTalento.includes("Quiero contratar personal para mi empresa")}
                onChange={handleChange}
                className="w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-describedby="servicios-description"
              />
              <label
                htmlFor="contratarPersonal"
                className="ml-2 text-sm font-medium"
              >
                {t("opciones.contratarPersonal")}
              </label>
            </div>
            <div className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-200 hover:border-[#4ECDC4] transition-colors">
              <input
                type="checkbox"
                id="talentoProyecto"
                name="buscandoTalento"
                value="Necesito talento para un proyecto"
                checked={formData.buscandoTalento.includes("Necesito talento para un proyecto")}
                onChange={handleChange}
                className="w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-describedby="servicios-description"
              />
              <label
                htmlFor="talentoProyecto"
                className="ml-2 text-sm font-medium"
              >
                {t("opciones.talentoProyecto")}
              </label>
            </div>
            <div className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-200 hover:border-[#4ECDC4] transition-colors">
              <input
                type="checkbox"
                id="subcontratar"
                name="buscandoTalento"
                value="Me interesa sub-contratar talento"
                checked={formData.buscandoTalento.includes("Me interesa sub-contratar talento")}
                onChange={handleChange}
                className="w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-describedby="servicios-description"
              />
              <label
                htmlFor="subcontratar"
                className="ml-2 text-sm font-medium"
              >
                {t("opciones.subcontratar")}
              </label>
            </div>
            <div className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-200 hover:border-[#4ECDC4] transition-colors">
              <input
                type="checkbox"
                id="conversar"
                name="buscandoTalento"
                value="Me interesa conversar y saber más detalles"
                checked={formData.buscandoTalento.includes("Me interesa conversar y saber más detalles")}
                onChange={handleChange}
                className="w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-describedby="servicios-description"
              />
              <label
                htmlFor="conversar"
                className="ml-2 text-sm font-medium"
              >
                {t("opciones.conversar")}
              </label>
            </div>
          </div>
          {touched.buscandoTalento && errors.buscandoTalento && (
            <p
              id="buscandoTalento-error"
              className="text-red-500 text-xs mt-1"
              aria-live="polite"
            >
              {errors.buscandoTalento}
            </p>
          )}
          <div id="servicios-description" className="sr-only">
            Selecciona los servicios que te interesan
          </div>
        </fieldset>
      </div>

      {/* ¿Qué perfiles estás buscando? - Input de texto */}
      <div className="space-y-1 col-span-1 md:col-span-2">
        <label
          htmlFor="perfiles"
          className="block text-sm font-medium text-gray-700"
        >
          {t("perfilBuscando")}
        </label>
        <input
          id="perfiles"
          type="text"
          name="perfiles"
          value={formData.perfiles}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("placeholder.perfiles")}
          className={getInputClassName("perfiles")}
          aria-invalid={touched.perfiles && !!errors.perfiles}
          aria-describedby={errors.perfiles ? "perfiles-error" : undefined}
        />
        {touched.perfiles && errors.perfiles && (
          <p
            id="perfiles-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.perfiles}
          </p>
        )}
      </div>

      {/* reCAPTCHA v3 es invisible - se ejecuta al enviar */}
      {errors.recaptcha && (
        <div className="col-span-1 md:col-span-2">
          <p className="text-red-500 text-xs" aria-live="polite">
            {errors.recaptcha}
          </p>
        </div>
      )}

      {/* Botón de envío */}
      <div className="col-span-1 md:col-span-2 mt-2">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#4ECDC4] to-linkIt-300 hover:from-[#2AB7CA] hover:to-[#4ECDC4] text-white font-bold py-3 px-6 rounded-md transition-all w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting ? (
            <>
              {t("enviando")}
              <svg
                className="animate-spin ml-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </>
          ) : (
            <>
              {t("empezarAhora")}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

const ContactFormWithRecaptcha = () => {
  const { executeGoogleReCaptcha } = useGoogleReCaptcha(RECAPTCHA_SITE_KEY!);
  return <ContactFormBase executeRecaptcha={executeGoogleReCaptcha} />;
};

const ContactForm = () => {
  if (RECAPTCHA_SITE_KEY) {
    return <ContactFormWithRecaptcha />;
  }
  return <ContactFormBase />;
};

export default ContactForm;
