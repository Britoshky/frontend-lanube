"use client";

import Image from "next/image";
import { type ChangeEvent, type ReactNode, type SyntheticEvent, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PublishIcon from "@mui/icons-material/Publish";
import ReviewsIcon from "@mui/icons-material/Reviews";

import {
  type EditorialSnapshot,
  getDraftReviewAction,
  type EditorialActionPayload,
  runEditorialMutationAction,
  getEditorialSnapshotAction,
} from "@/app/actions/pipeline";
import type { DraftDTO, PipelineConfigDTO, ReviewDTO } from "@/src/services/schemas";

const API_ORIGIN =
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8010/api/v1").replace("/api/v1", "");
const PUBLIC_MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "").trim().replace(/\/$/, "");

type AdminPageClientProps = {
  initialSession: string | null;
  initialDrafts: DraftDTO[];
  initialHistory: DraftDTO[];
  initialConfig: PipelineConfigDTO;
};

type ImagePreviewState = {
  draftId: number;
  newsTitle: string;
  images: string[];
  current: string;
  selected: string | null;
};

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

type PipelineRunResult = {
  prepared_posts?: number;
  draft_ids?: number[];
};

function TabPanel({ value, index, children }: { value: number; index: number; children: ReactNode }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2.5 }}>{children}</Box>;
}

function statusColor(status: string): "success" | "warning" | "info" | "default" {
  if (status === "published") return "success";
  if (status === "approved") return "info";
  if (status === "ready") return "warning";
  return "default";
}

function normalizeImageCandidateKey(imageUrl: string): string {
  try {
    const parsed = new URL(imageUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname
      .toLowerCase()
      .replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp)$)/i, "")
      .replace(/-scaled(?=\.(jpg|jpeg|png|webp)$)/i, "")
      .replace(/\/+/, "/");

    const cleaned = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      const k = key.toLowerCase();
      if (["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "width", "height", "w", "h", "fit", "crop", "quality", "q", "format", "auto"].includes(k)) {
        return;
      }
      cleaned.append(k, value);
    });

    const query = cleaned.toString();
    return `${host}${path}${query ? `?${query}` : ""}`;
  } catch {
    return imageUrl.trim().toLowerCase();
  }
}

function resolveImageSrc(imageUrl: string): string {
  if (!imageUrl) return imageUrl;

  function mediaProxyUrl(filename: string): string {
    return `/api/editorial/media/${encodeURIComponent(filename)}`;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const parsed = new URL(imageUrl);
      const filename = parsed.pathname.split("/").pop() || "";

      if (
        filename &&
        (parsed.pathname.startsWith("/rrss/public/") || parsed.pathname.startsWith("/media/"))
      ) {
        return mediaProxyUrl(filename);
      }
    } catch {
      return imageUrl;
    }

    return imageUrl;
  }

  if (imageUrl.startsWith("/media/")) {
    const filename = imageUrl.split("/").pop() || "";
    if (filename) return mediaProxyUrl(filename);
  }

  if (PUBLIC_MEDIA_BASE && imageUrl.startsWith("/rrss/public/")) {
    const filename = imageUrl.split("/").pop() || "";
    if (filename) return mediaProxyUrl(filename);
  }

  return `${API_ORIGIN}${imageUrl}`;
}

export default function AdminPageClient({ initialSession, initialDrafts, initialHistory, initialConfig }: AdminPageClientProps) {
  const [username, setUsername] = useState("britoshky@gmail.com");
  const [password, setPassword] = useState("CdCd@2627");
  const [session, setSession] = useState<string | null>(initialSession);
  const [drafts, setDrafts] = useState<DraftDTO[]>(initialDrafts);
  const [history, setHistory] = useState<DraftDTO[]>(initialHistory);
  const [config, setConfig] = useState<PipelineConfigDTO>(initialConfig);
  const [review, setReview] = useState<ReviewDTO | null>(null);
  const [error, setError] = useState<string>("");
  const [pageLoading] = useState<boolean>(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  function showToast(message: string, severity: ToastState["severity"]) {
    setToast({ open: true, message, severity });
  }

  async function runWithRetry<T>(runner: () => Promise<T>): Promise<T> {
    const delays = [1000, 2200, 3800];
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= delays.length; attempt += 1) {
      try {
        return await runner();
      } catch (error) {
        lastError = error;
        if (attempt >= delays.length) break;
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }
    }

    throw lastError instanceof Error ? lastError : new Error("No se pudo completar la solicitud");
  }

  const draftStats = useMemo(() => {
    const ready = drafts.filter((item) => item.status === "ready").length;
    const approved = drafts.filter((item) => item.status === "approved").length;
    const published = drafts.filter((item) => item.status === "published").length;
    return { ready, approved, published };
  }, [drafts]);

  async function refreshAll(): Promise<EditorialSnapshot | null> {
    const snapshot = await getEditorialSnapshotAction();
    if (!snapshot.ok || !snapshot.data) {
      setSession(null);
      setDrafts([]);
      setHistory([]);
      return null;
    }

    setSession(snapshot.data.username);
    setDrafts(snapshot.data.drafts);
    setHistory(snapshot.data.history);
    setConfig(snapshot.data.config);
    return snapshot.data;
  }

  async function waitForNewDraft(previousDraftCount: number, expectedDraftIds: number[] = []): Promise<EditorialSnapshot | null> {
    const delayMs = 1200;

    for (;;) {
      const snapshot = await refreshAll();
      const currentCount = snapshot?.drafts.length ?? 0;
      const hasExpectedDraft =
        expectedDraftIds.length > 0 &&
        Boolean(snapshot?.drafts.some((draft) => expectedDraftIds.includes(draft.id)));

      if (currentCount > previousDraftCount || hasExpectedDraft) {
        return snapshot;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  async function handleLogin() {
    setLoadingKey("login");
    setError("");
    try {
      // Login must fail fast; long retries here keep the button stuck in "Iniciando...".
      const result = await runEditorialMutationAction({ action: "login", username, password });
      if (!result.ok) {
        throw new Error(result.error || "Error de login");
      }
      showToast("Sesion iniciada correctamente", "success");
      // Force a fresh server render with authenticated cookies and avoid long action streams.
      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de login");
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleAction(payload: EditorialActionPayload, key: string) {
    setLoadingKey(key);
    setError("");
    let publishDraftId: number | null = null;
    let publishSucceeded = false;
    try {
      if ((payload.action === "approve" || payload.action === "publish") && payload.draftId) {
        const current = drafts.find((item) => item.id === payload.draftId);
        if (current?.status === "published") {
          showToast("Este post ya esta publicado", "info");
          return;
        }
        if (payload.action === "approve" && current?.status === "approved") {
          showToast("Este post ya esta aprobado", "info");
          return;
        }

        if (payload.action === "publish") {
          publishDraftId = payload.draftId;
          setDrafts((prev) =>
            prev.map((item) => (item.id === payload.draftId ? { ...item, status: "publishing" } : item)),
          );
        }
      }

      const previousDraftCount = drafts.length;
      const result = payload.action === "publish"
        ? await runEditorialMutationAction(payload)
        : await runWithRetry(() => runEditorialMutationAction(payload));
      if (!result.ok) {
        throw new Error(result.error || "Error en accion");
      }

      if (payload.action === "publish") {
        const publishData = (result.data as { published?: boolean; reason?: string; partial?: boolean } | undefined) || {};
        if (!publishData.published) {
          throw new Error(publishData.reason || "No se pudo publicar en Meta");
        }
        publishSucceeded = true;
        setDrafts((prev) =>
          prev.map((item) => (item.id === payload.draftId ? { ...item, status: "published" } : item)),
        );
      }

      const responseMessage = (result.data as { message?: string } | undefined)?.message;

      if (payload.action === "fetch-one") {
        const runInfo = (result.data as PipelineRunResult | undefined) || {};
        const createdCount = Number(runInfo.prepared_posts || 0);
        const draftIds = Array.isArray(runInfo.draft_ids) ? runInfo.draft_ids : [];

        if (createdCount <= 0) {
          await refreshAll();
          showToast("No se creo una noticia nueva (probablemente duplicada en fuente).", "warning");
          return;
        }

        await waitForNewDraft(previousDraftCount, draftIds);
        showToast(responseMessage || "Noticia creada correctamente", "success");
        return;
      }

      const snapshot = payload.action === "publish" ? null : await refreshAll();

      if (payload.action === "config") {
        showToast("Configuracion actualizada", "success");
      } else if (payload.action === "delete") {
        showToast("Draft eliminado", "success");
      } else if (payload.action === "approve") {
        showToast("Draft aprobado", "success");
      } else if (payload.action === "publish") {
        void refreshAll();
        showToast("Draft publicado", "success");
      } else if (payload.action === "run") {
        showToast(responseMessage || "Pipeline ejecutado", "success");
        if (!snapshot) {
          showToast("No se pudo refrescar el panel luego de ejecutar pipeline", "warning");
        }
      }
    } catch (err) {
      if (publishDraftId && !publishSucceeded) {
        setDrafts((prev) =>
          prev.map((item) => (item.id === publishDraftId && item.status === "publishing" ? { ...item, status: "approved" } : item)),
        );
      }
      const message = err instanceof Error ? err.message : "Error en accion";
      if (message.includes("Failed to find Server Action")) {
        setError("La sesion del panel quedo desactualizada. Recargando para sincronizar...");
        setTimeout(() => window.location.reload(), 900);
      } else {
        setError(message);
        showToast(message, "error");
      }
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleReview(draftId: number) {
    setLoadingKey(`review-${draftId}`);
    setError("");
    try {
      const result = await runWithRetry(() => getDraftReviewAction(draftId));
      if (!result.ok || !result.data) {
        throw new Error(result.error || "No se pudo generar review");
      }
      setReview(result.data);
      showToast("Review generado", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar review");
    } finally {
      setLoadingKey(null);
    }
  }

  function imageCandidatesForDraft(draft: DraftDTO): string[] {
    const all = [
      draft.selected_image_url || "",
      ...(draft.image_candidates || []),
    ].filter(Boolean);
    const dedup = new Map<string, string>();
    for (const candidate of all) {
      const key = normalizeImageCandidateKey(candidate);
      if (!dedup.has(key)) {
        dedup.set(key, candidate);
      }
    }

    const uniq = Array.from(dedup.values());
    return uniq;
  }

  function openImagePreview(draft: DraftDTO, images: string[], current: string) {
    setImagePreview({
      draftId: draft.id,
      newsTitle: draft.news_title,
      images,
      current,
      selected: draft.selected_image_url || null,
    });
  }

  async function chooseImageFromPreview() {
    if (!imagePreview?.selected) return;

    const key = `select-image-${imagePreview.draftId}`;
    setLoadingKey(key);
    setError("");
    try {
      const result = await runEditorialMutationAction({
        action: "select-image",
        draftId: imagePreview.draftId,
        imageUrl: imagePreview.selected,
      });
      if (!result.ok) {
        throw new Error(result.error || "No se pudo seleccionar imagen");
      }
      await refreshAll();
      setImagePreview(null);
      showToast("Imagen seleccionada", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo seleccionar imagen";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoadingKey(null);
    }
  }

  if (pageLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Card variant="outlined">
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, py: 5 }}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">Cargando panel editorial...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardHeader
            title="Acceso Editorial"
            subheader="Inicia sesion para revisar, aprobar y publicar contenido automatizado."
          />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Correo"
                type="email"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                fullWidth
              />
              <TextField
                label="Clave"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleLogin} disabled={loadingKey === "login"}>
                {loadingKey === "login" ? "Iniciando..." : "Iniciar sesion"}
              </Button>
              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3.5 }}>
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2.5, background: "linear-gradient(130deg,#eaf5ff 0%,#eef2ff 45%,#fff4e5 100%)" }}>
        <CardContent sx={{ py: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary">Centro Editorial IA</Typography>
              <Typography variant="h4" fontWeight={700}>Panel de Publicaciones La Nube FM</Typography>
              <Typography variant="body2" color="text.secondary">Sesion activa: {session}</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip color="warning" label={`Listos: ${draftStats.ready}`} />
              <Chip color="info" label={`Aprobados: ${draftStats.approved}`} />
              <Chip color="success" label={`Publicados: ${draftStats.published}`} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_: SyntheticEvent, v: number) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Control Diario" />
          <Tab icon={<ReviewsIcon />} iconPosition="start" label="Drafts y Review" />
          <Tab icon={<PublishIcon />} iconPosition="start" label="Historial" />
        </Tabs>
        <Divider />
        <CardContent>
          <TabPanel value={tab} index={0}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Noticias por dia"
                  inputProps={{ min: 1, max: 24 }}
                  value={config.daily_news_target}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConfig({ ...config, daily_news_target: Number(e.target.value) || 1 })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Horarios"
                  value={config.schedule_times}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConfig({ ...config, schedule_times: e.target.value })
                  }
                  placeholder="08:00,13:00,19:00"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", alignItems: "center" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Switch
                    checked={config.auto_approve_if_quality_ok}
                    onChange={(_: ChangeEvent<HTMLInputElement>, checked: boolean) =>
                      setConfig({ ...config, auto_approve_if_quality_ok: checked })
                    }
                  />
                  <Typography variant="body2">Auto aprobar si calidad OK</Typography>
                </Stack>
              </Grid>
            </Grid>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={2.5}>
              <Button variant="contained" color="secondary" onClick={() => handleAction({ action: "fetch-one" }, "fetch-one")} disabled={loadingKey === "fetch-one"}>
                {loadingKey === "fetch-one" ? "Trayendo..." : "Traer 1 noticia externa"}
              </Button>
              <Button variant="contained" color="success" onClick={() => handleAction({ action: "run" }, "run")} disabled={loadingKey === "run"}>
                {loadingKey === "run" ? "Ejecutando..." : "Ejecutar pipeline ahora"}
              </Button>
              <Button variant="contained" onClick={() => handleAction({ action: "config", ...config }, "config")} disabled={loadingKey === "config"} startIcon={<AutoAwesomeIcon />}>
                {loadingKey === "config" ? "Guardando..." : "Guardar configuracion"}
              </Button>
            </Stack>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={2}>
                  {drafts.length === 0 ? (
                    <Alert severity="info">No hay borradores por ahora.</Alert>
                  ) : null}
                  {drafts.map((draft) => {
                    const images = imageCandidatesForDraft(draft);
                    const cover = draft.media_url || draft.selected_image_url || images[0] || null;
                    return (
                      <Card key={draft.id} variant="outlined" sx={{ borderRadius: 2.5 }}>
                        <CardHeader
                          title={draft.news_title}
                          subheader={draft.news_source}
                          action={<Chip color={statusColor(draft.status)} label={draft.status} size="small" />}
                        />
                        <Divider />
                        <CardContent>
                          {cover ? (
                            <Box sx={{ position: "relative", width: "100%", borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                              <Image src={resolveImageSrc(cover)} alt={draft.news_title} width={1200} height={675} style={{ width: "100%", height: "auto" }} unoptimized />
                            </Box>
                          ) : null}
                          {images.length > 1 ? (
                            <Stack direction="row" spacing={1} sx={{ overflowX: "auto", py: 1.2 }}>
                              {images.slice(0, 10).map((img) => (
                                <Stack key={img} spacing={0.7} sx={{ minWidth: 110, width: 110 }}>
                                  <Box
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openImagePreview(draft, images, img)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        openImagePreview(draft, images, img);
                                      }
                                    }}
                                    sx={{ position: "relative", width: 110, height: 68, borderRadius: 1.5, overflow: "hidden", border: "1px solid", borderColor: draft.selected_image_url === img ? "primary.main" : "divider", cursor: "zoom-in" }}
                                  >
                                    <Image src={resolveImageSrc(img)} alt="thumb" fill style={{ objectFit: "cover" }} unoptimized />
                                  </Box>
                                  <Button
                                    size="small"
                                    variant={draft.selected_image_url === img ? "contained" : "outlined"}
                                    onClick={() => handleAction({ action: "select-image", draftId: draft.id, imageUrl: img }, `select-image-${draft.id}`)}
                                    disabled={loadingKey === `select-image-${draft.id}`}
                                  >
                                    {loadingKey === `select-image-${draft.id}` ? "Guardando..." : draft.selected_image_url === img ? "Seleccionada" : "Usar"}
                                  </Button>
                                </Stack>
                              ))}
                            </Stack>
                          ) : null}

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={1.5}>
                            <Button size="small" variant="outlined" onClick={() => handleReview(draft.id)} disabled={loadingKey === `review-${draft.id}`}>
                              {loadingKey === `review-${draft.id}` ? "Cargando..." : "Review IG/FB"}
                            </Button>
                            {images.length > 0 ? (
                              <Button size="small" variant="text" onClick={() => openImagePreview(draft, images, cover || images[0])}>
                                Ver imagenes
                              </Button>
                            ) : null}
                            <Button size="small" color="info" variant="contained" onClick={() => handleAction({ action: "approve", draftId: draft.id }, `approve-${draft.id}`)} disabled={loadingKey === `approve-${draft.id}` || draft.status === "approved" || draft.status === "published"}>
                              {draft.status === "published" ? "Publicado" : draft.status === "approved" ? "Aprobado" : "Aprobar"}
                            </Button>
                            <Button size="small" color="error" variant="contained" onClick={() => handleAction({ action: "publish", draftId: draft.id }, `publish-${draft.id}`)} disabled={loadingKey === `publish-${draft.id}` || draft.status === "published" || draft.status === "publishing"}>
                              {loadingKey === `publish-${draft.id}` || draft.status === "publishing" ? "Publicando..." : draft.status === "published" ? "Ya publicado" : "Publicar"}
                            </Button>
                            <Button size="small" variant="text" color="inherit" onClick={() => handleAction({ action: "delete", draftId: draft.id }, `delete-${draft.id}`)} disabled={loadingKey === `delete-${draft.id}`}>
                              Eliminar
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2.5, position: { lg: "sticky" }, top: { lg: 92 } }}>
                  <CardHeader title="Preview Social" />
                  <Divider />
                  <CardContent>
                    {!review ? (
                      <Typography variant="body2" color="text.secondary">
                        Selecciona un draft y presiona <strong>Review IG/FB</strong> para ver la previa.
                      </Typography>
                    ) : (
                      <Stack spacing={2}>
                        <Typography variant="subtitle2" fontWeight={700}>{review.news_title}</Typography>
                        {review.image_candidates?.length ? (
                          <Grid container spacing={1}>
                            {review.image_candidates.slice(0, 8).map((img) => (
                              <Grid key={img} size={{ xs: 6 }}>
                                <Box
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    const draft = drafts.find((item) => item.id === review.draft_id);
                                    if (!draft) return;
                                    const deduped = imageCandidatesForDraft(draft);
                                    openImagePreview(draft, deduped, img);
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      const draft = drafts.find((item) => item.id === review.draft_id);
                                      if (!draft) return;
                                      const deduped = imageCandidatesForDraft(draft);
                                      openImagePreview(draft, deduped, img);
                                    }
                                  }}
                                  sx={{ position: "relative", width: "100%", height: 96, borderRadius: 1.5, overflow: "hidden", border: "1px solid", borderColor: "divider", cursor: "zoom-in" }}
                                >
                                  <Image src={resolveImageSrc(img)} alt="review-image" fill style={{ objectFit: "cover" }} unoptimized />
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        ) : null}
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="overline" color="text.secondary">Instagram</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{review.instagram_preview.caption}</Typography>
                          </CardContent>
                        </Card>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="overline" color="text.secondary">Facebook</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{review.facebook_preview.caption}</Typography>
                          </CardContent>
                        </Card>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Stack spacing={1.2}>
              {history.length === 0 ? (
                <Alert severity="info">Aun no hay historial.</Alert>
              ) : (
                history.map((item) => (
                  <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{item.news_title}</Typography>
                        <Typography variant="caption" color="text.secondary">Aprobado por: {item.approved_by || "sistema"}</Typography>
                      </Box>
                      <Chip color={statusColor(item.status)} label={item.status} size="small" />
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </TabPanel>
        </CardContent>
      </Card>

      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : null}

      <Dialog open={Boolean(imagePreview)} onClose={() => setImagePreview(null)} maxWidth="md" fullWidth>
        <DialogTitle>{imagePreview?.newsTitle || "Imagen"}</DialogTitle>
        <DialogContent>
          {imagePreview ? (
            <Stack spacing={2}>
              <Box sx={{ position: "relative", width: "100%", borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                <Image
                  src={resolveImageSrc(imagePreview.current)}
                  alt="preview"
                  width={1200}
                  height={675}
                  style={{ width: "100%", height: "auto" }}
                  unoptimized
                />
              </Box>

              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", py: 0.5 }}>
                {imagePreview.images.map((img) => (
                  <Stack key={img} spacing={0.7} sx={{ minWidth: 120, width: 120 }}>
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={() => setImagePreview({ ...imagePreview, current: img, selected: img })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setImagePreview({ ...imagePreview, current: img, selected: img });
                        }
                      }}
                      sx={{ position: "relative", width: 120, height: 74, borderRadius: 1.5, overflow: "hidden", border: "2px solid", borderColor: imagePreview.selected === img ? "primary.main" : "divider", cursor: "pointer" }}
                    >
                      <Image src={resolveImageSrc(img)} alt="candidate" fill style={{ objectFit: "cover" }} unoptimized />
                    </Box>
                    <Button size="small" variant={imagePreview.selected === img ? "contained" : "outlined"} onClick={() => setImagePreview({ ...imagePreview, current: img, selected: img })}>
                      {imagePreview.selected === img ? "Seleccionada" : "Elegir"}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImagePreview(null)}>Cerrar</Button>
          <Button variant="contained" onClick={chooseImageFromPreview} disabled={!imagePreview?.selected || loadingKey === `select-image-${imagePreview?.draftId}`}>
            {loadingKey === `select-image-${imagePreview?.draftId}` ? "Guardando..." : "Usar esta imagen"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setToast((prev) => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
