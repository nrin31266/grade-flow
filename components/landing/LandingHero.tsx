import Link from "next/link";
import { GraduationCap, BarChart3, Target, ShieldCheck, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type LandingHeroProps = {
  hasProfile: boolean;
};

const features = [
  {
    icon: GraduationCap,
    title: "Theo dõi bảng điểm thật",
    description:
      "Nhập hoặc import bảng điểm theo từng học kỳ để xem GPA kỳ và GPA hiệu lực.",
  },
  {
    icon: BarChart3,
    title: "Tính GPA theo cấu hình trường",
    description:
      "Hỗ trợ thang điểm, tín chỉ tốt nghiệp và chính sách học lại/cải thiện.",
  },
  {
    icon: Target,
    title: "Lập mục tiêu GPA",
    description:
      "Ước tính điểm trung bình cần đạt ở các tín chỉ còn lại để chạm mục tiêu.",
  },
  {
    icon: ShieldCheck,
    title: "Không cần tài khoản",
    description:
      "Dữ liệu lưu trên trình duyệt. Không gửi bảng điểm lên máy chủ.",
  },
];

const steps = [
  {
    num: "1",
    title: "Chọn trường và nhập tín chỉ tốt nghiệp",
  },
  {
    num: "2",
    title: "Import chương trình học hoặc bảng điểm",
  },
  {
    num: "3",
    title: "Theo dõi GPA, biểu đồ và mục tiêu",
  },
];

export function LandingHero({ hasProfile }: LandingHeroProps) {
  return (
    <div className="space-y-20 pb-16">
      {/* ─── Hero ─── */}
      {/* ─── Hero ─── */}
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300">
          Local-first GPA workspace
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-sky-950 sm:text-5xl dark:text-sky-50">
          Quản lý GPA và tiến độ học tập rõ ràng hơn
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Nhập bảng điểm, theo dõi tín chỉ, kiểm tra GPA và đặt mục tiêu tốt
          nghiệp — tất cả trong một workspace gọn nhẹ.
        </p>
        <div className="mt-7 flex justify-center">
          <Button asChild size="lg" className="bg-sky-600 px-8 text-base hover:bg-sky-700">
            <Link href={hasProfile ? "/dashboard" : "/onboarding"}>
              {hasProfile ? "Mở bảng điều khiển" : "Bắt đầu"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="scroll-mt-16">
        <h2 className="text-center text-2xl font-bold text-sky-950 dark:text-sky-50">
          GradeFlow giúp gì cho bạn?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-sky-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-sky-900/50 dark:bg-slate-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Steps ─── */}
      <section>
        <h2 className="text-center text-2xl font-bold text-sky-950 dark:text-sky-50">
          Bắt đầu trong vài phút
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-4 rounded-xl border border-sky-100 bg-white p-5 shadow-sm dark:border-sky-900/50 dark:bg-slate-900"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                {step.num}
              </span>
              <p className="pt-1 text-sm font-medium">{step.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Privacy ─── */}
      <section className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-6 shadow-sm dark:border-sky-900/50 dark:from-sky-950/20 dark:to-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-sky-950 dark:text-sky-50">
              Dữ liệu học tập nằm trên máy của bạn
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              GradeFlow phiên bản hiện tại không có đăng nhập, không có backend
              và không gửi bảng điểm của bạn lên máy chủ. Dữ liệu được lưu trong
              trình duyệt bằng localStorage.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                Local-first
              </span>
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
                Không cần tài khoản
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                Dữ liệu lưu trên trình duyệt
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA cuối ─── */}
      <section className="text-center">
        <p className="text-sm text-muted-foreground">
          GradeFlow &middot; Local-first academic workspace
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Dữ liệu lưu trên trình duyệt của bạn
        </p>
      </section>
    </div>
  );
}
