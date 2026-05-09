import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_FALLBACK_URL ||
  "http://192.168.30.254:4003/api/v1";

const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");
const BACKEND_MEDIA_FALLBACK =
  process.env.BACKEND_MEDIA_URL || "http://192.168.30.254:4003/media";
/** Ultimo intento si el backend no responde; debe servir el mismo nombre de archivo que /media (no confundir con /rrss/public salvo archivos estaticos copiados ahi). */
const LEGACY_PUBLIC_MEDIA_BASE =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "https://lanubefm.cl/api/editorial/media";

function isSafeFilename(filename: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(filename);
}

async function fetchImageBytes(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (!ct.startsWith("image/")) return null;
    return res;
  } catch {
    return null;
  }
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

  /**
   * Importante: no redirigir a IPs privadas (ej. 192.168.x.x). Instagram/Meta
   * descarga la URL desde internet; un 307 a una LAN rompe la publicación.
   * Aquí proxyamos la imagen desde el servidor Next (solo accesible en red interna al backend).
   */
  for (const candidate of upstreamCandidates) {
    const upstream = await fetchImageBytes(candidate);
    if (!upstream) continue;

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buf = await upstream.arrayBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return NextResponse.json({ detail: "Imagen no encontrada" }, { status: 404 });
}
