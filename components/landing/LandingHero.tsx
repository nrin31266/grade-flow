import Link from "next/link";

import { Button } from "@/components/ui/button";

const highlights = [
  "Theo dõi điểm trung bình",
  "Lập kế hoạch tốt nghiệp",
  "Hỗ trợ nhiều quy đổi GPA",
];

export function LandingHero() {
  return (
    <section className="flex min-h-[calc(100vh-9rem)] items-center py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="mb-4 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          Quản lý hành trình học tập rõ ràng hơn
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          GradeFlow
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Theo dõi GPA, tín chỉ và lập kế hoạch học tập dễ dàng hơn.
        </p>

        <Button asChild size="lg" className="mt-8">
          <Link href="/onboarding">Bắt đầu</Link>
        </Button>

        <div className="mt-10 grid w-full gap-3 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-xl border bg-card px-4 py-5 text-sm font-medium text-card-foreground shadow-sm"
            >
              {highlight}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}