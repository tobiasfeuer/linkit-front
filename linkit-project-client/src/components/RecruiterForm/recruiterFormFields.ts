import type { FormFieldConfig, FormData } from "./types";

/** Coincide con columnas típicas de código JD / rol en Airtable (metadata + camelCase). */
export function isRoleCodeFieldCheck(field: FormFieldConfig): boolean {
  const name = field.fieldName.toLowerCase();
  const airtable = field.airtableField.toLowerCase();
  if (
    field.airtableField === "Rol al que aplica" ||
    field.airtableField === "Role to apply"
  ) {
    return true;
  }
  return (
    name.includes("role code") ||
    airtable.includes("role code") ||
    name.includes("recruitment role") ||
    airtable.includes("recruitment role") ||
    name.includes("rol al que aplica") ||
    airtable.includes("rol al que aplica") ||
    name.includes("roletoapply") ||
    airtable.includes("role to apply") ||
    name.includes("jdcode") ||
    airtable.includes("jd code") ||
    name.includes("codigovacante") ||
    airtable.includes("código de vacante") ||
    airtable.includes("codigo de vacante")
  );
}

function trimmedString(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

/** Primer código no vacío entre campos de rol del formulario, luego query/normalizado, luego legacy. */
export function resolveJdCodeForPayload(
  formConfig: FormFieldConfig[],
  formData: FormData,
  normalizedRoleCode: string
): string | undefined {
  for (const field of formConfig) {
    if (!isRoleCodeFieldCheck(field)) continue;
    const t = trimmedString(formData[field.fieldName]);
    if (t) return t;
  }
  const fromNorm = trimmedString(normalizedRoleCode);
  if (fromNorm) return fromNorm;
  const legacy = trimmedString(formData.rolAlQueAplica);
  return legacy || undefined;
}

/** Campo link en Airtable → tabla Forms Values (opciones de país). */
export function isPaisesNoBorrarField(field: FormFieldConfig): boolean {
  const a = field.airtableField.toLowerCase().trim();
  return a === "paises (no borrar)" || a === "países (no borrar)";
}

/** Columna legacy de texto/select "Country". */
export function isLegacyCountryField(field: FormFieldConfig): boolean {
  const a = field.airtableField.toLowerCase().trim();
  const n = field.fieldName.toLowerCase().trim();
  return a === "country" || n === "country";
}

/**
 * Un solo selector: si la vista incluye "Países (No borrar)", es el canónico;
 * si no, se usa Country.
 */
export function getPrimaryCountryField(
  config: FormFieldConfig[]
): FormFieldConfig | undefined {
  const linked = config.find(isPaisesNoBorrarField);
  if (linked) return linked;
  return config.find(isLegacyCountryField);
}

/** Ocultar Country en UI cuando ya existe el link Países (No borrar). */
export function isSupersededLegacyCountryField(
  field: FormFieldConfig,
  config: FormFieldConfig[]
): boolean {
  if (!isLegacyCountryField(field)) return false;
  return config.some(isPaisesNoBorrarField);
}

/** Este campo debe mostrar el único selector de país. */
export function isCountrySelectorField(
  field: FormFieldConfig,
  config: FormFieldConfig[]
): boolean {
  const primary = getPrimaryCountryField(config);
  return Boolean(primary && primary.fieldName === field.fieldName);
}

/**
 * Valor que va en `payload.country` (backend → link Países (No borrar));
 * no duplicar en el spread de airtableField.
 */
export function isCountryMappedToPayloadCountry(field: FormFieldConfig): boolean {
  return isPaisesNoBorrarField(field) || isLegacyCountryField(field);
}

export function isRecruiterFieldCheck(field: FormFieldConfig): boolean {
  return (
    field.fieldName.toLowerCase() === "recruiter" ||
    field.airtableField.toLowerCase() === "recruiter"
  );
}

export function isPhoneFieldCheck(field: FormFieldConfig): boolean {
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
}

export function isLastNameFieldCheck(field: FormFieldConfig): boolean {
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
}

export function isFirstNameFieldCheck(field: FormFieldConfig): boolean {
  if (isLastNameFieldCheck(field)) return false;

  const lowerFieldName = field.fieldName.toLowerCase();
  const lowerAirtableField = field.airtableField?.toLowerCase() || "";

  if (lowerFieldName === "name" || lowerAirtableField === "name") return true;

  return (
    lowerFieldName.includes("nombre") ||
    lowerFieldName.includes("firstname") ||
    lowerFieldName.includes("first name") ||
    lowerAirtableField.includes("nombre") ||
    lowerAirtableField.includes("firstname") ||
    lowerAirtableField.includes("first name") ||
    (lowerFieldName.includes("name") &&
      !lowerFieldName.includes("company") &&
      !lowerFieldName.includes("user") &&
      !lowerFieldName.includes("file") &&
      !lowerFieldName.includes("recruiter") &&
      !lowerAirtableField.includes("company") &&
      !lowerAirtableField.includes("user") &&
      !lowerAirtableField.includes("file") &&
      !lowerAirtableField.includes("recruiter"))
  );
}

export function isCvFieldCheck(field: FormFieldConfig): boolean {
  const lowerFieldName = field.fieldName.toLowerCase();
  const lowerAirtableField = field.airtableField?.toLowerCase() || "";
  return (
    lowerFieldName === "cv" ||
    lowerAirtableField === "cv" ||
    lowerFieldName.includes("curriculum") ||
    lowerAirtableField.includes("curriculum") ||
    field.type === "file"
  );
}

export function isCandidateStackPmFieldCheck(field: FormFieldConfig): boolean {
  const lowerFieldName = field.fieldName.toLowerCase();
  const lowerAirtableField = field.airtableField?.toLowerCase() || "";
  return (
    lowerFieldName.includes("candidatestackpmtools") ||
    lowerAirtableField.includes("candidate stack + pm tools") ||
    lowerAirtableField.includes("stack del candidato")
  );
}

export function isAvailabilityFieldCheck(field: FormFieldConfig): boolean {
  const lowerFieldName = field.fieldName.toLowerCase();
  const lowerAirtableField = field.airtableField?.toLowerCase() || "";
  return (
    lowerFieldName.includes("availability") ||
    lowerFieldName.includes("disponibilidad") ||
    lowerFieldName.includes("whentostart") ||
    lowerAirtableField.includes("availability") ||
    lowerAirtableField.includes("disponibilidad") ||
    lowerAirtableField.includes("when to start")
  );
}

/** Textareas/multi-select anchos salvo Stack PM y Disponibilidad (media columna). */
export function shouldRenderFieldFullWidth(field: FormFieldConfig): boolean {
  if (isCandidateStackPmFieldCheck(field)) return false;
  if (isAvailabilityFieldCheck(field)) return false;
  if (isCvFieldCheck(field)) return true;
  if (
    field.type === "textarea" ||
    field.type === "multi-select" ||
    field.type === "file"
  ) {
    return true;
  }
  return false;
}

export function isEnglishLevelFieldCheck(field: FormFieldConfig): boolean {
  const lowerFieldName = field.fieldName.toLowerCase();
  const lowerAirtableField = field.airtableField?.toLowerCase() || "";
  return (
    lowerFieldName.includes("english") ||
    lowerFieldName.includes("ingles") ||
    lowerFieldName.includes("inglés") ||
    lowerAirtableField.includes("english") ||
    lowerAirtableField.includes("ingles") ||
    lowerAirtableField.includes("inglés") ||
    lowerAirtableField === "english level" ||
    lowerAirtableField === "nivel de inglés" ||
    lowerAirtableField === "nivel de ingles"
  );
}

/** País inmediatamente antes de Nivel de inglés; resto conserva orden de Airtable. */
function placeCountryBeforeEnglish(
  config: FormFieldConfig[],
  fields: FormFieldConfig[]
): FormFieldConfig[] {
  const countryField = fields.find((f) => isCountrySelectorField(f, config));
  const englishField = fields.find(isEnglishLevelFieldCheck);
  if (!countryField || !englishField || countryField === englishField) {
    return fields;
  }

  const withoutCountry = fields.filter((f) => f !== countryField);
  const englishIndex = withoutCountry.findIndex((f) => f === englishField);
  if (englishIndex === -1) return fields;

  return [
    ...withoutCountry.slice(0, englishIndex),
    countryField,
    ...withoutCountry.slice(englishIndex),
  ];
}

/** Stack PM | Disponibilidad en una fila; CV al final. */
function finalizeRestFieldOrder(
  config: FormFieldConfig[],
  fields: FormFieldConfig[]
): FormFieldConfig[] {
  let ordered = placeCountryBeforeEnglish(config, fields);

  const cvField = ordered.find(isCvFieldCheck);
  const stackField = ordered.find(isCandidateStackPmFieldCheck);
  const availabilityField = ordered.find(isAvailabilityFieldCheck);

  const pulled = new Set(
    [cvField, stackField, availabilityField].filter(Boolean) as FormFieldConfig[]
  );

  let core = ordered.filter((f) => !pulled.has(f));

  if (stackField && availabilityField) {
    core = [...core, stackField, availabilityField];
  } else {
    if (stackField) core.push(stackField);
    if (availabilityField) core.push(availabilityField);
  }

  if (cvField) core.push(cvField);

  return core;
}

/**
 * Orden del grid (2 columnas):
 * 1. Reclutador (full width en render)
 * 2. Nombre | Apellido
 * 3. Teléfono | Rol al que aplica
 * 4. Resto (País antes de inglés; Stack PM | Disponibilidad; CV al final)
 */
export function orderRecruiterFormFields(
  config: FormFieldConfig[]
): FormFieldConfig[] {
  if (!config.length) return config;

  const recruiterField = config.find(isRecruiterFieldCheck);
  const firstNameField = config.find(isFirstNameFieldCheck);
  const lastNameField = config.find(isLastNameFieldCheck);
  const phoneField = config.find(isPhoneFieldCheck);
  const roleField = config.find((f) => isRoleCodeFieldCheck(f));

  const nonRecruiterFields = config.filter(
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

  const used = new Set<FormFieldConfig>(
    reserved.filter(Boolean) as FormFieldConfig[]
  );
  const rest = finalizeRestFieldOrder(
    config,
    nonRecruiterFields.filter((f) => !used.has(f))
  );

  const orderedNonRecruiter = reserved.filter(Boolean) as FormFieldConfig[];
  return recruiterField
    ? [recruiterField, ...orderedNonRecruiter, ...rest]
    : [...orderedNonRecruiter, ...rest];
}
