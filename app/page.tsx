import { LandingHero } from "@/components/landing/LandingHero";
import { AppShell } from "@/components/layout/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <LandingHero hasProfile={false} />
    </AppShell>
  );
}