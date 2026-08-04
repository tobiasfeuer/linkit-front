import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleReCaptcha } from "react-google-recaptcha-hook";

type StageSortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const PIPELINE_STAGES = [
  "0. Applied",
  "1. Listo para entrevistar",
  "2. Listo para presentar",
  "3. Rechazado por LinkIT",
  "4. Enviado a cliente",
  "5. Entrevistado por cliente",
  "6. Rechazado por cliente",
  "7. Ofertado",
  "8. Oferta rechazada",
  "9. Candidato desistió",
  "10. Contratado",
  "11. Blacklist",
] as const;

type PipelineStage = (typeof PIPELINE_STAGES)[number];

/** Solo stages visibles para el cliente (4 → 10). */
const CLIENT_VISIBLE_STAGES = [
  "4. Enviado a cliente",
  "5. Entrevistado por cliente",
  "6. Rechazado por cliente",
  "7. Ofertado",
  "8. Oferta rechazada",
  "9. Candidato desistió",
  "10. Contratado",
] as const satisfies readonly PipelineStage[];

type ClientVisibleStage = (typeof CLIENT_VISIBLE_STAGES)[number];

const CLIENT_VISIBLE_STAGE_SET = new Set<string>(CLIENT_VISIBLE_STAGES);

const STAGE_ORDER = PIPELINE_STAGES.reduce<Record<string, number>>(
  (acc, stage, index) => {
    acc[stage] = index;
    return acc;
  },
  {}
);

/** "4. Enviado a cliente" → "Enviado a cliente" (solo UI; el valor crudo se usa para filtrar). */
function formatStageLabel(stage: string): string {
  return stage.replace(/^\d+\.\s*/, "").trim() || stage;
}

interface AtsCandidate {
  name: string;
  candidateId: string;
  roleName: string;
  linkedin: string;
  pipelineStage: string;
  roleCode: string;
  country?: string;
  hasCv: boolean;
  cvFilename: string;
  endorsement: string;
  clientComment?: string;
}

interface AtsResponse {
  filter: { type: "roleCode" | "clientSlug"; value: string };
  count: number;
  candidates: AtsCandidate[];
}

const ATS_API_BASE = `${import.meta.env.VITE_ENDPOINT_URL}/resources/applications-status`;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const LINKIT_BLUE_LOGO =
  "/Linkit/Linkit-logo/linkit-logos-web_1-logo-ppal-azul.svg";
const LINKIT_WHITE_LOGO = "/Linkit-logo/linkit-logo-2024-white.svg";

function SplitText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      aria-label={text}
      className={`inline-flex flex-wrap ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { delayChildren: delay, staggerChildren: 0.018 },
        },
      }}
    >
      {Array.from(text).map((character, index) => (
        <motion.span
          aria-hidden="true"
          key={`${character}-${index}`}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 16, filter: "blur(7px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {character === " " ? "\u00A0" : character}
        </motion.span>
      ))}
    </motion.span>
  );
}

function LoadingSkeletonCards() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Cargando contenido"
      role="status"
    >
      {[0, 1, 2].map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: item * 0.08 }}
          className="relative min-h-[168px] overflow-hidden rounded-2xl border border-linkIt-50 bg-white p-5 shadow-[0_10px_30px_rgba(23,57,81,0.06)]"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
            initial={{ x: "-110%" }}
            animate={{ x: "260%" }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item * 0.12,
            }}
          />
          <img
            src={LINKIT_BLUE_LOGO}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 -right-5 w-40 opacity-[0.035] grayscale"
          />
          <div className="relative animate-pulse">
            <div className="h-2.5 w-24 rounded-full bg-linkIt-50" />
            <div className="mt-5 h-5 w-3/4 rounded-full bg-[#dfe8ee]" />
            <div className="mt-2.5 h-3 w-2/5 rounded-full bg-linkIt-50" />
            <div className="mt-7 flex items-center justify-between">
              <div className="h-7 w-28 rounded-full bg-linkIt-500" />
              <div className="h-3 w-20 rounded-full bg-linkIt-50" />
            </div>
          </div>
        </motion.div>
      ))}
      <span className="sr-only">Preparando el portal de clientes…</span>
    </motion.div>
  );
}

/** Desactivado en localhost para tests locales (reCAPTCHA vuelve en deploy). */
const IS_LOCALHOST =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");
const RECAPTCHA_ENABLED = Boolean(RECAPTCHA_SITE_KEY) && !IS_LOCALHOST;

interface JobCardSummary {
  key: string;
  roleCode: string;
  roleName: string;
  company: string;
  clientSlug: string;
  candidateCount: number;
}

interface JobsResponse {
  holding: string;
  count: number;
  jobs: Array<Omit<JobCardSummary, "key" | "candidateCount"> & {
    candidateCount: number;
  }>;
}

interface CompanyCardSummary {
  key: string;
  name: string;
  jobCount: number;
  candidateCount: number;
}

function isAllowedHttpUrl(
  value: string,
  allowedHost: (host: string) => boolean
): string {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    const host = parsed.hostname.toLowerCase();
    return allowedHost(host) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function safeLinkedInUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return isAllowedHttpUrl(
    withProtocol,
    (host) => host === "linkedin.com" || host.endsWith(".linkedin.com")
  );
}

function candidateMatchesCountries(
  candidateCountry: string | undefined | null,
  selectedCountries: string[],
  allSelected: boolean
): boolean {
  if (allSelected) return true;
  if (selectedCountries.length === 0) return false;
  const country = (candidateCountry ?? "").trim();
  if (!country) return false;
  const selectedSet = new Set(
    selectedCountries.map((item) => item.toLowerCase())
  );
  return country
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .some((item) => selectedSet.has(item));
}

function extractCandidateCountries(candidates: AtsCandidate[]): string[] {
  const countries = new Set<string>();
  for (const candidate of candidates) {
    const country = candidate.country ?? "";
    if (!country) continue;
    country
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => countries.add(item));
  }
  return Array.from(countries).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );
}

function ApplicationsStatusViewBase({
  executeRecaptcha,
}: {
  executeRecaptcha?: (action: string) => Promise<string>;
} = {}) {
  const [accessInput, setAccessInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);

  const [data, setData] = useState<AtsResponse | null>(null);
  const [holding, setHolding] = useState("");
  const [jobCards, setJobCards] = useState<JobCardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStages, setSelectedStages] = useState<ClientVisibleStage[]>([
    ...CLIENT_VISIBLE_STAGES,
  ]);
  const [stageSort, setStageSort] = useState<StageSortDirection>("asc");
  const [stageMenuOpen, setStageMenuOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [cvModal, setCvModal] = useState<AtsCandidate | null>(null);
  const [cvBlobUrl, setCvBlobUrl] = useState<string | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [endorsementModal, setEndorsementModal] =
    useState<AtsCandidate | null>(null);
  const [commentModal, setCommentModal] = useState<AtsCandidate | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccessOpen, setCommentSuccessOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedJobKey, setSelectedJobKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCompany(null);
    setSelectedJobKey(null);
  }, [sessionEpoch]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get<JobsResponse>(`${ATS_API_BASE}/jobs`, {
          withCredentials: true,
        });
        if (!cancelled) {
          setHolding(response.data.holding);
          setJobCards(
            response.data.jobs.map((job) => ({
              ...job,
              key: `${job.clientSlug}:${job.roleCode}`,
            }))
          );
          setData(null);
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          const status = err?.response?.status;
          setData(null);
          if (status === 429) {
            setIsAuthenticated(false);
            setError("Demasiados intentos. Probá de nuevo en unos minutos.");
          } else if (status === 401) {
            setIsAuthenticated(false);
            setError(null);
          } else {
            setIsAuthenticated(false);
            setError("No se pudo cargar la vista ATS. Intentá de nuevo.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionEpoch]);

  const selectedJob = useMemo(
    () => jobCards.find((job) => job.key === selectedJobKey) ?? null,
    [jobCards, selectedJobKey]
  );

  useEffect(() => {
    if (!selectedJob || !isAuthenticated) {
      setData(null);
      return;
    }

    let cancelled = false;
    const loadCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<AtsResponse>(ATS_API_BASE, {
          params: {
            clientSlug: selectedJob.clientSlug,
            roleCode: selectedJob.roleCode,
          },
          withCredentials: true,
        });
        if (!cancelled) setData(response.data);
      } catch {
        if (!cancelled) {
          setData(null);
          setError("No se pudo cargar el pipeline. Intentá de nuevo.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCandidates();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, selectedJob]);

  useEffect(() => {
    if (!cvModal || !selectedJob || !cvModal.candidateId) {
      setCvBlobUrl(null);
      setCvError(null);
      setCvLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const loadCv = async () => {
      setCvLoading(true);
      setCvError(null);
      setCvBlobUrl(null);
      try {
        const response = await axios.get(
          `${ATS_API_BASE}/cv/${encodeURIComponent(cvModal.candidateId)}`,
          {
            params: { clientSlug: selectedJob.clientSlug },
            responseType: "blob",
            withCredentials: true,
          }
        );

        // Si el backend devolvió JSON de error con status 2xx raro, o blob sin type PDF
        const contentType = String(
          response.headers["content-type"] || response.data?.type || ""
        ).toLowerCase();
        if (contentType.includes("application/json")) {
          throw new Error("CV_UNAVAILABLE");
        }

        const pdfBlob =
          response.data instanceof Blob &&
          response.data.type &&
          response.data.type.includes("pdf")
            ? response.data
            : new Blob([response.data], { type: "application/pdf" });

        objectUrl = URL.createObjectURL(pdfBlob);
        if (!cancelled) setCvBlobUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setCvError("No se pudo cargar el CV. Intentá de nuevo.");
          setCvBlobUrl(null);
        }
      } finally {
        if (!cancelled) setCvLoading(false);
      }
    };

    void loadCv();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cvModal, selectedJob]);

  const jobCardsCandidateTotal = useMemo(
    () => jobCards.reduce((sum, job) => sum + job.candidateCount, 0),
    [jobCards]
  );

  const companyCards = useMemo(() => {
    const companies = new Map<string, CompanyCardSummary>();
    for (const job of jobCards) {
      const key = job.company.trim().toLowerCase();
      const existing = companies.get(key);
      if (existing) {
        existing.jobCount += 1;
        existing.candidateCount += job.candidateCount;
      } else {
        companies.set(key, {
          key,
          name: job.company,
          jobCount: 1,
          candidateCount: job.candidateCount,
        });
      }
    }
    return Array.from(companies.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
    );
  }, [jobCards]);

  const companyJobCards = useMemo(
    () =>
      selectedCompany
        ? jobCards.filter(
            (job) => job.company.trim().toLowerCase() === selectedCompany
          )
        : [],
    [jobCards, selectedCompany]
  );

  const companyCandidateTotal = useMemo(
    () => companyJobCards.reduce((sum, job) => sum + job.candidateCount, 0),
    [companyJobCards]
  );

  const jobScopedCandidates = useMemo(() => {
    return data?.candidates ?? [];
  }, [data?.candidates]);

  const suggestedCountries = useMemo(
    () => extractCandidateCountries(jobScopedCandidates),
    [jobScopedCandidates]
  );

  useEffect(() => {
    setSelectedCountries(suggestedCountries);
  }, [suggestedCountries]);

  useEffect(() => {
    if (!selectedJobKey) return;
    setSelectedStages([...CLIENT_VISIBLE_STAGES]);
    setCurrentPage(1);
  }, [selectedJobKey]);

  useEffect(() => {
    if (
      !cvModal &&
      !endorsementModal &&
      !commentModal &&
      !commentSuccessOpen &&
      !stageMenuOpen &&
      !countryMenuOpen
    ) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCvModal(null);
        setEndorsementModal(null);
        setCommentModal(null);
        setCommentSuccessOpen(false);
        setStageMenuOpen(false);
        setCountryMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    cvModal,
    endorsementModal,
    commentModal,
    commentSuccessOpen,
    stageMenuOpen,
    countryMenuOpen,
  ]);

  const openCommentModal = (candidate: AtsCandidate) => {
    setCommentModal(candidate);
    setCommentDraft(candidate.clientComment || "");
    setCommentError(null);
  };

  const handleSaveComment = async () => {
    if (!commentModal?.candidateId || !selectedJob || commentSaving) return;
    setCommentSaving(true);
    setCommentError(null);
    try {
      const response = await axios.patch<{
        ok: boolean;
        candidateId: string;
        clientComment: string;
      }>(
        `${ATS_API_BASE}/comment`,
        {
          clientSlug: selectedJob.clientSlug,
          candidateId: commentModal.candidateId,
          comment: commentDraft,
        },
        { withCredentials: true }
      );

      const saved = response.data.clientComment ?? "";
      const savedCandidateId = commentModal.candidateId;
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          candidates: prev.candidates.map((item) =>
            item.candidateId === savedCandidateId
              ? { ...item, clientComment: saved }
              : item
          ),
        };
      });
      setCommentModal(null);
      setCommentDraft("");
      setCommentSuccessOpen(true);
    } catch {
      setCommentError("No se pudo guardar el comentario. Intentá de nuevo.");
    } finally {
      setCommentSaving(false);
    }
  };

  const allStagesSelected =
    selectedStages.length === CLIENT_VISIBLE_STAGES.length;
  const allCountriesSelected =
    suggestedCountries.length > 0 &&
    selectedCountries.length === suggestedCountries.length;

  const filteredCandidates = useMemo(() => {
    const selectedStageSet = new Set(selectedStages);
    const list = jobScopedCandidates.filter((candidate) => {
      if (!CLIENT_VISIBLE_STAGE_SET.has(candidate.pipelineStage)) {
        return false;
      }
      if (!selectedStageSet.has(candidate.pipelineStage as ClientVisibleStage)) {
        return false;
      }
      return candidateMatchesCountries(
        candidate.country,
        selectedCountries,
        allCountriesSelected || suggestedCountries.length === 0
      );
    });

    return [...list].sort((a, b) => {
      const left = STAGE_ORDER[a.pipelineStage] ?? Number.MAX_SAFE_INTEGER;
      const right = STAGE_ORDER[b.pipelineStage] ?? Number.MAX_SAFE_INTEGER;
      return stageSort === "asc" ? left - right : right - left;
    });
  }, [
    allCountriesSelected,
    jobScopedCandidates,
    selectedCountries,
    selectedStages,
    stageSort,
    suggestedCountries.length,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStages, selectedCountries, stageSort, pageSize, selectedJobKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / pageSize)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [currentPage, filteredCandidates, pageSize]);

  const pageStart =
    filteredCandidates.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filteredCandidates.length);

  const toggleStage = (stage: ClientVisibleStage) => {
    setSelectedStages((prev) => {
      if (prev.includes(stage)) {
        return prev.filter((item) => item !== stage);
      }
      return [...prev, stage];
    });
  };

  const selectAllStages = () => setSelectedStages([...CLIENT_VISIBLE_STAGES]);
  const clearStages = () => setSelectedStages([]);

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(country)) {
        return prev.filter((item) => item !== country);
      }
      return [...prev, country];
    });
  };

  const selectAllCountries = () =>
    setSelectedCountries([...suggestedCountries]);
  const clearCountries = () => setSelectedCountries([]);

  const stageButtonLabel = allStagesSelected
    ? "Todos"
    : selectedStages.length === 0
      ? "Ninguno"
      : `${selectedStages.length} seleccionados`;

  const countryButtonLabel = allCountriesSelected
    ? "Todos"
    : selectedCountries.length === 0
      ? "Ninguno"
      : `${selectedCountries.length} seleccionados`;

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    const value = accessInput.trim();
    if (!value || loginLoading) return;

    setLoginLoading(true);
    setError(null);
    try {
      let recaptchaToken = "";
      if (executeRecaptcha && RECAPTCHA_ENABLED) {
        try {
          recaptchaToken = await executeRecaptcha("ats_login");
        } catch {
          setError("No pudimos verificar que no sos un robot. Probá de nuevo.");
          return;
        }
      }

      await axios.post(
        `${ATS_API_BASE}/login`,
        {
          clientAccess: value,
          recaptchaToken,
        },
        { withCredentials: true }
      );

      setAccessInput("");
      setIsAuthenticated(true);
      setSessionEpoch((epoch) => epoch + 1);
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      if (status === 429) {
        setError("Demasiados intentos. Probá de nuevo en unos minutos.");
      } else if (code === "RECAPTCHA_FAILED") {
        setError("No pudimos verificar que no sos un robot. Probá de nuevo.");
      } else if (status === 401 || code === "CLIENT_ACCESS_INVALID") {
        setError("Usuario incorrecto. Probá de nuevo.");
      } else {
        setError("No se pudo iniciar sesión. Intentá de nuevo.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${ATS_API_BASE}/logout`, {}, { withCredentials: true });
    } catch {
      // ignore network errors on logout
    }
    setAccessInput("");
    setIsAuthenticated(false);
    setData(null);
    setHolding("");
    setJobCards([]);
    setSelectedCompany(null);
    setSelectedJobKey(null);
    setError(null);
    setSessionEpoch((epoch) => epoch + 1);
  };

  const workspaceLabel = holding || "Portal ATS";

  const roleSubtitle = selectedJob
    ? selectedJob.roleName
    : "Elegí una búsqueda para ver candidatos";

  const showLogin = authChecked && !isAuthenticated && !loading;
  const showCompanyCards =
    !showLogin &&
    !loading &&
    isAuthenticated &&
    !selectedCompany &&
    !selectedJobKey;
  const showJobCards =
    !showLogin &&
    !loading &&
    isAuthenticated &&
    !!selectedCompany &&
    !selectedJobKey;
  const showJobDetail = !showLogin && !loading && !!data && !!selectedJobKey;

  const filterButtonClass =
    "flex min-w-[210px] items-center justify-between rounded-lg border border-linkIt-50 bg-white px-3 py-2 text-left font-manrope text-sm text-linkIt-200 shadow-sm transition hover:border-linkIt-300";

  return (
    <main className="relative min-h-screen overflow-hidden bg-linkIt-500 font-manrope text-linkIt-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(1,162,139,0.18),_transparent_42%),radial-gradient(circle_at_80%_20%,_rgba(23,57,81,0.12),_transparent_35%)]" />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#173951] via-[#1c4a6b] to-[#0f2a3d] text-white">
        <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-linkIt-300/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-linkIt-50/10 blur-2xl" />

        <motion.nav
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-6xl px-4 pt-2.5 md:px-8"
          aria-label="Navegación del portal ATS"
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center rounded-xl border border-white/15 bg-white/[0.07] px-4 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-xl">
            <span className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-linkIt-300 shadow-[0_0_10px_rgba(1,162,139,0.9)]" />
              Portal seguro
            </span>
            <motion.div
              whileHover={{ scale: 1.035 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="px-4 py-1 drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)]"
            >
              <img
                src={LINKIT_WHITE_LOGO}
                alt="LinkIT"
                className="h-4 w-auto md:h-5"
              />
            </motion.div>
            <span className="justify-self-end text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              ATS · Client Side
            </span>
          </div>
        </motion.nav>

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="mb-3 font-montserrat text-xs font-semibold uppercase tracking-[0.22em] text-linkIt-50">
                LinkIT · Client Portal
              </p>
              <h1 className="max-w-3xl font-montserrat text-3xl font-bold leading-tight md:text-5xl">
                <SplitText text="Portal de Clientes" delay={0.16} />
              </h1>
              <p className="mt-2 font-montserrat text-lg font-medium text-linkIt-300 md:text-xl">
                Client Side by LinkIT
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                Visualizá el avance de tus candidatos, filtrá por etapa y país, y
                revisá CVs y endorsements en un solo lugar.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  Bienvenido a tu espacio · {workspaceLabel}
                </span>
                {!showLogin && !loading && isAuthenticated && (
                  <span className="rounded-full border border-linkIt-300/40 bg-linkIt-300/20 px-3 py-1 text-xs font-semibold text-linkIt-50">
                    {selectedJob
                      ? `${filteredCandidates.length} candidato${filteredCandidates.length === 1 ? "" : "s"} visibles`
                      : selectedCompany
                        ? `${companyJobCards.length} búsqueda${companyJobCards.length === 1 ? "" : "s"} abierta${companyJobCards.length === 1 ? "" : "s"}`
                        : `${companyCards.length} razón${companyCards.length === 1 ? "" : "es"} social${companyCards.length === 1 ? "" : "es"}`}
                  </span>
                )}
              </div>
            </div>

            <motion.a
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3qmMK1h4c08Aw_b5gFiF-vLjHYunVGIWvt6RyOJvaaQOVd8qQm9syzfgwV03LXDEnL7R_CHXbi"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:border-linkIt-300/50 hover:bg-white/15 lg:mt-2 lg:w-[280px]"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-linkIt-300/30 blur-2xl transition group-hover:bg-linkIt-300/45" />
              <p className="relative font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-linkIt-300">
                LinkIT Talent
              </p>
              <p className="relative mt-2 font-montserrat text-sm font-semibold leading-snug text-white">
                Contrata y gestiona talentos de forma global
              </p>
              <span className="relative mt-3 inline-flex items-center rounded-lg bg-linkIt-300 px-3 py-1.5 font-montserrat text-xs font-bold text-white transition group-hover:bg-[#01967f]">
                Comienza ahora! →
              </span>
            </motion.a>
          </motion.div>
        </div>
      </section>

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        {showLogin && (
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mx-auto max-w-md rounded-2xl border border-linkIt-50 bg-white p-7 shadow-[0_18px_50px_rgba(23,57,81,0.12)]"
          >
            <p className="mb-1 font-montserrat text-xs font-semibold uppercase tracking-[0.16em] text-linkIt-300">
              Acceso seguro
            </p>
            <h2 className="mb-2 font-montserrat text-2xl font-bold text-linkIt-200">
              Bienvenido a tu portal
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-linkIt-700">
              Ingresá tu usuario para ver el seguimiento de candidatos
              preseleccionados por LinkIT.
            </p>

            <label className="mb-2 block text-sm font-semibold text-linkIt-200">
              Usuario
            </label>
            <input
              type="password"
              value={accessInput}
              onChange={(e) => setAccessInput(e.target.value)}
              className="mb-4 w-full rounded-lg border border-linkIt-50 px-3 py-2.5 text-linkIt-200 outline-none transition focus:border-linkIt-300 focus:ring-2 focus:ring-linkIt-300/20"
              placeholder="Tu usuario de acceso"
              autoComplete="current-password"
              required
            />
            {error && (
              <p className="mb-3 text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-linkIt-300 px-4 py-3 font-montserrat text-sm font-bold text-white transition hover:bg-[#01967f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading ? "Verificando…" : "Entrar al portal"}
            </button>
            
          </motion.form>
        )}

        {!showLogin && !loading && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 rounded-2xl border border-linkIt-50 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {showJobDetail && (
                  <button
                    type="button"
                    onClick={() => setSelectedJobKey(null)}
                    className="mb-2 text-sm font-semibold text-linkIt-300 hover:underline"
                  >
                    ← Volver a búsquedas
                  </button>
                )}
                {showJobCards && (
                  <button
                    type="button"
                    onClick={() => setSelectedCompany(null)}
                    className="mb-2 text-sm font-semibold text-linkIt-300 hover:underline"
                  >
                    ← Volver a razones sociales
                  </button>
                )}
                <h2 className="font-montserrat text-xl font-bold text-linkIt-200 md:text-2xl">
                  {showCompanyCards
                    ? "Tus razones sociales"
                    : showJobCards
                      ? companyJobCards[0]?.company || "Tus búsquedas abiertas"
                      : roleSubtitle}
                </h2>
                <p className="mt-1 text-sm text-linkIt-700">
                  {showCompanyCards
                    ? `${companyCards.length} razón${companyCards.length === 1 ? "" : "es"} social${companyCards.length === 1 ? "" : "es"} · ${jobCards.length} búsqueda${jobCards.length === 1 ? "" : "s"} · ${jobCardsCandidateTotal} candidato${jobCardsCandidateTotal === 1 ? "" : "s"}`
                    : showJobCards
                      ? `${companyJobCards.length} búsqueda${companyJobCards.length === 1 ? "" : "s"} · ${companyCandidateTotal} candidato${companyCandidateTotal === 1 ? "" : "s"}`
                    : `${filteredCandidates.length} candidato${filteredCandidates.length === 1 ? "" : "s"}${
                        !allStagesSelected || !allCountriesSelected
                          ? ` · ${jobScopedCandidates.length} en este rol`
                          : ""
                      }`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-lg border border-linkIt-50 px-3 py-1.5 text-sm font-medium text-linkIt-700 transition hover:border-linkIt-300 hover:text-linkIt-200"
              >
                Cerrar sesión
              </button>
            </div>

            {showJobDetail && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCountryMenuOpen(false);
                    setStageMenuOpen((open) => !open);
                  }}
                  className={filterButtonClass}
                >
                  <span>Stage · {stageButtonLabel}</span>
                  <span className="ml-2 text-linkIt-700">▾</span>
                </button>
                {stageMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Cerrar menú de stages"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setStageMenuOpen(false)}
                    />
                    <div className="absolute left-0 z-20 mt-2 w-[320px] rounded-xl border border-linkIt-50 bg-white p-3 shadow-xl">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-montserrat text-xs font-semibold uppercase tracking-wide text-linkIt-700">
                          Stages
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllStages}
                            className="text-xs font-semibold text-linkIt-300 hover:underline"
                          >
                            Todos
                          </button>
                          <button
                            type="button"
                            onClick={clearStages}
                            className="text-xs font-medium text-linkIt-700 hover:underline"
                          >
                            Ninguno
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {CLIENT_VISIBLE_STAGES.map((stage) => (
                          <label
                            key={stage}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-linkIt-500"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStages.includes(stage)}
                              onChange={() => toggleStage(stage)}
                              className="h-4 w-4 rounded border-linkIt-50 text-linkIt-300 focus:ring-linkIt-300"
                            />
                            <span className="text-sm text-linkIt-200">
                              {formatStageLabel(stage)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setStageMenuOpen(false);
                    setCountryMenuOpen((open) => !open);
                  }}
                  className={filterButtonClass}
                >
                  <span>País · {countryButtonLabel}</span>
                  <span className="ml-2 text-linkIt-700">▾</span>
                </button>
                {countryMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Cerrar menú de países"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setCountryMenuOpen(false)}
                    />
                    <div className="absolute left-0 z-20 mt-2 w-[320px] rounded-xl border border-linkIt-50 bg-white p-3 shadow-xl md:left-auto md:right-0">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-montserrat text-xs font-semibold uppercase tracking-wide text-linkIt-700">
                          Países en esta vista
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllCountries}
                            className="text-xs font-semibold text-linkIt-300 hover:underline"
                          >
                            Todos
                          </button>
                          <button
                            type="button"
                            onClick={clearCountries}
                            className="text-xs font-medium text-linkIt-700 hover:underline"
                          >
                            Ninguno
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {suggestedCountries.length === 0 && (
                          <p className="px-2 py-1.5 text-sm text-linkIt-700">
                            No hay países en estos candidatos.
                          </p>
                        )}
                        {suggestedCountries.map((country) => (
                          <label
                            key={country}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-linkIt-500"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCountries.includes(country)}
                              onChange={() => toggleCountry(country)}
                              className="h-4 w-4 rounded border-linkIt-50 text-linkIt-300 focus:ring-linkIt-300"
                            />
                            <span className="text-sm text-linkIt-200">
                              {country}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-linkIt-700">
                Orden
                <select
                  value={stageSort}
                  onChange={(e) =>
                    setStageSort(e.target.value as StageSortDirection)
                  }
                  className="rounded-lg border border-linkIt-50 bg-white px-2 py-2 text-linkIt-200 outline-none focus:border-linkIt-300"
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </label>

              <div className="ml-auto flex flex-wrap items-center gap-2 rounded-full bg-linkIt-500/80 px-2 py-1.5">
                <label className="flex items-center gap-2 px-1 text-sm text-linkIt-700">
                  Ver
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      setPageSize(Number(e.target.value) as PageSize)
                    }
                    className="rounded-md border-0 bg-white px-2 py-1.5 text-sm font-semibold text-linkIt-200 outline-none ring-1 ring-linkIt-50 focus:ring-linkIt-300"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-linkIt-200 transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página anterior"
                  >
                    ←
                  </button>
                  <span className="min-w-[4.5rem] text-center text-xs font-semibold text-linkIt-200">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-linkIt-200 transition enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página siguiente"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            )}
          </motion.div>
        )}

        {showCompanyCards && companyCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {companyCards.map((company, index) => (
              <motion.button
                key={company.key}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.05, 0.35),
                }}
                whileHover={{ y: -7, scale: 1.012 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setSelectedCompany(company.key)}
                className="group relative overflow-hidden rounded-2xl border border-linkIt-50 bg-white p-5 text-left shadow-[0_10px_30px_rgba(23,57,81,0.06)] transition-colors hover:border-linkIt-300 hover:shadow-[0_20px_48px_rgba(23,57,81,0.15)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-8 h-32 w-32 rounded-full bg-linkIt-300/10 blur-2xl transition duration-500 group-hover:bg-linkIt-300/20" />
                <img
                  src={LINKIT_BLUE_LOGO}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-3 -right-5 w-40 rotate-[-6deg] opacity-[0.055] grayscale transition duration-500 group-hover:rotate-0 group-hover:opacity-[0.09]"
                />
                <p className="relative z-10 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-linkIt-300">
                  Razón social
                </p>
                <h3 className="relative z-10 mt-2 font-montserrat text-lg font-bold text-linkIt-200">
                  <SplitText text={company.name} delay={index * 0.04} />
                </h3>
                <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-linkIt-500 px-3 py-1 text-xs font-semibold text-linkIt-200">
                      {company.jobCount} búsqueda
                      {company.jobCount === 1 ? "" : "s"}
                    </span>
                    <span className="rounded-full bg-linkIt-500 px-3 py-1 text-xs font-semibold text-linkIt-200">
                      {company.candidateCount} candidato
                      {company.candidateCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-linkIt-300 transition group-hover:translate-x-0.5">
                    Ver búsquedas →
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {showJobCards && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {companyJobCards.map((job, index) => (
              <motion.button
                key={job.key}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.35) }}
                whileHover={{ y: -7, scale: 1.012 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setSelectedJobKey(job.key)}
                className="group relative overflow-hidden rounded-2xl border border-linkIt-50 bg-white p-5 text-left shadow-[0_10px_30px_rgba(23,57,81,0.06)] transition-colors hover:border-linkIt-300 hover:shadow-[0_20px_48px_rgba(23,57,81,0.15)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-8 h-32 w-32 rounded-full bg-linkIt-300/10 blur-2xl transition duration-500 group-hover:bg-linkIt-300/20" />
                <img
                  src={LINKIT_BLUE_LOGO}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-3 -right-5 w-40 rotate-[-6deg] opacity-[0.055] grayscale transition duration-500 group-hover:rotate-0 group-hover:opacity-[0.09]"
                />
                <p className="relative z-10 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-linkIt-300">
                  {job.company || "Búsqueda"}
                </p>
                <h3 className="relative z-10 mt-2 font-montserrat text-lg font-bold text-linkIt-200">
                  <SplitText text={job.roleName} delay={index * 0.04} />
                </h3>
                {job.roleCode && (
                  <p className="relative z-10 mt-1 text-xs text-linkIt-700">
                    Código · {job.roleCode}
                  </p>
                )}
                <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-linkIt-500 px-3 py-1 text-xs font-semibold text-linkIt-200">
                    {job.candidateCount} candidato{job.candidateCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-sm font-semibold text-linkIt-300 transition group-hover:translate-x-0.5">
                    Ver pipeline →
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {showCompanyCards && companyCards.length === 0 && (
          <p className="rounded-2xl border border-linkIt-50 bg-white px-5 py-8 text-linkIt-700 shadow-sm">
            No hay búsquedas abiertas para este holding.
          </p>
        )}

        {!showLogin && loading && <LoadingSkeletonCards />}

        {!showLogin && !loading && error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-red-700">
            {typeof error === "string" ? error : "Error al cargar datos."}
          </p>
        )}

        {!showLogin && !loading && !error && data && data.count === 0 && (
          <p className="rounded-2xl border border-linkIt-50 bg-white px-5 py-8 text-linkIt-700 shadow-sm">
            Todavía no hay candidatos para este workspace.
          </p>
        )}

        {!showLogin &&
          !loading &&
          !error &&
          data &&
          data.count > 0 &&
          showJobDetail &&
          filteredCandidates.length === 0 && (
            <p className="rounded-2xl border border-linkIt-50 bg-white px-5 py-8 text-linkIt-700 shadow-sm">
              No hay candidatos con los filtros seleccionados.
            </p>
          )}

        {!showLogin &&
          !loading &&
          !error &&
          data &&
          showJobDetail &&
          filteredCandidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-2xl border border-linkIt-50 bg-white shadow-[0_14px_40px_rgba(23,57,81,0.08)]"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-linkIt-50 text-center text-sm">
                  <thead className="bg-[#f3f7fa]">
                    <tr className="font-montserrat text-[11px] uppercase tracking-[0.12em] text-linkIt-700">
                      <th className="px-4 py-3.5 font-semibold">ID</th>
                      <th className="px-4 py-3.5 font-semibold">Candidato</th>
                      <th className="px-4 py-3.5 font-semibold">Rol</th>
                      <th className="px-4 py-3.5 font-semibold">Stage</th>
                      <th className="px-4 py-3.5 font-semibold">País</th>
                      <th className="px-4 py-3.5 font-semibold">LinkedIn</th>
                      <th className="px-4 py-3.5 font-semibold">CV</th>
                      <th className="px-4 py-3.5 font-semibold">Endorsement</th>
                      <th className="px-4 py-3.5 font-semibold">Comentario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linkIt-50/80">
                    {paginatedCandidates.map((candidate, index) => {
                      const linkedInHref = safeLinkedInUrl(candidate.linkedin);
                      return (
                      <motion.tr
                        key={`${candidate.candidateId}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                        className="transition hover:bg-linkIt-500/70"
                      >
                        <td className="px-4 py-3.5 text-linkIt-700">
                          {candidate.candidateId || "—"}
                        </td>
                        <td className="px-4 py-3.5 font-montserrat font-semibold text-linkIt-200">
                          {candidate.name || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-linkIt-700">
                          {candidate.roleName || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex rounded-full bg-linkIt-50/60 px-2.5 py-1 text-xs font-medium text-linkIt-200">
                            {candidate.pipelineStage
                              ? formatStageLabel(candidate.pipelineStage)
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-linkIt-700">
                          {candidate.country || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {linkedInHref ? (
                            <a
                              href={linkedInHref}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="font-semibold text-linkIt-300 hover:underline"
                            >
                              Perfil
                            </a>
                          ) : (
                            <span className="text-linkIt-700/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {candidate.hasCv && candidate.candidateId ? (
                            <button
                              type="button"
                              onClick={() => setCvModal(candidate)}
                              className="font-semibold text-linkIt-300 hover:underline"
                            >
                              Ver PDF
                            </button>
                          ) : (
                            <span className="text-linkIt-700/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {candidate.endorsement ? (
                            <button
                              type="button"
                              onClick={() => setEndorsementModal(candidate)}
                              className="font-semibold text-linkIt-300 hover:underline"
                            >
                              Ver
                            </button>
                          ) : (
                            <span className="text-linkIt-700/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {candidate.candidateId ? (
                            <button
                              type="button"
                              onClick={() => openCommentModal(candidate)}
                              className="font-semibold text-linkIt-300 hover:underline"
                            >
                              {candidate.clientComment?.trim() ? "Ver / Editar" : "Agregar"}
                            </button>
                          ) : (
                            <span className="text-linkIt-700/50">—</span>
                          )}
                        </td>
                      </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linkIt-50 bg-[#f8fafb] px-4 py-3 text-sm text-linkIt-700">
                <p>
                  Mostrando{" "}
                  <span className="font-semibold text-linkIt-200">
                    {pageStart}-{pageEnd}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-linkIt-200">
                    {filteredCandidates.length}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-linkIt-50 bg-white px-3 py-1.5 font-semibold text-linkIt-200 transition enabled:hover:border-linkIt-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-lg bg-linkIt-300 px-3 py-1.5 font-semibold text-white transition enabled:hover:bg-[#01967f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-r from-[#173951] via-[#1c4a6b] to-[#01A28B] p-[1px] shadow-[0_14px_40px_rgba(23,57,81,0.14)]"
        >
          <div className="flex flex-col items-start justify-between gap-4 rounded-[15px] bg-[#122f43] px-5 py-5 text-white sm:flex-row sm:items-center md:px-7">
            <div>
              <p className="font-montserrat text-xs font-semibold uppercase tracking-[0.16em] text-linkIt-300">
                LinkIT Talent
              </p>
              <p className="mt-1 max-w-2xl font-montserrat text-base font-semibold leading-snug md:text-lg">
                Contrata y gestiona talentos de forma global con LinkIT
              </p>
            </div>
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3qmMK1h4c08Aw_b5gFiF-vLjHYunVGIWvt6RyOJvaaQOVd8qQm9syzfgwV03LXDEnL7R_CHXbi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center rounded-lg bg-linkIt-300 px-4 py-2.5 font-montserrat text-sm font-bold text-white transition hover:bg-[#01967f]"
            >
              Comienza ahora! →
            </a>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-linkIt-700">
          Powered by LinkIT · Talento con seguimiento transparente
        </p>
      </div>

      <AnimatePresence>
        {cvModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#173951]/55 p-4 backdrop-blur-sm"
            onClick={() => setCvModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-linkIt-50 bg-gradient-to-r from-[#173951] to-[#1c4a6b] px-5 py-4 text-white">
                <div>
                  <h2 className="font-montserrat text-lg font-bold">
                    CV · {cvModal.name || "Candidato"}
                  </h2>
                  <p className="text-sm text-white/70">
                    {cvModal.cvFilename || "Documento PDF"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {cvBlobUrl && (
                    <a
                      href={cvBlobUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm font-semibold text-linkIt-300 hover:underline"
                    >
                      Abrir en pestaña
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setCvModal(null)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              {cvLoading && (
                <div className="flex flex-1 items-center justify-center bg-linkIt-500 text-sm text-linkIt-700">
                  Cargando CV…
                </div>
              )}
              {!cvLoading && cvError && (
                <div className="flex flex-1 items-center justify-center bg-linkIt-500 px-6 text-center text-sm text-red-600">
                  {cvError}
                </div>
              )}
              {!cvLoading && !cvError && cvBlobUrl && (
                <object
                  data={cvBlobUrl}
                  type="application/pdf"
                  title={`CV ${cvModal.name}`}
                  className="h-full w-full flex-1 bg-linkIt-500"
                >
                  <iframe
                    title={`CV ${cvModal.name}`}
                    src={cvBlobUrl}
                    className="h-full w-full flex-1 bg-linkIt-500"
                  />
                </object>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commentSuccessOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#173951]/55 p-4 backdrop-blur-sm"
            onClick={() => setCommentSuccessOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-linkIt-50 bg-gradient-to-r from-[#173951] to-[#1c4a6b] px-5 py-4 text-white">
                <h2 className="font-montserrat text-lg font-bold">
                  Comentario guardado
                </h2>
              </div>
              <div className="px-5 py-6 text-center">
                <p className="text-sm leading-relaxed text-linkIt-700">
                  El comentario se agregó correctamente y ya quedó disponible
                  para el equipo de LinkIT.
                </p>
                <button
                  type="button"
                  onClick={() => setCommentSuccessOpen(false)}
                  className="mt-5 rounded-lg bg-linkIt-300 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#01967f]"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#173951]/55 p-4 backdrop-blur-sm"
            onClick={() => !commentSaving && setCommentModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-linkIt-50 bg-gradient-to-r from-[#173951] to-[#1c4a6b] px-5 py-4 text-white">
                <div>
                  <h2 className="font-montserrat text-lg font-bold">
                    Comentario · {commentModal.name || "Candidato"}
                  </h2>
                  <p className="text-sm text-white/70">
                    Visible para el equipo LinkIT en Airtable
                  </p>
                </div>
                <button
                  type="button"
                  disabled={commentSaving}
                  onClick={() => setCommentModal(null)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 disabled:opacity-50"
                >
                  Cerrar
                </button>
              </div>
              <div className="px-5 py-5">
                <label className="mb-2 block text-sm font-semibold text-linkIt-200">
                  Escribí tu comentario sobre este candidato…
                </label>
                <textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  rows={8}
                  maxLength={5000}
                  placeholder="Escribí tu comentario sobre este candidato…"
                  className="w-full rounded-xl border border-linkIt-50 px-3 py-3 text-sm text-linkIt-200 outline-none transition focus:border-linkIt-300 focus:ring-2 focus:ring-linkIt-300/20"
                />
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-linkIt-700">
                  <span>{commentDraft.length}/5000</span>
                  {commentError && (
                    <span className="text-red-600">{commentError}</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={commentSaving}
                    onClick={() => setCommentModal(null)}
                    className="rounded-lg border border-linkIt-50 px-4 py-2 text-sm font-semibold text-linkIt-700 transition hover:border-linkIt-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={commentSaving}
                    onClick={() => void handleSaveComment()}
                    className="rounded-lg bg-linkIt-300 px-4 py-2 text-sm font-bold text-white transition hover:bg-[#01967f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {commentSaving ? "Guardando…" : "Guardar comentario"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {endorsementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#173951]/55 p-4 backdrop-blur-sm"
            onClick={() => setEndorsementModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-linkIt-50 bg-gradient-to-r from-[#173951] to-[#1c4a6b] px-5 py-4 text-white">
                <h2 className="font-montserrat text-lg font-bold">
                  Endorsement · {endorsementModal.name || "Candidato"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEndorsementModal(null)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                >
                  Cerrar
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                <pre className="whitespace-pre-wrap font-manrope text-sm leading-7 text-linkIt-200">
                  {endorsementModal.endorsement}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ApplicationsStatusViewWithRecaptcha() {
  const { executeGoogleReCaptcha } = useGoogleReCaptcha(RECAPTCHA_SITE_KEY!);
  return (
    <ApplicationsStatusViewBase executeRecaptcha={executeGoogleReCaptcha} />
  );
}

export default function ApplicationsStatusView() {
  if (RECAPTCHA_ENABLED) {
    return <ApplicationsStatusViewWithRecaptcha />;
  }
  return <ApplicationsStatusViewBase />;
}
