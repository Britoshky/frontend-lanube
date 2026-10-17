"use client";

import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from "react";

type VolumeSliderProps = {
  /** 0–1, posición del thumb (no el volumen efectivo con mute) */
  value: number;
  onChange: (next: number) => void;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  thumbClassName?: string;
  ariaLabel?: string;
};

/**
 * Slider de volumen con pointer capture — evita fallos de <input type="range">
 * en WebKit/móvil (track no clickeable, thumb minúsculo, scroll hijack).
 */
export function VolumeSlider({
  value,
  onChange,
  className = "",
  trackClassName = "bg-white/25",
  fillClassName = "bg-yellow-300",
  thumbClassName = "border-sky-800 bg-yellow-300",
  ariaLabel = "Nivel de volumen",
}: VolumeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (clientX - rect.left) / rect.width;
      onChange(Math.min(1, Math.max(0, ratio)));
    },
    [onChange]
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`relative flex h-10 min-w-0 flex-1 cursor-pointer touch-none items-center ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(0, value - 0.05));
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(1, value + 0.05));
        } else if (e.key === "Home") {
          e.preventDefault();
          onChange(0);
        } else if (e.key === "End") {
          e.preventDefault();
          onChange(1);
        }
      }}
    >
      <div className={`pointer-events-none absolute inset-x-0 h-1.5 rounded-full ${trackClassName}`} />
      <div
        className={`pointer-events-none absolute left-0 h-1.5 rounded-full ${fillClassName}`}
        style={{ width: `${pct}%` }}
      />
      <div
        className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 shadow-md ${thumbClassName}`}
        style={{ left: `calc(${pct}% - 0.5rem)` }}
      />
    </div>
  );
}
