'use client';

import { useSyncExternalStore } from 'react';
import { LessonId, LessonProgress, UserProfile } from '@/types';

const PROFILE_KEY = 'makeitreal_profile_v1';
const PROGRESS_KEY = 'makeitreal_progress_v1';

const SERVER_PROGRESS_SNAPSHOT: Record<LessonId, LessonProgress> = {
  'leccion-1': { lessonId: 'leccion-1', completed: false },
  'leccion-2': { lessonId: 'leccion-2', completed: false },
};

const listeners = new Set<() => void>();

let cachedProfileRaw: string | null | undefined;
let cachedProfile: UserProfile | null = null;

let cachedProgressRaw: string | null | undefined;
let cachedProgress: Record<LessonId, LessonProgress> = SERVER_PROGRESS_SNAPSHOT;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function emitStorageChange(): void {
  cachedProfileRaw = undefined;
  cachedProgressRaw = undefined;
  listeners.forEach((listener) => listener());
}

export function subscribeStorage(listener: () => void): () => void {
  listeners.add(listener);
  if (!isBrowser()) {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === PROFILE_KEY ||
      event.key === PROGRESS_KEY ||
      event.key === null
    ) {
      emitStorageChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getUserProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (raw === cachedProfileRaw) {
      return cachedProfile;
    }
    cachedProfileRaw = raw;
    if (!raw) {
      cachedProfile = null;
      return null;
    }
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed || !parsed.stage || !parsed.targetRole) {
      cachedProfile = null;
      return null;
    }
    cachedProfile = parsed;
    return cachedProfile;
  } catch {
    cachedProfile = null;
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    emitStorageChange();
  } catch {
    // Ignore storage errors gracefully
  }
}

export function getAllLessonProgress(): Record<LessonId, LessonProgress> {
  if (!isBrowser()) {
    return SERVER_PROGRESS_SNAPSHOT;
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (raw === cachedProgressRaw) {
      return cachedProgress;
    }
    cachedProgressRaw = raw;
    if (!raw) {
      cachedProgress = SERVER_PROGRESS_SNAPSHOT;
      return cachedProgress;
    }
    const parsed = JSON.parse(raw) as Partial<Record<LessonId, LessonProgress>>;
    cachedProgress = {
      'leccion-1': {
        ...SERVER_PROGRESS_SNAPSHOT['leccion-1'],
        ...(parsed['leccion-1'] ?? {}),
        lessonId: 'leccion-1',
      },
      'leccion-2': {
        ...SERVER_PROGRESS_SNAPSHOT['leccion-2'],
        ...(parsed['leccion-2'] ?? {}),
        lessonId: 'leccion-2',
      },
    };
    return cachedProgress;
  } catch {
    cachedProgress = SERVER_PROGRESS_SNAPSHOT;
    return cachedProgress;
  }
}

export function getLessonProgress(lessonId: LessonId): LessonProgress {
  return getAllLessonProgress()[lessonId];
}

export function saveLessonProgress(
  lessonId: LessonId,
  update: Partial<LessonProgress>
): LessonProgress {
  const all = getAllLessonProgress();
  const next: LessonProgress = {
    ...all[lessonId],
    ...update,
    lessonId,
  };
  const updatedMap: Record<LessonId, LessonProgress> = {
    ...all,
    [lessonId]: next,
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedMap));
      emitStorageChange();
    } catch {
      // Ignore storage errors gracefully
    }
  }
  return next;
}

const noopSubscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function useUserProfile(): UserProfile | null {
  return useSyncExternalStore(
    subscribeStorage,
    getUserProfile,
    () => null
  );
}

export function useAllLessonProgress(): Record<LessonId, LessonProgress> {
  return useSyncExternalStore(
    subscribeStorage,
    getAllLessonProgress,
    () => SERVER_PROGRESS_SNAPSHOT
  );
}

export function getDisplayName(profile: UserProfile | null): string {
  const name = profile?.nickname?.trim();
  return name && name.length > 0 ? name : 'Participante';
}

export function getDisplayRole(profile: UserProfile | null): string {
  if (!profile) return 'Atención al cliente';
  if (profile.targetRole === 'Otro') {
    const custom = profile.customRole?.trim();
    return custom && custom.length > 0 ? custom : 'el puesto que buscas';
  }
  return profile.targetRole;
}
