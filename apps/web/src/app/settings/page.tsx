"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import {
  clearAuthSession,
  getAuthToken,
  setOnboardingRequired,
} from "@/lib/auth-session";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  onboarding_required?: boolean;
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

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

const FALLBACK_SCOPES = ["tasks:read", "tasks:write", "lists:read", "lists:write"];

async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;

  return (await requestFn(path, init)) as TResponse;
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

  return "Unexpected API error.";
}

function toIsoDateTime(localDateTimeValue: string): string | undefined {
  if (!localDateTimeValue) {
    return undefined;
  }

  const iso = new Date(localDateTimeValue).toISOString();
  return Number.isNaN(Date.parse(iso)) ? undefined : iso;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "n/a";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function SettingsPage() {
  const router = useRouter();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [scopeOptions, setScopeOptions] = useState<string[]>(FALLBACK_SCOPES);
  const [delegatedCredentials, setDelegatedCredentials] = useState<DelegatedCredential[]>([]);
  const [aiAgents, setAiAgents] = useState<AiAgent[]>([]);
  const [aiAgentCredentials, setAiAgentCredentials] = useState<Record<string, DelegatedCredential[]>>(
    {}
  );
  const [accessAudits, setAccessAudits] = useState<AccessAudit[]>([]);

  const [delegatedName, setDelegatedName] = useState("Telegram Delegated Agent");
  const [delegatedScopes, setDelegatedScopes] = useState<string[]>(["tasks:read"]);
  const [delegatedExpiresAtLocal, setDelegatedExpiresAtLocal] = useState("");
  const [latestDelegatedToken, setLatestDelegatedToken] = useState("");

  const [newAgentName, setNewAgentName] = useState("Life Copilot");
  const [agentCredentialDrafts, setAgentCredentialDrafts] = useState<
    Record<string, AgentCredentialDraft>
  >({});
  const [latestAgentToken, setLatestAgentToken] = useState<{ agentName: string; token: string } | null>(
    null
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    setOnboardingRequired(false);
    setUser(null);
    router.replace("/auth");
  }, [router]);

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
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      setIsBootstrapping(false);
      return;
    }

    try {
      const meResponse = await apiRequest<{ data: AuthUser }>("/auth/me");
      if (meResponse.data.onboarding_required) {
        setOnboardingRequired(true);
        router.replace("/onboarding");
        return;
      }

      setOnboardingRequired(false);
      setUser(meResponse.data);
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
  }, [handleUnauthorized, refreshData, router]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  const activeDelegatedCount = useMemo(
    () => delegatedCredentials.filter((item) => item.status === "active").length,
    [delegatedCredentials]
  );

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

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // no-op
    }
    handleUnauthorized();
  }

  async function createDelegatedCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!delegatedName.trim()) {
      setErrorMessage("Credential name is required.");
      return;
    }
    if (delegatedScopes.length === 0) {
      setErrorMessage("Select at least one scope.");
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      const response = await nestApiClient.createDelegatedCredential({
        name: delegatedName.trim(),
        scopes: delegatedScopes,
        ...(toIsoDateTime(delegatedExpiresAtLocal)
          ? { expires_at: toIsoDateTime(delegatedExpiresAtLocal) }
          : {}),
      });

      setLatestDelegatedToken(response.data.plain_text_token);
      setFeedback("Delegated credential issued.");
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
    if (!window.confirm("Revoke this delegated credential now?")) {
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.revokeDelegatedCredential(credentialId);
      setFeedback("Delegated credential revoked.");
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
      setErrorMessage("Agent name is required.");
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.createAiAgent({ name: newAgentName.trim() });
      setNewAgentName("");
      setFeedback("AI agent created.");
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
      setErrorMessage("Credential name is required.");
      return;
    }
    if (draft.scopes.length === 0) {
      setErrorMessage("Select at least one scope for agent credential.");
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      const response = await nestApiClient.createAiAgentCredential(agent.id, {
        name: draft.name.trim(),
        scopes: draft.scopes,
        ...(toIsoDateTime(draft.expiresAtLocal)
          ? { expires_at: toIsoDateTime(draft.expiresAtLocal) }
          : {}),
      });
      setLatestAgentToken({
        agentName: agent.name,
        token: response.data.plain_text_token,
      });
      setFeedback(`AI agent credential issued for ${agent.name}.`);
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
    if (!window.confirm("Revoke this AI agent credential?")) {
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.revokeAiAgentCredential(agentId, credentialId);
      setFeedback("AI agent credential revoked.");
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
    if (!window.confirm(`Deactivate AI agent "${agent.name}" and revoke all its credentials?`)) {
      return;
    }

    setErrorMessage("");
    setFeedback("");

    try {
      await nestApiClient.deactivateAiAgent(agent.id);
      setFeedback(`AI agent "${agent.name}" deactivated.`);
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
      title="Access Control"
      subtitle="Manage delegated credentials, AI agents, and access-boundary audit visibility."
      module="insights"
    >
      <div className="stack">
        <MetricCard label="Delegated active" value={String(activeDelegatedCount)} />
        <MetricCard label="AI agents" value={String(aiAgents.length)} />
        <MetricCard label="Audit events" value={String(accessAudits.length)} />
      </div>

      <Panel
        title="Session"
        actions={
          <button
            type="button"
            className="btn-secondary"
            onClick={handleLogout}
            disabled={isBootstrapping}
          >
            Sign out
          </button>
        }
      >
        <p className="callout">
          Signed in as <strong>{user?.email ?? "..."}</strong>.
        </p>
      </Panel>

      <Panel
        title="Delegated Credentials"
        actions={
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void refreshData()}
            disabled={isRefreshing || isBootstrapping}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        }
      >
        <form className="form-grid" onSubmit={createDelegatedCredential}>
          <label className="field">
            <span>Credential name</span>
            <input
              className="list-row"
              type="text"
              value={delegatedName}
              onChange={(event) => setDelegatedName(event.target.value)}
              disabled={isBootstrapping}
            />
          </label>
          <label className="field">
            <span>Expires at (optional)</span>
            <input
              className="list-row"
              type="datetime-local"
              value={delegatedExpiresAtLocal}
              onChange={(event) => setDelegatedExpiresAtLocal(event.target.value)}
              disabled={isBootstrapping}
            />
          </label>
          <div className="field">
            <span>Scopes</span>
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
            Issue delegated credential
          </button>
        </form>

        <ul className="list">
          {delegatedCredentials.length === 0 ? (
            <li className="list-row">
              <p>No delegated credentials yet.</p>
            </li>
          ) : (
            delegatedCredentials.map((credential) => (
              <li className="list-row" key={credential.id}>
                <div>
                  <strong>{credential.name}</strong>
                  <p>
                    {credential.status} | scopes: {credential.scopes.join(", ")}
                  </p>
                  <p>
                    last used: {formatDateTime(credential.last_used_at)} | expires:{" "}
                    {formatDateTime(credential.expires_at)}
                  </p>
                </div>
                <div className="row-inline">
                  <span className={`pill ${credential.status === "active" ? "state-success" : ""}`}>
                    {credential.status}
                  </span>
                  <button
                    type="button"
                    className="pill-link"
                    disabled={credential.status !== "active"}
                    onClick={() => void revokeDelegatedCredential(credential.id)}
                  >
                    Revoke
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </Panel>

      <Panel title="AI Agents">
        <form className="form-grid" onSubmit={createAiAgent}>
          <label className="field">
            <span>New AI agent name</span>
            <input
              className="list-row"
              type="text"
              value={newAgentName}
              onChange={(event) => setNewAgentName(event.target.value)}
              disabled={isBootstrapping}
            />
          </label>
          <button type="submit" className="btn-secondary" disabled={isBootstrapping}>
            Create AI agent
          </button>
        </form>

        <ul className="list">
          {aiAgents.length === 0 ? (
            <li className="list-row">
              <p>No AI agents configured.</p>
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
                        {agent.email} | status: {agent.agent_status}
                      </p>
                      <p>
                        created: {formatDateTime(agent.created_at)} | last used:{" "}
                        {formatDateTime(agent.last_used_at)}
                      </p>
                    </div>

                    <div className="form-grid">
                      <label className="field">
                        <span>Credential name</span>
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
                        <span>Expires at (optional)</span>
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
                        <span>Scopes</span>
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
                          Issue credential
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          disabled={agent.agent_status !== "active"}
                          onClick={() => void deactivateAiAgent(agent)}
                        >
                          Deactivate agent
                        </button>
                      </div>
                    </div>

                    <ul className="list">
                      {credentials.length === 0 ? (
                        <li className="list-row">
                          <p>No credentials for this agent.</p>
                        </li>
                      ) : (
                        credentials.map((credential) => (
                          <li className="list-row" key={credential.id}>
                            <div>
                              <strong>{credential.name}</strong>
                              <p>
                                {credential.status} | scopes: {credential.scopes.join(", ")}
                              </p>
                              <p>
                                last used: {formatDateTime(credential.last_used_at)} | expires:{" "}
                                {formatDateTime(credential.expires_at)}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="pill-link"
                              disabled={credential.status !== "active"}
                              onClick={() => void revokeAiAgentCredential(agent.id, credential.id)}
                            >
                              Revoke
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

      <Panel title="Access Audits">
        <ul className="list">
          {accessAudits.length === 0 ? (
            <li className="list-row">
              <p>No access-boundary audit events yet.</p>
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
                    {audit.required_scope ? ` | required: ${audit.required_scope}` : ""}
                  </p>
                </div>
                <span className="mono-note">{formatDateTime(audit.occurred_at)}</span>
              </li>
            ))
          )}
        </ul>
      </Panel>

      {latestDelegatedToken ? (
        <Panel title="New Delegated Token">
          <p className="callout">{latestDelegatedToken}</p>
        </Panel>
      ) : null}

      {latestAgentToken ? (
        <Panel title={`New AI Agent Token (${latestAgentToken.agentName})`}>
          <p className="callout">{latestAgentToken.token}</p>
        </Panel>
      ) : null}

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
