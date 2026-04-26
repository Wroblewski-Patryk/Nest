"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nestApiClient } from "@/lib/api-client";
import { clearAuthSession } from "@/lib/auth-session";

export function WorkspaceLogoutButton() {
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
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
