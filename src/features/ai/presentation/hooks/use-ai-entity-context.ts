"use client";

import { useEffect, useMemo } from "react";

import { useAiScreenContext } from "@/contexts/ai-screen-context";
import type { AiScreenContext } from "@/features/ai/domain/types";

type UseAiEntityContextOptions = {
  entityId?: string;
  entityLabel?: string;
  formSnapshot?: Record<string, string>;
  metadata?: Record<string, string>;
};

export function useAiEntityContext(options: UseAiEntityContextOptions) {
  const { patchScreenContext } = useAiScreenContext();

  const formSnapshotKey = useMemo(
    () =>
      options.formSnapshot ? JSON.stringify(options.formSnapshot) : undefined,
    [options.formSnapshot]
  );

  const metadataKey = useMemo(
    () => (options.metadata ? JSON.stringify(options.metadata) : undefined),
    [options.metadata]
  );

  useEffect(() => {
    const patch: Partial<AiScreenContext> = {};

    if (options.entityId) {
      patch.entityId = options.entityId;
    }

    if (options.entityLabel) {
      patch.entityLabel = options.entityLabel;
    }

    if (options.formSnapshot) {
      patch.formSnapshot = options.formSnapshot;
    }

    if (options.metadata) {
      patch.metadata = options.metadata;
    }

    if (Object.keys(patch).length > 0) {
      patchScreenContext(patch);
    }
  }, [
    options.entityId,
    options.entityLabel,
    formSnapshotKey,
    metadataKey,
    options.formSnapshot,
    options.metadata,
    patchScreenContext,
  ]);
}
