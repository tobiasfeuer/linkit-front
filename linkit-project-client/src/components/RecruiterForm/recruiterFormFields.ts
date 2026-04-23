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
