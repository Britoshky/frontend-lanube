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

const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8010/api/v1";

async function getJson(path: string, cookieHeader?: string | null): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  return response.json();
}

export async function getSession(cookieHeader?: string | null): Promise<SessionDTO> {
  return SessionSchema.parse(await getJson("/auth/session", cookieHeader));
}

export async function getDrafts(cookieHeader?: string | null): Promise<DraftDTO[]> {
  return DraftListSchema.parse(await getJson("/pipeline/drafts", cookieHeader));
}

export async function getHistory(cookieHeader?: string | null): Promise<DraftDTO[]> {
  return DraftListSchema.parse(await getJson("/pipeline/history", cookieHeader));
}

export async function getConfig(cookieHeader?: string | null): Promise<PipelineConfigDTO> {
  return PipelineConfigSchema.parse(await getJson("/pipeline/config", cookieHeader));
}

export async function getReview(draftId: number, cookieHeader?: string | null): Promise<ReviewDTO> {
  return ReviewSchema.parse(await getJson(`/pipeline/review/${draftId}`, cookieHeader));
}
