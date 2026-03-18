"use server";

import { API_BASE, type ActionResult } from "@/app/actions/shared";

export type LoginResult = {
  message: string;
  setCookies: string[];
};

export async function loginAction(
  username: string,
  password: string,
): Promise<ActionResult<LoginResult>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 503,
      error: `No se pudo conectar al backend en ${API_BASE}`,
    };
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: (data as { detail?: string }).detail || "Credenciales invalidas",
    };
  }

  const getSetCookie = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const setCookies = typeof getSetCookie === "function" ? getSetCookie.call(response.headers) : [];
  const fallback = response.headers.get("set-cookie");

  return {
    ok: true,
    status: response.status,
    data: {
      message: (data as { message?: string }).message || "Login exitoso",
      setCookies: setCookies.length > 0 ? setCookies : fallback ? [fallback] : [],
    },
  };
}
