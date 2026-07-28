import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type AtsFilterType = "roleCode" | "company";

interface AtsCandidate {
  name: string;
  candidateId: string;
  roleAndCompany: string;
  salaryExpectationUsd: string;
  pipelinesCount: string;
  seniority: string;
  email: string;
  linkedin: string;
  pipelineStage: string;
  roleCode: string;
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

  const title =
    filterType === "roleCode"
      ? `ATS · Role Code ${filterValue}`
      : `ATS · ${filterValue}`;

  const subtitle =
    data?.candidates?.[0]?.roleAndCompany ||
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
            <p className="mt-3 text-sm text-slate-500">
              {data.count} candidato{data.count === 1 ? "" : "s"}
            </p>
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
                  <th className="px-4 py-3 font-medium">Rol + Empresa</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Seniority</th>
                  <th className="px-4 py-3 font-medium">Salario</th>
                  <th className="px-4 py-3 font-medium">Pipelines</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">LinkedIn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.candidates.map((candidate, index) => (
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
                      {candidate.roleAndCompany || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.pipelineStage || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.seniority || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.salaryExpectationUsd || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.pipelinesCount || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {candidate.email ? (
                        <a
                          href={`mailto:${candidate.email}`}
                          className="text-sky-700 hover:underline"
                        >
                          {candidate.email}
                        </a>
                      ) : (
                        "—"
                      )}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
