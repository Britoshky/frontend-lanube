import { NextRequest, NextResponse } from "next/server";

import {
  approveDraftAction,
  fetchOneNewsAction,
  loginAction,
  publishDraftAction,
  runPipelineAction,
  updateConfigAction,
} from "@/app/actions";

function appendCookies(response: NextResponse, setCookies: string[]) {
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  const cookieHeader = req.headers.get("cookie");

  if (action === "login") {
    const result = await loginAction(String(body.username || ""), String(body.password || ""));
    const response = NextResponse.json(result, { status: result.ok ? 200 : result.status || 401 });
    appendCookies(response, result.data?.setCookies || []);
    return response;
  }

  if (action === "fetch-one") {
    const result = await fetchOneNewsAction(cookieHeader);
    return NextResponse.json(result, { status: result.ok ? 200 : result.status });
  }

  if (action === "run") {
    const result = await runPipelineAction(cookieHeader);
    return NextResponse.json(result, { status: result.ok ? 200 : result.status });
  }

  if (action === "approve") {
    const result = await approveDraftAction(Number(body.draftId), cookieHeader);
    return NextResponse.json(result, { status: result.ok ? 200 : result.status });
  }

  if (action === "publish") {
    const result = await publishDraftAction(Number(body.draftId), cookieHeader);
    return NextResponse.json(result, { status: result.ok ? 200 : result.status });
  }

  if (action === "config") {
    const result = await updateConfigAction(
      {
        daily_news_target: Number(body.daily_news_target),
        schedule_times: String(body.schedule_times || ""),
        auto_approve_if_quality_ok: Boolean(body.auto_approve_if_quality_ok),
      },
      cookieHeader,
    );
    return NextResponse.json(result, { status: result.ok ? 200 : result.status });
  }

  return NextResponse.json({ ok: false, error: "Accion invalida" }, { status: 400 });
}
