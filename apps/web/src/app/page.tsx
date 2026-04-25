import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function WelcomePage() {
  return (
    <PublicShell
      title="Organize life calmly, one clear dashboard."
      subtitle="Nest helps you manage tasks, habits, routines, goals, journal notes, and calendar plans in one place."
    >
      <section className="panel">
        <div className="panel-header">
          <h2>Get Started</h2>
        </div>
        <div className="panel-content">
          <p className="callout">
            Sign in or create an account to unlock your private workspace at <strong>/dashboard</strong>.
          </p>
          <div className="row-inline">
            <Link href="/auth?mode=login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/auth?mode=register" className="btn-secondary">
              Register
            </Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>What You Get</h2>
        </div>
        <ul className="list">
          <li className="list-row">
            <div>
              <strong>Daily dashboard</strong>
              <p>A calm overview of today&apos;s tasks, habits, and upcoming events.</p>
            </div>
          </li>
          <li className="list-row">
            <div>
              <strong>Core life modules</strong>
              <p>Planning, habits, routines, calendar, journal, life areas, and settings in one system.</p>
            </div>
          </li>
          <li className="list-row">
            <div>
              <strong>Founder-first product focus</strong>
              <p>Start with a dependable daily operating system, then grow into advanced capabilities later.</p>
            </div>
          </li>
        </ul>
      </section>
    </PublicShell>
  );
}
