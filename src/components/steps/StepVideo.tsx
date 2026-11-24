'use client';

import { useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LessonVideo } from '@/types';

interface StepVideoProps {
  video: LessonVideo;
  stepNumber: number;
  alreadyCompletedBefore?: boolean;
  onNext: () => void;
}

const SPEED_OPTIONS = [1, 1.25, 1.5] as const;

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function StepVideo({
  video,
  stepNumber,
  alreadyCompletedBefore = false,
  onNext,
}: StepVideoProps) {
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.25 | 1.5>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);

  const canContinue = hasEnded || videoError;
  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  async function togglePlay() {
    const el = videoRef.current;
    if (!el || videoError) return;

    if (el.paused || el.ended) {
      if (el.ended) {
        el.currentTime = 0;
      }
      try {
        await el.play();
      } catch {
        // Browser autoplay/play rejection ignored safely
      }
    } else {
      el.pause();
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = videoRef.current;
    if (!el) return;
    const nextTime = Number(e.target.value);
    el.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  }

  function cycleSpeed() {
    const el = videoRef.current;
    const nextIndex =
      (SPEED_OPTIONS.indexOf(playbackRate) + 1) % SPEED_OPTIONS.length;
    const nextSpeed = SPEED_OPTIONS[nextIndex];
    setPlaybackRate(nextSpeed);
    if (el) {
      el.playbackRate = nextSpeed;
    }
  }

  function toggleFullscreen() {
    const wrapper = playerWrapperRef.current;
    const el = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    if (wrapper?.requestFullscreen) {
      wrapper.requestFullscreen().catch(() => {
        el?.webkitEnterFullscreen?.();
      });
      return;
    }
    el?.webkitEnterFullscreen?.();
  }

  return (
    <div className="animate-fade-slide space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-bold text-[#046C4E]">
          Paso {stepNumber} · Video guía
        </span>
        {(duration > 0 || video.durationLabel) && (
          <span className="rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-semibold text-[#5B6B65]">
            {duration > 0 ? formatSeconds(duration) : video.durationLabel}
          </span>
        )}
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#10231C]">
          {video.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#5B6B65]">
          {video.subtitle}
        </p>
      </div>

      {/* Modern Responsive Video Player Card */}
      <div
        ref={playerWrapperRef}
        className="overflow-hidden rounded-3xl border border-[#DDEAE4] bg-[#10231C] shadow-[0_12px_36px_rgb(16,35,28,0.14)]"
      >
        <div className="relative aspect-video w-full bg-[#10231C]">
          {!videoError ? (
            <>
              <video
                ref={videoRef}
                src={video.src}
                preload="metadata"
                playsInline
                controlsList="nodownload"
                onClick={togglePlay}
                onLoadedMetadata={(e) => {
                  const vid = e.currentTarget;
                  if (Number.isFinite(vid.duration)) {
                    setDuration(vid.duration);
                  }
                }}
                onTimeUpdate={(e) => {
                  const vid = e.currentTarget;
                  setCurrentTime(vid.currentTime);
                  if (vid.duration > 0 && vid.currentTime >= vid.duration - 0.35) {
                    setHasEnded(true);
                  }
                }}
                onPlay={() => {
                  setIsPlaying(true);
                  setHasStarted(true);
                  setIsBuffering(false);
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setIsBuffering(false);
                }}
                onWaiting={() => setIsBuffering(true)}
                onCanPlay={() => setIsBuffering(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setIsBuffering(false);
                  setHasEnded(true);
                }}
                onError={() => {
                  setVideoError(true);
                  setIsPlaying(false);
                  setIsBuffering(false);
                }}
                className="h-full w-full cursor-pointer object-contain"
              />

              {/* Center Play / Replay Overlay */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={
                    hasEnded
                      ? 'Volver a ver el video'
                      : hasStarted
                        ? 'Reanudar video'
                        : 'Reproducir video'
                  }
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#10231C]/35 backdrop-blur-[1px] transition-opacity hover:bg-[#10231C]/25 cursor-pointer"
                >
                  <span className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#0E9F6E] text-white shadow-[0_8px_30px_rgb(14,159,110,0.5)] transition-transform duration-200 hover:scale-105 hover:bg-[#046C4E]">
                    {hasEnded ? (
                      <RotateCcw className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.4} />
                    ) : (
                      <Play
                        className="h-7 w-7 sm:h-8 sm:w-8 translate-x-0.5 fill-white"
                        strokeWidth={2.2}
                      />
                    )}
                  </span>
                  <span className="rounded-full bg-[#10231C]/80 px-3.5 py-1 text-xs sm:text-sm font-semibold text-white">
                    {hasEnded
                      ? 'Ver de nuevo'
                      : hasStarted
                        ? 'Continuar viendo'
                        : 'Dale play para ver la guía'}
                  </span>
                </button>
              )}

              {/* Buffering Indicator */}
              {isPlaying && isBuffering && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#10231C]/25">
                  <Loader2 className="h-10 w-10 animate-spin text-[#A7F3D0]" />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
              <p className="text-sm sm:text-base font-semibold">
                No pudimos cargar el video en este momento.
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#A7F3D0]">
                Puedes continuar directamente con la fórmula escrita.
              </p>
            </div>
          )}
        </div>

        {/* Sleek Docked Control Bar (never covers video captions) */}
        {!videoError && (
          <div className="border-t border-white/10 bg-[#10231C] px-2.5 sm:px-4 py-2.5 sm:py-3 text-white">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-[#0E9F6E] transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" strokeWidth={2.4} />
                ) : (
                  <Play className="h-4 w-4 translate-x-0.5" strokeWidth={2.4} />
                )}
              </button>

              <div className="flex-1 min-w-[60px] flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Progreso del video"
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#0E9F6E]"
                  style={{
                    background: `linear-gradient(to right, #0E9F6E ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                  }}
                />
              </div>

              <span className="shrink-0 text-[11px] sm:text-xs font-semibold tabular-nums text-[#A7F3D0]">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>

              <button
                type="button"
                onClick={cycleSpeed}
                aria-label={`Velocidad de reproducción ${playbackRate}x`}
                className="shrink-0 rounded-lg bg-white/10 px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-bold text-white hover:bg-[#0E9F6E] transition-colors cursor-pointer"
              >
                {playbackRate}x
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar video'}
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-[#0E9F6E] transition-colors cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <Volume2 className="h-4 w-4" strokeWidth={2.2} />
                )}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Pantalla completa"
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-[#0E9F6E] transition-colors cursor-pointer"
              >
                <Maximize className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Completion status + Natural advance */}
      {hasEnded && (
        <div className="animate-fade-slide flex items-center gap-3 rounded-2xl border border-[#A7F3D0] bg-[#F0FAF5] px-4 py-3 text-sm font-bold text-[#046C4E]">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0E9F6E]" strokeWidth={2.4} />
          <span>¡Video completado! Ya puedes avanzar al siguiente paso.</span>
        </div>
      )}

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 transition-all duration-200 cursor-pointer"
        >
          <span>
            {canContinue
              ? 'Continuar con la fórmula'
              : 'Termina el video para continuar'}
          </span>
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </button>

        {!canContinue && alreadyCompletedBefore && (
          <button
            type="button"
            onClick={onNext}
            className="min-h-[40px] w-full py-1.5 text-center text-xs sm:text-sm font-semibold text-[#5B6B65] hover:text-[#046C4E] transition-colors cursor-pointer"
          >
            Ya completé esta lección, ir directo a la fórmula
          </button>
        )}
      </div>
    </div>
  );
}
