export type AppLanguage = "es" | "en";

function normalizeLanguage(value: string | null | undefined): AppLanguage | null {
  const raw = value?.trim().toLowerCase() ?? "";
  if (raw === "en" || raw === "eng" || raw === "english") return "en";
  if (raw === "es" || raw === "spa" || raw === "spanish" || raw === "espanol" || raw === "español") {
    return "es";
  }
  return null;
}

/** Lee `lang`, `lng` o `language` de la query (`?lang=en`). */
export function parseLanguageQuery(search: string): AppLanguage | null {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  return normalizeLanguage(
    params.get("lang") || params.get("lng") || params.get("language")
  );
}

/** Rutas públicas que ya implican idioma sin query. */
export function languageFromPath(pathname: string): AppLanguage | null {
  if (pathname === "/hire-it-talent") return "en";
  if (pathname === "/contrata-talento-it") return "es";
  return null;
}

export function resolveUrlLanguage(pathname: string, search: string): AppLanguage | null {
  return parseLanguageQuery(search) ?? languageFromPath(pathname);
}

export function readInitialLanguageFromWindow(): AppLanguage {
  if (typeof window === "undefined") return "es";
  return resolveUrlLanguage(window.location.pathname, window.location.search) ?? "es";
}
