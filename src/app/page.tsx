'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboardingComplete } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check onboarding status and redirect
    const complete = isOnboardingComplete();
    
    if (complete) {
      router.replace('/pet');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <main className="min-h-screen min-h-dvh bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-purple-300/50 animate-ping absolute inset-0" />
        <div className="w-12 h-12 rounded-full bg-purple-400 animate-pulse" />
      </div>
    </main>
  );
}
