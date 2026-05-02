"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatLocalizedDateTime } from "@nest/shared-types";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
import { apiRequest, nestApiClient } from "@/lib/api-client";
import { clearAuthSession } from "@/lib/auth-session";
import { setStoredUiLanguage, useTranslator, useUiLanguage } from "@/lib/ui-language";

type SettingsTab = "profile" | "application" | "access" | "subscription";
type ProfileLanguage = "en" | "pl";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  timezone?: string | null;
  language?: ProfileLanguage;
  locale?: string | null;
  onboarding_required?: boolean;
  settings?: Record<string, unknown>;
};

type DelegatedCredential = {
  id: string;
  name: string;
  scopes: string[];
  status: "active" | "expired" | "revoked";
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string | null;
};

type AiAgent = {
  id: string;
  name: string;
  email: string;
  agent_status: "active" | "revoked";
  created_at: string | null;
  last_used_at: string | null;
};

type AccessAudit = {
  id: string;
  user_id: string;
  principal_type: "human_user" | "ai_agent";
  token_mode: "delegated" | "ai_agent" | null;
  route: string;
  method: string;
  reason: string;
  required_scope: string | null;
  occurred_at: string | null;
};

type AgentCredentialDraft = {
  name: string;
  scopes: string[];
  expiresAtLocal: string;
};

const FALLBACK_SCOPES = ["tasks:read", "tasks:write", "lists:read", "lists:write"];

function detectSettingsTab(value: string | null): SettingsTab {
  if (value === "access") {
    return "access";
  }

  if (value === "application" || value === "app") {
    return "application";
  }

  if (value === "subscription" || value === "billing") {
    return "subscription";
  }

  return "profile";
}

function getErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "payload" in error &&
    typeof (error as { payload?: unknown }).payload === "object" &&
    (error as { payload: { message?: unknown } }).payload?.message &&
    typeof (error as { payload: { message: unknown } }).payload.message === "string"
  ) {
    return (error as { payload: { message: string } }).payload.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function toIsoDateTime(localDateTimeValue: string): string | undefined {
  if (!localDateTimeValue) {
    return undefined;
  }

  const iso = new Date(localDateTimeValue).toISOString();
  return Number.isNaN(Date.parse(iso)) ? undefined : iso;
}

function formatDateTime(value: string | null, language: ProfileLanguage): string {
  if (!value) {
    return "n/a";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatLocalizedDateTime(date, language);
}

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslator();
  const uiLanguage = useUiLanguage();
  const { confirm, confirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [profileName, setProfileName] = useState("");
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>("en");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [scopeOptions, setScopeOptions] = useState<string[]>(FALLBACK_SCOPES);
  const [delegatedCredentials, setDelegatedCredentials] = useState<DelegatedCredential[]>([]);
  const [aiAgents, setAiAgents] = useState<AiAgent[]>([]);
  const [aiAgentCredentials, setAiAgentCredentials] = useState<Record<string, DelegatedCredential[]>>({});
  const [accessAudits, setAccessAudits] = useState<AccessAudit[]>([]);

  const [delegatedName, setDelegatedName] = useState("Telegram Delegated Agent");
  const [delegatedScopes, setDelegatedScopes] = useState<string[]>(["tasks:read"]);
  const [delegatedExpiresAtLocal, setDelegatedExpiresAtLocal] = useState("");
  const [latestDelegatedToken, setLatestDelegatedToken] = useState("");

  const [newAgentName, setNewAgentName] = useState("Life Copilot");
  const [agentCredentialDrafts, setAgentCredentialDrafts] = useState<Record<string, AgentCredentialDraft>>({});
  const [latestAgentToken, setLatestAgentToken] = useState<{ agentName: string; token: string } | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    setUser(null);
    router.replace("/auth");
  }, [router]);

  const selectTab = useCallback((tab: SettingsTab) => {
    setActiveTab(tab);

    if (typeof window === "undefined") {
      return;
    }

    const current = new URL(window.location.href);
    if (tab === "profile") {
      current.searchParams.delete("tab");
    } else {
      current.searchParams.set("tab", tab);
    }

    const nextPath = `${current.pathname}${current.search}${current.hash}`;
    window.history.replaceState({}, "", nextPath);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const query = new URLSearchParams(window.location.search);
    setActiveTab(detectSettingsTab(query.get("tab")));
  }, []);

  const ensureAgentDrafts = useCallback((agents: AiAgent[], scopes: string[]) => {
    setAgentCredentialDrafts((current) => {
      const next: Record<string, AgentCredentialDraft> = { ...current };
      for (const agent of agents) {
        if (!next[agent.id]) {
          next[agent.id] = {
            name: `${agent.name} Runtime`,
            scopes: scopes.length > 0 ? [scopes[0]] : ["tasks:read"],
            expiresAtLocal: "",
          };
        }
      }
      return next;
    });
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage("");

    try {
      const [delegatedResponse, agentsResponse, auditsResponse] = await Promise.all([
        nestApiClient.getDelegatedCredentials(),
        nestApiClient.getAiAgents(),
        nestApiClient.getAccessAudits({ per_page: 50 }),
      ]);

      const availableScopes = delegatedResponse.meta?.available_scopes ?? FALLBACK_SCOPES;
      const agents = agentsResponse.data ?? [];

      setScopeOptions(availableScopes.length > 0 ? availableScopes : FALLBACK_SCOPES);
      setDelegatedCredentials((delegatedResponse.data ?? []) as DelegatedCredential[]);
      setAiAgents(agents as AiAgent[]);
      setAccessAudits((auditsResponse.data ?? []) as AccessAudit[]);

      const credentialPairs = await Promise.all(
        agents.map(async (agent) => {
          const response = await nestApiClient.getAiAgentCredentials(agent.id);
          return [agent.id, (response.data ?? []) as DelegatedCredential[]] as const;
        })
      );

      setAiAgentCredentials(Object.fromEntries(credentialPairs));
      ensureAgentDrafts(agents as AiAgent[], availableScopes);
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }, [ensureAgentDrafts, handleUnauthorized]);

  const bootstrapSession = useCallback(async () => {
    try {
      const meResponse = await apiRequest<{ data: AuthUser }>("/auth/me");
      const me = meResponse.data;
      setUser(me);
      setProfileName(me.name ?? "");
      setProfileLanguage(me.language === "pl" ? "pl" : "en");
      await refreshData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsBootstrapping(false);
    }
  }, [handleUnauthorized, refreshData]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  function toggleScope(current: string[], scope: string): string[] {
    if (current.includes(scope)) {
      return current.filter((item) => item !== scope);
    }

    return [...current, scope];
  }

  function updateAgentDraft(agentId: string, updater: (draft: AgentCredentialDraft) => AgentCredentialDraft) {
    setAgentCredentialDrafts((current) => ({
      ...current,
      [agentId]: updater(
        current[agentId] ?? {
          name: "AI Agent Runtime",
          scopes: scopeOptions.length > 0 ? [scopeOptions[0]] : ["tasks:read"],
          expiresAtLocal: "",
        }
      ),
    }));
  }

  async function persistUserSettings(successMessage: string) {
    if (!profileName.trim()) {
      setErrorMessage(t("web.settings.validation.display_name_required", "Display name is required."));
      return;
    }

    setIsSavingProfile(true);
    setErrorMessage("");
    setFeedback("");

    try {
      const normalizedLanguage = profileLanguage === "pl" ? "pl" : "en";
      const response = await apiRequest<{ data: AuthUser }>("/auth/settings", {
        method: "PATCH",
        body: {
          name: profileName.trim(),
          language: normalizedLanguage,
          locale: normalizedLanguage === "pl" ? "pl-PL" : "en-US",
        },
      });

      setUser(response.data);
      setProfileName(response.data.name ?? profileName.trim());
      const resolvedLanguage = response.data.language === "pl" ? "pl" : normalizedLanguage;
      setProfileLanguage(resolvedLanguage);
      setStoredUiLanguage(resolvedLanguage);
      setFeedback(successMessage);
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function saveProfilePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistUserSettings(t("web.settings.feedback.profile_updated", "Profile updated."));
  }

  async function saveApplicationPreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistUserSettings(t("web.settings.feedback.application_updated", "Application preferences updated."));
  }

  async function createDelegatedCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!delegatedName.trim()) {
      setErrorMessage(t("web.settings.validation.credential_name_required", "Credential name is required."));
      return;
    }
    if (delegatedScopes.length === 0) {
      setErrorMessage(t("web.settings.validation.scope_required", "Select at least one scope."));
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      const response = await nestApiClient.createDelegatedCredential({
        name: delegatedName.trim(),
        scopes: delegatedScopes,
        ...(toIsoDateTime(delegatedExpiresAtLocal) ? { expires_at: toIsoDateTime(delegatedExpiresAtLocal) } : {}),
      });

      setLatestDelegatedToken(response.data.plain_text_token);
      setFeedback(t("web.settings.feedback.delegated_issued", "Delegated credential issued."));
      await refreshData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function revokeDelegatedCredential(credentialId: string) {
    if (
      !(await confirm({
        title: t("web.settings.confirm.revoke_delegated_title", "Revoke delegated credential?"),
        description: t("web.settings.confirm.revoke_delegated_body", "This immediately disables the credential for external access. Existing integrations using it will stop working."),
        confirmLabel: t("web.settings.action.revoke_credential", "Revoke credential"),
        tone: "danger",
      }))
    ) {
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.revokeDelegatedCredential(credentialId);
      setFeedback(t("web.settings.feedback.delegated_revoked", "Delegated credential revoked."));
      await refreshData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function createAiAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newAgentName.trim()) {
      setErrorMessage(t("web.settings.validation.agent_name_required", "Agent name is required."));
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.createAiAgent({ name: newAgentName.trim() });
      setNewAgentName("");
      setFeedback(t("web.settings.feedback.agent_created", "AI agent created."));
      await refreshData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function issueAiAgentCredential(agent: AiAgent) {
    const draft = agentCredentialDrafts[agent.id];
    if (!draft || !draft.name.trim()) {
      setErrorMessage(t("web.settings.validation.credential_name_required", "Credential name is required."));
      return;
    }
    if (draft.scopes.length === 0) {
      setErrorMessage(t("web.settings.validation.agent_scope_required", "Select at least one scope for agent credential."));
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      const response = await nestApiClient.createAiAgentCredential(agent.id, {
        name: draft.name.trim(),
        scopes: draft.scopes,
        ...(toIsoDateTime(draft.expiresAtLocal) ? { expires_at: toIsoDateTime(draft.expiresAtLocal) } : {}),
      });
      setLatestAgentToken({
        agentName: agent.name,
        token: response.data.plain_text_token,
      });
      setFeedback(t("web.settings.feedback.agent_credential_issued", "AI agent credential issued for {name}.").replace("{name}", agent.name));
      await refreshData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function revokeAiAgentCredential(agentId: string, credentialId: string) {
    if (
      !(await confirm({
        title: t("web.settings.confirm.revoke_agent_credential_title", "Revoke AI agent credential?"),
        description: t("web.settings.confirm.revoke_agent_credential_body", "This immediately disables the selected AI agent credential."),
        confirmLabel: t("web.settings.action.revoke_credential", "Revoke credential"),
        tone: "danger",
      }))
    ) {
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.revokeAiAgentCredential(agentId, credentialId);
      setFeedback(t("web.settings.feedback.agent_credential_revoked", "AI agent credential revoked."));
      await refreshData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function deactivateAiAgent(agent: AiAgent) {
    if (
      !(await confirm({
        title: t("web.settings.confirm.deactivate_agent_title", "Deactivate {name}?").replace("{name}", agent.name),
        description: t("web.settings.confirm.deactivate_agent_body", "This deactivates the AI agent and revokes all credentials connected to it."),
        confirmLabel: t("web.settings.action.deactivate_agent", "Deactivate agent"),
        tone: "danger",
      }))
    ) {
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.deactivateAiAgent(agent.id);
      setFeedback(t("web.settings.feedback.agent_deactivated", "AI agent \"{name}\" deactivated.").replace("{name}", agent.name));
      await refreshData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <WorkspaceShell
      title={t("web.settings.title", "Settings")}
      subtitle={t("web.settings.subtitle", "Personal preferences for your account, plus advanced AI and delegated access control.")}
      navKey="settings"
      module="insights"
      shellTone="dashboard-canonical"
      hideRailFooterActions
    >
      <Panel title={t("web.settings.tabs.title", "Settings Tabs")}>
        <div className="settings-tabs">
          <button
            type="button"
            className={`settings-tab ${activeTab === "profile" ? "is-active" : ""}`}
            onClick={() => selectTab("profile")}
          >
            <strong>{t("web.settings.tab.profile", "Profile")}</strong>
            <small>{t("web.settings.tab.profile_hint", "account basics")}</small>
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === "application" ? "is-active" : ""}`}
            onClick={() => selectTab("application")}
          >
            <strong>{t("web.settings.tab.application", "App Preferences")}</strong>
            <small>{t("web.settings.tab.application_hint", "language and UI defaults")}</small>
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === "access" ? "is-active" : ""}`}
            onClick={() => selectTab("access")}
          >
            <strong>{t("web.settings.tab.access", "Access & API")}</strong>
            <small>{t("web.settings.tab.access_hint", "tokens, AI agents, audit trail")}</small>
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === "subscription" ? "is-active" : ""}`}
            onClick={() => selectTab("subscription")}
          >
            <strong>{t("web.settings.tab.subscription", "Subscription")}</strong>
            <small>{t("web.settings.tab.subscription_hint", "plan and billing")}</small>
          </button>
        </div>
      </Panel>

      {activeTab === "profile" ? (
        <>
          <Panel title={t("web.settings.panel.profile", "Profile")}>
            <form className="form-grid" onSubmit={saveProfilePreferences}>
              <div className="settings-grid-dual">
                <label className="field">
                  <span>{t("web.settings.field.display_name", "Display name")}</span>
                  <input
                    className="list-row"
                    type="text"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    disabled={isSavingProfile || isBootstrapping}
                  />
                </label>
                <label className="field">
                  <span>{t("web.settings.field.sign_in_email", "Sign-in email")}</span>
                  <input className="list-row" type="email" value={user?.email ?? ""} disabled />
                </label>
              </div>
              <label className="field">
                <span>{t("web.settings.field.timezone", "Timezone")}</span>
                <input className="list-row" type="text" value={user?.timezone ?? "Europe/Warsaw"} disabled />
              </label>
              <button type="submit" className="btn-primary" disabled={isSavingProfile || isBootstrapping}>
                {isSavingProfile ? t("web.common.action.saving", "Saving...") : t("web.settings.action.save_profile", "Save profile")}
              </button>
            </form>
          </Panel>

          <Panel title={t("web.settings.panel.security", "Security")}>
            <p className="callout">
              {t("web.settings.security.copy", "Sign out is available from the main left navigation. Password changes and additional account security controls will land here in a later slice.")}
            </p>
          </Panel>
        </>
      ) : null}

      {activeTab === "application" ? (
        <>
          <Panel title={t("web.settings.panel.application", "App Preferences")}>
            <form className="form-grid" onSubmit={saveApplicationPreferences}>
              <label className="field">
                <span>{t("web.settings.field.app_language", "App language")}</span>
                <select
                  className="list-row"
                  value={profileLanguage}
                  onChange={(event) => setProfileLanguage(event.target.value as ProfileLanguage)}
                  disabled={isSavingProfile || isBootstrapping}
                >
                  <option value="en">English</option>
                  <option value="pl">Polski</option>
                </select>
              </label>
              <p className="form-hint">
                {t("web.settings.language_hint", "Changing the language refreshes UI copy and the default locale (`en-US` or `pl-PL`) after save.")}
              </p>
              <button type="submit" className="btn-primary" disabled={isSavingProfile || isBootstrapping}>
                {isSavingProfile ? t("web.common.action.saving", "Saving...") : t("web.settings.action.save_application", "Save application settings")}
              </button>
            </form>
          </Panel>

          <Panel title={t("web.settings.panel.planned_preferences", "Planned Preferences")}>
            <p className="callout">
              {t("web.settings.planned.copy", "Next up for this area: week start, time format, dashboard personalization, and notification preferences.")}
            </p>
          </Panel>
        </>
      ) : null}

      {activeTab === "access" ? (
        <>
          <Panel
            title={t("web.settings.panel.delegated_credentials", "Delegated Credentials")}
            actions={
              <button
                type="button"
                className="btn-secondary"
                onClick={() => void refreshData()}
                disabled={isRefreshing || isBootstrapping}
              >
                {isRefreshing ? t("web.common.action.refreshing", "Refreshing...") : t("web.common.action.refresh", "Refresh")}
              </button>
            }
          >
            <form className="form-grid" onSubmit={createDelegatedCredential}>
              <label className="field">
                <span>{t("web.settings.field.credential_name", "Credential name")}</span>
                <input
                  className="list-row"
                  type="text"
                  value={delegatedName}
                  onChange={(event) => setDelegatedName(event.target.value)}
                  disabled={isBootstrapping}
                />
              </label>
              <label className="field">
                <span>{t("web.settings.field.expires_at_optional", "Expires at (optional)")}</span>
                <input
                  className="list-row"
                  type="datetime-local"
                  value={delegatedExpiresAtLocal}
                  onChange={(event) => setDelegatedExpiresAtLocal(event.target.value)}
                  disabled={isBootstrapping}
                />
              </label>
              <div className="field">
                <span>{t("web.settings.field.scopes", "Scopes")}</span>
                <div className="row-inline">
                  {scopeOptions.map((scope) => (
                    <label key={scope} className="pill-link">
                      <input
                        type="checkbox"
                        checked={delegatedScopes.includes(scope)}
                        onChange={() => setDelegatedScopes((current) => toggleScope(current, scope))}
                        disabled={isBootstrapping}
                      />{" "}
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={isBootstrapping}>
                {t("web.settings.action.issue_delegated", "Issue delegated credential")}
              </button>
            </form>

            <ul className="list">
              {delegatedCredentials.length === 0 ? (
                <li className="list-row">
                  <p>{t("web.settings.empty.delegated_credentials", "No delegated credentials yet.")}</p>
                </li>
              ) : (
                delegatedCredentials.map((credential) => (
                  <li className="list-row" key={credential.id}>
                    <div>
                      <strong>{credential.name}</strong>
                      <p>
                        {credential.status} | {t("web.settings.field.scopes_lower", "scopes")}: {credential.scopes.join(", ")}
                      </p>
                      <p>
                        {t("web.settings.meta.last_used", "last used")}: {formatDateTime(credential.last_used_at, uiLanguage)} | {t("web.settings.meta.expires", "expires")}: {formatDateTime(credential.expires_at, uiLanguage)}
                      </p>
                    </div>
                    <div className="row-inline">
                      <span className={`pill ${credential.status === "active" ? "state-success" : ""}`}>{credential.status}</span>
                      <button
                        type="button"
                        className="pill-link"
                        disabled={credential.status !== "active"}
                        onClick={() => void revokeDelegatedCredential(credential.id)}
                      >
                        {t("web.settings.action.revoke", "Revoke")}
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Panel>

          <Panel title={t("web.settings.panel.ai_agents", "AI Agents")}>
            <form className="form-grid" onSubmit={createAiAgent}>
              <label className="field">
                <span>{t("web.settings.field.new_agent_name", "New AI agent name")}</span>
                <input
                  className="list-row"
                  type="text"
                  value={newAgentName}
                  onChange={(event) => setNewAgentName(event.target.value)}
                  disabled={isBootstrapping}
                />
              </label>
              <button type="submit" className="btn-secondary" disabled={isBootstrapping}>
                {t("web.settings.action.create_ai_agent", "Create AI agent")}
              </button>
            </form>

            <ul className="list">
              {aiAgents.length === 0 ? (
                <li className="list-row">
                  <p>{t("web.settings.empty.ai_agents", "No AI agents configured.")}</p>
                </li>
              ) : (
                aiAgents.map((agent) => {
                  const draft = agentCredentialDrafts[agent.id];
                  const credentials = aiAgentCredentials[agent.id] ?? [];

                  return (
                    <li className="list-row" key={agent.id}>
                      <div className="form-grid">
                        <div>
                          <strong>{agent.name}</strong>
                          <p>
                            {agent.email} | {t("web.settings.meta.status", "status")}: {agent.agent_status}
                          </p>
                          <p>
                            {t("web.settings.meta.created", "created")}: {formatDateTime(agent.created_at, uiLanguage)} | {t("web.settings.meta.last_used", "last used")}: {formatDateTime(agent.last_used_at, uiLanguage)}
                          </p>
                        </div>

                        <div className="form-grid">
                          <label className="field">
                            <span>{t("web.settings.field.credential_name", "Credential name")}</span>
                            <input
                              className="list-row"
                              type="text"
                              value={draft?.name ?? ""}
                              onChange={(event) =>
                                updateAgentDraft(agent.id, (current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              disabled={agent.agent_status !== "active"}
                            />
                          </label>
                          <label className="field">
                            <span>{t("web.settings.field.expires_at_optional", "Expires at (optional)")}</span>
                            <input
                              className="list-row"
                              type="datetime-local"
                              value={draft?.expiresAtLocal ?? ""}
                              onChange={(event) =>
                                updateAgentDraft(agent.id, (current) => ({
                                  ...current,
                                  expiresAtLocal: event.target.value,
                                }))
                              }
                              disabled={agent.agent_status !== "active"}
                            />
                          </label>
                          <div className="field">
                            <span>{t("web.settings.field.scopes", "Scopes")}</span>
                            <div className="row-inline">
                              {scopeOptions.map((scope) => (
                                <label key={`${agent.id}-${scope}`} className="pill-link">
                                  <input
                                    type="checkbox"
                                    checked={draft?.scopes?.includes(scope) ?? false}
                                    onChange={() =>
                                      updateAgentDraft(agent.id, (current) => ({
                                        ...current,
                                        scopes: toggleScope(current.scopes, scope),
                                      }))
                                    }
                                    disabled={agent.agent_status !== "active"}
                                  />{" "}
                                  {scope}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="row-inline">
                            <button
                              type="button"
                              className="btn-secondary"
                              disabled={agent.agent_status !== "active"}
                              onClick={() => void issueAiAgentCredential(agent)}
                            >
                              {t("web.settings.action.issue_credential", "Issue credential")}
                            </button>
                            <button
                              type="button"
                              className="pill-link"
                              disabled={agent.agent_status !== "active"}
                              onClick={() => void deactivateAiAgent(agent)}
                            >
                              {t("web.settings.action.deactivate_agent", "Deactivate agent")}
                            </button>
                          </div>
                        </div>

                        <ul className="list">
                          {credentials.length === 0 ? (
                            <li className="list-row">
                              <p>{t("web.settings.empty.agent_credentials", "No credentials for this agent.")}</p>
                            </li>
                          ) : (
                            credentials.map((credential) => (
                              <li className="list-row" key={credential.id}>
                                <div>
                                  <strong>{credential.name}</strong>
                                  <p>
                                    {credential.status} | {t("web.settings.field.scopes_lower", "scopes")}: {credential.scopes.join(", ")}
                                  </p>
                                  <p>
                                    {t("web.settings.meta.last_used", "last used")}: {formatDateTime(credential.last_used_at, uiLanguage)} | {t("web.settings.meta.expires", "expires")}: {formatDateTime(credential.expires_at, uiLanguage)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="pill-link"
                                  disabled={credential.status !== "active"}
                                  onClick={() => void revokeAiAgentCredential(agent.id, credential.id)}
                                >
                                  {t("web.settings.action.revoke", "Revoke")}
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </Panel>

          <Panel title={t("web.settings.panel.access_audits", "Access Audits")}>
            <ul className="list">
              {accessAudits.length === 0 ? (
                <li className="list-row">
                  <p>{t("web.settings.empty.access_audits", "No access-boundary audit events yet.")}</p>
                </li>
              ) : (
                accessAudits.map((audit) => (
                  <li className="list-row" key={audit.id}>
                    <div>
                      <strong>
                        {audit.reason} ({audit.principal_type}/{audit.token_mode ?? "unknown"})
                      </strong>
                      <p>
                        {audit.method} {audit.route}
                        {audit.required_scope ? ` | ${t("web.settings.meta.required", "required")}: ${audit.required_scope}` : ""}
                      </p>
                    </div>
                    <span className="mono-note">{formatDateTime(audit.occurred_at, uiLanguage)}</span>
                  </li>
                ))
              )}
            </ul>
          </Panel>

          {latestDelegatedToken ? (
            <Panel title={t("web.settings.panel.new_delegated_token", "New Delegated Token")}>
              <p className="callout">{latestDelegatedToken}</p>
            </Panel>
          ) : null}

          {latestAgentToken ? (
            <Panel title={t("web.settings.panel.new_agent_token", "New AI Agent Token ({name})").replace("{name}", latestAgentToken.agentName)}>
              <p className="callout">{latestAgentToken.token}</p>
            </Panel>
          ) : null}
        </>
      ) : null}

      {activeTab === "subscription" ? (
        <>
          <Panel title={t("web.settings.panel.subscription", "Subscription")}>
            <p className="callout">
              {t("web.settings.subscription.copy", "This area will hold your plan, billing history, and subscription status. For now, the account remains in development mode.")}
            </p>
          </Panel>

          <Panel title={t("web.settings.panel.api_external_apps", "API & External Apps")}>
            <p className="callout">
              {t("web.settings.external_apps.copy_prefix", "API keys and external app connections stay in the")} <strong>{t("web.settings.tab.access", "Access & API")}</strong> {t("web.settings.external_apps.copy_suffix", "tab so permissions and tokens remain in one place.")}
            </p>
          </Panel>
        </>
      ) : null}

      {feedback ? (
        <Panel title={t("web.common.panel.status", "Status")}>
          <p className="callout">{feedback}</p>
        </Panel>
      ) : null}

      {errorMessage ? (
        <Panel title={t("web.common.panel.error", "Error")}>
          <p className="callout state-error">{errorMessage}</p>
        </Panel>
      ) : null}
      {confirmDialog}
    </WorkspaceShell>
  );
}
