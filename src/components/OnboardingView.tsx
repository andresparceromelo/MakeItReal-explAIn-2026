'use client';

import { TopNavbar } from '@/components/TopNavbar';
import { ProfileForm } from '@/components/ProfileForm';
import { UserProfile } from '@/types';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
      <TopNavbar mode="onboarding" />

      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="mx-auto max-w-xl animate-fade-slide">
          <div className="mb-7 text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#10231C] leading-tight">
              Prepárate para tu próxima entrevista,{' '}
              <span className="text-[#046C4E]">paso a paso.</span>
            </h1>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#5B6B65]">
              Para personas en Antioquia que buscan empleo. Aprende en 2
              lecciones cortas (10–15 min) a responder con claridad y demuestra
              tu avance real.
            </p>
          </div>

          <section className="rounded-3xl border border-[#DDEAE4] bg-[#FFFFFF] p-6 sm:p-8 shadow-[0_8px_30px_rgb(16,35,28,0.06)]">
            <ProfileForm submitLabel="Empezar ahora" onSubmit={onComplete} />
          </section>
        </div>
      </main>
    </div>
  );
}
