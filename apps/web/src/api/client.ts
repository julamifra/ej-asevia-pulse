type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

const rawBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const normalizeApiBaseUrl = (value: string) => {
  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const apiBaseUrl = normalizeApiBaseUrl(rawBaseUrl);

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const buildApiUrl = (
  path: string,
  params?: Record<string, string | number | undefined>
) => {
  const url = new URL(`${apiBaseUrl}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
};

export const fetchJson = async <T>(
  path: string,
  params?: Record<string, string | number | undefined>
) => {
  const response = await fetch(buildApiUrl(path, params));

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
    throw new ApiError(
      payload?.error?.message ?? "No se pudo completar la peticion.",
      response.status
    );
  }

  return (await response.json()) as T;
};
