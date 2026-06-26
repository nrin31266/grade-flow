"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LandingHero } from "@/components/landing/LandingHero";
import { AppShell } from "@/components/layout/AppShell";
import { getUserProfile } from "@/lib/profile-storage";

export default function HomePage() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    try {
      setHasProfile(getUserProfile() !== null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (hasProfile) {
      router.replace("/dashboard");
    }
  }, [hasProfile, router]);

  return (
    <AppShell>
      <LandingHero hasProfile={hasProfile} />
    </AppShell>
  );
}