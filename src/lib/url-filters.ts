export type SearchParamValue = string | string[] | undefined;
export type SearchParamsInput = Record<string, SearchParamValue>;

export function getSearchParam(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function tieneFlag(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value.some((item) => item === "1" || item === "true");
  }

  return value === "1" || value === "true";
}

export function parseEnumParam<T extends string>(
  value: SearchParamValue,
  allowed: readonly T[],
  fallback: T
): T {
  const normalized = getSearchParam(value);
  return normalized && allowed.includes(normalized as T) ? (normalized as T) : fallback;
}

export function parseOptionalEnumParam<T extends string>(
  value: SearchParamValue,
  allowed: readonly T[]
) {
  const normalized = getSearchParam(value);
  return normalized && allowed.includes(normalized as T) ? (normalized as T) : null;
}

export function parseTextParam(value: SearchParamValue) {
  return getSearchParam(value)?.trim() ?? "";
}

export function parsePositiveIntParam(value: SearchParamValue, fallback = 1) {
  const normalized = getSearchParam(value);
  const parsed = Number.parseInt(normalized ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

type QueryValue = string | number | null | undefined;

export function buildUrlWithUpdatedQuery(
  pathname: string,
  currentSearch: string,
  updates: Record<string, QueryValue>
) {
  const params = new URLSearchParams(currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
