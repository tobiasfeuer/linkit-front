import { FormEvent, useState, useEffect, useMemo, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import Select from "react-select";
import CloudinaryUploadWidget from "../Services/cloudinaryWidget";
import Loading from "../Loading/Loading";
import {
  getFormConfig,
  getRecruiterBySlug,
  submitRecruiterApplication,
} from "../Services/recruiterForm.service";
import {
  FormFieldConfig,
  RecruiterData,
  FormData,
  FormErrors,
} from "./types";
import { SelectCountryFormEs } from "../Talentos/ModulosTalentos/ModuloTalentosG/JobCard/jobDescription/job-form/jobFormCountry/JobFormSelectCountry";
import PhoneInput from "react-phone-number-input";
import { useGoogleReCaptcha } from "react-google-recaptcha-hook";
import "react-phone-number-input/style.css";
import "./RecruiterApplicationForm.css";

const SUPERADMN_ID = import.meta.env.VITE_SUPERADMN_ID;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const RECRUITER_OPTIONS: { value: string; label: string; slug: string }[] = [
  { value: "Julieta", label: "Julieta", slug: "julieta" },
  { value: "Shayna", label: "Shayna", slug: "shayna" },
  { value: "Magali", label: "Magali", slug: "magali" },
  { value: "Tobias", label: "Tobias", slug: "tobias" },
];

interface CandidateApplicationFormProps {
  executeRecaptcha?: (action: string) => Promise<string>;
}

function CandidateApplicationFormBase({
  executeRecaptcha,
}: CandidateApplicationFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || sessionStorage.getItem("lang") || "es";

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const roleCodeParam = useMemo(() => {
    const param =
      searchParams.get("roleCode") ||
      searchParams.get("recruitmentRoleCode") ||
      "";
    return param.trim();
  }, [searchParams]);
  const recruiterSlugParam = useMemo(
    () => searchParams.get("recruiterSlug")?.trim() || "",
    [searchParams]
  );

  const airtableTranslations: Record<string, { es: string; en: string }> = {
    "Role to apply": { es: "Rol al que aplica", en: "Role to apply" },
    "Rol al que aplica": { es: "Rol al que aplica", en: "Role to apply" },
    "What would be your area of expertise?": {
      es: "¿Cuál sería tu área de especialización?",
      en: "What would be your area of expertise?",
    },
    "Candidate Email": { es: "Email del candidato", en: "Candidate Email" },
    "When to start availability": {
      es: "Disponibilidad para empezar",
      en: "When to start availability",
    },
    "Why Change": { es: "Por qué cambiar", en: "Why Change" },
    "Candidate Stack + PM tools": {
      es: "Stack del candidato + herramientas PM",
      en: "Candidate Stack + PM tools",
    },
    "Salary expectation (USD)": {
      es: "Expectativa salarial (USD)",
      en: "Salary expectation (USD)",
    },
    "English Level": { es: "Nivel de inglés", en: "English Level" },
    Country: { es: "País", en: "Country" },
    Location: { es: "Ubicación", en: "Location" },
    Phone: { es: "Teléfono", en: "Phone" },
    Recruiter: { es: "Reclutador", en: "Recruiter" },
    CV: { es: "CV", en: "CV" },
    LinkedIn: { es: "LinkedIn", en: "LinkedIn" },
    "Select...": { es: "Seleccionar...", en: "Select..." },
    Nombre: { es: "Nombre", en: "First Name" },
    "First Name": { es: "Nombre", en: "First Name" },
    Apellido: { es: "Apellido", en: "Last Name" },
    "Last Name": { es: "Apellido", en: "Last Name" },
    "intermediate (B2)": { es: "intermedio (B2)", en: "intermediate (B2)" },
    Intermediate: { es: "Intermedio", en: "Intermediate" },
    "intermediate (B1)": { es: "intermedio (B1)", en: "intermediate (B1)" },
    Advanced: { es: "Avanzado", en: "Advanced" },
    Professional: { es: "Profesional", en: "Professional" },
    Basic: { es: "Básico", en: "Basic" },
  };

  const [formConfig, setFormConfig] = useState<FormFieldConfig[]>([]);
  const [recruiterData, setRecruiterData] = useState<RecruiterData | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filePublicId, setFilePublicId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [country, setCountry] = useState<{ value: string; label: string } | null>(
    null
  );
  const [selectedRecruiter, setSelectedRecruiter] = useState<{
    value: string;
    label: string;
    slug: string;
  } | null>(null);

  const [technologies, setTechnologies] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [techStack, setTechStack] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!roleCodeParam) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Falta el código de la vacante",
          confirmButtonColor: "#01A28B",
        }).then(() => navigate("/soyTalento"));
        return;
      }

      try {
        setInitialLoading(true);
        const recruiterSlugFromQuery = recruiterSlugParam.trim();
        const hasRecruiterSlug = recruiterSlugFromQuery.length > 0;

        let recruiter: RecruiterData | null = null;
        if (hasRecruiterSlug) {
          recruiter = await getRecruiterBySlug(recruiterSlugFromQuery, roleCodeParam);

          if (!recruiter.active) {
            Swal.fire({
              icon: "warning",
              title: "Formulario no disponible",
              text: "Este formulario no está disponible actualmente",
              confirmButtonColor: "#01A28B",
            }).then(() => navigate("/soyTalento"));
            return;
          }
        }

        setRecruiterData(recruiter);

        const config = await getFormConfig("RecruiterFormWebView", lang);
        const sortedConfig = config.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return 0;
        });
        const reversedConfig = sortedConfig.reverse();
        setFormConfig(reversedConfig);

        try {
          const [techResponse, stackResponse] = await Promise.all([
            axios.get(
              `${import.meta.env.VITE_ENDPOINT_URL}/resources/stackList`,
              {
                headers: {
                  Authorization: `Bearer ${SUPERADMN_ID}`,
                  "Accept-Language": lang,
                },
              }
            ),
            axios.get(
              `${import.meta.env.VITE_ENDPOINT_URL}/resources/techStack`,
              {
                headers: {
                  Authorization: `Bearer ${SUPERADMN_ID}`,
                  "Accept-Language": lang,
                },
              }
            ),
          ]);

          setTechnologies(
            techResponse.data.map((tech: any) => ({
              value: tech.name,
              label: tech.name,
            }))
          );
          setTechStack(
            stackResponse.data.map((tech: any) => ({
              value: tech.name,
              label: tech.name,
            }))
          );
        } catch {
          /* ignorar */
        }

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

        initialData.recruiterSlug = recruiterSlugFromQuery;

        const recruiterField = config.find(
          (field) =>
            field.fieldName.toLowerCase() === "recruiter" ||
            field.airtableField.toLowerCase() === "recruiter"
        );
        if (recruiterField && recruiter) {
          const fullName = recruiter.lastName
            ? `${recruiter.name} ${recruiter.lastName}`.trim()
            : recruiter.name;
          const matchBySlug = RECRUITER_OPTIONS.find(
            (r) => r.slug.toLowerCase() === recruiter.urlSlug?.toLowerCase()
          );
          const matchByName = RECRUITER_OPTIONS.find(
            (r) =>
              r.value.toLowerCase() === fullName.toLowerCase() ||
              r.value.toLowerCase() === recruiter.name?.toLowerCase()
          );
          const match = matchBySlug || matchByName;
          if (match) {
            initialData[recruiterField.fieldName] = match.value;
            setSelectedRecruiter(match);
          } else {
            initialData[recruiterField.fieldName] = fullName;
            setSelectedRecruiter({
              value: fullName,
              label: fullName,
              slug: recruiter.urlSlug || recruiterSlugParam,
            });
          }
        }

        const roleCodeValue = (
          roleCodeParam || recruiter?.recruitmentRoleCode || ""
        ).trim();
        if (roleCodeField && roleCodeValue) {
          initialData[roleCodeField.fieldName] = roleCodeValue;
        }

        setFormData(initialData);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Error al cargar el formulario",
          confirmButtonColor: "#01A28B",
        }).then(() => navigate("/soyTalento"));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [roleCodeParam, recruiterSlugParam, lang, navigate]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const translateLabel = (label: string): string => {
    if (!label) return "";
    const currentLang = lang.startsWith("es") ? "es" : "en";
    if (airtableTranslations[label]) {
      return airtableTranslations[label][currentLang as "es" | "en"];
    }
    if (i18n.exists(label)) {
      return t(label);
    }
    return label;
  };

  const validateField = (field: FormFieldConfig, value: any): string => {
    const lowerFieldName = field.fieldName.toLowerCase();
    const lowerAirtableField = field.airtableField.toLowerCase();
    const isPhoneField =
      lowerFieldName.includes("phone") ||
      lowerFieldName.includes("telefono") ||
      lowerFieldName.includes("tel") ||
      lowerAirtableField.includes("phone") ||
      lowerAirtableField.includes("telefono") ||
      lowerAirtableField.includes("tel");
    const isCvField =
      lowerFieldName === "cv" ||
      lowerAirtableField === "cv" ||
      lowerFieldName.includes("curriculum") ||
      lowerAirtableField.includes("curriculum") ||
      field.type === "file";

    if (
      field.required &&
      !isCvField &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      return `${translateLabel(field.label)} ${t("es requerido")}`;
    }

    if (
      isPhoneField &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      const label = field.label || "Phone";
      return `${translateLabel(label)} ${t("es requerido")}`;
    }

    if (!value) return "";

    const isNameField =
      lowerFieldName.includes("nombre") ||
      lowerFieldName.includes("firstname") ||
      (lowerFieldName.includes("name") &&
        !lowerFieldName.includes("company") &&
        !lowerFieldName.includes("user"));
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

    const isLinkedInField =
      lowerFieldName.includes("linkedin") ||
      lowerAirtableField.includes("linkedin");

    if (isLinkedInField && typeof value === "string") {
      const linkedInRegex =
        /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\p{L}\p{N}\w\-]+\/?$/iu;
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
      if (numValue < 500) {
        return `${translateLabel(field.label)} ${t("debe ser al menos 500 USD")}`;
      }
      if (numValue > 15000) {
        return `${translateLabel(field.label)} ${t("no puede ser mayor a 15.000 USD")}`;
      }
    }

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return t("Email inválido");
    }

    if (
      field.type === "url" &&
      !isLinkedInField &&
      !/^https?:\/\/.+\..+/.test(value)
    ) {
      return t("URL inválida");
    }

    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    formConfig.forEach((field) => {
      const value = formData[field.fieldName];
      let error = validateField(field, value);

      const isCvField =
        field.fieldName.toLowerCase() === "cv" ||
        field.airtableField?.toLowerCase() === "cv" ||
        field.fieldName.toLowerCase().includes("curriculum") ||
        field.airtableField?.toLowerCase()?.includes("curriculum") ||
        field.type === "file";
      if (isCvField) {
        const hasCvFile = Boolean(filePublicId?.trim());
        const hasCvInFormData = Array.isArray(value) && value.length > 0;
        const hasCvString =
          value &&
          typeof value === "string" &&
          String(value).trim() !== "";
        if (!hasCvFile && !hasCvInFormData && !hasCvString) {
          error = `${translateLabel(field.label)} ${t("es requerido")}`;
          isValid = false;
        }
      }

      const isRecruiterField = isRecruiterFieldCheck(field);
      if (isRecruiterField && field.required && !selectedRecruiter) {
        error = `${translateLabel(field.label)} ${t("es requerido")}`;
        isValid = false;
      }

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

  const recruiterSelectOptions = useMemo(() => {
    const base = RECRUITER_OPTIONS.map((r) => ({ value: r.value, label: r.label }));
    if (!recruiterData) return base;
    const fullName = recruiterData.lastName
      ? `${recruiterData.name} ${recruiterData.lastName}`.trim()
      : recruiterData.name;
    const alreadyInList = base.some(
      (o) =>
        o.value.toLowerCase() === fullName.toLowerCase() ||
        o.value.toLowerCase() === recruiterData.name?.toLowerCase()
    );
    if (!alreadyInList && fullName) {
      return [...base, { value: fullName, label: fullName }];
    }
    return base;
  }, [recruiterData]);

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
            if (
              "value" in item &&
              item.value !== undefined &&
              item.value !== null
            ) {
              return String(item.value).trim();
            }
            if (
              "label" in item &&
              item.label !== undefined &&
              item.label !== null
            ) {
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

  const buildSubmissionPayload = (): {
    payload: Record<string, any>;
    error?: string;
  } => {
    const stack = ensureStringArray(formData.candidateStackPmTools);
    const techStack = ensureStringArray(
      formData.whatWouldBeYourAreaOfExpertise
    );

    const salaryRaw =
      formData.salaryExpectationusd ??
      formData.salaryExpectationUsd ??
      formData.salaryExpectationUSD ??
      formData.salaryExpectationUsD;

    let salary: number | undefined;
    if (
      salaryRaw !== undefined &&
      salaryRaw !== null &&
      String(salaryRaw).trim() !== ""
    ) {
      const parsed = Number(salaryRaw);
      if (Number.isNaN(parsed)) {
        return {
          payload: {},
          error: t("La expectativa salarial debe ser un número válido."),
        };
      }
      if (parsed < 500) {
        return {
          payload: {},
          error: t("La expectativa salarial debe ser al menos 500 USD."),
        };
      }
      if (parsed > 15000) {
        return {
          payload: {},
          error: t("La expectativa salarial no puede ser mayor a 15.000 USD."),
        };
      }
      salary = parsed;
    }

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
    const phoneAirtableField =
      phoneField?.airtableField || phoneFieldName || "Phone";
    const phoneRawValue = phoneFieldName ? formData[phoneFieldName] : undefined;

    let phoneValue: string | undefined;
    if (phoneRawValue !== undefined && phoneRawValue !== null) {
      const phoneStr = String(phoneRawValue).trim();
      if (phoneStr !== "") {
        phoneValue = phoneStr;
      }
    }

    const recruiterSlugForPayload =
      selectedRecruiter?.slug || recruiterSlugParam;
    const recruiterNameForPayload =
      selectedRecruiter?.value || formData.recruiter;

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
      recruiterSlug: sanitizeString(recruiterSlugForPayload),
      recruiter: sanitizeString(recruiterNameForPayload),
    };

    if (
      phoneField &&
      phoneAirtableField &&
      phoneValue &&
      phoneValue.trim() !== ""
    ) {
      payload[phoneAirtableField] = phoneValue;
      if (phoneFieldName && phoneFieldName !== phoneAirtableField) {
        payload[phoneFieldName] = phoneValue;
      }
    }

    formConfig.forEach((field) => {
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

        if (field.type === "multi-select") {
          const arrayValue = ensureStringArray(fieldValue);
          if (arrayValue.length > 0) {
            payload[airtableFieldName] = arrayValue;
          }
        } else if (
          fieldValue !== undefined &&
          fieldValue !== null &&
          String(fieldValue).trim() !== ""
        ) {
          payload[airtableFieldName] =
            sanitizeString(fieldValue) || String(fieldValue).trim();
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

      let recaptchaToken: string | null = null;
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha("submit");
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: t("Error en la verificación de seguridad. Intenta de nuevo."),
            confirmButtonColor: "#01A28B",
          });
          setLoading(false);
          return;
        }
      }
  

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
        (payload.recruiterSlug as string | undefined) ?? recruiterSlugParam ?? "";

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
      const responseData = error.response?.data;
      const errorLang = i18n.language || sessionStorage.getItem("lang") || "es";

      let errorTitle = t("Error al enviar la postulación");
      let errorMessage = "";

      if (responseData) {
        if (typeof responseData === "object") {
          const translatedMessage =
            errorLang === "en" ? responseData.en : responseData.es;
          errorMessage =
            translatedMessage ||
            responseData.message ||
            t(
              "Ocurrió un error al enviar tu postulación. Por favor intenta más tarde."
            );
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = t(
          "Ocurrió un error al enviar tu postulación. Por favor intenta más tarde."
        );
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
    if (field.fieldName === "recruiterSlug") return null;

    const lowerFieldName = field.fieldName.toLowerCase();
    const lowerAirtableField = field.airtableField.toLowerCase();
    const isCountryField =
      lowerFieldName === "country" || lowerAirtableField === "country";
    const isRecruiterField = isRecruiterFieldCheck(field);
    const isRoleCodeField = isRoleCodeFieldCheck(field);
    const isCvField =
      lowerFieldName === "cv" ||
      lowerAirtableField === "cv" ||
      lowerFieldName.includes("curriculum") ||
      lowerAirtableField.includes("curriculum");
    const isSalaryField =
      lowerFieldName.includes("salary") ||
      lowerFieldName.includes("salario") ||
      lowerAirtableField.includes("salary") ||
      lowerAirtableField.includes("salario");

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
        .filter(
          (opt): opt is { value: string; label: string } => Boolean(opt)
        );
    };

    const renderWrapper = (
      key: string,
      children: ReactNode,
      opts?: { fullWidth?: boolean }
    ) => (
      <div
        key={key}
        className={`form-field ${opts?.fullWidth ? "form-field-full-width" : ""}`}
      >
        {children}
      </div>
    );

    const renderLabel = () => (
      <>
        <label htmlFor={field.fieldName} className="form-label">
          {translateLabel(field.label)}
          {(field.required || isCvField) && (
            <span className="text-red-400">*</span>
          )}
        </label>
        {field.instructions && (
          <p className="form-instructions">
            {translateLabel(field.instructions)}
          </p>
        )}
      </>
    );

    if (isCountryField) {
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <SelectCountryFormEs
            setCountry={(countryValue: {
              value: string;
              label: string;
            } | null) => {
              setCountry(countryValue);
              handleInputChange(field.fieldName, countryValue?.value || "");
            }}
            country={country}
            setUser={() => ({})}
            isSearchable={false}
          />
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    if (isRecruiterField) {
      const currentLang = lang.startsWith("es") ? "es" : "en";
      const recruiterComesFromSlug = recruiterSlugParam && recruiterSlugParam !== "linkit";
    
      // Si el recruiter viene del slug, mostrar como readonly
      if (recruiterComesFromSlug) {
        const recruiterDisplayValue = selectedRecruiter?.label || value || "";
        return renderWrapper(
          field.fieldName,
          <>
            {renderLabel()}
            <input
              type="text"
              id={field.fieldName}
              name={field.fieldName}
              value={recruiterDisplayValue}
              readOnly
              className="form-input input-readonly"
            />
            {error && <p className="form-error">{error}</p>}
          </>,
          { fullWidth: true }
        );
      }
    
      // Si no hay slug específico, permitir seleccionar
      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <Select
            options={recruiterSelectOptions}
            value={
              selectedRecruiter
                ? { value: selectedRecruiter.value, label: selectedRecruiter.label }
                : null
            }
            onChange={(opt) => {
              const match = RECRUITER_OPTIONS.find(
                (r) => r.value === opt?.value
              );
              if (match) {
                setSelectedRecruiter(match);
              } else if (opt && recruiterData) {
                const fullName = recruiterData.lastName
                  ? `${recruiterData.name} ${recruiterData.lastName}`.trim()
                  : recruiterData.name;
                if (opt.value === fullName || opt.value === recruiterData.name) {
                  setSelectedRecruiter({
                    value: opt.value,
                    label: opt.label,
                    slug: recruiterData.urlSlug || recruiterSlugParam,
                  });
                } else {
                  setSelectedRecruiter({
                    value: opt.value,
                    label: opt.label,
                    slug: opt.value.toLowerCase().replace(/\s+/g, "-"),
                  });
                }
              } else {
                setSelectedRecruiter(null);
              }
              handleInputChange(field.fieldName, opt?.value || "");
            }}
            className="form-select"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "unset",
                height: "auto",
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: error
                  ? "#F87171"
                  : state.isFocused
                    ? "#01A28B"
                    : "#CBDAE8",
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%)",
                boxShadow: state.isFocused
                  ? "0 0 0 4px rgba(1, 162, 139, 0.14), 0 14px 34px rgba(1, 162, 139, 0.12)"
                  : "0 10px 24px rgba(15, 45, 75, 0.06)",
                transition: "box-shadow 0.18s ease, border-color 0.18s ease, transform 0.08s ease",
                "&:hover": {
                  borderColor: error ? "#F87171" : "#CBDAE8",
                },
                padding: 0,
              }),
              valueContainer: (base) => ({
                ...base,
                padding: "0 1rem",
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
              }),
              placeholder: (base) => ({
                ...base,
                color: "#6B7280",
              }),
              singleValue: (base) => ({
                ...base,
                color: "#173951",
              }),
              indicatorSeparator: (base) => ({
                ...base,
                backgroundColor: "#CBDAE8",
              }),
              dropdownIndicator: (base) => ({
                ...base,
                padding: "0 1rem",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
            placeholder={
              currentLang === "es" ? "Seleccionar reclutador" : "Select recruiter"
            }
            isClearable
            isSearchable={false}
          />
          {error && <p className="form-error">{error}</p>}
        </>,
        { fullWidth: true }
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
            onChange={(e) =>
              !isReadOnly && handleInputChange(field.fieldName, e.target.value)
            }
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
              <span>
                {fileName ||
                  (field.placeholder
                    ? translateLabel(field.placeholder)
                    : t("Subir CV (PDF o imagen)"))}
              </span>
            </div>
          </CloudinaryUploadWidget>
          {fileName && (
            <p className="form-file-name">
              {t("Archivo:")} {fileName}
            </p>
          )}
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
            placeholder={
              field.placeholder ? translateLabel(field.placeholder) : ""
            }
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
            placeholder={
              isSalaryField
                ? t("Ej: 500 - 15.000")
                : field.placeholder
                  ? translateLabel(field.placeholder)
                  : ""
            }
            min={isSalaryField ? 500 : field.validation?.min}
            max={isSalaryField ? 15000 : field.validation?.max}
            className={`form-input ${error ? "error" : ""}`}
          />
          {isSalaryField && (
            <p
              className="form-instructions"
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "#6B7280",
              }}
            >
              {t("Salario mensual expresado en USD")}
            </p>
          )}
          {error && <p className="form-error">{error}</p>}
        </>
      );
    }

    if (field.type === "select") {
      const baseOptions = normalizeOptionsArray(field.options);
      const currentLang = lang.startsWith("es") ? "es" : "en";
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
            <option value="">
              {field.placeholder
                ? translateLabel(field.placeholder)
                : currentLang === "es"
                  ? "Seleccionar..."
                  : "Select..."}
            </option>
            {baseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {translateLabel(option.label)}
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

      const disableSearchForThisMultiSelect =
        lowerFieldName.includes("candidatestackpmtools") ||
        lowerAirtableField.includes("candidate stack + pm tools") ||
        lowerFieldName.includes("whatwouldbeyourareaofexpertise") ||
        lowerAirtableField.includes("what would be your area of expertise") ||
        lowerFieldName.includes("area de especializacion") ||
        lowerAirtableField.includes("area de especializacion");

      const currentValues = Array.isArray(value)
        ? value.map((item) =>
            typeof item === "string" ? item : String(item)
          )
        : [];

      const translatedOptions = options.map((opt) => ({
        value: opt.value,
        label: translateLabel(opt.label),
      }));

      const selected = currentValues
        .map((val) => {
          const found = options.find((opt) => opt.value === val);
          if (found) {
            return {
              value: found.value,
              label: translateLabel(found.label),
            };
          }
          return { value: val, label: translateLabel(val) };
        })
        .filter(Boolean);

      const currentLang = lang.startsWith("es") ? "es" : "en";

      return renderWrapper(
        field.fieldName,
        <>
          {renderLabel()}
          <Select
            options={translatedOptions}
            isMulti
            name={field.fieldName}
            value={selected}
            onChange={(selectedOptions) => {
              const mapped = (selectedOptions || []).map((opt) => opt.value);
              handleInputChange(field.fieldName, mapped);
            }}
            closeMenuOnSelect={false}
            isSearchable={!disableSearchForThisMultiSelect}
            className="form-multiselect"
            placeholder={
              field.placeholder
                ? translateLabel(field.placeholder)
                : currentLang === "es"
                  ? "Seleccionar..."
                  : "Select..."
            }
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
            placeholder={
              field.placeholder
                ? translateLabel(field.placeholder)
                : t("Ingresa tu número de teléfono")
            }
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

    const isLinkedInField =
      lowerFieldName.includes("linkedin") ||
      lowerAirtableField.includes("linkedin");

    return renderWrapper(
      field.fieldName,
      <>
        {renderLabel()}
        <input
          type={
            field.type === "email" || field.type === "url" ? field.type : "text"
          }
          id={field.fieldName}
          name={field.fieldName}
          value={value || ""}
          onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
          placeholder={
            field.placeholder ? translateLabel(field.placeholder) : ""
          }
          className={`form-input ${error ? "error" : ""}`}
        />
        {isLinkedInField && (
          <p
            className="form-instructions"
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              color: "#6B7280",
            }}
          >
            {t("Ejemplo")}:{" "}
            <a
              href="https://www.linkedin.com/in/link-it"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#01A28B",
                textDecoration: "underline",
              }}
            >
              www.linkedin.com/in/link-it
            </a>
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
      </>
    );
  };

  const formFieldsForGrid = useMemo(() => {
    if (!formConfig.length) return formConfig as any[];

    const isRecruiterFieldCheckLocal = (field: FormFieldConfig) =>
      field.fieldName.toLowerCase() === "recruiter" ||
      field.airtableField.toLowerCase() === "recruiter";

    const isPhoneFieldCheck = (field: FormFieldConfig) => {
      const lowerFieldName = field.fieldName.toLowerCase();
      const lowerAirtableField = field.airtableField?.toLowerCase() || "";
      return (
        lowerFieldName.includes("phone") ||
        lowerFieldName.includes("telefono") ||
        lowerFieldName.includes("tel") ||
        lowerAirtableField.includes("phone") ||
        lowerAirtableField.includes("telefono") ||
        lowerAirtableField.includes("tel")
      );
    };

    const isFirstNameFieldCheck = (field: FormFieldConfig) => {
      const lowerFieldName = field.fieldName.toLowerCase();
      const lowerAirtableField = field.airtableField?.toLowerCase() || "";
      return (
        lowerFieldName.includes("nombre") ||
        lowerFieldName.includes("firstname") ||
        lowerFieldName.includes("first name") ||
        lowerAirtableField.includes("nombre") ||
        lowerAirtableField.includes("firstname") ||
        lowerAirtableField.includes("first name")
      );
    };

    const isLastNameFieldCheck = (field: FormFieldConfig) => {
      const lowerFieldName = field.fieldName.toLowerCase();
      const lowerAirtableField = field.airtableField?.toLowerCase() || "";
      return (
        lowerFieldName.includes("apellido") ||
        lowerFieldName.includes("lastname") ||
        lowerFieldName.includes("last name") ||
        lowerAirtableField.includes("apellido") ||
        lowerAirtableField.includes("lastname") ||
        lowerAirtableField.includes("last name")
      );
    };

    // Layout objetivo en grid (2 columnas):
    // - Fila 1: Reclutador (full width)
    // - Fila 2: (col 1) primero disponible, (col 2) Apellido
    // - Fila 3: (col 1) Teléfono, (col 2) Rol al que aplica
    const recruiterField = formConfig.find(isRecruiterFieldCheckLocal);
    const firstNameField = formConfig.find(isFirstNameFieldCheck);
    const lastNameField = formConfig.find(isLastNameFieldCheck);
    const phoneField = formConfig.find(isPhoneFieldCheck);
    const roleField = formConfig.find((f) => isRoleCodeFieldCheck(f));

    const nonRecruiterFields = formConfig.filter(
      (f) => f !== recruiterField && f.fieldName !== "recruiterSlug"
    );

    const reserved: Array<FormFieldConfig | null> = [null, null, null, null];
    if (firstNameField) reserved[0] = firstNameField;
    if (lastNameField) reserved[1] = lastNameField;
    if (phoneField) reserved[2] = phoneField;
    if (roleField) reserved[3] = roleField;

    const remaining = nonRecruiterFields.filter((f) => !reserved.includes(f));

    let cursor = 0;
    for (let i = 0; i < reserved.length; i++) {
      if (!reserved[i] && cursor < remaining.length) {
        reserved[i] = remaining[cursor++];
      }
    }

    const used = new Set<FormFieldConfig>(reserved.filter(Boolean) as FormFieldConfig[]);
    const rest = nonRecruiterFields.filter((f) => !used.has(f));

    const orderedNonRecruiter = reserved.filter(Boolean) as FormFieldConfig[];
    return recruiterField
      ? [recruiterField, ...orderedNonRecruiter, ...rest]
      : [...orderedNonRecruiter, ...rest];
  }, [formConfig]);

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

  if (!formConfig.length) {
    return null;
  }

  return (
    <div className="recruiter-form-container">
      {backgroundVisuals}
      <div className="recruiter-form-header">
        {recruiterData?.photoUrl && (
          <img
            src={recruiterData.photoUrl}
            alt={recruiterData.name || "Recruiter"}
            className="recruiter-photo"
          />
        )}
        <div className="recruiter-info">
          <h1 className="form-title">{t("Formulario de Talentos")}</h1>
          <p className="form-subtitle">
            {t("Hola! Gracias por aplicar al rol!")}
          </p>
          <p className="form-description">
            {t(
              "Por favor completa el siguiente formulario para finalizar el proceso de aplicación."
            )}{" "}
            <br />
            {t("Pronto revisaremos tu perfil!")}
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
          {formFieldsForGrid.map((field) => renderField(field))}
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

const CandidateApplicationFormWithRecaptcha = () => {
  const { executeGoogleReCaptcha } = useGoogleReCaptcha(RECAPTCHA_SITE_KEY!);
  return (
    <CandidateApplicationFormBase executeRecaptcha={executeGoogleReCaptcha} />
  );
};

const CandidateApplicationForm = () => {
  if (RECAPTCHA_SITE_KEY) {
    return <CandidateApplicationFormWithRecaptcha />;
  }
  return <CandidateApplicationFormBase />;
};

export default CandidateApplicationForm;
