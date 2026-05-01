"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveLanguage, translate } from "@nest/shared-types";
import { PublicShell } from "@/components/public-shell";
import { PreAuthLanguageSelector } from "@/components/pre-auth-language-selector";
import { apiRequest } from "@/lib/api-client";
import { clearAuthSession, getAuthToken, setAuthSession } from "@/lib/auth-session";
import { getStoredUiLanguage } from "@/lib/ui-language";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  onboarding_required: boolean;
};

type AuthResponse = {
  data: {
    token: string;
    user: AuthUser;
  };
};

function detectMode(rawValue: string | null): "login" | "register" {
  return rawValue === "register" ? "register" : "login";
}

function resolvePostAuthPath(onboardingRequired: boolean): "/dashboard" | "/onboarding" {
  return onboardingRequired ? "/onboarding" : "/dashboard";
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [language, setLanguage] = useState<"en" | "pl">(resolveLanguage("en"));
  const [feedback, setFeedback] = useState(translate("auth.feedback.default", "en"));

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    setMode(detectMode(searchParams.get("mode")));
    const storedLanguage = getStoredUiLanguage();
    if (storedLanguage) {
      setLanguage(storedLanguage);
      setFeedback(translate("auth.feedback.default", storedLanguage));
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    let mounted = true;
    void apiRequest<{ data: AuthUser }>("/auth/me")
      .then((response) => {
        if (!mounted) {
          return;
        }

        setAuthSession(token, response.data.onboarding_required);
        router.replace(resolvePostAuthPath(response.data.onboarding_required));
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        clearAuthSession();
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setErrorMessage("");
    setFeedback("");

    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: {
          email: loginEmail.trim(),
          password: loginPassword,
        },
      });

      setAuthSession(response.data.token, response.data.user.onboarding_required);
      setFeedback(translate("auth.feedback.signed_in", language));
      router.replace(resolvePostAuthPath(response.data.user.onboarding_required));
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? (error as { status: number }).status
          : null;
      setErrorMessage(
        status === 422
          ? translate("auth.error.login_invalid", language)
          : translate("auth.error.login_generic", language)
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setErrorMessage("");
    setFeedback("");

    if (registerPassword !== registerPasswordConfirm) {
      setErrorMessage(translate("auth.error.password_mismatch", language));
      setIsBusy(false);
      return;
    }

    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          name: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          password_confirmation: registerPasswordConfirm,
        },
      });

      setAuthSession(response.data.token, response.data.user.onboarding_required);
      setFeedback(translate("auth.feedback.created", language));
      router.replace(resolvePostAuthPath(response.data.user.onboarding_required));
    } catch {
      setErrorMessage(translate("auth.error.register_generic", language));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <PublicShell
      title={translate(mode === "login" ? "auth.title.login" : "auth.title.register", language)}
      subtitle={translate("auth.subtitle", language)}
      copy={{
        kicker: translate("public.kicker", language),
        welcome: translate("public.nav.welcome", language),
        signIn: translate("public.nav.sign_in", language),
        register: translate("public.nav.register", language),
        footerRuntime: translate("public.footer.runtime", language),
      }}
    >
      <section className="panel">
        <div className="panel-header">
          <h2>{translate("auth.section.language", language)}</h2>
        </div>
        <PreAuthLanguageSelector
          language={language}
          onLanguageChange={(nextLanguage) => {
            setLanguage(nextLanguage);
            setFeedback(translate("auth.feedback.default", nextLanguage));
          }}
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>{translate("auth.section.account", language)}</h2>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
            disabled={isBusy}
          >
            {translate(
              mode === "login" ? "auth.switch_to_register" : "auth.switch_to_login",
              language
            )}
          </button>
        </div>

        {mode === "login" ? (
          <form className="form-grid" onSubmit={handleLogin}>
            <label className="field">
              <span>{translate("auth.field.email", language)}</span>
              <input
                className="list-row"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{translate("auth.field.password", language)}</span>
              <input
                className="list-row"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={isBusy}>
              {isBusy
                ? translate("auth.action.signing_in", language)
                : translate("auth.action.sign_in", language)}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegister}>
            <label className="field">
              <span>{translate("auth.field.name", language)}</span>
              <input
                className="list-row"
                type="text"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{translate("auth.field.email", language)}</span>
              <input
                className="list-row"
                type="email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{translate("auth.field.password", language)}</span>
              <input
                className="list-row"
                type="password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            <label className="field">
              <span>{translate("auth.field.password_confirm", language)}</span>
              <input
                className="list-row"
                type="password"
                value={registerPasswordConfirm}
                onChange={(event) => setRegisterPasswordConfirm(event.target.value)}
                minLength={8}
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={isBusy}>
              {isBusy
                ? translate("auth.action.creating_account", language)
                : translate("auth.action.create_account", language)}
            </button>
          </form>
        )}
      </section>

      {feedback ? (
        <section className="panel">
          <div className="panel-header">
            <h2>{translate("auth.section.status", language)}</h2>
          </div>
          <p className="callout">{feedback}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="panel">
          <div className="panel-header">
            <h2>{translate("auth.section.error", language)}</h2>
          </div>
          <p className="callout state-error">{errorMessage}</p>
        </section>
      ) : null}
    </PublicShell>
  );
}
