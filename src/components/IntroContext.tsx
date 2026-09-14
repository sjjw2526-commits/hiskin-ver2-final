"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IntroContextValue = {
  introDone: boolean;
  setIntroDone: (done: boolean) => void;
};

// introDone starts true: the wordmark preloader was removed on 2026-09-15
// (owner — it cost seconds on first load and the site felt slow). The flag
// and its consumers stay, so the hero reveal and the nav fade still key off
// it and a preloader could be put back by flipping this to false.
const IntroContext = createContext<IntroContextValue>({
  introDone: true,
  setIntroDone: () => {},
});

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(true);
  return (
    <IntroContext.Provider value={{ introDone, setIntroDone }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}
