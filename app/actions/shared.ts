import { cookies } from "next/headers";

export const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_FALLBACK_URL ||
  "http://192.168.30.254:8010/api/v1";

const TRANSIENT_HTTP_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const POST_RETRY_DELAYS_MS = [1200, 2500, 4000, 6000];

export type ActionResult<T = unknown> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

export async function resolveCookieHeader(cookieHeader?: string | null): Promise<string> {
  if (cookieHeader) return cookieHeader;
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");
}

export async function applySetCookies(setCookies: string[]): Promise<void> {
  if (!setCookies.length) return;
  const cookieStore = await cookies();

  for (const rawCookie of setCookies) {
    const parts = rawCookie.split(";").map((part) => part.trim());
    const [nameValue, ...attrs] = parts;
    const separatorIndex = nameValue.indexOf("=");
    if (separatorIndex <= 0) continue;

    const name = nameValue.slice(0, separatorIndex);
    const value = nameValue.slice(separatorIndex + 1);
    const options: {
      path?: string;
      domain?: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      maxAge?: number;
      expires?: Date;
    } = {};

    for (const attr of attrs) {
      const [rawKey, rawVal] = attr.split("=");
      const key = rawKey.toLowerCase();
      const val = rawVal?.trim();

      if (key === "path" && val) options.path = val;
      else if (key === "domain" && val) options.domain = val;
      else if (key === "httponly") options.httpOnly = true;
      else if (key === "secure") options.secure = true;
      else if (key === "samesite" && val) {
        const sameSite = val.toLowerCase();
        if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
          options.sameSite = sameSite;
        }
      } else if (key === "max-age" && val) {
        const maxAge = Number(val);
        if (!Number.isNaN(maxAge)) options.maxAge = maxAge;
      } else if (key === "expires" && val) {
        const expires = new Date(val);
        if (!Number.isNaN(expires.getTime())) options.expires = expires;
      }
    }

    cookieStore.set(name, value, options);
  }
}

function csrfFromCookie(cookieHeader: string | null): string {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((item) => item.trim());
  const token = parts.find((item) => item.startsWith("lanube_csrf_token="));
  return token ? decodeURIComponent(token.split("=")[1] || "") : "";
}

export async function postJson<T>(
  path: string,
  payload: unknown,
  cookieHeader: string | null,
): Promise<ActionResult<T>> {
  const csrf = csrfFromCookie(cookieHeader);
  let lastTransportError = "";

  for (let attempt = 0; attempt <= POST_RETRY_DELAYS_MS.length; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf,
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    } catch (error) {
      lastTransportError = error instanceof Error ? error.message : "Error de red";
      if (attempt < POST_RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, POST_RETRY_DELAYS_MS[attempt]));
        continue;
      }

      return {
        ok: false,
        status: 503,
        error: `No se pudo conectar al backend en ${API_BASE}. ${lastTransportError}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      return { ok: true, status: response.status, data: data as T };
    }

    const message = (data as { detail?: string }).detail || `POST ${path} fallo`;
    if (!TRANSIENT_HTTP_STATUS.has(response.status) || attempt >= POST_RETRY_DELAYS_MS.length) {
      return {
        ok: false,
        status: response.status,
        error: message,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, POST_RETRY_DELAYS_MS[attempt]));
  }

  return {
    ok: false,
    status: 503,
    error: `No se pudo completar POST ${path}`,
  };
}
