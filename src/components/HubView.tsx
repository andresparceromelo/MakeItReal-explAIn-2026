'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquareHeart,
  Pencil,
  Rocket,
  Trophy,
  X,
} from 'lucide-react';
import { TopNavbar } from '@/components/TopNavbar';
import { ProfileForm } from '@/components/ProfileForm';
import { LESSON_LIST } from '@/data/lessons';
import { getDisplayName, getDisplayRole } from '@/lib/storage';
import { LessonId, LessonProgress, UserProfile } from '@/types';

interface HubViewProps {
  profile: UserProfile;
  progressMap: Record<LessonId, LessonProgress>;
  onUpdateProfile: (profile: UserProfile) => void;
}

export function HubView({
  profile,
  progressMap,
  onUpdateProfile,
}: HubViewProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const nickname = getDisplayName(profile);
  const role = getDisplayRole(profile);
  const completedCount = LESSON_LIST.filter(
    (lesson) => progressMap[lesson.id]?.completed
  ).length;
  const progressPercent = Math.round((completedCount / LESSON_LIST.length) * 100);

  function handleSaveProfile(updated: UserProfile) {
    onUpdateProfile(updated);
    setIsProfileOpen(false);
  }

  return (
    <div className="min-h-dvh bg-[#FFFFFF] flex flex-col">
      <TopNavbar
        mode="hub"
        completedCount={completedCount}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-5 sm:py-6 lg:py-8">
        {/* Compact Greeting & Progress Header */}
        <section className="animate-fade-slide mb-5 sm:mb-6 rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 sm:p-6 shadow-[0_8px_30px_rgb(16,35,28,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#10231C]">
                ¡Hola, {nickname}!
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-full bg-[#F0FAF5] px-3.5 py-1.5 text-sm font-semibold text-[#046C4E] transition-colors hover:bg-[#A7F3D0]/50 cursor-pointer"
                >
                  <span>Objetivo: {role}</span>
                  <Pencil className="h-3.5 w-3.5 text-[#0E9F6E]" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#F0FAF5] border border-[#DDEAE4] px-4 py-3 md:w-72 lg:w-80 shrink-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBBF24]/25 text-[#10231C]">
                <Trophy className="h-5 w-5 text-[#FBBF24]" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#5B6B65]">
                  Tu progreso
                </p>
                <p className="text-sm font-extrabold text-[#10231C]">
                  {completedCount} de 2 lecciones completadas
                </p>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#FFFFFF] border border-[#DDEAE4]">
                  <div
                    className="h-full rounded-full bg-[#0E9F6E] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2 Giant Lesson Cards */}
        <section
          aria-label="Lecciones disponibles"
          className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6"
        >
          {LESSON_LIST.map((lesson) => {
            const progress = progressMap[lesson.id];
            const isCompleted = Boolean(progress?.completed);
            const isCoral = lesson.accentColor === 'coral';
            const beforeScore = progress?.diagnosticEval?.score;
            const afterScore = progress?.finalEval?.score;

            return (
              <article
                key={lesson.id}
                className="flex flex-col justify-between rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-5 sm:p-6 lg:p-7 shadow-[0_8px_30px_rgb(16,35,28,0.06)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgb(14,159,110,0.12)] transition-all duration-200"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold tracking-wide ${
                          isCoral
                            ? 'bg-[#FB7185]/15 text-[#FB7185]'
                            : 'bg-[#F0FAF5] text-[#046C4E]'
                        }`}
                      >
                        LECCIÓN {lesson.number}
                      </span>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isCoral
                            ? 'bg-[#FB7185]/15 text-[#FB7185]'
                            : 'bg-[#F0FAF5] text-[#0E9F6E]'
                        }`}
                        aria-hidden="true"
                      >
                        {lesson.number === 1 ? (
                          <MessageSquareHeart className="h-5 w-5" strokeWidth={2.2} />
                        ) : (
                          <Rocket className="h-5 w-5" strokeWidth={2.2} />
                        )}
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#A7F3D0] px-3 py-1 text-xs font-bold text-[#046C4E]">
                        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Completada
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F0FAF5] px-3 py-1 text-xs font-semibold text-[#5B6B65]">
                        Pendiente
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="mt-5 text-xl font-extrabold tracking-tight text-[#10231C] leading-snug">
                    {lesson.title}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#5B6B65]">
                    {lesson.shortSubtitle}
                  </p>

                  {/* Soft inner competence box */}
                  <div className="mt-5 rounded-2xl bg-[#F0FAF5] p-4 border border-[#DDEAE4]/70">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-[#046C4E]">
                      Qué dominarás
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#10231C]">
                      {lesson.competence}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-[#DDEAE4]/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#5B6B65]">
                      <Clock className="h-4 w-4 text-[#0E9F6E]" strokeWidth={2.2} />
                      {lesson.estimatedMinutes}
                    </span>

                    {isCompleted &&
                      typeof beforeScore === 'number' &&
                      typeof afterScore === 'number' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBBF24]/25 px-3 py-1 text-xs font-bold text-[#10231C]">
                          Antes {beforeScore}/3 → Después {afterScore}/3
                        </span>
                      )}
                  </div>

                  <Link
                    href={`/leccion/${lesson.id}`}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E9F6E] px-5 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.2)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200"
                  >
                    <span>
                      {isCompleted ? 'Practicar de nuevo' : 'Empezar lección'}
                    </span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      {/* Profile Modal (Bottom sheet on smartphones, centered dialog on tablet/PC) */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#10231C]/40 p-0 sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          <div className="w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-5 sm:p-7 safe-pb sm:pb-7 shadow-2xl animate-fade-slide">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2
                id="profile-modal-title"
                className="text-xl font-extrabold text-[#10231C]"
              >
                Mi Perfil
              </h2>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#5B6B65] hover:bg-[#F0FAF5] hover:text-[#10231C] cursor-pointer"
                aria-label="Cerrar perfil"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProfileForm
              initialProfile={profile}
              submitLabel="Guardar cambios"
              showPrivacyNote={false}
              onSubmit={handleSaveProfile}
              onCancel={() => setIsProfileOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
