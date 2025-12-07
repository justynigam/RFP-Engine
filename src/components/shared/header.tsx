import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base font-headline"
        >
          <span className="sr-only">RFP Response Engine</span>
          RFP Engine
        </Link>
        <Link
          href="/dashboard"
          className="text-foreground transition-colors hover:text-foreground font-medium"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/repository"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Repository
        </Link>
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Future search bar could go here */}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
