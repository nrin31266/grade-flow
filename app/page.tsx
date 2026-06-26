"use client";

import { useState } from "react";

import { LandingHero } from "@/components/landing/LandingHero";
import { AppShell } from "@/components/layout/AppShell";
import { getUserProfile } from "@/lib/profile-storage";

function getStoredProfile(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return getUserProfile() !== null;
  } catch {
    return false;
  }
}

export default function HomePage() {
  const [hasProfile] = useState(getStoredProfile);

  return (
    <AppShell>
      <LandingHero hasProfile={hasProfile} />
    </AppShell>
  );
}