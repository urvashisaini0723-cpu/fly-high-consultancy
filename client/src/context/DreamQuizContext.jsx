import { createContext, useContext, useCallback, useMemo, useState } from "react";

/**
 * Lets any component on the site open the "Find Your Dream Country" quiz
 * (used by the Home page CTA, the floating launcher and the enquiry form's
 * back navigation) without prop-drilling or routing hacks.
 */
const DreamQuizContext = createContext(null);

export const DreamQuizProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Optionally pre-fill the counselling form with a specific country
  const [focusCountry, setFocusCountry] = useState(null);

  const openQuiz = useCallback((countryId = null) => {
    setFocusCountry(countryId);
    setIsOpen(true);
  }, []);

  const closeQuiz = useCallback(() => {
    setIsOpen(false);
    setFocusCountry(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, focusCountry, openQuiz, closeQuiz }),
    [isOpen, focusCountry, openQuiz, closeQuiz]
  );

  return <DreamQuizContext.Provider value={value}>{children}</DreamQuizContext.Provider>;
};

export const useDreamQuiz = () => {
  const ctx = useContext(DreamQuizContext);
  if (!ctx) throw new Error("useDreamQuiz must be used within DreamQuizProvider");
  return ctx;
};
