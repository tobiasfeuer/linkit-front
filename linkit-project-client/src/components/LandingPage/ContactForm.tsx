import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import "react-phone-number-input/style.css";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

// Traducciones específicas para este componente
const translations = {
  es: {
    nombre: "Nombre",
    apellido: "Apellido",
    correo: "Correo corporativo",
    telefono: "Número de teléfono",
    empresa: "Empresa",
    pais: "País de la empresa",
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
      pais: "Ingresa el país",
      seleccionar: "Seleccionar perfiles",
      buscar: "Buscar perfiles...",
    },
    opciones: {
      buscarTalento: "Buscar talento IT",
      contratarTalento: "Contratar talento IT",
      mejorarProductividad:
        "Mejorar la productividad y fidelización de tu talento",
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
      terminos: "Debes aceptar los términos y condiciones",
      generico:
        "Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.",
      faltanDatos: "Faltan datos del formulario",
    },
  },
  en: {
    nombre: "First Name",
    apellido: "Last Name",
    correo: "Corporate Email",
    telefono: "Phone Number",
    empresa: "Company",
    pais: "Company Country",
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
      pais: "Enter country",
      seleccionar: "Select profiles",
      buscar: "Search profiles...",
    },
    opciones: {
      buscarTalento: "Find IT talent",
      contratarTalento: "Hire IT talent",
      mejorarProductividad: "Improve productivity and retention of your talent",
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
      terminos: "You must accept the terms and conditions",
      generico: "There was an error submitting the form. Please try again.",
      faltanDatos: "Missing form data",
    },
  },
};

interface FormData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  empresa: string;
  pais: string;
  buscandoTalento: string[];
  perfiles: string[];
  aceptaTerminos: boolean;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  empresa?: string;
  pais?: string;
  perfiles?: string;
  aceptaTerminos?: string;
  buscandoTalento?: string;
}

interface Technology {
  name: string;
}

const ContactForm = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    empresa: "",
    pais: "",
    buscandoTalento: [],
    perfiles: [],
    aceptaTerminos: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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

  // Obtener las tecnologías del stack desde Redux
  const allStackTechnologies = useSelector(
    (state: any) => (state.resources?.stackTechnologies as Technology[]) || []
  );

  // Cargar datos guardados del localStorage al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem("talentFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Validar el formulario
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Validar campos requeridos
    if (!formData.nombre) newErrors.nombre = t("errores.requerido");
    if (!formData.apellido) newErrors.apellido = t("errores.requerido");
    if (!formData.empresa) newErrors.empresa = t("errores.requerido");
    if (!formData.pais) newErrors.pais = t("errores.requerido");
    if (formData.perfiles.length === 0) {
      newErrors.perfiles = t("errores.requerido");
    }
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
    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = t("errores.terminos");
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

  const handleProfileToggle = (profileName: string) => {
    setFormData((prev) => {
      let updatedProfiles = [...prev.perfiles];

      if (updatedProfiles.includes(profileName)) {
        updatedProfiles = updatedProfiles.filter((p) => p !== profileName);
      } else {
        updatedProfiles.push(profileName);
      }

      const updatedData = { ...prev, perfiles: updatedProfiles };

      // Si el usuario ha interactuado con el campo, actualizar los errores
      setErrors((prevErrors) => ({
        ...prevErrors,
        perfiles:
          updatedProfiles.length === 0 ? t("errores.requerido") : undefined,
      }));

      return updatedData;
    });

    setTouched((prev) => ({
      ...prev,
      perfiles: true,
    }));
  };

  const handleRemoveProfile = (profileName: string) => {
    setFormData((prev) => {
      const updatedProfiles = prev.perfiles.filter((p) => p !== profileName);

      const updatedData = { ...prev, perfiles: updatedProfiles };

      // Si el usuario borra todos los perfiles, marcar como error
      setErrors((prevErrors) => ({
        ...prevErrors,
        perfiles:
          updatedProfiles.length === 0 ? t("errores.requerido") : undefined,
      }));

      return updatedData;
    });

    setTouched((prev) => ({
      ...prev,
      perfiles: true,
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

  const fallbackProfiles = [
    { name: "Frontend Developer" },
    { name: "Backend Developer" },
    { name: "Fullstack Developer" },
    { name: "DevOps Engineer" },
    { name: "QA Engineer" },
    { name: "Mobile Developer" },
    { name: "Data Scientist/Engineer" },
    { name: "UI/UX Designer" },
    { name: "Java: Springboot" },
  ];

  const profileOptions =
    allStackTechnologies && allStackTechnologies.length > 0
      ? allStackTechnologies
      : fallbackProfiles;

  // Filtrar perfiles según el término de búsqueda
  const filteredProfiles = profileOptions.filter((tech) =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      const confirmMessage = await Swal.fire({
        icon: "info",
        title: t("confirmarServicios"),
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonColor: "#01A28B",
        confirmButtonText: t("confirmar"),
        cancelButtonText: t("cancelar"),
        reverseButtons: true,
      });

      if (confirmMessage.isConfirmed) {
        const { aceptaTerminos, ...formDataToSend } = formData;
        const dataToSend = {
          ...formDataToSend,
          perfil: formDataToSend.perfiles.join(", "),
        };
        delete (dataToSend as any).perfiles;
        // Intentar con el endpoint de producción como fallback
        try {
          const prodResponse = await axios.post(
            `${import.meta.env.VITE_ENDPOINT_URL}/resources/contactus/form`,
            dataToSend,
            {
              headers: {
                Authorization: `Bearer ${SUPERADMN_ID}`,
                "Accept-Language":
                  sessionStorage.getItem("lang") || currentLang,
              },
            }
          );

          if (prodResponse.status === 200) {
            // Limpiar el formulario y localStorage después del envío exitoso
            setFormData({
              nombre: "",
              apellido: "",
              correo: "",
              telefono: "",
              empresa: "",
              pais: "",
              buscandoTalento: [],
              perfiles: [],
              aceptaTerminos: false,
            });
            pushToDataLayer();
            localStorage.removeItem("talentFormData");
            navigate("/Gracias");
          }
        } catch (prodError: any) {
          setIsSubmitting(false);

          // Mostrar información detallada del error
          const errorMessage =
            prodError.response?.data?.message || prodError.message;
          const errorDetails =
            prodError.response?.data?.error || "No hay detalles adicionales";

          Swal.fire({
            customClass: {
              confirmButton: "background-button",
            },
            title: "Error al enviar el formulario",
            html: `
                <p>${errorMessage}</p>
                <p class="text-sm text-gray-500 mt-2">Detalles técnicos: ${errorDetails}</p>
              `,
            icon: "error",
            showConfirmButton: true,
            buttonsStyling: false,
          });

          console.error(`${t("errores.faltanDatos")}:`, prodError);
          console.error("Respuesta completa:", prodError.response?.data);
        }
      } else {
        setIsSubmitting(false);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      Swal.fire({
        customClass: {
          confirmButton: "background-button",
        },
        title: (error as Error).message,
        icon: "error",
        showConfirmButton: true,
        buttonsStyling: false,
      });
      console.error(`${t("errores.faltanDatos")}: ${(error as Error).message}`);
    }
  };

  // Clase condicional para campos con error
  
  

  
  
  
  
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
            defaultCountry="US"
            value={formData.telefono}
            onChange={(value) => {
              handleChange({
                target: { name: "telefono", value: value || "" },
              } as React.ChangeEvent<HTMLInputElement>);
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

      {/* País de la empresa */}
      <div className="space-y-1">
        <label
          htmlFor="pais"
          className="block text-sm font-medium text-gray-700"
        >
          {t("pais")} <span className="text-red-500">*</span>
        </label>
        <input
          id="pais"
          type="text"
          name="pais"
          value={formData.pais}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("placeholder.pais")}
          className={getInputClassName("pais")}
          aria-invalid={touched.pais && !!errors.pais}
          aria-describedby={errors.pais ? "pais-error" : undefined}
          required
        />
        {touched.pais && errors.pais && (
          <p
            id="pais-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.pais}
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
                id="buscarTalento"
                name="buscandoTalento"
                value="Buscar talento IT"
                checked={formData.buscandoTalento.includes("Buscar talento IT")}
                onChange={handleChange}
                className="w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-describedby="servicios-description"
              />
              <label
                htmlFor="buscarTalento"
                className="ml-2 text-sm font-medium"
              >
                {t("opciones.buscarTalento")}
              </label>
            </div>
            <div className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-200 hover:border-[#4ECDC4] transition-colors">
              <input
                type="checkbox"
                id="contratarTalento"
                name="buscandoTalento"
                value="Contratar talento"
                checked={formData.buscandoTalento.includes("Contratar talento")}
                onChange={handleChange}
                className="w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-describedby="servicios-description"
              />
              <label
                htmlFor="contratarTalento"
                className="ml-2 text-sm font-medium"
              >
                {t("opciones.contratarTalento")}
              </label>
            </div>
            <div className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-200 hover:border-[#4ECDC4] transition-colors col-span-2">
              <input
                type="checkbox"
                id="mejorarProductividad"
                name="buscandoTalento"
                value="Mejorar la productividad y fidelización de tu talento"
                checked={formData.buscandoTalento.includes(
                  "Mejorar la productividad y fidelización de tu talento"
                )}
                onChange={handleChange}
                className="w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                aria-describedby="servicios-description"
              />
              <label
                htmlFor="mejorarProductividad"
                className="ml-2 text-sm font-medium"
              >
                {t("opciones.mejorarProductividad")}
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

      {/* ¿Qué perfiles estás buscando? - Multiselect */}
      <div className="space-y-1 col-span-1 md:col-span-2">
        <label
          htmlFor="perfiles"
          className="block text-sm font-medium text-gray-700"
        >
          {t("perfilBuscando")} <span className="text-red-500">*</span>
        </label>
        <div className="relative profile-dropdown">
          {/* Mostrar perfiles seleccionados como tags */}
          <div
            className={`flex flex-wrap gap-2 min-h-[42px] p-2 border rounded-md ${
              touched.perfiles && errors.perfiles
                ? "border-red-500 bg-red-50"
                : touched.perfiles && !errors.perfiles
                ? "border-green-500 bg-green-50"
                : "border-gray-300"
            } cursor-pointer`}
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            {formData.perfiles.length > 0 ? (
              formData.perfiles.map((profile) => (
                <div
                  key={profile}
                  className="flex items-center bg-[#4ECDC4] bg-opacity-20 text-[#01A28B] px-2 py-1 rounded-md text-sm"
                >
                  {profile}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProfile(profile);
                    }}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    aria-label={`Eliminar ${profile}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            ) : (
              <span className="text-gray-400 text-sm py-1">
                {t("placeholder.seleccionar")}
              </span>
            )}
          </div>

          {/* Dropdown para seleccionar perfiles */}
          {isProfileDropdownOpen && (
             <div className="absolute z-50 left-0 top-full w-full border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto bg-white">
              <div className="sticky top-0 bg-white p-2 border-b">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("placeholder.buscar")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-black"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="py-1">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((tech) => (
                    <div
                      key={tech.name}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                        formData.perfiles.includes(tech.name)
                          ? "bg-gray-100"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProfileToggle(tech.name);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.perfiles.includes(tech.name)}
                        onChange={() => {}}
                        className="mr-2 h-4 w-4 text-[#010202] focus:ring-[#4ECDC4]"
                      />
                      <span className="text-sm text-black">{tech.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </div>
          )}

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
      </div>

      {/* Términos y condiciones */}
      <div className="col-span-1 md:col-span-2">
        <div
          className={`flex items-start p-3 rounded-md border ${
            touched.aceptaTerminos && errors.aceptaTerminos
              ? "bg-red-50 border-red-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <input
            type="checkbox"
            id="terminos"
            name="aceptaTerminos"
            checked={formData.aceptaTerminos}
            onChange={handleChange}
            onBlur={handleBlur}
            className="mt-1 w-4 h-4 text-[#4ECDC4] focus:ring-[#4ECDC4] rounded"
            aria-invalid={touched.aceptaTerminos && !!errors.aceptaTerminos}
            aria-describedby={
              errors.aceptaTerminos ? "terminos-error" : undefined
            }
            required
          />
          <label htmlFor="terminos" className="ml-2 text-sm text-gray-700">
            {t("terminos")}{" "}
            <span className="text-[#4ECDC4] hover:underline cursor-pointer font-medium">
              {t("terminosLink")}
            </span>{" "}
            {t("y")}{" "}
            <span className="text-[#4ECDC4] hover:underline cursor-pointer font-medium">
              {t("privacidadLink")}
            </span>{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>
        {touched.aceptaTerminos && errors.aceptaTerminos && (
          <p
            id="terminos-error"
            className="text-red-500 text-xs mt-1"
            aria-live="polite"
          >
            {errors.aceptaTerminos}
          </p>
        )}
      </div>

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

export default ContactForm;
