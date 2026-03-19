import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_FALLBACK_URL ||
  "http://192.168.30.254:8010/api/v1";

const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

function isSafeFilename(filename: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(filename);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> },
): Promise<NextResponse> {
  const { filename } = await context.params;
  const decoded = decodeURIComponent(filename || "").trim();

  if (!decoded || !isSafeFilename(decoded)) {
    return NextResponse.json({ detail: "Nombre de archivo invalido" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_ORIGIN}/media/${encodeURIComponent(decoded)}`, {
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "No se pudo conectar al backend media" }, { status: 503 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ detail: "Imagen no encontrada" }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300",
    },
  });
}
