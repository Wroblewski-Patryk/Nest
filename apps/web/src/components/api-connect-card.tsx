"use client";

import { useEffect, useMemo, useState } from "react";
import type { UiAsyncState } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { describeApiIssue, STATE_LABELS } from "@/lib/ux-contract";

export function ApiConnectCard() {
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Checking whether the shared API client can reach your lists...");

  const stateClass = useMemo(() => `pill state-${state}`, [state]);

  useEffect(() => {
    let mounted = true;

    nestApiClient
      .getLists({ per_page: 1 })
      .then((response) => {
        if (!mounted) return;

        const total = response.meta?.total ?? response.data?.length ?? 0;
        setState(total > 0 ? "success" : "empty");
        setDetail(
          total > 0
            ? `API connection is healthy. ${total} list item(s) are visible.`
            : "API connection is healthy, but no lists are visible yet."
        );
      })
      .catch((error) => {
        if (!mounted) return;

        setState("error");
        setDetail(`We couldn't verify the API connection right now. ${describeApiIssue(error)}`);
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
