'use client';

import { CheckCircle2, Compass, Sparkles } from 'lucide-react';
import { TopNavbar } from '@/components/TopNavbar';
import { ProfileForm } from '@/components/ProfileForm';
import { UserProfile } from '@/types';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
}

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: '1. Tu punto de partida real',
    detail: 'Responde como lo harías hoy, sin calificaciones ni presión.',
  },
  {
    icon: Sparkles,
    title: '2. Práctica guiada con IA',
    detail: 'Recibe pistas para mejorar tu estructura sin copiar textos.',
  },
  {
    icon: CheckCircle2,
    title: '3. Progreso comprobable',
    detail: 'Compara tu Antes vs. Después al terminar cada lección.',
  },
];

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  return (
    <div className="min-h-dvh bg-[#FFFFFF] flex flex-col">
      <TopNavbar mode="onboarding" />

      <main className="flex-1 flex items-start lg:items-center px-4 sm:px-6 py-4 sm:py-6 lg:py-6">
        <div className="mx-auto w-full max-w-xl lg:max-w-5xl animate-fade-slide">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-5 lg:gap-10">
            <div className="lg:col-span-5 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold tracking-tight text-[#10231C] leading-[1.15]">
                Prepárate para tu próxima entrevista,{' '}
                <span className="text-[#046C4E]">paso a paso.</span>
              </h1>
              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#5B6B65]">
                Para personas en Antioquia que buscan empleo. Aprende en 2
                lecciones cortas (10–15 min) a responder con claridad y demuestra
                tu avance real.
              </p>

              {/* Purposeful value summary on PC/landscape desktop */}
              <ul className="hidden lg:flex flex-col gap-2.5 mt-5">
                {HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className="flex items-start gap-3 rounded-2xl border border-[#DDEAE4] bg-[#F0FAF5]/80 p-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#A7F3D0]/70 text-[#046C4E]">
                        <Icon className="h-4 w-4" strokeWidth={2.3} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#10231C]">
                          {item.title}
                        </p>
                        <p className="text-xs leading-snug text-[#5B6B65]">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <section className="lg:col-span-7 rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-4 sm:p-6 shadow-[0_8px_30px_rgb(16,35,28,0.06)]">
              <ProfileForm submitLabel="Empezar ahora" onSubmit={onComplete} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
