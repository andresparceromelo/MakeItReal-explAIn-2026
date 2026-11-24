'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles, Trophy, UserRound } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

interface TopNavbarProps {
  mode: 'onboarding' | 'hub' | 'lesson';
  completedCount?: number;
  currentStep?: number;
  totalSteps?: number;
  onOpenProfile?: () => void;
  onExitLesson?: () => void;
}

export function TopNavbar({
  mode,
  completedCount = 0,
  currentStep = 1,
  totalSteps = 5,
  onOpenProfile,
  onExitLesson,
}: TopNavbarProps) {
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentStep / totalSteps) * 100))
  );
  const containerWidth =
    mode === 'lesson' ? 'max-w-2xl lg:max-w-3xl' : 'max-w-5xl';

  return (
    <header className="sticky top-0 z-40 border-b border-[#DDEAE4] bg-[#FFFFFF]/90 backdrop-blur-md">
      <div
        className={`mx-auto flex h-16 sm:h-[72px] ${containerWidth} items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6`}
      >
        {mode === 'onboarding' && (
          <>
            <BrandLogo />
            <div className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#DDEAE4] bg-[#F0FAF5] px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#046C4E]">
              <Sparkles className="h-4 w-4 text-[#0E9F6E]" strokeWidth={2.2} />
              <span>Entrenador IA</span>
            </div>
          </>
        )}

        {mode === 'hub' && (
          <>
            <Link
              href="/"
              className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9F6E]"
              aria-label="Ir al inicio de MakeItReal"
            >
              <BrandLogo />
            </Link>
            <nav
              aria-label="Navegación principal"
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <Link
                href="/"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-full bg-[#F0FAF5] px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#046C4E] transition-colors hover:bg-[#A7F3D0]/40"
                aria-label="Lecciones"
                title="Lecciones"
              >
                <BookOpen className="h-4 w-4 text-[#0E9F6E]" strokeWidth={2.2} />
                <span className="hidden sm:inline">Lecciones</span>
              </Link>

              <div
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#DDEAE4] bg-[#F0FAF5] px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-[#10231C]"
                title={`${completedCount} de 2 lecciones completadas`}
              >
                <Trophy className="h-4 w-4 text-[#FBBF24]" strokeWidth={2.2} />
                <span>{completedCount}/2</span>
              </div>

              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#5B6B65] transition-colors hover:bg-[#F0FAF5] hover:text-[#0E9F6E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E9F6E] cursor-pointer"
                aria-label="Editar mi perfil"
                title="Mi Perfil"
              >
                <UserRound className="h-4 w-4" strokeWidth={2.2} />
                <span className="hidden sm:inline">Mi Perfil</span>
              </button>
            </nav>
          </>
        )}

        {mode === 'lesson' && (
          <>
            <div className="flex items-center gap-2 shrink-0">
              {onExitLesson ? (
                <button
                  type="button"
                  onClick={onExitLesson}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#DDEAE4] bg-[#FFFFFF] px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#5B6B65] transition-colors hover:bg-[#F0FAF5] hover:text-[#046C4E] cursor-pointer"
                  aria-label="Salir de la lección"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
                  <span className="hidden min-[360px]:inline">Salir</span>
                </button>
              ) : (
                <Link
                  href="/"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#DDEAE4] bg-[#FFFFFF] px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#5B6B65] transition-colors hover:bg-[#F0FAF5] hover:text-[#046C4E]"
                  aria-label="Salir de la lección"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
                  <span className="hidden min-[360px]:inline">Salir</span>
                </Link>
              )}
              <div className="hidden md:block pl-1">
                <BrandLogo compact />
              </div>
            </div>

            <div className="flex-1 min-w-[72px] max-w-xs sm:max-w-sm px-1 sm:px-2">
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-[#F0FAF5] border border-[#DDEAE4]"
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={totalSteps}
                aria-label={`Progreso de la lección: paso ${currentStep} de ${totalSteps}`}
              >
                <div
                  className="h-full rounded-full bg-[#0E9F6E] transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-[#F0FAF5] px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-[#046C4E]">
              Paso {currentStep} de {totalSteps}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
