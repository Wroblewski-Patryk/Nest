import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function WelcomePage() {
  return (
    <PublicShell
      title="Organize life calmly, one clear dashboard."
      subtitle="Nest pomaga zarzadzac zadaniami, listami, nawykami, rutynami, celami i kalendarzem w jednym miejscu."
    >
      <section className="panel">
        <div className="panel-header">
          <h2>Start</h2>
        </div>
        <div className="panel-content">
          <p className="callout">
            Wejdz do modulu auth i zaloguj sie, aby przejsc do prywatnego panelu pod
            {" "}
            <strong>/dashboard</strong>.
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
              <strong>Dashboard dnia</strong>
              <p>Podglad dzisiejszych zadan i najblizszych eventow.</p>
            </div>
          </li>
          <li className="list-row">
            <div>
              <strong>Pelne moduly zycia</strong>
              <p>Tasks/Lists, Habits, Routines, Goals, Targets, Calendar, Journal, Insights.</p>
            </div>
          </li>
          <li className="list-row">
            <div>
              <strong>Przygotowanie pod AI</strong>
              <p>Delegowane access tokeny i surface pod wspolprace Human + AI.</p>
            </div>
          </li>
        </ul>
      </section>
    </PublicShell>
  );
}
