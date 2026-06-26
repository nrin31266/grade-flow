"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

const navigationItems = [
  { label: "Bảng điều khiển", href: "/dashboard" },
  { label: "Bảng điểm", href: "/transcript" },
  { label: "Kế hoạch học tập", href: "/program" },
];

export function DashboardShell({
  children,
  title,
  description,
  actions,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-background md:flex md:flex-col">
        <div className="flex h-16 flex-col justify-center border-b px-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            GradeFlow
          </Link>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Academic Workspace
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname === item.href && "bg-muted text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Dữ liệu lưu trên trình duyệt</p>
          <p className="mt-1 leading-5">
            Local-first workspace
          </p>
        </div>
      </aside>

      <div className="min-h-screen md:pl-60">
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
          <div className="flex min-h-14 w-full flex-col gap-2 px-3 py-2.5 sm:px-5 lg:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Link
                href="/"
                className="text-base font-semibold tracking-tight md:hidden"
              >
                GradeFlow
              </Link>
              <p className="text-sm font-medium text-foreground md:text-base">
                {title}
              </p>
              {description ? (
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div>
            ) : null}
          </div>
        </header>

        <main className="w-full px-3 py-4 sm:px-5 lg:px-6">
          <div className="mx-auto grid w-full max-w-[1600px] gap-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
