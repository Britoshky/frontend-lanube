"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Spinner,
  Switch,
  Tab,
  Tabs,
} from "@nextui-org/react";

import {
  getConfig,
  getDrafts,
  getHistory,
  getReview,
  getSession,
} from "@/src/services/pipeline-get.service";
import type { DraftDTO, PipelineConfigDTO, ReviewDTO } from "@/src/services/schemas";

const API_ORIGIN =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8010/api/v1").replace("/api/v1", "");

type ActionPayload = {
  action: "login" | "fetch-one" | "run" | "approve" | "publish" | "delete" | "config";
  username?: string;
  password?: string;
  draftId?: number;
  daily_news_target?: number;
  schedule_times?: string;
  auto_approve_if_quality_ok?: boolean;
};

async function callEditorialAction(payload: ActionPayload) {
  const csrfToken = getCsrfToken();
  const response = await fetch("/api/editorial", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || data?.detail || "Operacion fallida");
  }
  return data;
}

function statusColor(status: string): "success" | "warning" | "primary" | "default" {
  if (status === "published") return "success";
  if (status === "approved") return "primary";
  if (status === "ready") return "warning";
  return "default";
}

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/lanube_csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
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
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const inputClassNames = {
    label: "!leading-6 !text-zinc-700",
    inputWrapper: "min-h-12",
  };

  const draftStats = useMemo(() => {
    const ready = drafts.filter((item) => item.status === "ready").length;
    const approved = drafts.filter((item) => item.status === "approved").length;
    const published = drafts.filter((item) => item.status === "published").length;
    return { ready, approved, published };
  }, [drafts]);

  async function refreshAll() {
    const sessionRes = await getSession();
    const [draftsRes, historyRes, configRes] = await Promise.all([
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
    setPageLoading(true);
    refreshAll()
      .catch(() => {
        setSession(null);
      })
      .finally(() => setPageLoading(false));
  }, []);

  async function handleLogin() {
    setLoadingKey("login");
    setError("");
    try {
      await callEditorialAction({ action: "login", username, password });
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de login");
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleAction(payload: ActionPayload, key: string) {
    setLoadingKey(key);
    setError("");
    try {
      await callEditorialAction(payload);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en accion");
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleReview(draftId: number) {
    setLoadingKey(`review-${draftId}`);
    setError("");
    try {
      const result = await getReview(draftId);
      setReview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar review");
    } finally {
      setLoadingKey(null);
    }
  }

  if (pageLoading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <Card className="border border-zinc-200">
          <CardBody className="flex flex-row items-center gap-3 p-8">
            <Spinner color="primary" size="lg" />
            <p className="text-zinc-700">Cargando panel editorial...</p>
          </CardBody>
        </Card>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <Card className="border border-zinc-200 shadow-xl">
          <CardHeader className="flex flex-col items-start gap-1">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">LA NUBE FM</p>
            <h1 className="text-2xl font-semibold">Acceso Editorial</h1>
            <p className="text-sm text-zinc-600">
              Inicia sesion para revisar, aprobar y publicar contenido automatizado.
            </p>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              label="Correo"
              type="email"
              labelPlacement="outside"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="bordered"
              classNames={inputClassNames}
            />
            <Input
              label="Clave"
              type="password"
              labelPlacement="outside"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="bordered"
              classNames={inputClassNames}
            />
            <Button
              color="primary"
              onPress={handleLogin}
              isLoading={loadingKey === "login"}
              className="font-semibold w-full sm:w-auto"
            >
              Iniciar sesion
            </Button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-3 pb-10 pt-6 sm:px-4 md:px-6 space-y-6">
      <Card className="overflow-hidden border border-zinc-200 shadow-lg">
        <CardBody className="bg-[linear-gradient(120deg,#e0f2ff_0%,#f1f5ff_42%,#fff7ed_100%)] p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Centro Editorial IA</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900">Panel de Publicaciones La Nube FM</h1>
              <p className="text-sm text-zinc-700">Sesion activa: {session}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip color="warning" variant="flat">Listos: {draftStats.ready}</Chip>
              <Chip color="primary" variant="flat">Aprobados: {draftStats.approved}</Chip>
              <Chip color="success" variant="flat">Publicados: {draftStats.published}</Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs
        aria-label="panel-admin"
        color="primary"
        variant="underlined"
        fullWidth
        classNames={{
          tabList: "overflow-x-auto",
          panel: "pt-5",
        }}
      >
        <Tab key="control" title="Control Diario">
          <Card className="border border-zinc-200 shadow-sm">
            <CardBody className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Input
                type="number"
                min={1}
                max={24}
                label="Noticias por dia"
                labelPlacement="outside"
                variant="bordered"
                value={String(config.daily_news_target)}
                onChange={(e) =>
                  setConfig({ ...config, daily_news_target: Number(e.target.value) || 1 })
                }
                classNames={inputClassNames}
              />
              <Input
                label="Horarios"
                labelPlacement="outside"
                variant="bordered"
                value={config.schedule_times}
                onChange={(e) => setConfig({ ...config, schedule_times: e.target.value })}
                placeholder="08:00,13:00,19:00"
                classNames={inputClassNames}
              />
              <div className="flex items-center rounded-xl border border-zinc-200 px-3 py-3 min-h-12">
                <Switch
                  isSelected={config.auto_approve_if_quality_ok}
                  onValueChange={(value) =>
                    setConfig({ ...config, auto_approve_if_quality_ok: value })
                  }
                >
                  Auto aprobar si calidad OK
                </Switch>
              </div>

              <div className="md:col-span-2 xl:col-span-3 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <Button
                  color="secondary"
                  onPress={() => handleAction({ action: "fetch-one" }, "fetch-one")}
                  isLoading={loadingKey === "fetch-one"}
                  className="w-full sm:w-auto"
                >
                  Traer 1 noticia externa
                </Button>
                <Button
                  color="success"
                  onPress={() => handleAction({ action: "run" }, "run")}
                  isLoading={loadingKey === "run"}
                  className="w-full sm:w-auto"
                >
                  Ejecutar pipeline ahora
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleAction({ action: "config", ...config }, "config")}
                  isLoading={loadingKey === "config"}
                  className="w-full sm:w-auto"
                >
                  Guardar configuracion
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="drafts" title="Drafts y Review">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-4">
              {drafts.length === 0 ? (
                <Card className="border border-zinc-200">
                  <CardBody>
                    <p className="text-zinc-600">No hay borradores por ahora.</p>
                  </CardBody>
                </Card>
              ) : null}

              {drafts.map((draft) => (
                <Card key={draft.id} className="border border-zinc-200 shadow-sm">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">{draft.news_title}</p>
                      <p className="text-xs text-zinc-500">{draft.news_source}</p>
                    </div>
                    <Chip color={statusColor(draft.status)} variant="flat">
                      {draft.status}
                    </Chip>
                  </CardHeader>
                  <Divider />
                  <CardBody className="gap-3">
                    {draft.media_url ? (
                      <Image
                        className="h-auto w-full rounded-xl border border-zinc-200 object-cover"
                        src={
                          draft.media_url.startsWith("http")
                            ? draft.media_url
                            : `${API_ORIGIN}${draft.media_url}`
                        }
                        alt={draft.news_title}
                        width={1080}
                        height={1080}
                        unoptimized
                      />
                    ) : null}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleReview(draft.id)}
                        isLoading={loadingKey === `review-${draft.id}`}
                        className="w-full sm:w-auto"
                      >
                        Review IG/FB
                      </Button>
                      <Button
                        size="sm"
                        color="secondary"
                        onPress={() =>
                          handleAction({ action: "approve", draftId: draft.id }, `approve-${draft.id}`)
                        }
                        isLoading={loadingKey === `approve-${draft.id}`}
                        className="w-full sm:w-auto"
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() =>
                          handleAction({ action: "publish", draftId: draft.id }, `publish-${draft.id}`)
                        }
                        isLoading={loadingKey === `publish-${draft.id}`}
                        className="w-full sm:w-auto"
                      >
                        Publicar
                      </Button>
                      <Button
                        size="sm"
                        color="default"
                        variant="bordered"
                        onPress={() =>
                          handleAction({ action: "delete", draftId: draft.id }, `delete-${draft.id}`)
                        }
                        isLoading={loadingKey === `delete-${draft.id}`}
                        className="w-full sm:w-auto"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Card className="border border-zinc-200 shadow-sm h-fit lg:sticky lg:top-28">
              <CardHeader>
                <h3 className="font-semibold text-zinc-900">Preview Social</h3>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4">
                {!review ? (
                  <p className="text-sm text-zinc-600">
                    Selecciona un draft y presiona <strong>Review IG/FB</strong> para ver la previa.
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-zinc-900">{review.news_title}</p>
                    <Card className="border border-zinc-200 shadow-none">
                      <CardBody className="gap-2">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Instagram</p>
                        <p className="text-sm whitespace-pre-wrap text-zinc-700">
                          {review.instagram_preview.caption}
                        </p>
                      </CardBody>
                    </Card>
                    <Card className="border border-zinc-200 shadow-none">
                      <CardBody className="gap-2">
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Facebook</p>
                        <p className="text-sm whitespace-pre-wrap text-zinc-700">
                          {review.facebook_preview.caption}
                        </p>
                      </CardBody>
                    </Card>
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="historial" title="Historial">
          <Card className="border border-zinc-200 shadow-sm">
            <CardHeader>
              <h3 className="font-semibold text-zinc-900">Publicaciones procesadas</h3>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
              {history.length === 0 ? (
                <p className="text-sm text-zinc-600">Aun no hay historial.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-sm flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-800">{item.news_title}</p>
                      <p className="text-xs text-zinc-500">Aprobado por: {item.approved_by || "sistema"}</p>
                    </div>
                    <Chip color={statusColor(item.status)} variant="flat">
                      {item.status}
                    </Chip>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {error ? (
        <Card className="border border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{error}</p>
          </CardBody>
        </Card>
      ) : null}
    </main>
  );
}
