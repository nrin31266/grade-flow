import Link from "next/link";

import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

const navigationItems = [
  { label: "Bảng điều khiển", href: "#overview", active: true },
  { label: "Bảng điểm thật", href: "#transcript", active: false },
  { label: "Chương trình học", href: "#program", active: false },
  { label: "Import dữ liệu", href: "#program", active: false },
  { label: "Cấu hình", href: "#settings", active: false },
];

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background md:flex md:flex-col">
        <div className="flex h-20 flex-col justify-center border-b px-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            GradeFlow
          </Link>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Academic Workspace
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                item.active && "bg-muted text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Dữ liệu lưu trên trình duyệt</p>
          <p className="mt-1 leading-5">
            GradeFlow chưa gửi hồ sơ, chương trình học hoặc bảng điểm lên máy
            chủ.
          </p>
        </div>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-sm">
          <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <Link
                href="/"
                className="text-base font-semibold tracking-tight md:hidden"
              >
                GradeFlow
              </Link>
              <p className="hidden text-sm font-medium text-foreground md:block">
                Bảng điều khiển
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Không gian quản lý chương trình học
              </p>
            </div>
          </div>
        </header>

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-[1600px] gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
