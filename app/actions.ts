"use server";

const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8010/api/v1";

type ActionResult<T = unknown> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

type LoginResult = {
  message: string;
  setCookies: string[];
};

function csrfFromCookie(cookieHeader: string | null): string {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((item) => item.trim());
  const token = parts.find((item) => item.startsWith("lanube_csrf_token="));
  return token ? decodeURIComponent(token.split("=")[1] || "") : "";
}

async function postJson<T>(
  path: string,
  payload: unknown,
  cookieHeader: string | null,
): Promise<ActionResult<T>> {
  const csrf = csrfFromCookie(cookieHeader);
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
  } catch {
    return {
      ok: false,
      status: 503,
      error: `No se pudo conectar al backend en ${API_BASE}`,
    };
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: (data as { detail?: string }).detail || `POST ${path} fallo`,
    };
  }

  return { ok: true, status: response.status, data: data as T };
}

export async function loginAction(
  username: string,
  password: string,
): Promise<ActionResult<LoginResult>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 503,
      error: `No se pudo conectar al backend en ${API_BASE}`,
    };
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: (data as { detail?: string }).detail || "Credenciales invalidas",
    };
  }

  const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const setCookies = typeof getSetCookie === "function" ? getSetCookie.call(response.headers) : [];
  const fallback = response.headers.get("set-cookie");

  return {
    ok: true,
    status: response.status,
    data: {
      message: (data as { message?: string }).message || "Login exitoso",
      setCookies: setCookies.length > 0 ? setCookies : fallback ? [fallback] : [],
    },
  };
}

export async function fetchOneNewsAction(cookieHeader: string | null): Promise<ActionResult> {
  return postJson("/pipeline/fetch-one", {}, cookieHeader);
}

export async function runPipelineAction(cookieHeader: string | null): Promise<ActionResult> {
  return postJson("/pipeline/run", {}, cookieHeader);
}

export async function approveDraftAction(draftId: number, cookieHeader: string | null): Promise<ActionResult> {
  return postJson(`/pipeline/approve/${draftId}`, {}, cookieHeader);
}

export async function publishDraftAction(draftId: number, cookieHeader: string | null): Promise<ActionResult> {
  return postJson(`/pipeline/publish/${draftId}`, {}, cookieHeader);
}

export async function updateConfigAction(
  payload: {
    daily_news_target: number;
    schedule_times: string;
    auto_approve_if_quality_ok: boolean;
  },
  cookieHeader: string | null,
): Promise<ActionResult> {
  return postJson("/pipeline/config", payload, cookieHeader);
}
