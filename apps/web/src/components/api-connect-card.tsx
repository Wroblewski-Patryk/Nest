"use client";

import { useEffect, useMemo, useState } from "react";
import type { UiAsyncState } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { STATE_LABELS } from "@/lib/ux-contract";

export function ApiConnectCard() {
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Checking /lists endpoint...");

  const stateClass = useMemo(() => `pill state-${state}`, [state]);

  useEffect(() => {
    let mounted = true;

    nestApiClient
      .getLists({ per_page: 1 })
      .then((response) => {
        if (!mounted) return;

        const total = response.meta?.total ?? response.data?.length ?? 0;
        setState(total > 0 ? "success" : "empty");
        setDetail(`Shared client call succeeded (${total} list items visible).`);
      })
      .catch((error) => {
        if (!mounted) return;

        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: unknown }).status === "number"
            ? String((error as { status: number }).status)
            : "n/a";

        setState("error");
        setDetail(`Shared client call failed (HTTP ${status}).`);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <article className="panel">
      <h2>API Client Status</h2>
      <div className="panel-content">
        <span className={stateClass}>{STATE_LABELS[state]}</span>
        <p className="callout">{detail}</p>
      </div>
    </article>
  );
}
