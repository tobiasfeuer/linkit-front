export type FreeTextValidationResult =
  | { valid: true }
  | { valid: false; errorKey: "min" | "max" | "invalid_chars" };

const TYPOGRAPHIC_REPLACEMENTS: [RegExp, string][] = [
  [/\u00A0/g, " "],
  [/[\u2018\u2019\u201A\u2032]/g, "'"],
  [/[\u201C\u201D\u201E\u2033]/g, '"'],
  [/[\u2013\u2014]/g, "-"],
];

/** Letras (con acentos), dígitos, espacios y puntuación habitual en texto profesional. */
export const FREE_TEXT_PATTERN =
  /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,!?():;"'/&%\-–—]+$/;

export function normalizeFormText(value: string): string {
  let normalized = value.trim();
  for (const [pattern, replacement] of TYPOGRAPHIC_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\s+/g, " ").trim();
}

function validateFreeText(
  value: string,
  min: number,
  max: number
): FreeTextValidationResult {
  const normalized = normalizeFormText(value);
  if (normalized.length < min) return { valid: false, errorKey: "min" };
  if (normalized.length > max) return { valid: false, errorKey: "max" };
  if (!FREE_TEXT_PATTERN.test(normalized)) {
    return { valid: false, errorKey: "invalid_chars" };
  }
  return { valid: true };
}

export function validateReasonText(value: string): FreeTextValidationResult {
  return validateFreeText(value, 10, 500);
}

export function validateAvailabilityText(
  value: string
): FreeTextValidationResult {
  return validateFreeText(value, 5, 200);
}

export function isAvailabilityField(
  fieldName: string,
  airtableField: string
): boolean {
  const lowerFieldName = fieldName.toLowerCase();
  const lowerAirtableField = airtableField.toLowerCase();
  return (
    lowerFieldName.includes("availability") ||
    lowerFieldName.includes("disponibilidad") ||
    lowerAirtableField.includes("availability") ||
    lowerAirtableField.includes("disponibilidad")
  );
}

export function isReasonField(fieldName: string, airtableField: string): boolean {
  const lowerFieldName = fieldName.toLowerCase();
  const lowerAirtableField = airtableField.toLowerCase();
  return (
    lowerFieldName.includes("reason") ||
    lowerFieldName.includes("razon") ||
    lowerFieldName.includes("whychange") ||
    lowerAirtableField.includes("reason") ||
    lowerAirtableField.includes("razon") ||
    lowerAirtableField.includes("why change")
  );
}
