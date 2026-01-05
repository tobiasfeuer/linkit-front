import { FormEvent, useState, useEffect, useMemo, ReactNode } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import Select from "react-select";
import CloudinaryUploadWidget from "../Services/cloudinaryWidget";
import Loading from "../Loading/Loading";
import { getFormConfig, getRecruiterBySlug, submitRecruiterApplication } from "../Services/recruiterForm.service";
import { FormFieldConfig, RecruiterData, FormData, FormErrors } from "./types";
import { SelectCountryFormEs } from "../Talentos/ModulosTalentos/ModuloTalentosG/JobCard/jobDescription/job-form/jobFormCountry/JobFormSelectCountry";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./RecruiterApplicationForm.css";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;

function RecruiterApplicationForm() {
  const { recruiterSlug } = useParams<{ recruiterSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || sessionStorage.getItem("lang") || "es";

  const [formConfig, setFormConfig] = useState<FormFieldConfig[]>([]);
  const [recruiterData, setRecruiterData] = useState<RecruiterData | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filePublicId, setFilePublicId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [country, setCountry] = useState<{ value: string; label: string } | null>(null);

  // Obtener tecnologías y stack técnico del store (si están disponibles)
  const [technologies, setTechnologies] = useState<Array<{ value: string; label: string }>>([]);
  const [techStack, setTechStack] = useState<Array<{ value: string; label: string }>>([]);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const roleCodeParam = useMemo(() => {
    const param =
      searchParams.get("roleCode") ||
      searchParams.get("recruitmentRoleCode") ||
      "";
    return param.trim();
  }, [searchParams]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!recruiterSlug) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "URL de recruiter no válida",
          confirmButtonColor: "#01A28B",
        }).then(() => navigate("/"));
        return;
      }

      try {
        setInitialLoading(true);

        // Obtener datos del recruiter
        const roleCodeQuery = roleCodeParam || undefined;
        const recruiter = await getRecruiterBySlug(recruiterSlug, roleCodeQuery);
        
        if (!recruiter.active) {
          Swal.fire({
            icon: "warning",
            title: "Formulario no disponible",
            text: "Este formulario no está disponible actualmente",
            confirmButtonColor: "#01A28B",
          }).then(() => navigate("/"));
          return;
        }

        setRecruiterData(recruiter);

        // Obtener configuración del formulario
        const config = await getFormConfig("RecruiterFormWebView", lang);
        // Ordenar por el campo 'order' que viene del backend
        const sortedConfig = config.sort((a, b) => {
          // Asegurar que el orden sea correcto
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // Si no tiene order, mantener el orden del backend
          return 0;
        });
        const reversedConfig = sortedConfig.reverse();
        setFormConfig(reversedConfig);

        // Obtener tecnologías y stack técnico
        try {
          const [techResponse, stackResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_ENDPOINT_URL}/resources/stackList`, {
              headers: {
                Authorization: `Bearer ${SUPERADMN_ID}`,
                "Accept-Language": lang,
              },
            }),
            axios.get(`${import.meta.env.VITE_ENDPOINT_URL}/resources/techStack`, {
              headers: {
                Authorization: `Bearer ${SUPERADMN_ID}`,
                "Accept-Language": lang,
              },
            }),
          ]);

          setTechnologies(
            techResponse.data.map((tech: any) => ({ value: tech.name, label: tech.name }))
          );
          setTechStack(
            stackResponse.data.map((tech: any) => ({ value: tech.name, label: tech.name }))
          );
        } catch (error) {
          console.error("Error fetching technologies:", error);
        }

        // Inicializar formData con valores vacíos
        const initialData: FormData = {};
        let roleCodeField: FormFieldConfig | undefined;

        config.forEach((field) => {
          if (field.type === "multi-select") {
            initialData[field.fieldName] = [];
          } else {
            initialData[field.fieldName] = "";
          }

          if (isRoleCodeFieldCheck(field)) {
            roleCodeField = field;
          }
        });
        
        // Asignar recruiterSlug al formData si existe el campo
        if (recruiterSlug) {
          initialData.recruiterSlug = recruiterSlug;
        }
        
        // Asignar el nombre completo del recruiter al campo "Recruiter" si existe
        // El campo puede llamarse "recruiter" o tener otro nombre según la configuración de Airtable
        const recruiterField = config.find(
          (field) => 
            field.fieldName.toLowerCase() === "recruiter" || 
            field.airtableField.toLowerCase() === "recruiter"
        );
        if (recruiterField && recruiter) {
          const fullName = recruiter.lastName 
            ? `${recruiter.name} ${recruiter.lastName}`.trim()
            : recruiter.name;
          initialData[recruiterField.fieldName] = fullName;
        }
        const roleCodeValue = (roleCodeParam || recruiter.recruitmentRoleCode || "").trim();
        if (roleCodeField && roleCodeValue) {
          initialData[roleCodeField.fieldName] = roleCodeValue;
        }
        
        setFormData(initialData);
      } catch (error: any) {
        console.error("Error loading form:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al cargar el formulario",
          confirmButtonColor: "#01A28B",
        }).then(() => navigate("/"));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [recruiterSlug, roleCodeParam, lang, navigate]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Limpiar error del campo
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Función helper para traducir labels (disponible para validateField y renderField)
  const translateLabel = (label: string): string => {
    if (!label) return "";
    // Si existe traducción, usarla; si no, devolver el label original
    if (i18n.exists(label)) {
      return t(label);
    }
    return label;
  };

  const validateField = (field: FormFieldConfig, value: any): string => {
    const lowerFieldName = field.fieldName.toLowerCase();
    const lowerAirtableField = field.airtableField.toLowerCase();
    const isCvField =
      lowerFieldName === "cv" ||
      lowerAirtableField === "cv" ||
      lowerFieldName.includes("curriculum") ||
      lowerAirtableField.includes("curriculum") ||
      field.type === "file";

    if (field.required && !isCvField && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${translateLabel(field.label)} ${t("es requerido")}`;
    }

    if (!value) return "";

    // Validación para Nombre y Apellido (solo letras y caracteres permitidos)
    const isNameField =
      lowerFieldName.includes("nombre") ||
      lowerFieldName.includes("firstname") ||
      lowerFieldName.includes("name") && !lowerFieldName.includes("company") && !lowerFieldName.includes("user");
    const isLastNameField =
      lowerFieldName.includes("apellido") ||
      lowerFieldName.includes("lastname") ||
      lowerAirtableField.includes("apellido") ||
      lowerAirtableField.includes("lastname");

    if ((isNameField || isLastNameField) && typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue.length < 2) {
        return `${field.label} ${t("debe tener al menos")} 2 ${t("caracteres")}`;
      }
      if (trimmedValue.length > 50) {
        return `${field.label} ${t("debe tener máximo")} 50 ${t("caracteres")}`;
      }
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,50}$/;
      if (!nameRegex.test(trimmedValue)) {
        return `${field.label} ${t("solo puede contener letras, espacios, guiones y apóstrofes (2-50 caracteres)")}`;
      }
    }

    // Validación para LinkedIn (formato más flexible)
    const isLinkedInField =
      lowerFieldName.includes("linkedin") ||
      lowerAirtableField.includes("linkedin");
    
    if (isLinkedInField && typeof value === "string") {
      const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
      if (!linkedInRegex.test(value.trim())) {
        return `${translateLabel(field.label)} ${t("debe tener el formato: www.linkedin.com/in/tu-perfil")}`;
      }
    }

    if (field.validation) {
      if (field.type === "text" || field.type === "textarea") {
        if (field.validation.min && value.length < field.validation.min) {
          return `${translateLabel(field.label)} ${t("debe tener al menos")} ${field.validation.min} ${t("caracteres")}`;
        }
        if (field.validation.max && value.length > field.validation.max) {
          return `${translateLabel(field.label)} ${t("debe tener máximo")} ${field.validation.max} ${t("caracteres")}`;
        }
      }

      if (field.type === "number") {
        const numValue = Number(value);
        if (field.validation.min && numValue < field.validation.min) {
          return `${translateLabel(field.label)} ${t("debe ser al menos")} ${field.validation.min}`;
        }
        if (field.validation.max && numValue > field.validation.max) {
          return `${translateLabel(field.label)} ${t("debe ser máximo")} ${field.validation.max}`;
        }
      }
    }

    // Validación para Disponibilidad (availability)
    const isAvailabilityField =
      lowerFieldName.includes("availability") ||
      lowerFieldName.includes("disponibilidad") ||
      lowerAirtableField.includes("availability") ||
      lowerAirtableField.includes("disponibilidad");
    
    if (isAvailabilityField && typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue.length < 5) {
        return `${translateLabel(field.label)} ${t("debe tener al menos")} 5 ${t("caracteres")}`;
      }
      if (trimmedValue.length > 200) {
        return `${translateLabel(field.label)} ${t("debe tener máximo")} 200 ${t("caracteres")}`;
      }
      const contentRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,!?-]{5,200}$/;
      if (!contentRegex.test(trimmedValue)) {
        return `${translateLabel(field.label)} ${t("contiene caracteres no permitidos")}`;
      }
    }

    // Validación para Razón para cambiar (whyChange/reason)
    const isReasonField =
      lowerFieldName.includes("reason") ||
      lowerFieldName.includes("razon") ||
      lowerFieldName.includes("whychange") ||
      lowerAirtableField.includes("reason") ||
      lowerAirtableField.includes("razon") ||
      lowerAirtableField.includes("why change");
    
    if (isReasonField && typeof value === "string") {
      const trimmedValue = value.trim();
      if (trimmedValue.length < 10) {
        return `${translateLabel(field.label)} ${t("debe tener al menos")} 10 ${t("caracteres")}`;
      }
      if (trimmedValue.length > 500) {
        return `${translateLabel(field.label)} ${t("debe tener máximo")} 500 ${t("caracteres")}`;
      }
      const contentRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,!?-]{10,500}$/;
      if (!contentRegex.test(trimmedValue)) {
        return `${translateLabel(field.label)} ${t("contiene caracteres no permitidos")}`;
      }
    }

    // Validación para Expectativa salarial (salary)
    const isSalaryField =
      lowerFieldName.includes("salary") ||
      lowerFieldName.includes("salario") ||
      lowerAirtableField.includes("salary") ||
      lowerAirtableField.includes("salario");
    
    if (isSalaryField && field.type === "number" && value) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${translateLabel(field.label)} ${t("debe ser un número válido")}`;
      }
      if (numValue < 0) {
        return `${translateLabel(field.label)} ${t("no puede ser negativo")}`;
      }
      if (numValue > 1000000) {
        return `${translateLabel(field.label)} ${t("no puede ser mayor a 1,000,000 USD")}`;
      }
    }

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t("Email inválido");
    }

    if (field.type === "url" && !isLinkedInField && !/^https?:\/\/.+\..+/.test(value)) {
      return t("URL inválida");
    }

    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    formConfig.forEach((field) => {
      const value = formData[field.fieldName];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const isRecruiterFieldCheck = (field: FormFieldConfig) =>
    field.fieldName.toLowerCase() === "recruiter" ||
    field.airtableField.toLowerCase() === "recruiter";

  const isRoleCodeFieldCheck = (field: FormFieldConfig) => {
    const name = field.fieldName.toLowerCase();
    const airtable = field.airtableField.toLowerCase();
    return (
      name.includes("role code") ||
      airtable.includes("role code") ||
      name.includes("recruitment role") ||
      airtable.includes("recruitment role") ||
      name.includes("rol al que aplica") ||
      airtable.includes("rol al que aplica")
    );
  };

  const normalizedRoleCode = useMemo(() => {
    const fromQuery = roleCodeParam;
    const fromRecruiter = recruiterData?.recruitmentRoleCode?.trim();
    return (fromQuery || fromRecruiter || "").trim();
  }, [roleCodeParam, recruiterData?.recruitmentRoleCode]);


  const sanitizeString = (value: any): string | undefined => {
    if (value === undefined || value === null) return undefined;
    const str = String(value).trim();
    return str === "" ? undefined : str;
  };

  const ensureStringArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            if ("value" in item && item.value !== undefined && item.value !== null) {
              return String(item.value).trim();
            }
            if ("label" in item && item.label !== undefined && item.label !== null) {
              return String(item.label).trim();
            }
          }
          return "";
        })
        .filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return [];
  };

  const buildSubmissionPayload = (): { payload: Record<string, any>; error?: string } => {
    const stack = ensureStringArray(formData.candidateStackPmTools);
    const techStack = ensureStringArray(formData.whatWouldBeYourAreaOfExpertise);

    const salaryRaw =
      formData.salaryExpectationusd ??
      formData.salaryExpectationUsd ??
      formData.salaryExpectationUSD ??
      formData.salaryExpectationUsD;

    let salary: number | undefined;
    if (salaryRaw !== undefined && salaryRaw !== null && String(salaryRaw).trim() !== "") {
      const parsed = Number(salaryRaw);
      if (Number.isNaN(parsed)) {
        return { payload: {}, error: t("La expectativa salarial debe ser un número válido.") };
      }
      if (parsed < 0) {
        return { payload: {}, error: t("La expectativa salarial no puede ser negativa.") };
      }
      if (parsed > 1000000) {
        return { payload: {}, error: t("La expectativa salarial no puede ser mayor a 1,000,000 USD.") };
      }
      salary = parsed;
    }

    // Buscar el campo de teléfono en formConfig para obtener su airtableField
    const phoneField = formConfig.find(
      (field) =>
        field.fieldName.toLowerCase().includes("phone") ||
        field.fieldName.toLowerCase().includes("telefono") ||
        field.fieldName.toLowerCase().includes("tel") ||
        field.airtableField.toLowerCase().includes("phone") ||
        field.airtableField.toLowerCase().includes("telefono") ||
        field.airtableField.toLowerCase().includes("tel")
    );
    
    const phoneFieldName = phoneField?.fieldName;
    const phoneAirtableField = phoneField?.airtableField || phoneFieldName || "Phone";
    
    // Obtener el valor del teléfono directamente de formData
    const phoneRawValue = phoneFieldName ? formData[phoneFieldName] : undefined;
    
    // Formatear el teléfono para Airtable tipo "Phone number"
    // Airtable acepta números en formato internacional con el signo + (ej: +543492580666)
    // También acepta formato estadounidense (415) 555-9876, pero el formato internacional es más universal
    // PhoneInput ya devuelve el formato internacional correcto (ej: +255455455788)
    let phoneValue: string | undefined;
    if (phoneRawValue !== undefined && phoneRawValue !== null) {
      const phoneStr = String(phoneRawValue).trim();
      if (phoneStr !== "") {
        // Airtable Phone number field acepta el formato internacional con +
        // El formato +[código país][número] es el estándar y debería funcionar
        // Ejemplo: +255455455788, +543492580666
        phoneValue = phoneStr;
      }
    }

    const payload: Record<string, any> = {
      code: sanitizeString(formData.rolAlQueAplica ?? normalizedRoleCode),
      stack,
      techStack,
      email: sanitizeString(formData.candidateEmail ?? formData.email),
      availability: sanitizeString(formData.whenToStartAvailability),
      reason: sanitizeString(formData.whyChange),
      salary,
      english: sanitizeString(formData.englishLevel),
      country: sanitizeString(formData.country),
      linkedin: sanitizeString(formData.linkedIn ?? formData.linkedin),
      firstName: sanitizeString(formData.nombre ?? formData.firstName),
      lastName: sanitizeString(formData.apellido ?? formData.lastName),
      recruiterSlug: sanitizeString(formData.recruiterSlug ?? recruiterSlug),
      recruiter: sanitizeString(formData.recruiter),
    };

    if (phoneField && phoneAirtableField && phoneValue && phoneValue.trim() !== "") {
      payload[phoneAirtableField] = phoneValue;
      
      if (phoneFieldName && phoneFieldName !== phoneAirtableField) {
        payload[phoneFieldName] = phoneValue;
      }
    }

    // Agregar todos los demás campos de formConfig que no están mapeados explícitamente
    // Esto asegura que campos personalizados también se envíen a Airtable
    formConfig.forEach((field) => {
      // Saltar campos que ya están mapeados o son internos
      const isMappedField = 
        field.fieldName === "rolAlQueAplica" ||
        field.fieldName === "candidateStackPmTools" ||
        field.fieldName === "whatWouldBeYourAreaOfExpertise" ||
        field.fieldName === "salaryExpectationusd" ||
        field.fieldName === "salaryExpectationUsd" ||
        field.fieldName === "salaryExpectationUSD" ||
        field.fieldName === "salaryExpectationUsD" ||
        field.fieldName === "candidateEmail" ||
        field.fieldName === "email" ||
        field.fieldName === "whenToStartAvailability" ||
        field.fieldName === "whyChange" ||
        field.fieldName === "englishLevel" ||
        field.fieldName === "country" ||
        field.fieldName === "linkedIn" ||
        field.fieldName === "linkedin" ||
        field.fieldName === "nombre" ||
        field.fieldName === "firstName" ||
        field.fieldName === "apellido" ||
        field.fieldName === "lastName" ||
        field.fieldName === "recruiterSlug" ||
        field.fieldName === "recruiter" ||
        field.fieldName === "cV" ||
        field.fieldName === "cv" ||
        field.fieldName.toLowerCase() === "recruiterslug" ||
        phoneFieldName === field.fieldName;

      if (!isMappedField && field.fieldName in formData) {
        const fieldValue = formData[field.fieldName];
        const airtableFieldName = field.airtableField || field.fieldName;
        
        // Procesar según el tipo de campo
        if (field.type === "multi-select") {
          const arrayValue = ensureStringArray(fieldValue);
          if (arrayValue.length > 0) {
            payload[airtableFieldName] = arrayValue;
          }
        } else if (fieldValue !== undefined && fieldValue !== null && String(fieldValue).trim() !== "") {
          payload[airtableFieldName] = sanitizeString(fieldValue) || String(fieldValue).trim();
        }
      }
    });

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

    return { payload };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: "Formulario incompleto",
        text: "Por favor completa todos los campos requeridos",
        confirmButtonColor: "#01A28B",
      });
      return;
    }

    const { payload, error: payloadError } = buildSubmissionPayload();
    if (payloadError) {
      Swal.fire({
        icon: "error",
        title: "Dato inválido",
        text: payloadError,
        confirmButtonColor: "#01A28B",
      });
      return;
    }

    try {
      setLoading(true);
    const cvAttachments: any[] = [];

    if (Array.isArray(formData.cV)) {
      formData.cV.forEach((attachment: any) => {
        if (!attachment) return;
        if (typeof attachment === "string") {
          cvAttachments.push({
            url: attachment,
            filename: attachment.split("/").pop() || `cv-${Date.now()}`,
          });
          return;
        }
        if (attachment.url && attachment.filename) {
          cvAttachments.push({
            url: attachment.url,
            filename: attachment.filename,
          });
          return;
        }
        if (attachment.secure_url) {
          cvAttachments.push({
            url: attachment.secure_url,
            filename:
              attachment.original_filename ||
              attachment.path ||
              `cv-${Date.now()}`,
          });
        }
      });
    }

    if (filePublicId) {
      cvAttachments.unshift({
        filename: fileName || `cv-${Date.now()}`,
        url: `https://res.cloudinary.com/dquhriqz3/image/upload/${filePublicId}`,
      });
    }

    if (cvAttachments.length) {
      payload.cv = cvAttachments;
    }

      const recruiterSlugForSubmit =
        (payload.recruiterSlug as string | undefined) ?? recruiterSlug ?? "";

      await submitRecruiterApplication(payload, recruiterSlugForSubmit);

      Swal.fire({
        icon: "success",
        title: t("¡Postulación enviada!"),
        text: t("Tu postulación ha sido enviada exitosamente"),
        confirmButtonText: "OK",
        confirmButtonColor: "#01A28B",
      }).then(() => {
        navigate("/Gracias");
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const responseData = error.response?.data;
      const lang = i18n.language || sessionStorage.getItem("lang") || "es";
      
      let errorTitle = t("Error al enviar la postulación");
      let errorMessage = "";
      
      if (responseData) {
        if (typeof responseData === "object") {
          const translatedMessage = lang === "en" ? responseData.en : responseData.es;
          errorMessage = translatedMessage || responseData.message || t("Ocurrió un error al enviar tu postulación. Por favor intenta más tarde.");
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = t("Ocurrió un error al enviar tu postulación. Por favor intenta más tarde.");
      }
      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: "#01A28B",
        confirmButtonText: t("Entendido"),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    // ocultar campos internos
    if (field.fieldName === "recruiterSlug") return null;

    const lowerFieldName = field.fieldName.toLowerCase();
    const lowerAirtableField = field.airtableField.toLowerCase();
    const isCountryField = lowerFieldName === "country" || lowerAirtableField === "country";
    const isRecruiterField = isRecruiterFieldCheck(field);
    const isRoleCodeField = isRoleCodeFieldCheck(field);
    const isCvField =
      lowerFieldName === "cv" ||
      lowerAirtableField === "cv" ||
      lowerFieldName.includes("curriculum") ||
      lowerAirtableField.includes("curriculum");

    const value = formData[field.fieldName];
    const error = errors[field.fieldName];

    const normalizeSingleOption = (option: any) => {
      if (option === undefined || option === null) return undefined;
      if (typeof option === "string") return { value: option, label: option };
      if (typeof option === "object") {
        const v =
          option.value !== undefined
            ? String(option.value)
            : option.label !== undefined
            ? String(option.label)
            : option.name !== undefined
            ? String(option.name)
            : undefined;
        if (!v) return undefined;
        const label =
          option.label !== undefined
            ? String(option.label)
            : option.value !== undefined
            ? String(option.value)
            : v;
        return { value: v, label };
      }
      const coerced = String(option);
      return { value: coerced, label: coerced };
    };

    const normalizeOptionsArray = (options: any[] | undefined) => {
      if (!Array.isArray(options)) return [];
      return options
        .map((opt) => normalizeSingleOption(opt))
        .filter((opt): opt is { value: string; label: string } => Boolean(opt));
    };

    const renderWrapper = (key: string, children: ReactNode, opts?: { fullWidth?: boolean }) => (
      <div key={key} className={`form-field ${opts?.fullWidth ? "form-field-full-width" : ""}`}>
        {children}
      </div>
    );

    const renderLabel = () => (
      <>
        <label htmlFor={field.fieldName} className="form-label">
          {translateLabel(field.label)}
          {field.required && <span className="text-red-400">*</span>}
        </label>
        {field.instructions && (
          <p className="form-instructions">{translateLabel(field.instructions)}</p>
        )}
      </>
    );

    if (isCountryField) {
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <SelectCountryFormEs
            setCountry={(countryValue: { value: string; label: string } | null) => {
              setCountry(countryValue);
              handleInputChange(field.fieldName, countryValue?.value || "");
            }}
            country={country}
            setUser={() => ({})}
          />
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    if (isRecruiterField) {
      const recruiterValue =
        value ||
        (recruiterData
          ? recruiterData.lastName
            ? `${recruiterData.name} ${recruiterData.lastName}`.trim()
            : recruiterData.name
          : "");

      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <input
            type="text"
            id={field.fieldName}
            name={field.fieldName}
            value={recruiterValue}
            readOnly
            className="form-input input-readonly"
          />
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    if (isRoleCodeField) {
      const roleCodeValue = value || normalizedRoleCode;
      const isReadOnly = Boolean(normalizedRoleCode);

      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <input
            type="text"
            id={field.fieldName}
            name={field.fieldName}
            value={roleCodeValue}
            readOnly={isReadOnly}
            onChange={(e) => !isReadOnly && handleInputChange(field.fieldName, e.target.value)}
            className={`form-input ${isReadOnly ? "input-readonly" : ""}`}
          />
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    if (isCvField || field.type === "file") {
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <CloudinaryUploadWidget
            setFilePublicId={setFilePublicId}
            setFileName={setFileName}
            isAPostulation={true}
          >
            <div className="upload-button">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 16.5l4-4h-3V3h-2v9.5H8l4 4zM20 18v2H4v-2H2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2h-2z" />
              </svg>
              <span>{fileName || (field.placeholder ? translateLabel(field.placeholder) : t("Subir CV (PDF o imagen)"))}</span>
            </div>
          </CloudinaryUploadWidget>
          {fileName && <p className="form-file-name">{t("Archivo:")} {fileName}</p>}
          {error && <p className="form-error">{error}</p>}
        </>,
        { fullWidth: true }
      );
    }

    if (field.type === "textarea") {
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <textarea
            id={field.fieldName}
            name={field.fieldName}
            value={value || ""}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder ? translateLabel(field.placeholder) : ""}
            rows={6}
            className={`form-textarea ${error ? "error" : ""}`}
          />
          {error && <p className="form-error">{error}</p>}
        </>,
        { fullWidth: true }
      );
    }

    if (field.type === "number") {
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <input
            type="number"
            id={field.fieldName}
            name={field.fieldName}
            value={value || ""}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
            placeholder={field.placeholder ? translateLabel(field.placeholder) : ""}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`form-input ${error ? "error" : ""}`}
          />
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    if (field.type === "select") {
      const baseOptions = normalizeOptionsArray(field.options);
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <select
            id={field.fieldName}
            name={field.fieldName}
            value={value || ""}
            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
            className={`form-select ${error ? "error" : ""}`}
          >
            <option value="">{field.placeholder ? translateLabel(field.placeholder) : t("Select...")}</option>
            {baseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    if (field.type === "multi-select") {
      const options =
        lowerFieldName.includes("stack") || lowerAirtableField.includes("stack")
          ? lowerFieldName.includes("tech") || lowerAirtableField.includes("tech")
            ? techStack
            : technologies
          : normalizeOptionsArray(field.options);

      const currentValues = Array.isArray(value)
        ? value.map((item) => (typeof item === "string" ? item : String(item)))
        : [];

      const selected = currentValues
        .map((val) => options.find((opt) => opt.value === val) || { value: val, label: val })
        .filter(Boolean);

      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <Select
            options={options}
            isMulti
            name={field.fieldName}
            value={selected}
            onChange={(selectedOptions) => {
              const mapped = (selectedOptions || []).map((opt) => opt.value);
              handleInputChange(field.fieldName, mapped);
            }}
            closeMenuOnSelect={false}
            className="form-multiselect"
            styles={{
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: "#01A28B",
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: "#FFF",
              }),
            }}
          />
          {error && <p className="form-error">{error}</p>}
        </>,
        { fullWidth: true }
      );
    }

    // Detectar campos de teléfono por nombre o tipo
    const isPhoneField =
      lowerFieldName.includes("phone") ||
      lowerFieldName.includes("telefono") ||
      lowerFieldName.includes("tel") ||
      lowerAirtableField.includes("phone") ||
      lowerAirtableField.includes("telefono") ||
      lowerAirtableField.includes("tel");

    if (isPhoneField) {
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <PhoneInput
            international
            defaultCountry="US"
            value={value || ""}
            onChange={(phoneValue) => {
              handleInputChange(field.fieldName, phoneValue || "");
            }}
            placeholder={field.placeholder ? translateLabel(field.placeholder) : t("Ingresa tu número de teléfono")}
            className={`phone-input-wrapper ${error ? "error" : ""}`}
            numberInputProps={{
              className: "form-input phone-input",
            }}
            countrySelectProps={{
              className: "phone-country-select",
            }}
          />
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    // Detectar si es campo de LinkedIn
    const isLinkedInField =
      lowerFieldName.includes("linkedin") ||
      lowerAirtableField.includes("linkedin");

    // default: tratar como texto simple
    return renderWrapper(
      field.fieldName,
      <>
        {renderLabel()}
        <input
          type={field.type === "email" || field.type === "url" ? field.type : "text"}
          id={field.fieldName}
          name={field.fieldName}
          value={value || ""}
          onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
          placeholder={field.placeholder ? translateLabel(field.placeholder) : ""}
          className={`form-input ${error ? "error" : ""}`}
        />
        {isLinkedInField && (
          <p className="form-instructions" style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6B7280" }}>
            {t("Ejemplo")}: <a href="https://www.linkedin.com/in/link-it" target="_blank" rel="noopener noreferrer" style={{ color: "#01A28B", textDecoration: "underline" }}>www.linkedin.com/in/link-it</a>
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
      </>
    );
  };

  const backgroundVisuals = (
    <div className="recruiter-visuals">
      <div className="recruiter-pattern">
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <motion.div
            key={rowIndex}
            className={`pattern-row ${rowIndex % 2 === 0 ? "align-left" : "align-right"}`}
            animate={{ x: [-20, 20, -20], opacity: [0.05, 0.12, 0.05] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: rowIndex * 1.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <span key={colIndex} className="pattern-text">
                LinkIT
              </span>
            ))}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="recruiter-orb orb-1"
        animate={{ y: [-20, 15, -20], x: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="recruiter-orb orb-2"
        animate={{ y: [15, -25, 15], x: [0, -12, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="recruiter-orb orb-3"
        animate={{ y: [-10, 20, -10], x: [5, -15, 5] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  if (initialLoading) {
    return (
      <div className="recruiter-form-container">
        {backgroundVisuals}
        <div className="recruiter-skeleton">
          <div className="skeleton-card">
            <div className="skeleton-line" style={{ width: "60%" }} />
            <div className="skeleton-line" style={{ width: "80%" }} />
            <div className="skeleton-line" style={{ width: "45%" }} />
          </div>
          <div className="skeleton-card">
            <div className="skeleton-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`skeleton-block${idx % 3 === 2 ? " large" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recruiterData || !formConfig.length) {
    return null;
  }

  return (
    <div className="recruiter-form-container">
      {backgroundVisuals}
      <div className="recruiter-form-header">
        {recruiterData.photoUrl && (
          <img
            src={recruiterData.photoUrl}
            alt={recruiterData.name}
            className="recruiter-photo"
          />
        )}
        <div className="recruiter-info">
          <h1 className="form-title">Formulario de Talentos</h1>
          <p className="form-subtitle">
            Hola! Gracias por aplicar al rol!
          </p>
          <p className="form-description">
            Por favor completa el siguiente formulario para finalizar el proceso de aplicación.
            Pronto revisaremos tu perfil!
          </p>
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="recruiter-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="form-fields-grid">
          {formConfig.map((field) => renderField(field))}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-button bg-linkIt-300"
          >
            {loading ? t("Enviando...") : t("Enviar")}
          </button>
        </div>
      </motion.form>

      {loading && <Loading text={t("Enviando tu postulación")} />}
    </div>
  );
}

export default RecruiterApplicationForm;
