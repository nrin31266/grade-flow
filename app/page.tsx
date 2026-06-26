"use client";

import { useSyncExternalStore } from "react";

import { LandingHero } from "@/components/landing/LandingHero";
import { AppShell } from "@/components/layout/AppShell";
import { getUserProfile } from "@/lib/profile-storage";

function subscribeToStorage(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getHasProfileSnapshot(): boolean {
  try {
    return getUserProfile() !== null;
  } catch {
    return false;
  }
}

function getHasProfileServerSnapshot(): boolean {
  return false;
}

export default function HomePage() {
  const hasProfile = useSyncExternalStore(
    subscribeToStorage,
    getHasProfileSnapshot,
    getHasProfileServerSnapshot,
  );

  return (
    <AppShell>
      <LandingHero hasProfile={hasProfile} />
    </AppShell>
  );
}