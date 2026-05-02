"use client";

import { useCallback, useState } from "react";

type ConfirmTone = "danger" | "default";

type ConfirmDialogOptions = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type PendingConfirmation = ConfirmDialogOptions & {
  resolve: (confirmed: boolean) => void;
};

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({
        cancelLabel: "Cancel",
        tone: "default",
        ...options,
        resolve,
      });
    });
  }, []);

  const close = useCallback(
    (confirmed: boolean) => {
      pending?.resolve(confirmed);
      setPending(null);
    },
    [pending]
  );

  const confirmDialog = pending ? (
    <div className="confirm-dialog-backdrop" role="presentation" onMouseDown={() => close(false)}>
      <section
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={`confirm-dialog is-${pending.tone}`}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog-mark" aria-hidden="true" />
        <div className="confirm-dialog-copy">
          <h2 id="confirm-dialog-title">{pending.title}</h2>
          <p id="confirm-dialog-description">{pending.description}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn-secondary" onClick={() => close(false)}>
            {pending.cancelLabel}
          </button>
          <button type="button" className="btn-primary" onClick={() => close(true)}>
            {pending.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  ) : null;

  return { confirm, confirmDialog };
}
