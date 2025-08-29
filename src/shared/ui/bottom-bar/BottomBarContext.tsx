import React, { createContext, useContext, useMemo, useState } from 'react';

type BottomBarCtx = {
  content: React.ReactNode;                     // override ?? defaultContent
  setOverride: (node: React.ReactNode | null) => void; // вместо setContent/reset
};

const BottomBarContext = createContext<BottomBarCtx | null>(null);

export function BottomBarProvider({
  children,
  defaultContent,
}: { children: React.ReactNode; defaultContent: React.ReactNode }) {
  const [override, setOverride] = useState<React.ReactNode | null>(null);

  const value = useMemo(
    () => ({
      content: override ?? defaultContent,
      setOverride,
    }),
    [override, defaultContent]
  );

  return (
    <BottomBarContext.Provider value={value}>
      {children}
    </BottomBarContext.Provider>
  );
}

export function useBottomBar() {
  const ctx = useContext(BottomBarContext);
  if (!ctx) throw new Error("useBottomBar must be used within BottomBarProvider");
  return ctx;
}
