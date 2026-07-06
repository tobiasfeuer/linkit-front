export const WHATSAPP_ADVISOR = {
  phone: "5491165287429",
  name: "Ary",
} as const

export function getWhatsAppUrl(lang: "es" | "en" = "es"): string {
  const message =
    lang === "en"
      ? `Hi ${WHATSAPP_ADVISOR.name}, I'd like to speak with a LinkIT advisor.`
      : `Hola ${WHATSAPP_ADVISOR.name}, me gustaría hablar con un asesor de LinkIT.`

  return `https://wa.me/${WHATSAPP_ADVISOR.phone}?text=${encodeURIComponent(message)}`
}
