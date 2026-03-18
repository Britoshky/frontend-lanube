"use server";

import {
  getConfig,
  getDrafts,
  getHistory,
  getReview,
  getSession,
} from "@/src/services/pipeline-get.service";
import type { DraftDTO, PipelineConfigDTO, ReviewDTO } from "@/src/services/schemas";
import { loginAction } from "@/app/actions/auth";
import {
  applySetCookies,
  type ActionResult,
  postJson,
  resolveCookieHeader,
} from "@/app/actions/shared";

export type EditorialActionPayload = {
  action: "login" | "fetch-one" | "run" | "approve" | "publish" | "delete" | "config" | "select-image";
  username?: string;
  password?: string;
  draftId?: number;
  imageUrl?: string;
  daily_news_target?: number;
  schedule_times?: string;
  auto_approve_if_quality_ok?: boolean;
};

export type EditorialSnapshot = {
  username: string | null;
  drafts: DraftDTO[];
  history: DraftDTO[];
  config: PipelineConfigDTO;
};

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

export async function deleteDraftAction(draftId: number, cookieHeader: string | null): Promise<ActionResult> {
  return postJson(`/pipeline/delete/${draftId}`, {}, cookieHeader);
}

export async function selectDraftImageAction(
  draftId: number,
  imageUrl: string,
  cookieHeader: string | null,
): Promise<ActionResult> {
  return postJson(`/pipeline/select-image/${draftId}`, { image_url: imageUrl }, cookieHeader);
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

export async function getEditorialSnapshotAction(): Promise<ActionResult<EditorialSnapshot>> {
  const cookieHeader = await resolveCookieHeader();

  try {
    const [sessionRes, draftsRes, historyRes, configRes] = await Promise.all([
      getSession(cookieHeader),
      getDrafts(cookieHeader),
      getHistory(cookieHeader),
      getConfig(cookieHeader),
    ]);

    return {
      ok: true,
      status: 200,
      data: {
        username: sessionRes.username,
        drafts: draftsRes,
        history: historyRes,
        config: configRes,
      },
    };
  } catch (error) {
    return {
      ok: false,
      status: 401,
      error: error instanceof Error ? error.message : "No autenticado",
      data: {
        username: null,
        drafts: [],
        history: [],
        config: {
          daily_news_target: 5,
          schedule_times: "08:00,13:00,19:00",
          auto_approve_if_quality_ok: true,
        },
      },
    };
  }
}

export async function getDraftReviewAction(draftId: number): Promise<ActionResult<ReviewDTO>> {
  try {
    const cookieHeader = await resolveCookieHeader();
    const review = await getReview(draftId, cookieHeader);
    return { ok: true, status: 200, data: review };
  } catch (error) {
    return {
      ok: false,
      status: 400,
      error: error instanceof Error ? error.message : "No se pudo generar review",
    };
  }
}

export async function runEditorialMutationAction(payload: EditorialActionPayload): Promise<ActionResult> {
  if (payload.action === "login") {
    const result = await loginAction(payload.username || "", payload.password || "");
    if (result.ok) {
      await applySetCookies(result.data?.setCookies || []);
    }
    return result;
  }

  const cookieHeader = await resolveCookieHeader();

  if (payload.action === "fetch-one") {
    return fetchOneNewsAction(cookieHeader);
  }

  if (payload.action === "run") {
    return runPipelineAction(cookieHeader);
  }

  if (payload.action === "approve") {
    return approveDraftAction(Number(payload.draftId), cookieHeader);
  }

  if (payload.action === "publish") {
    return publishDraftAction(Number(payload.draftId), cookieHeader);
  }

  if (payload.action === "delete") {
    return deleteDraftAction(Number(payload.draftId), cookieHeader);
  }

  if (payload.action === "select-image") {
    return selectDraftImageAction(Number(payload.draftId), String(payload.imageUrl || ""), cookieHeader);
  }

  if (payload.action === "config") {
    return updateConfigAction(
      {
        daily_news_target: Number(payload.daily_news_target),
        schedule_times: String(payload.schedule_times || ""),
        auto_approve_if_quality_ok: Boolean(payload.auto_approve_if_quality_ok),
      },
      cookieHeader,
    );
  }

  return {
    ok: false,
    status: 400,
    error: "Accion invalida",
  };
}
