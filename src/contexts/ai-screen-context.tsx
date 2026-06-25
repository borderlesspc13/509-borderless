"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { AiScreenContext } from "@/features/ai/domain/types";

type AiScreenContextValue = {
  screenContext: AiScreenContext;
  setScreenContext: (context: AiScreenContext) => void;
  patchScreenContext: (patch: Partial<AiScreenContext>) => void;
};

const AiScreenContextReact = createContext<AiScreenContextValue | null>(null);

type AiScreenContextProviderProps = {
  children: React.ReactNode;
  initialContext?: AiScreenContext;
};

function hasScreenContextPatch(
  current: AiScreenContext,
  patch: Partial<AiScreenContext>
) {
  return Object.entries(patch).some(([key, value]) => {
    const patchKey = key as keyof AiScreenContext;
    return current[patchKey] !== value;
  });
}

export function AiScreenContextProvider({
  children,
  initialContext,
}: AiScreenContextProviderProps) {
  const [screenContext, setScreenContext] = useState<AiScreenContext>(
    initialContext ?? {}
  );

  const patchScreenContext = useCallback((patch: Partial<AiScreenContext>) => {
    setScreenContext((current) => {
      if (!hasScreenContextPatch(current, patch)) {
        return current;
      }

      return { ...current, ...patch };
    });
  }, []);

  const value = useMemo<AiScreenContextValue>(
    () => ({
      screenContext,
      setScreenContext,
      patchScreenContext,
    }),
    [screenContext, patchScreenContext]
  );

  return (
    <AiScreenContextReact.Provider value={value}>
      {children}
    </AiScreenContextReact.Provider>
  );
}

export function useAiScreenContext() {
  const context = useContext(AiScreenContextReact);

  return (
    context ?? {
      screenContext: {},
      setScreenContext: () => undefined,
      patchScreenContext: () => undefined,
    }
  );
}
