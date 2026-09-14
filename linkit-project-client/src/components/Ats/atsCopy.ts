export type AtsLang = "es" | "en";

export type AtsErrorKey =
  | "rateLimited"
  | "loadView"
  | "loadPipeline"
  | "recaptcha"
  | "badUser"
  | "loginFailed"
  | "generic";

export type AtsCvErrorKey = "loadCv";
export type AtsCommentErrorKey = "saveComment";

const STAGE_LABELS_EN: Record<string, string> = {
  "0. Applied": "Applied",
  "1. Listo para entrevistar": "Ready to interview",
  "2. Listo para presentar": "Ready to present",
  "3. Rechazado por LinkIT": "Rejected by LinkIT",
  "4. Enviado a cliente": "Sent to client",
  "5. Entrevistado por cliente": "Interviewed by client",
  "6. Rechazado por cliente": "Rejected by client",
  "7. Ofertado": "Offered",
  "8. Oferta rechazada": "Offer declined",
  "9. Candidato desistió": "Candidate withdrew",
  "10. Contratado": "Hired",
  "11. Blacklist": "Blacklist",
};

export function formatStageLabel(stage: string, lang: AtsLang): string {
  if (lang === "en" && STAGE_LABELS_EN[stage]) {
    return STAGE_LABELS_EN[stage];
  }
  return stage.replace(/^\d+\.\s*/, "").trim() || stage;
}

export const ATS_COPY = {
  es: {
    loadingAria: "Cargando contenido",
    navAria: "Navegación del portal ATS",
    securePortal: "Portal seguro",
    heroKicker: "LinkIT · Client Portal",
    heroTitle: "Portal de Clientes",
    heroLead:
      "Visualizá el avance de tus candidatos, filtrá por etapa y país, y revisá CVs y endorsements en un solo lugar.",
    welcomeSpace: (label: string) => `Bienvenido a tu espacio · ${label}`,
    candidatesVisible: (n: number) =>
      `${n} candidato${n === 1 ? "" : "s"} visibles`,
    openJobs: (n: number) =>
      `${n} búsqueda${n === 1 ? "" : "s"} abierta${n === 1 ? "" : "s"}`,
    companiesCount: (n: number) =>
      `${n} razón${n === 1 ? "" : "es"} social${n === 1 ? "" : "es"}`,
    talentTag: "LinkIT Talent",
    talentCta:
      "Contrata y gestiona talentos de forma global",
    startNow: "Comienza ahora! →",
    loginKicker: "Acceso seguro",
    loginTitle: "Bienvenido a tu portal",
    loginLead:
      "Ingresá tu usuario para ver el seguimiento de candidatos preseleccionados por LinkIT.",
    userLabel: "Usuario",
    userPlaceholder: "Tu usuario de acceso",
    verifying: "Verificando…",
    enterPortal: "Entrar al portal",
    backToJobs: "← Volver a búsquedas",
    backToCompanies: "← Volver a razones sociales",
    yourCompanies: "Tus razones sociales",
    yourOpenJobs: "Tus búsquedas abiertas",
    pickJob: "Elegí una búsqueda para ver candidatos",
    workspaceFallback: "Portal ATS",
    companySummary: (companies: number, jobs: number, candidates: number) =>
      `${companies} razón${companies === 1 ? "" : "es"} social${companies === 1 ? "" : "es"} · ${jobs} búsqueda${jobs === 1 ? "" : "s"} · ${candidates} candidato${candidates === 1 ? "" : "s"}`,
    jobSummary: (jobs: number, candidates: number) =>
      `${jobs} búsqueda${jobs === 1 ? "" : "s"} · ${candidates} candidato${candidates === 1 ? "" : "s"}`,
    candidatesCount: (n: number) => `${n} candidato${n === 1 ? "" : "s"}`,
    inThisRole: (n: number) => `${n} en este rol`,
    logout: "Cerrar sesión",
    stage: "Stage",
    country: "País",
    all: "Todos",
    none: "Ninguno",
    selected: (n: number) => `${n} seleccionados`,
    closeStages: "Cerrar menú de stages",
    closeCountries: "Cerrar menú de países",
    countriesInView: "Países en esta vista",
    noCountries: "No hay países en estos candidatos.",
    sort: "Orden",
    sortAsc: "Ascendente",
    sortDesc: "Descendente",
    view: "Ver",
    prevPage: "Página anterior",
    nextPage: "Página siguiente",
    legalEntity: "Razón social",
    jobCount: (n: number) => `búsqueda${n === 1 ? "" : "s"}`,
    candidateWord: (n: number) => `candidato${n === 1 ? "" : "s"}`,
    seeJobs: "Ver búsquedas →",
    jobFallback: "Búsqueda",
    code: "Código",
    seePipeline: "Ver pipeline →",
    noJobs: "No hay búsquedas abiertas para este holding.",
    noCandidates: "Todavía no hay candidatos para este workspace.",
    noFilterMatch: "No hay candidatos con los filtros seleccionados.",
    colId: "ID",
    colCandidate: "Candidato",
    colRole: "Rol",
    colStage: "Stage",
    colCountry: "País",
    colLinkedin: "LinkedIn",
    colCv: "CV",
    colEndorsement: "Endorsement",
    colComment: "Comentario",
    profile: "Perfil",
    viewPdf: "Ver PDF",
    viewAction: "Ver",
    viewEdit: "Ver / Editar",
    add: "Agregar",
    showing: (start: number, end: number, total: number) =>
      `Mostrando ${start}-${end} de ${total}`,
    previous: "Anterior",
    next: "Siguiente",
    footerTalent:
      "Contrata y gestiona talentos de forma global con LinkIT",
    powered: "Powered by LinkIT · Talento con seguimiento transparente",
    candidate: "Candidato",
    pdfDocument: "Documento PDF",
    openTab: "Abrir en pestaña",
    close: "Cerrar",
    loadingCv: "Cargando CV…",
    commentSaved: "Comentario guardado",
    commentSavedBody:
      "El comentario se agregó correctamente y ya quedó disponible para el equipo de LinkIT.",
    understood: "Entendido",
    commentVisible: "Visible para el equipo LinkIT en Airtable",
    commentLabel: "Escribí tu comentario sobre este candidato…",
    commentPlaceholder: "Escribí tu comentario sobre este candidato…",
    cancel: "Cancelar",
    saving: "Guardando…",
    saveComment: "Guardar comentario",
    errors: {
      rateLimited: "Demasiados intentos. Probá de nuevo en unos minutos.",
      loadView: "No se pudo cargar la vista ATS. Intentá de nuevo.",
      loadPipeline: "No se pudo cargar el pipeline. Intentá de nuevo.",
      recaptcha: "No pudimos verificar que no sos un robot. Probá de nuevo.",
      badUser: "Usuario incorrecto. Probá de nuevo.",
      loginFailed: "No se pudo iniciar sesión. Intentá de nuevo.",
      generic: "Error al cargar datos.",
    } satisfies Record<AtsErrorKey, string>,
    cvErrors: {
      loadCv: "No se pudo cargar el CV. Intentá de nuevo.",
    } satisfies Record<AtsCvErrorKey, string>,
    commentErrors: {
      saveComment: "No se pudo guardar el comentario. Intentá de nuevo.",
    } satisfies Record<AtsCommentErrorKey, string>,
  },
  en: {
    loadingAria: "Loading content",
    navAria: "ATS portal navigation",
    securePortal: "Secure portal",
    heroKicker: "LinkIT · Client Portal",
    heroTitle: "Client Portal",
    heroLead:
      "Track your candidates, filter by stage and country, and review CVs and endorsements in one place.",
    welcomeSpace: (label: string) => `Welcome to your workspace · ${label}`,
    candidatesVisible: (n: number) =>
      `${n} visible candidate${n === 1 ? "" : "s"}`,
    openJobs: (n: number) => `${n} open search${n === 1 ? "" : "es"}`,
    companiesCount: (n: number) =>
      `${n} legal entit${n === 1 ? "y" : "ies"}`,
    talentTag: "LinkIT Talent",
    talentCta: "Hire and manage talent globally",
    startNow: "Get started! →",
    loginKicker: "Secure access",
    loginTitle: "Welcome to your portal",
    loginLead:
      "Enter your username to see the pipeline of candidates shortlisted by LinkIT.",
    userLabel: "Username",
    userPlaceholder: "Your access username",
    verifying: "Verifying…",
    enterPortal: "Enter the portal",
    backToJobs: "← Back to searches",
    backToCompanies: "← Back to legal entities",
    yourCompanies: "Your legal entities",
    yourOpenJobs: "Your open searches",
    pickJob: "Choose a search to view candidates",
    workspaceFallback: "ATS Portal",
    companySummary: (companies: number, jobs: number, candidates: number) =>
      `${companies} legal entit${companies === 1 ? "y" : "ies"} · ${jobs} search${jobs === 1 ? "" : "es"} · ${candidates} candidate${candidates === 1 ? "" : "s"}`,
    jobSummary: (jobs: number, candidates: number) =>
      `${jobs} search${jobs === 1 ? "" : "es"} · ${candidates} candidate${candidates === 1 ? "" : "s"}`,
    candidatesCount: (n: number) =>
      `${n} candidate${n === 1 ? "" : "s"}`,
    inThisRole: (n: number) => `${n} in this role`,
    logout: "Sign out",
    stage: "Stage",
    country: "Country",
    all: "All",
    none: "None",
    selected: (n: number) => `${n} selected`,
    closeStages: "Close stages menu",
    closeCountries: "Close countries menu",
    countriesInView: "Countries in this view",
    noCountries: "There are no countries in these candidates.",
    sort: "Sort",
    sortAsc: "Ascending",
    sortDesc: "Descending",
    view: "View",
    prevPage: "Previous page",
    nextPage: "Next page",
    legalEntity: "Legal entity",
    jobCount: (n: number) => `search${n === 1 ? "" : "es"}`,
    candidateWord: (n: number) => `candidate${n === 1 ? "" : "s"}`,
    seeJobs: "View searches →",
    jobFallback: "Search",
    code: "Code",
    seePipeline: "View pipeline →",
    noJobs: "There are no open searches for this holding.",
    noCandidates: "There are no candidates for this workspace yet.",
    noFilterMatch: "No candidates match the selected filters.",
    colId: "ID",
    colCandidate: "Candidate",
    colRole: "Role",
    colStage: "Stage",
    colCountry: "Country",
    colLinkedin: "LinkedIn",
    colCv: "CV",
    colEndorsement: "Endorsement",
    colComment: "Comment",
    profile: "Profile",
    viewPdf: "View PDF",
    viewAction: "View",
    viewEdit: "View / Edit",
    add: "Add",
    showing: (start: number, end: number, total: number) =>
      `Showing ${start}-${end} of ${total}`,
    previous: "Previous",
    next: "Next",
    footerTalent: "Hire and manage talent globally with LinkIT",
    powered: "Powered by LinkIT · Talent with transparent tracking",
    candidate: "Candidate",
    pdfDocument: "PDF document",
    openTab: "Open in new tab",
    close: "Close",
    loadingCv: "Loading CV…",
    commentSaved: "Comment saved",
    commentSavedBody:
      "The comment was added successfully and is now available for the LinkIT team.",
    understood: "Got it",
    commentVisible: "Visible to the LinkIT team in Airtable",
    commentLabel: "Write your comment about this candidate…",
    commentPlaceholder: "Write your comment about this candidate…",
    cancel: "Cancel",
    saving: "Saving…",
    saveComment: "Save comment",
    errors: {
      rateLimited: "Too many attempts. Please try again in a few minutes.",
      loadView: "Could not load the ATS view. Please try again.",
      loadPipeline: "Could not load the pipeline. Please try again.",
      recaptcha: "We could not verify you are not a robot. Please try again.",
      badUser: "Incorrect username. Please try again.",
      loginFailed: "Could not sign in. Please try again.",
      generic: "Error loading data.",
    } satisfies Record<AtsErrorKey, string>,
    cvErrors: {
      loadCv: "Could not load the CV. Please try again.",
    } satisfies Record<AtsCvErrorKey, string>,
    commentErrors: {
      saveComment: "Could not save the comment. Please try again.",
    } satisfies Record<AtsCommentErrorKey, string>,
  },
} as const;
