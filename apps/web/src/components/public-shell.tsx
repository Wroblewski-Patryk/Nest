import Link from "next/link";
import type { ReactNode } from "react";

type PublicShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  copy?: {
    brand?: string;
    kicker?: string;
    welcome?: string;
    signIn?: string;
    register?: string;
    footerRuntime?: string;
  };
};

export function PublicShell({ title, subtitle, children, copy }: PublicShellProps) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link href="/" className="public-brand">
          {copy?.brand ?? "Nest"}
        </Link>
        <nav className="public-nav" aria-label="Public navigation">
          <Link href="/" className="public-link">
            {copy?.welcome ?? "Welcome"}
          </Link>
          <Link href="/auth?mode=login" className="public-link">
            {copy?.signIn ?? "Sign In"}
          </Link>
          <Link href="/auth?mode=register" className="public-link">
            {copy?.register ?? "Register"}
          </Link>
        </nav>
      </header>

      <main className="public-main">
        <section className="public-hero">
          <p className="public-kicker">{copy?.kicker ?? "Life management in one calm place"}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>
        <section className="public-content">{children}</section>
      </main>

      <footer className="public-footer">
        <p>{copy?.footerRuntime ?? "Web app: http://localhost:9001 | API: http://localhost:9000"}</p>
      </footer>
    </div>
  );
}
