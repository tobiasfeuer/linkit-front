import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type AtsFilterType = "roleCode" | "company";
type SortKey = "stage" | "country" | "name";

interface AtsCandidate {
  name: string;
  candidateId: string;
  roleName: string;
  seniority: string;
  linkedin: string;
  pipelineStage: string;
  roleCode: string;
  country: string;
  cvUrl: string;
  cvFilename: string;
  endorsement: string;
}

interface AtsResponse {
  filter: { type: AtsFilterType; value: string };
  count: number;
  candidates: AtsCandidate[];
}

function normalizeLinkedIn(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

interface ApplicationsStatusViewProps {
  filterType: AtsFilterType;
}

export default function ApplicationsStatusView({
  filterType,
}: ApplicationsStatusViewProps) {
  const params = useParams<{ roleCode?: string; company?: string }>();
  const filterValue = useMemo(() => {
    const raw =
      filterType === "roleCode" ? params.roleCode : params.company;
    return decodeURIComponent(raw ?? "").trim();
  }, [filterType, params.company, params.roleCode]);

  const [data, setData] = useState<AtsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("stage");
  const [cvModal, setCvModal] = useState<AtsCandidate | null>(null);
  const [endorsementModal, setEndorsementModal] =
    useState<AtsCandidate | null>(null);

  useEffect(() => {
    if (!filterValue) {
      setLoading(false);
      setError("Falta el identificador en la URL.");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryKey = filterType === "roleCode" ? "roleCode" : "company";
        const response = await axios.get<AtsResponse>(
          `${import.meta.env.VITE_ENDPOINT_URL}/resources/applications-status`,
          {
            params: { [queryKey]: filterValue },
          }
        );
        if (!cancelled) setData(response.data);
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              err?.response?.data ||
              err?.message ||
              "No se pudo cargar la vista ATS."
          );
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [filterType, filterValue]);

  useEffect(() => {
    if (!cvModal && !endorsementModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCvModal(null);
        setEndorsementModal(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cvModal, endorsementModal]);

  const sortedCandidates = useMemo(() => {
    const list = [...(data?.candidates ?? [])];
    list.sort((a, b) => {
      const left =
        sortKey === "stage"
          ? a.pipelineStage
          : sortKey === "country"
            ? a.country
            : a.name;
      const right =
        sortKey === "stage"
          ? b.pipelineStage
          : sortKey === "country"
            ? b.country
            : b.name;
      return left.localeCompare(right, "es", { sensitivity: "base", numeric: true });
    });
    return list;
  }, [data?.candidates, sortKey]);

  const title =
    filterType === "roleCode"
      ? `ATS · Role Code ${filterValue}`
      : `ATS · ${filterValue}`;

  const subtitle =
    data?.candidates?.[0]?.roleName ||
    (filterType === "roleCode"
      ? "Candidatos filtrados por Role Code"
      : "Candidatos filtrados por empresa");

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
            LinkIT · Applications Status
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-base text-slate-600">{subtitle}</p>
          {!loading && !error && data && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">
                {data.count} candidato{data.count === 1 ? "" : "s"}
              </p>
              <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
                Ordenar por
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-800"
                >
                  <option value="stage">Stage</option>
                  <option value="country">País</option>
                  <option value="name">Nombre</option>
                </select>
              </label>
            </div>
          )}
        </header>

        {loading && (
          <p className="rounded-lg bg-white px-4 py-6 text-slate-600 shadow-sm">
            Cargando candidatos…
          </p>
        )}

        {!loading && error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-red-700">
            {typeof error === "string" ? error : "Error al cargar datos."}
          </p>
        )}

        {!loading && !error && data && data.count === 0 && (
          <p className="rounded-lg bg-white px-4 py-6 text-slate-600 shadow-sm">
            No hay candidatos para este filtro.
          </p>
        )}

        {!loading && !error && data && data.count > 0 && (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Candidato</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">País</th>
                  <th className="px-4 py-3 font-medium">Seniority</th>
                  <th className="px-4 py-3 font-medium">LinkedIn</th>
                  <th className="px-4 py-3 font-medium">CV</th>
                  <th className="px-4 py-3 font-medium">Endorsement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedCandidates.map((candidate, index) => (
                  <tr
                    key={`${candidate.candidateId}-${index}`}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {candidate.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.candidateId || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.roleName || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.pipelineStage || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.country || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.seniority || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {candidate.linkedin ? (
                        <a
                          href={normalizeLinkedIn(candidate.linkedin)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-sky-700 hover:underline"
                        >
                          Perfil
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {candidate.cvUrl ? (
                        <button
                          type="button"
                          onClick={() => setCvModal(candidate)}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          Ver PDF
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {candidate.endorsement ? (
                        <button
                          type="button"
                          onClick={() => setEndorsementModal(candidate)}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          Ver
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cvModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setCvModal(null)}
        >
          <div
            className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  CV · {cvModal.name || "Candidato"}
                </h2>
                <p className="text-sm text-slate-500">
                  {cvModal.cvFilename || "Documento PDF"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={cvModal.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-sky-700 hover:underline"
                >
                  Abrir en pestaña
                </a>
                <button
                  type="button"
                  onClick={() => setCvModal(null)}
                  className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <iframe
              title={`CV ${cvModal.name}`}
              src={cvModal.cvUrl}
              className="h-full w-full flex-1 bg-slate-100"
            />
          </div>
        </div>
      )}

      {endorsementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setEndorsementModal(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Endorsement · {endorsementModal.name || "Candidato"}
              </h2>
              <button
                type="button"
                onClick={() => setEndorsementModal(null)}
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">
                {endorsementModal.endorsement}
              </pre>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
