'use client';

import { HubView } from '@/components/HubView';
import { OnboardingView } from '@/components/OnboardingView';
import { TopNavbar } from '@/components/TopNavbar';
import {
  saveUserProfile,
  useAllLessonProgress,
  useIsClient,
  useUserProfile,
} from '@/lib/storage';
import { UserProfile } from '@/types';

export default function HomePage() {
  const isClient = useIsClient();
  const profile = useUserProfile();
  const progressMap = useAllLessonProgress();

  function handleSaveProfile(nextProfile: UserProfile) {
    saveUserProfile(nextProfile);
  }

  if (!isClient) {
    return (
      <div className="min-h-dvh bg-[#FFFFFF] flex flex-col">
        <TopNavbar mode="onboarding" />
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
          <div className="mx-auto max-w-xl lg:max-w-none space-y-4 animate-pulse">
            <div className="h-9 w-3/4 max-w-md rounded-2xl bg-[#F0FAF5]" />
            <div className="h-5 w-full max-w-lg rounded-xl bg-[#F0FAF5]" />
            <div className="mt-6 h-80 w-full rounded-3xl bg-[#F0FAF5]" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return <OnboardingView onComplete={handleSaveProfile} />;
  }

  return (
    <HubView
      profile={profile}
      progressMap={progressMap}
      onUpdateProfile={handleSaveProfile}
    />
  );
}
