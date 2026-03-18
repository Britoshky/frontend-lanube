import { NextRequest, NextResponse } from "next/server";

type EditorialActionPayload = {
  action?: string;
  username?: string;
  password?: string;
  draftId?: number;
  imageUrl?: string;
  daily_news_target?: number;
  schedule_times?: string;
  auto_approve_if_quality_ok?: boolean;
};

const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_FALLBACK_URL ||
  "http://192.168.30.254:8010/api/v1";

function setCookieHeaders(target: Headers, source: Headers): void {
  const getSetCookie = (source as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const all = typeof getSetCookie === "function" ? getSetCookie.call(source) : [];
  if (all.length > 0) {
    for (const value of all) {
      target.append("set-cookie", value);
    }
    return;
  }

  const single = source.get("set-cookie");
  if (single) target.append("set-cookie", single);
}

async function callBackend(
  path: string,
  req: NextRequest,
  body?: unknown,
): Promise<NextResponse> {
  const csrf = req.headers.get("x-csrf-token") || "";
  const cookie = req.headers.get("cookie") || "";

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body || {}),
      cache: "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de red";
    return NextResponse.json(
      { detail: `No se pudo conectar al backend en ${API_BASE}. ${message}` },
      { status: 503 },
    );
  }

  const data = await response.json().catch(() => ({}));
  const result = NextResponse.json(data, { status: response.status });
  setCookieHeaders(result.headers, response.headers);
  return result;
}

function parseNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

async function handleMutation(req: NextRequest): Promise<NextResponse> {
  const payload = (await req.json().catch(() => ({}))) as EditorialActionPayload;
  const action = payload.action || "";

  if (action === "login") {
    return callBackend("/auth/login", req, {
      username: payload.username || "",
      password: payload.password || "",
    });
  }

  if (action === "fetch-one") {
    return callBackend("/pipeline/fetch-one", req, {});
  }

  if (action === "run") {
    return callBackend("/pipeline/run", req, {});
  }

  if (action === "approve") {
    return callBackend(`/pipeline/approve/${parseNumber(payload.draftId)}`, req, {});
  }

  if (action === "publish") {
    return callBackend(`/pipeline/publish/${parseNumber(payload.draftId)}`, req, {});
  }

  if (action === "delete") {
    return callBackend(`/pipeline/delete/${parseNumber(payload.draftId)}`, req, {});
  }

  if (action === "select-image") {
    return callBackend(`/pipeline/select-image/${parseNumber(payload.draftId)}`, req, {
      image_url: String(payload.imageUrl || ""),
    });
  }

  if (action === "config") {
    return callBackend("/pipeline/config", req, {
      daily_news_target: parseNumber(payload.daily_news_target),
      schedule_times: String(payload.schedule_times || ""),
      auto_approve_if_quality_ok: Boolean(payload.auto_approve_if_quality_ok),
    });
  }

  return NextResponse.json({ detail: "Accion invalida" }, { status: 400 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleMutation(req);
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  return handleMutation(req);
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  return handleMutation(req);
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST,PUT,DELETE,OPTIONS",
    },
  });
}
