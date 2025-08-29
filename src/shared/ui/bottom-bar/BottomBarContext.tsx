import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Setter = (node: ReactNode | null) => void;

type BottomBarContextValue = {
  content: ReactNode | null;
  setContent: Setter;
  reset: () => void;
};

const BottomBarContext = createContext<BottomBarContextValue | null>(null);

export function BottomBarProvider({ children, defaultContent }: {
  children: ReactNode;
  defaultContent: ReactNode;
}) {
  const [content, setContent] = useState<ReactNode | null>(defaultContent);
  const reset = () => setContent(defaultContent);

  const value = useMemo(() => ({ content, setContent, reset }), [content, defaultContent]);

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
