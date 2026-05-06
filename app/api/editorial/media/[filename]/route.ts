import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_FALLBACK_URL ||
  "http://192.168.30.254:8010/api/v1";

const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");
const BACKEND_MEDIA_FALLBACK =
  process.env.BACKEND_MEDIA_URL || "http://192.168.30.254:8010/media";
const LEGACY_PUBLIC_MEDIA_BASE =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "https://lanubefm.cl/rrss/public";

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
    `${LEGACY_PUBLIC_MEDIA_BASE.replace(/\/$/, "")}/${encodeURIComponent(decoded)}`,
  ];

  // Redirect avoids buffering binary streams in Next route handlers,
  // preventing intermittent "Error in input stream" issues.
  for (const candidate of upstreamCandidates) {
    try {
      const head = await fetch(candidate, { method: "HEAD", cache: "no-store" });
      if (head.ok) {
        return NextResponse.redirect(candidate, { status: 307 });
      }
    } catch {
      // Try next candidate.
    }
  }

  return NextResponse.json({ detail: "Imagen no encontrada" }, { status: 404 });
}
