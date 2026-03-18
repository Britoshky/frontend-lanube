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

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8010/api/v1";

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  return response.json();
}

export async function getSession(): Promise<SessionDTO> {
  return SessionSchema.parse(await getJson("/auth/session"));
}

export async function getDrafts(): Promise<DraftDTO[]> {
  return DraftListSchema.parse(await getJson("/pipeline/drafts"));
}

export async function getHistory(): Promise<DraftDTO[]> {
  return DraftListSchema.parse(await getJson("/pipeline/history"));
}

export async function getConfig(): Promise<PipelineConfigDTO> {
  return PipelineConfigSchema.parse(await getJson("/pipeline/config"));
}

export async function getReview(draftId: number): Promise<ReviewDTO> {
  return ReviewSchema.parse(await getJson(`/pipeline/review/${draftId}`));
}
