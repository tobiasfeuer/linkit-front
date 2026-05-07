import { useTranslation } from "react-i18next"

type PolicyContent = {
  title: string
  summaryTitle: string
  summary: string
  sections: Array<{
    title: string
    paragraphs?: string[]
    bullets?: string[]
  }>
  contactLabel: string
}

const content: Record<"es" | "en", PolicyContent> = {
  es: {
    title: "🔐 Política de Privacidad – LinkIT",
    summaryTitle: "🧾 Resumen rápido",
    summary:
      "En LinkIT respetamos tu privacidad. Recopilamos solo los datos necesarios para operar el servicio, mejorar tu experiencia y comunicarnos con vos. No vendemos tus datos personales.",
    sections: [
      {
        title: "1. Responsable del tratamiento",
        paragraphs: [
          "Esta Política de Privacidad describe cómo LinkIT (“LinkIT”, “nosotros”) recopila, utiliza y protege tus datos personales a través de:",
          "👉 https://www.linkit-hr.com/",
          "Si tenés consultas, podés contactarnos a través de nuestro formulario de contacto.",
        ],
      },
      {
        title: "2. Qué datos recopilamos",
        paragraphs: [
          "📌 Datos que nos proporcionás",
          "“Nombre y apellido, correo electrónico y demás información que nos compartas a través de formularios o contacto con el sitio.”",
          "⚙️ Datos recopilados automáticamente",
          "“También recopilamos datos de navegación y uso del sitio (por ejemplo, información técnica del navegador/dispositivo, páginas visitadas y tiempos de navegación) para funcionamiento, mejora y seguridad.”",
        ],
      },
      {
        title: "3. Base legal para el tratamiento (GDPR)",
        paragraphs: ["Tratamos tus datos bajo las siguientes bases legales:"],
        bullets: [
          "Consentimiento: cuando completás formularios o aceptás cookies",
          "Interés legítimo: para mejorar el servicio y analizar uso",
          "Ejecución de contrato: cuando utilizás nuestros servicios",
        ],
      },
      {
        title: "4. Cómo usamos tus datos",
        paragraphs: ["Usamos tu información para:"],
        bullets: [
          "Operar y mantener el sitio",
          "Responder consultas",
          "Mejorar la experiencia de usuario",
          "Analizar métricas de uso",
          "Garantizar seguridad y prevenir abusos",
        ],
      },
      {
        title: "5. Cookies y tecnologías de seguimiento",
        paragraphs: [
          "Usamos cookies para:",
          "Podés gestionar o desactivar cookies desde tu navegador.",
          "👉 (Recomendado: agregar banner de cookies si tienen tráfico europeo)",
        ],
        bullets: ["Funcionamiento del sitio", "Preferencias del usuario", "Análisis y rendimiento"],
      },
      {
        title: "6. Compartición de datos",
        paragraphs: [
          "Proveedores tecnológicos: terceros que nos ayudan a operar el servicio, por ejemplo, servicios de hosting (alojamiento web), herramientas de analítica y soporte operativo/técnico.",
          "Estos proveedores solo acceden a la información necesaria para prestar su servicio y bajo obligaciones de confidencialidad.",
          "👉 No vendemos tus datos personales.",
        ],
      },
      {
        title: "7. Transferencias internacionales",
        paragraphs: [
          "Tus datos pueden procesarse fuera de tu jurisdicción, dado que operamos de forma global, aplicando medidas de protección adecuadas.",
          "En estos casos, garantizamos que:",
        ],
        bullets: [
          "Existan medidas de protección adecuadas",
          "Se utilicen cláusulas contractuales estándar (SCCs) cuando corresponda",
        ],
      },
      {
        title: "8. Retención de datos",
        paragraphs: ["Conservamos los datos solo el tiempo necesario para:"],
        bullets: ["Cumplir los fines descritos", "Cumplir obligaciones legales"],
      },
      {
        title: "9. Seguridad",
        paragraphs: [
          "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos. Aun así, ningún sistema es completamente seguro.",
        ],
      },
      {
        title: "10. Tus derechos (GDPR y equivalentes)",
        paragraphs: [
          "Dependiendo de tu país, podés tener derecho a:",
          "Para ejercer estos derechos, podés contactarnos.",
        ],
        bullets: [
          "Acceder a tus datos",
          "Rectificarlos",
          "Solicitar su eliminación",
          "Limitar u oponerte al tratamiento",
          "Solicitar portabilidad",
        ],
      },
      {
        title: "11. Privacidad de menores",
        paragraphs: [
          "El servicio no está dirigido a menores de 13 años (o edad equivalente según jurisdicción). No recopilamos datos intencionalmente de menores.",
        ],
      },
      {
        title: "12. Enlaces a terceros",
        paragraphs: ["No somos responsables por las políticas de privacidad de sitios externos."],
      },
      {
        title: "13. Cambios en esta política",
        paragraphs: ["Podemos actualizar esta política. Publicaremos la versión actualizada en esta página."],
      },
      {
        title: "14. Contacto",
        paragraphs: ["Si tenés dudas sobre esta Política de Privacidad, podés escribirnos a:"],
      },
    ],
    contactLabel: "contacto@linkit-hr.com",
  },
  en: {
    title: "🔐 Privacy Policy - LinkIT",
    summaryTitle: "🧾 Quick summary",
    summary:
      "At LinkIT, we respect your privacy. We collect only the data needed to operate the service, improve your experience, and communicate with you. We do not sell your personal data.",
    sections: [
      {
        title: "1. Data controller",
        paragraphs: [
          "This Privacy Policy describes how LinkIT (“LinkIT”, “we”) collects, uses, and protects your personal data through:",
          "👉 https://www.linkit-hr.com/",
          "If you have questions, you can contact us through our contact form.",
        ],
      },
      {
        title: "2. What data we collect",
        paragraphs: [
          "📌 Data you provide",
          "\"Full name, email address, and any other information you share through forms or by contacting us through the site.\"",
          "⚙️ Data collected automatically",
          "\"We also collect navigation and site usage data (for example, technical browser/device information, pages visited, and browsing time) for operation, improvement, and security.\"",
        ],
      },
      {
        title: "3. Legal basis for processing (GDPR)",
        paragraphs: ["We process your data under the following legal bases:"],
        bullets: [
          "Consent: when you complete forms or accept cookies",
          "Legitimate interest: to improve the service and analyze usage",
          "Contract performance: when you use our services",
        ],
      },
      {
        title: "4. How we use your data",
        paragraphs: ["We use your information to:"],
        bullets: [
          "Operate and maintain the site",
          "Respond to inquiries",
          "Improve user experience",
          "Analyze usage metrics",
          "Ensure security and prevent abuse",
        ],
      },
      {
        title: "5. Cookies and tracking technologies",
        paragraphs: [
          "We use cookies for:",
          "You can manage or disable cookies from your browser.",
          "👉 (Recommended: add a cookie banner if you have European traffic)",
        ],
        bullets: ["Site functionality", "User preferences", "Analytics and performance"],
      },
      {
        title: "6. Data sharing",
        paragraphs: [
          "Technology providers: third parties that help us operate the service, for example hosting services, analytics tools, and technical/operational support.",
          "These providers only access the information necessary to deliver their services and are bound by confidentiality obligations.",
          "👉 We do not sell your personal data.",
        ],
      },
      {
        title: "7. International transfers",
        paragraphs: [
          "Your data may be processed outside your jurisdiction, as we operate globally, applying appropriate safeguards.",
          "In these cases, we ensure:",
        ],
        bullets: [
          "Appropriate data protection measures are in place",
          "Standard Contractual Clauses (SCCs) are used when applicable",
        ],
      },
      {
        title: "8. Data retention",
        paragraphs: ["We keep data only as long as needed to:"],
        bullets: ["Fulfill the purposes described", "Comply with legal obligations"],
      },
      {
        title: "9. Security",
        paragraphs: [
          "We apply reasonable technical and organizational measures to protect your data. However, no system is completely secure.",
        ],
      },
      {
        title: "10. Your rights (GDPR and equivalents)",
        paragraphs: [
          "Depending on your country, you may have the right to:",
          "To exercise these rights, you can contact us.",
        ],
        bullets: [
          "Access your data",
          "Rectify your data",
          "Request deletion",
          "Restrict or object to processing",
          "Request portability",
        ],
      },
      {
        title: "11. Children's privacy",
        paragraphs: [
          "The service is not directed to children under 13 years old (or equivalent age by jurisdiction). We do not intentionally collect children's data.",
        ],
      },
      {
        title: "12. Third-party links",
        paragraphs: ["We are not responsible for the privacy policies of external websites."],
      },
      {
        title: "13. Changes to this policy",
        paragraphs: ["We may update this policy. The updated version will be published on this page."],
      },
      {
        title: "14. Contact",
        paragraphs: ["If you have questions about this Privacy Policy, you can write to us at:"],
      },
    ],
    contactLabel: "contacto@linkit-hr.com",
  },
}

export default function PrivacyPolicy() {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith("en") ? "en" : "es"
  const t = content[lang]

  return (
    <div className="bg-linkIt-500 p-[7%] pt-[17vh] lg:pt-[23vh]">
      <h1 className="titles-size text-center font-bold font-manrope mb-6">{t.title}</h1>

      <h2 className="subtitles-size font-bold font-montserrat text-linkIt-300">{t.summaryTitle}</h2>
      <p className="text-size font-montserrat my-[2%]">{t.summary}</p>

      {t.sections.map((section) => (
        <div key={section.title}>
          <h2 className="subtitles-size font-bold font-montserrat text-linkIt-300">{section.title}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="text-size font-montserrat my-[2%]">
              {paragraph}
            </p>
          ))}
          {section.bullets && (
            <ul className="list-disc pl-6 text-size font-montserrat space-y-1">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
          {section.title.startsWith("14.") && (
            <p className="text-size font-montserrat my-[2%]">
              📩{" "}
              <a href={`mailto:${t.contactLabel}`} className="underline underline-offset-2">
                {t.contactLabel}
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  )
}