import Link from "next/link";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-white to-white text-foreground dark:from-sky-950/10 dark:via-background dark:to-background">
      <header className="border-b border-sky-100/50 bg-white/70 backdrop-blur-sm dark:border-sky-900/30 dark:bg-background/70">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold tracking-tight text-sky-900 dark:text-sky-100">
            GradeFlow
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}