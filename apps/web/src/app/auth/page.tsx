"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { PreAuthLanguageSelector } from "@/components/pre-auth-language-selector";
import { nestApiClient } from "@/lib/api-client";
import { clearAuthSession, getAuthToken, setAuthSession } from "@/lib/auth-session";

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

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState("Sign in to access your private dashboard.");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    let mounted = true;
    const requestFn = nestApiClient.request as unknown as <
      TResponse = unknown,
      TBody extends Record<string, unknown> = Record<string, unknown>,
      TQuery extends Record<string, unknown> = Record<string, unknown>,
    >(
      path: string,
      init?: {
        method?: string;
        body?: TBody;
        query?: TQuery;
      }
    ) => Promise<TResponse>;

    void requestFn<{ data: AuthUser }>("/auth/me")
      .then((response) => {
        if (!mounted) {
          return;
        }

        setAuthSession(token, response.data.onboarding_required);
        router.replace(response.data.onboarding_required ? "/onboarding" : "/");
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
      const requestFn = nestApiClient.request as unknown as (
        path: string,
        init?: { method?: string; body?: Record<string, unknown> }
      ) => Promise<AuthResponse>;

      const response = await requestFn("/auth/login", {
        method: "POST",
        body: {
          email: loginEmail.trim(),
          password: loginPassword,
        },
      });

      setAuthSession(response.data.token, response.data.user.onboarding_required);
      setFeedback("Signed in. Redirecting...");
      router.replace(response.data.user.onboarding_required ? "/onboarding" : "/");
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? String((error as { status: number }).status)
          : "n/a";
      setErrorMessage(`Login failed (HTTP ${status}).`);
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
      setErrorMessage("Password confirmation does not match.");
      setIsBusy(false);
      return;
    }

    try {
      const requestFn = nestApiClient.request as unknown as (
        path: string,
        init?: { method?: string; body?: Record<string, unknown> }
      ) => Promise<AuthResponse>;

      const response = await requestFn("/auth/register", {
        method: "POST",
        body: {
          name: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          password_confirmation: registerPasswordConfirm,
        },
      });

      setAuthSession(response.data.token, response.data.user.onboarding_required);
      setFeedback("Account created. Redirecting to onboarding...");
      router.replace(response.data.user.onboarding_required ? "/onboarding" : "/");
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? String((error as { status: number }).status)
          : "n/a";
      setErrorMessage(`Registration failed (HTTP ${status}).`);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <WorkspaceShell
      title="Welcome to Nest"
      subtitle="Sign in to your private workspace or create a new account."
      module="tasks"
    >
      <div className="stack">
        <MetricCard label="Access policy" value="Auth required" />
        <MetricCard label="Public pages" value="/auth only" />
        <MetricCard label="Onboarding gate" value="Enabled" />
      </div>

      <Panel title="Language">
        <PreAuthLanguageSelector />
      </Panel>

      <Panel
        title={mode === "login" ? "Sign In" : "Create Account"}
        actions={
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
            disabled={isBusy}
          >
            {mode === "login" ? "Switch to Register" : "Switch to Login"}
          </button>
        }
      >
        {mode === "login" ? (
          <form className="form-grid" onSubmit={handleLogin}>
            <label className="field">
              <span>Email</span>
              <input
                className="list-row"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="list-row"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={isBusy}>
              {isBusy ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegister}>
            <label className="field">
              <span>Name</span>
              <input
                className="list-row"
                type="text"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                className="list-row"
                type="email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
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
              <span>Confirm password</span>
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
              {isBusy ? "Creating..." : "Create account"}
            </button>
          </form>
        )}
      </Panel>

      {feedback ? (
        <Panel title="Status">
          <p className="callout">{feedback}</p>
        </Panel>
      ) : null}
      {errorMessage ? (
        <Panel title="Error">
          <p className="callout state-error">{errorMessage}</p>
        </Panel>
      ) : null}
    </WorkspaceShell>
  );
}
