"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nestApiClient } from "@/lib/api-client";
import { clearAuthSession } from "@/lib/auth-session";

type WorkspaceLogoutButtonProps = {
  idleLabel?: string;
  busyLabel?: string;
};

export function WorkspaceLogoutButton({
  idleLabel = "Sign out",
  busyLabel = "Signing out...",
}: WorkspaceLogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const requestFn = nestApiClient.request as unknown as (
        path: string,
        init?: { method?: string }
      ) => Promise<unknown>;
      await requestFn("/auth/logout", { method: "POST" });
    } catch {
      // no-op: local session clear is still required
    } finally {
      clearAuthSession();
      router.replace("/auth");
      setIsLoggingOut(false);
    }
  }

  return (
    <button type="button" className="workspace-logout-button" onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? busyLabel : idleLabel}
    </button>
  );
}
