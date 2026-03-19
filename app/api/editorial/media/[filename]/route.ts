import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_FALLBACK_URL ||
  "http://192.168.30.254:8010/api/v1";

const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");
const BACKEND_MEDIA_FALLBACK =
  process.env.BACKEND_MEDIA_URL || "http://192.168.30.254:8010/media";

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

  const upstreamCandidates = [
    `${BACKEND_ORIGIN}/media/${encodeURIComponent(decoded)}`,
    `${BACKEND_MEDIA_FALLBACK}/${encodeURIComponent(decoded)}`,
  ];

  let upstream: Response | null = null;
  let lastStatus = 503;

  for (const candidate of upstreamCandidates) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (response.ok) {
        upstream = response;
        break;
      }
      lastStatus = response.status;
    } catch {
      lastStatus = 503;
    }
  }

  if (!upstream) {
    return NextResponse.json({ detail: "Imagen no encontrada" }, { status: lastStatus });
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
