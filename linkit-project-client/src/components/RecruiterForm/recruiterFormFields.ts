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
