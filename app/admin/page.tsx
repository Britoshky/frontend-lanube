"use client";

import { useEffect, useState } from "react";

import {
  getConfig,
  getDrafts,
  getHistory,
  getReview,
  getSession,
} from "@/src/services/pipeline-get.service";
import type { DraftDTO, PipelineConfigDTO, ReviewDTO } from "@/src/services/schemas";

const API_ORIGIN = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8010/api/v1").replace("/api/v1", "");

type ActionPayload = {
  action: "login" | "fetch-one" | "run" | "approve" | "publish" | "config";
  username?: string;
  password?: string;
  draftId?: number;
  daily_news_target?: number;
  schedule_times?: string;
  auto_approve_if_quality_ok?: boolean;
};

async function callEditorialAction(payload: ActionPayload) {
  const response = await fetch("/api/editorial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || data?.detail || "Operacion fallida");
  }
  return data;
}

export default function AdminPage() {
  const [username, setUsername] = useState("britoshky@gmail.com");
  const [password, setPassword] = useState("CdCd@2627");
  const [session, setSession] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftDTO[]>([]);
  const [history, setHistory] = useState<DraftDTO[]>([]);
  const [config, setConfig] = useState<PipelineConfigDTO>({
    daily_news_target: 5,
    schedule_times: "08:00,13:00,19:00",
    auto_approve_if_quality_ok: true,
  });
  const [review, setReview] = useState<ReviewDTO | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function refreshAll() {
    const [sessionRes, draftsRes, historyRes, configRes] = await Promise.all([
      getSession(),
      getDrafts(),
      getHistory(),
      getConfig(),
    ]);
    setSession(sessionRes.username);
    setDrafts(draftsRes);
    setHistory(historyRes);
    setConfig(configRes);
  }

  useEffect(() => {
    refreshAll().catch(() => {
      setSession(null);
    });
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await callEditorialAction({ action: "login", username, password });
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de login");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(payload: ActionPayload) {
    setLoading(true);
    setError("");
    try {
      await callEditorialAction(payload);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en accion");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(draftId: number) {
    setLoading(true);
    setError("");
    try {
      const result = await getReview(draftId);
      setReview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar review");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-lg p-8 space-y-4">
        <h1 className="text-2xl font-bold">Acceso Editorial</h1>
        <p className="text-sm text-gray-600">Login único para revisar, aprobar y publicar noticias.</p>
        <input
          className="w-full border rounded p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Correo"
        />
        <input
          className="w-full border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Clave"
          type="password"
        />
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleLogin}
          disabled={loading}
        >
          Iniciar sesion
        </button>
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <section className="border rounded p-4">
        <h1 className="text-2xl font-bold">Panel Editorial IA</h1>
        <p className="text-sm text-gray-600">Sesion activa: {session}</p>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="text-lg font-semibold">Programacion y Frecuencia</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="number"
            min={1}
            max={24}
            className="border rounded p-2"
            value={config.daily_news_target}
            onChange={(e) =>
              setConfig({ ...config, daily_news_target: Number(e.target.value) || 1 })
            }
          />
          <input
            className="border rounded p-2"
            value={config.schedule_times}
            onChange={(e) => setConfig({ ...config, schedule_times: e.target.value })}
            placeholder="08:00,13:00,19:00"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.auto_approve_if_quality_ok}
              onChange={(e) =>
                setConfig({ ...config, auto_approve_if_quality_ok: e.target.checked })
              }
            />
            Auto aprobar si calidad OK
          </label>
        </div>
        <button
          className="bg-slate-900 text-white px-4 py-2 rounded"
          onClick={() => handleAction({ action: "config", ...config })}
          disabled={loading}
        >
          Guardar configuracion
        </button>
      </section>

      <section className="border rounded p-4 space-x-2">
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => handleAction({ action: "fetch-one" })}
          disabled={loading}
        >
          Traer 1 noticia externa
        </button>
        <button
          className="bg-emerald-700 text-white px-4 py-2 rounded"
          onClick={() => handleAction({ action: "run" })}
          disabled={loading}
        >
          Ejecutar pipeline
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Borradores para review</h2>
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <article key={draft.id} className="border rounded p-4 space-y-2">
              <p className="font-semibold">{draft.news_title}</p>
              <p className="text-sm text-gray-500">{draft.news_source}</p>
              <p className="text-xs">Estado: {draft.status}</p>
              {draft.media_url ? (
                <img
                  className="max-w-sm rounded border"
                  src={draft.media_url.startsWith("http") ? draft.media_url : `${API_ORIGIN}${draft.media_url}`}
                  alt={draft.news_title}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button className="bg-gray-800 text-white px-3 py-1 rounded" onClick={() => handleReview(draft.id)}>
                  Review IG/FB
                </button>
                <button className="bg-indigo-700 text-white px-3 py-1 rounded" onClick={() => handleAction({ action: "approve", draftId: draft.id })}>
                  Aprobar
                </button>
                <button className="bg-rose-700 text-white px-3 py-1 rounded" onClick={() => handleAction({ action: "publish", draftId: draft.id })}>
                  Publicar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {review ? (
        <section className="border rounded p-4 space-y-3">
          <h2 className="text-lg font-semibold">Review previo para Instagram y Facebook</h2>
          <p className="font-medium">{review.news_title}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <h3 className="font-semibold">Instagram</h3>
              <p className="text-sm whitespace-pre-wrap">{review.instagram_preview.caption}</p>
            </div>
            <div className="border rounded p-3">
              <h3 className="font-semibold">Facebook</h3>
              <p className="text-sm whitespace-pre-wrap">{review.facebook_preview.caption}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Historial (aprobado/publicado)</h2>
        <div className="grid gap-2">
          {history.map((item) => (
            <div key={item.id} className="border rounded p-3 text-sm">
              <strong>{item.news_title}</strong> - {item.status} - {item.approved_by || "sin aprobador"}
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
    </main>
  );
}
