"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IntroContextValue = {
  introDone: boolean;
  setIntroDone: (done: boolean) => void;
};

const IntroContext = createContext<IntroContextValue>({
  introDone: false,
  setIntroDone: () => {},
});

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(false);
  return (
    <IntroContext.Provider value={{ introDone, setIntroDone }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
