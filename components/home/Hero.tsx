"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Pause, Phone, Play } from "lucide-react";
import Image from "next/image";

const STREAM_URL = "https://a6.asurahosting.com:7360/radio.mp3";
const NOW_PLAYING_URL = "https://a6.asurahosting.com/api/nowplaying/radio_la_nube";
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

  useEffect(() => {
    let isCancelled = false;

    const loadNowPlaying = async () => {
      try {
        const response = await fetch(NOW_PLAYING_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar metadata");
        }

        const data = await response.json();
        const song = data?.now_playing?.song;

        if (isCancelled) {
          return;
        }

        setNowPlaying({
          isOnline: Boolean(data?.is_online),
          title: song?.title || "Sin información",
          artist: song?.artist || "Radio La Nube",
          art: song?.art || DEFAULT_COVER,
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
    <section className="w-full mt-20 min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 text-white px-6 text-center">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold drop-shadow-md">
          Radio La Nube <span className="text-yellow-300">99.5 FM</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium italic">
          “Una nube de éxitos” desde Chanco, Región del Maule 🌤️
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={toggleAudio}
            className="text-white bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md"
            variant="ghost"
            size="lg"
          >
            {isPlaying ? (
              <Pause className="mr-2" />
            ) : isLoading ? (
              <LoaderCircle className="mr-2 animate-spin" />
            ) : (
              <Play className="mr-2" />
            )}
            {isPlaying ? "Pausar" : isLoading ? "Cargando..." : "Escúchanos en vivo"}
          </Button>

          <Button
            variant="secondary"
            className="bg-white text-sky-700 hover:bg-white/90 font-semibold"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
          >
            <Phone className="mr-2 w-5 h-5" />
            Contáctanos
          </Button>
        </div>

        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/30 bg-white/15 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,220px)_1fr] items-stretch">
            <div className="flex items-center justify-center bg-black/20 p-3 sm:p-4 min-h-[220px] sm:min-h-0">
              <Image
                src={nowPlaying.art}
                alt={`Carátula de ${nowPlaying.title}`}
                width={900}
                height={900}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 220px, 240px"
                className="h-full w-full max-h-[280px] object-contain"
                referrerPolicy="no-referrer"
                onError={() => {
                  setNowPlaying((current) => ({
                    ...current,
                    art: DEFAULT_COVER,
                  }));
                }}
              />
            </div>

            <div className="p-5 sm:p-6 text-left space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
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

              <p className="text-sm uppercase tracking-[0.18em] text-white/70 font-medium">
                Artista
              </p>
              <h2 className="text-lg md:text-xl font-semibold leading-tight text-white break-words">
                {nowPlaying.artist}
              </h2>

              <p className="text-sm uppercase tracking-[0.18em] text-white/70 font-medium pt-1">
                Canción
              </p>
              <p className="text-xl md:text-2xl font-bold leading-tight text-white break-words">
                {nowPlaying.title}
              </p>
            </div>
          </div>
        </div>

        <audio ref={audioRef} src={STREAM_URL} preload="none" />
      </div>
    </section>
  );
}
