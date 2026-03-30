import {
  DraftListSchema,
  PipelineConfigSchema,
  ReviewSchema,
  SessionSchema,
  type DraftDTO,
  type PipelineConfigDTO,
  type ReviewDTO,
  type SessionDTO,
} from "./schemas";

// En servidor (Node.js): usa BACKEND_INTERNAL_URL (IP local)
// En navegador: usa NEXT_PUBLIC_* vars (public URLs)
// Esta función corre siempre en servidor (Server Action)
const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://192.168.30.254:8010/api/v1";

const GET_TIMEOUT_MS = 8000;

export type PagedDraftResult = {
  items: DraftDTO[];
  total: number;
  page: number;
  pageSize: number;
};

async function getJson(path: string, cookieHeader?: string | null): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GET_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`GET ${path} timeout (${GET_TIMEOUT_MS / 1000}s)`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  return response.json();
}

export async function getSession(cookieHeader?: string | null): Promise<SessionDTO> {
  return SessionSchema.parse(await getJson("/auth/session", cookieHeader));
}

export async function getDrafts(cookieHeader?: string | null): Promise<DraftDTO[]> {
  const result = await getDraftsPaged(1, 10, cookieHeader);
  return result.items;
}

export async function getHistory(cookieHeader?: string | null): Promise<DraftDTO[]> {
  const result = await getHistoryPaged(1, 10, cookieHeader);
  return result.items;
}

export async function getDraftsPaged(
  page = 1,
  pageSize = 10,
  cookieHeader?: string | null,
): Promise<PagedDraftResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GET_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/pipeline/drafts?page=${page}&page_size=${pageSize}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GET /pipeline/drafts failed with ${response.status}`);
    }

    const items = DraftListSchema.parse(await response.json());
    const total = Number(response.headers.get("x-total-count") || items.length);
    return { items, total, page, pageSize };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`GET /pipeline/drafts timeout (${GET_TIMEOUT_MS / 1000}s)`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getHistoryPaged(
  page = 1,
  pageSize = 10,
  cookieHeader?: string | null,
): Promise<PagedDraftResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GET_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/pipeline/history?page=${page}&page_size=${pageSize}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GET /pipeline/history failed with ${response.status}`);
    }

    const items = DraftListSchema.parse(await response.json());
    const total = Number(response.headers.get("x-total-count") || items.length);
    return { items, total, page, pageSize };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`GET /pipeline/history timeout (${GET_TIMEOUT_MS / 1000}s)`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getConfig(cookieHeader?: string | null): Promise<PipelineConfigDTO> {
  return PipelineConfigSchema.parse(await getJson("/pipeline/config", cookieHeader));
}

export async function getReview(draftId: number, cookieHeader?: string | null): Promise<ReviewDTO> {
  return ReviewSchema.parse(await getJson(`/pipeline/review/${draftId}`, cookieHeader));
}
