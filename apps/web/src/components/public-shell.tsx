import Link from "next/link";
import type { ReactNode } from "react";

type PublicShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function PublicShell({ title, subtitle, children }: PublicShellProps) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link href="/" className="public-brand">
          Nest LifeOS
        </Link>
        <nav className="public-nav" aria-label="Public navigation">
          <Link href="/" className="public-link">
            Welcome
          </Link>
          <Link href="/auth?mode=login" className="public-link">
            Sign In
          </Link>
          <Link href="/auth?mode=register" className="public-link">
            Register
          </Link>
        </nav>
      </header>

      <main className="public-main">
        <section className="public-hero">
          <p className="public-kicker">Life management in one calm place</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>
        <section className="public-content">{children}</section>
      </main>

      <footer className="public-footer">
        <p>Web app: `http://localhost:9001` | API: `http://localhost:9000`</p>
      </footer>
    </div>
  );
}
