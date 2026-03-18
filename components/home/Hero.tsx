"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Pause, Play } from "lucide-react";
import Image from "next/image";
import { getNowPlayingAction } from "@/app/actions/now-playing";

const STREAM_URL = "https://a6.asurahosting.com:7360/radio.mp3";
const BASE_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 20000;
const NOW_PLAYING_POLL_MS = 15000;

type PlayerStatus = "idle" | "connecting" | "playing" | "reconnecting";

type NowPlayingInfo = {
  isOnline: boolean;
  title: string;
  artist: string;
  art: string;
};

const DEFAULT_COVER = "/logo-fondo.webp";

const INITIAL_NOW_PLAYING: NowPlayingInfo = {
  isOnline: false,
  title: "Cargando...",
  artist: "Radio La Nube",
  art: DEFAULT_COVER,
};

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const [nowPlaying, setNowPlaying] = useState<NowPlayingInfo>(INITIAL_NOW_PLAYING);
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);
  const wantsToPlayRef = useRef(false);
  const isManualPauseRef = useRef(false);
  const isRefreshingSourceRef = useRef(false);
  const scheduleReconnectRef = useRef<() => void>(() => {});
  const forceReconnectRef = useRef<() => Promise<void>>(async () => {});
  const isLoading = playerStatus === "connecting" || playerStatus === "reconnecting";

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const playWithRecovery = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !wantsToPlayRef.current) return;

    try {
      await audio.play();
    } catch {
      scheduleReconnectRef.current();
    }
  }, []);

  const forceReconnect = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !wantsToPlayRef.current) return;

    isRefreshingSourceRef.current = true;
    const url = `${STREAM_URL}${STREAM_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
    audio.src = url;
    audio.load();

    try {
      await playWithRecovery();
    } finally {
      isRefreshingSourceRef.current = false;
    }
  }, [playWithRecovery]);

  const scheduleReconnect = useCallback(() => {
    if (!wantsToPlayRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    clearRetryTimer();
    setPlayerStatus("reconnecting");
    const attempt = retryAttemptRef.current;
    const backoff = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
    const jitter = Math.floor(Math.random() * 350);
    retryAttemptRef.current += 1;

    retryTimerRef.current = setTimeout(() => {
      void forceReconnectRef.current();
    }, backoff + jitter);
  }, [clearRetryTimer]);

  scheduleReconnectRef.current = scheduleReconnect;
  forceReconnectRef.current = forceReconnect;

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (wantsToPlayRef.current) {
      wantsToPlayRef.current = false;
      isManualPauseRef.current = true;
      clearRetryTimer();
      retryAttemptRef.current = 0;
      setPlayerStatus("idle");
      audio.pause();
      setIsPlaying(false);
    } else {
      wantsToPlayRef.current = true;
      isManualPauseRef.current = false;
      retryAttemptRef.current = 0;
      setPlayerStatus("connecting");
      void playWithRecovery();
    }
  };

  // Hydration fix: only set dynamic state after client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadNowPlaying = async () => {
      try {
        const result = await getNowPlayingAction();
        if (!result.ok || !result.data) {
          throw new Error(result.error || "No se pudo cargar metadata");
        }

        if (isCancelled) {
          return;
        }

        setNowPlaying({
          isOnline: result.data.isOnline,
          title: result.data.title,
          artist: result.data.artist,
          art: result.data.art || DEFAULT_COVER,
        });
      } catch {
        if (isCancelled) {
          return;
        }

        setNowPlaying((current) => ({
          ...current,
          isOnline: false,
        }));
      }
    };

    void loadNowPlaying();
    const poll = setInterval(() => {
      void loadNowPlaying();
    }, NOW_PLAYING_POLL_MS);

    return () => {
      isCancelled = true;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      setIsPlaying(true);
      setPlayerStatus("playing");
      retryAttemptRef.current = 0;
      clearRetryTimer();
    };

    const onPause = () => {
      setIsPlaying(false);
      if (isManualPauseRef.current) {
        isManualPauseRef.current = false;
        setPlayerStatus("idle");
        return;
      }
      if (isRefreshingSourceRef.current) {
        return;
      }
      if (wantsToPlayRef.current) {
        scheduleReconnect();
      }
    };

    const onRecoverableInterruption = () => {
      if (wantsToPlayRef.current) {
        scheduleReconnect();
      }
    };

    const onOnline = () => {
      if (wantsToPlayRef.current) {
        retryAttemptRef.current = 0;
        setPlayerStatus("connecting");
        void forceReconnect();
      }
    };

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        wantsToPlayRef.current &&
        audio.paused
      ) {
        setPlayerStatus("connecting");
        void forceReconnect();
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onRecoverableInterruption);
    audio.addEventListener("stalled", onRecoverableInterruption);
    audio.addEventListener("waiting", onRecoverableInterruption);
    audio.addEventListener("error", onRecoverableInterruption);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearRetryTimer();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onRecoverableInterruption);
      audio.removeEventListener("stalled", onRecoverableInterruption);
      audio.removeEventListener("waiting", onRecoverableInterruption);
      audio.removeEventListener("error", onRecoverableInterruption);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [clearRetryTimer, forceReconnect, scheduleReconnect]);

  return (
    <section className="w-full mt-20 min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-[#0d4f9e] via-[#1b6fcd] to-[#3aa8ff] text-white px-4 sm:px-6 text-center">
      <div className="w-full max-w-4xl space-y-5 sm:space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-md">
          Radio La Nube <span className="text-yellow-300">99.5 FM</span>
        </h1>
        <p className="text-base sm:text-xl md:text-2xl font-medium italic">
          “Una nube de éxitos” desde Chanco, Región del Maule 🌤️
        </p>

        <div className="mx-auto w-[min(94vw,320px)] sm:w-full sm:max-w-2xl space-y-3 sm:space-y-4">
          <Button
            onClick={toggleAudio}
            className="w-full h-14 sm:h-12 rounded-full border border-white/45 bg-slate-900/35 px-4 text-sm sm:text-base font-semibold text-white backdrop-blur-md hover:bg-yellow-300 hover:text-sky-900"
            variant="ghost"
            size="default"
            aria-label={isPlaying ? "Pausar transmisión" : isLoading ? "Conectando" : "Escuchar en vivo"}
          >
            {isPlaying ? (
              <Pause className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            ) : isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            )}
            {isPlaying ? "Pausar transmisión" : isLoading ? "Conectando..." : "Escúchanos en vivo"}
          </Button>

          <div className="rounded-xl sm:rounded-2xl border border-white/30 bg-white/15 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,220px)_1fr] items-stretch">
            {isMounted ? (
              <>
            <div className="flex items-center justify-center bg-black/20 p-2.5 sm:p-4 min-h-[160px] sm:min-h-0">
              <Image
                src={nowPlaying.art}
                alt={`Carátula de ${nowPlaying.title}`}
                width={900}
                height={900}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 220px, 240px"
                className="h-full w-full max-h-[180px] sm:max-h-[280px] object-contain"
                referrerPolicy="no-referrer"
                onError={() => {
                  setNowPlaying((current) => ({
                    ...current,
                    art: DEFAULT_COVER,
                  }));
                }}
              />
            </div>

            <div className="p-3.5 sm:p-6 text-left space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wide ${
                    nowPlaying.isOnline
                      ? "bg-emerald-400/20 text-emerald-100 border border-emerald-300/40"
                      : "bg-amber-300/20 text-amber-100 border border-amber-200/40"
                  }`}
                >
                  <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${
                      nowPlaying.isOnline ? "bg-emerald-300" : "bg-amber-200"
                    }`}
                  />
                  Sonando ahora
                </span>
              </div>

              <p className="text-[11px] sm:text-sm uppercase tracking-[0.16em] sm:tracking-[0.18em] text-white/70 font-medium">
                Artista
              </p>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-tight text-white break-words">
                {nowPlaying.artist}
              </h2>

              <p className="text-[11px] sm:text-sm uppercase tracking-[0.16em] sm:tracking-[0.18em] text-white/70 font-medium pt-0.5 sm:pt-1">
                Canción
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-white break-words">
                {nowPlaying.title}
              </p>
            </div>
              </>
            ) : (
              <div className="flex items-center justify-center bg-black/20 p-2.5 sm:p-4 min-h-[160px] sm:min-h-0 col-span-2">
                <p className="text-white/70">Cargando...</p>
              </div>
            )}
          </div>
          </div>
        </div>

        <audio ref={audioRef} src={STREAM_URL} preload="none" />
      </div>
    </section>
  );
}
