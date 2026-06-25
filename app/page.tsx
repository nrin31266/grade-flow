"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LandingHero } from "@/components/landing/LandingHero";
import { AppShell } from "@/components/layout/AppShell";
import { getUserProfile } from "@/lib/profile-storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const profile = getUserProfile();

    if (profile) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <AppShell>
      <LandingHero />
    </AppShell>
  );
}