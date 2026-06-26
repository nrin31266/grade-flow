"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

const navigationItems = [
  { label: "Bảng điều khiển", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bảng điểm", href: "/transcript", icon: FileText },
  { label: "Kế hoạch học tập", href: "/program", icon: BookOpen },
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
      {/* Desktop sidebar */}
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
                "flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname === item.href && "bg-muted text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Dữ liệu lưu trên trình duyệt</p>
          <p className="mt-1 leading-5">Local-first workspace</p>
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

        <main className="w-full px-3 py-4 pb-20 sm:px-5 lg:px-6 md:pb-4">
          <div className="mx-auto grid w-full max-w-[1600px] gap-4">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
                pathname === item.href && "text-sky-600",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
