"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { OnboardingTour } from "./onboarding-tour";

const TourContext = createContext<{ startTour: () => void }>({
  startTour: () => {},
});

export const useTour = () => useContext(TourContext);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tourOpen, setTourOpen] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const startTour = useCallback(() => {
    setTourKey((k) => k + 1);
    setTourOpen(true);
  }, []);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      <OnboardingTour key={tourKey} forceOpen={tourOpen} />
    </TourContext.Provider>
  );
}
