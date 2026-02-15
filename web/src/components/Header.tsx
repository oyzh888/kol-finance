import Link from "next/link";

export function Header({ currentAsset }: { currentAsset?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-red-500">
            <span className="text-sm font-bold text-white">K</span>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            KOL<span className="text-muted">Finance</span>
          </span>
        </Link>

        {/* Center - Asset (hidden on small mobile) */}
        {currentAsset && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm font-medium text-foreground">
              {currentAsset}
            </span>
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
              High Volatility
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="min-h-[44px] flex items-center text-sm text-muted transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className="min-h-[44px] flex items-center text-sm text-muted transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
