'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { CAREER_STAGES, TARGET_ROLES } from '@/data/lessons';
import { CareerStage, TargetRole, UserProfile } from '@/types';

interface ProfileFormProps {
  initialProfile?: UserProfile | null;
  submitLabel: string;
  showPrivacyNote?: boolean;
  onSubmit: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export function ProfileForm({
  initialProfile,
  submitLabel,
  showPrivacyNote = true,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [nickname, setNickname] = useState(initialProfile?.nickname ?? '');
  const [stage, setStage] = useState<CareerStage>(
    initialProfile?.stage ?? '18-24 Primer empleo'
  );
  const [targetRole, setTargetRole] = useState<TargetRole>(
    initialProfile?.targetRole ?? 'Atención al cliente'
  );
  const [customRole, setCustomRole] = useState(
    initialProfile?.customRole ?? ''
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      nickname: nickname.trim(),
      stage,
      targetRole,
      customRole: targetRole === 'Otro' ? customRole.trim() : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="nickname-input"
          className="block text-sm font-bold text-[#10231C]"
        >
          ¿Cómo quieres que te llamemos?
        </label>
        <input
          id="nickname-input"
          type="text"
          maxLength={40}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Ej: Camilo, Laura (opcional)"
          className="mt-2 w-full rounded-2xl border border-[#DDEAE4] bg-[#FFFFFF] px-4 py-3 text-base text-[#10231C] placeholder:text-[#5B6B65]/70 focus:border-[#0E9F6E] focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/40 transition-all"
        />
      </div>

      <div>
        <span className="block text-sm font-bold text-[#10231C]">
          Tu etapa actual
        </span>
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {CAREER_STAGES.map((option) => {
            const selected = stage === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setStage(option)}
                aria-pressed={selected}
                className={`rounded-2xl border px-3.5 py-3 text-left sm:text-center text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selected
                    ? 'border-[#0E9F6E] bg-[#F0FAF5] text-[#046C4E] shadow-xs'
                    : 'border-[#DDEAE4] bg-[#FFFFFF] text-[#10231C] hover:border-[#0E9F6E]/50 hover:bg-[#F0FAF5]/50'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="block text-sm font-bold text-[#10231C]">
          Puesto al que aspiras
        </span>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {TARGET_ROLES.map((role) => {
            const selected = targetRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                aria-pressed={selected}
                className={`rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selected
                    ? 'border-[#0E9F6E] bg-[#F0FAF5] text-[#046C4E] shadow-xs'
                    : 'border-[#DDEAE4] bg-[#FFFFFF] text-[#10231C] hover:border-[#0E9F6E]/50 hover:bg-[#F0FAF5]/50'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {targetRole === 'Otro' && (
          <div className="mt-3 animate-fade-slide">
            <label htmlFor="custom-role-input" className="sr-only">
              Escribe el puesto al que aspiras
            </label>
            <input
              id="custom-role-input"
              type="text"
              maxLength={60}
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Escribe el puesto (ej: Cajero, Mesero, Operario)"
              className="w-full rounded-2xl border border-[#DDEAE4] bg-[#FFFFFF] px-4 py-3 text-sm sm:text-base text-[#10231C] placeholder:text-[#5B6B65]/70 focus:border-[#0E9F6E] focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]/40 transition-all"
            />
          </div>
        )}
      </div>

      {showPrivacyNote && (
        <div className="flex items-center gap-2 rounded-2xl bg-[#F0FAF5] px-3.5 py-2.5 text-xs sm:text-sm text-[#5B6B65]">
          <ShieldCheck
            className="h-4 w-4 shrink-0 text-[#0E9F6E]"
            strokeWidth={2.2}
          />
          <span>
            Sin registro. Tus respuestas se guardan solo en este navegador.
          </span>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto rounded-2xl border border-[#DDEAE4] bg-[#FFFFFF] px-5 py-3.5 text-sm font-semibold text-[#5B6B65] hover:bg-[#F0FAF5] hover:text-[#10231C] transition-all cursor-pointer"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="w-full flex-1 rounded-2xl bg-[#0E9F6E] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgb(14,159,110,0.22)] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
