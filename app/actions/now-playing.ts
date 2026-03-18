"use server";

import { getNowPlaying, type NowPlayingInfo } from "@/src/services/now-playing.service";
import type { ActionResult } from "@/app/actions/shared";

export async function getNowPlayingAction(): Promise<ActionResult<NowPlayingInfo>> {
  try {
    const data = await getNowPlaying();
    return { ok: true, status: 200, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      error: error instanceof Error ? error.message : "No se pudo cargar metadata",
    };
  }
}
