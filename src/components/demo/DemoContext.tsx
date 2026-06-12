"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const DemoContext = createContext(false);

export function DemoProvider({ isDemo, children }: { isDemo: boolean; children: ReactNode }) {
  return <DemoContext.Provider value={isDemo}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}

interface DemoGuardResult {
  guard: <T>(action: () => T) => T | undefined;
  blocked: boolean;
}

export function useDemoGuard(): DemoGuardResult {
  const isDemo = useDemo();
  const [blocked, setBlocked] = useState(false);

  function guard<T>(action: () => T): T | undefined {
    if (isDemo) {
      setBlocked(true);
      setTimeout(() => setBlocked(false), 3000);
      return undefined;
    }
    return action();
  }

  return { guard, blocked };
}
