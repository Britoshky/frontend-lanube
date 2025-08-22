"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Play, Pause, Phone } from "lucide-react";

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

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

    <audio ref={audioRef} src="https://stream.cloudmusic.cl/listen/radio_la_nube/radio.mp3" preload="none" />
      </div>
    </section>
  );
}
