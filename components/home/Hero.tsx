"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Phone } from "lucide-react";

const STREAM_URL = "https://stream.cloudmusic.cl/listen/radio_la_nube/radio.mp3";
const BASE_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 20000;

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);
  const wantsToPlayRef = useRef(false);
  const isManualPauseRef = useRef(false);
  const isRefreshingSourceRef = useRef(false);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const playWithRecovery = async () => {
    const audio = audioRef.current;
    if (!audio || !wantsToPlayRef.current) return;

    try {
      await audio.play();
    } catch {
      scheduleReconnect();
    }
  };

  const forceReconnect = async () => {
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
  };

  const scheduleReconnect = () => {
    if (!wantsToPlayRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    clearRetryTimer();
    const attempt = retryAttemptRef.current;
    const backoff = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
    const jitter = Math.floor(Math.random() * 350);
    retryAttemptRef.current += 1;

    retryTimerRef.current = setTimeout(() => {
      void forceReconnect();
    }, backoff + jitter);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (wantsToPlayRef.current) {
      wantsToPlayRef.current = false;
      isManualPauseRef.current = true;
      clearRetryTimer();
      retryAttemptRef.current = 0;
      audio.pause();
      setIsPlaying(false);
    } else {
      wantsToPlayRef.current = true;
      isManualPauseRef.current = false;
      retryAttemptRef.current = 0;
      void playWithRecovery();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      setIsPlaying(true);
      retryAttemptRef.current = 0;
      clearRetryTimer();
    };

    const onPause = () => {
      setIsPlaying(false);
      if (isManualPauseRef.current) {
        isManualPauseRef.current = false;
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
        void forceReconnect();
      }
    };

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        wantsToPlayRef.current &&
        audio.paused
      ) {
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
  }, []);

  return (
    <section className="w-full min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 text-white px-6 text-center">
      <div className="max-w-3xl space-y-6">
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
            {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isPlaying ? "Pausar" : "Escúchanos en vivo"}
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

    <audio ref={audioRef} src={STREAM_URL} preload="none" />
      </div>
    </section>
  );
}
