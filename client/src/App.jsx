import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";
import Loader from "./components/Loader";
import PageTransition from "./components/PageTransition";
import { DreamQuizProvider } from "./context/DreamQuizContext";
import DreamCountryQuiz from "./components/dream/DreamCountryQuiz";
import DreamQuizLauncher from "./components/dream/DreamQuizLauncher";
import Home from "./pages/Home";

// Route-level code splitting: only Home ships in the initial bundle.
const Owner = lazy(() => import("./pages/Owner"));
const Courses = lazy(() => import("./pages/Courses"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Deep links (SEO crawlers, shared links, new tabs) must land on the real
  // page — no forced redirect to Home. [The old "F5 always Home" redirect
  // made every subpage render the homepage for crawlers and shared links.
  // To restore it, navigate('/', { replace: true }) here.]

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  // The splash never blocks content: the site renders immediately and the
  // overlay fades out (LCP/FCP are measured from content paint, not the splash).
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: prefersReduced ? 0 : 1.1,
      smoothWheel: !prefersReduced,
    });
    (window).__lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <DreamQuizProvider>
      {/* Splash overlays the content briefly, then fades — it never gates it. */}
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>
      <Navbar />
      <main className="pt-0">
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />

            <Route
              path="/owner"
              element={
                <PageTransition>
                  <Owner />
                </PageTransition>
              }
            />
            <Route
              path="/courses"
              element={
                <PageTransition>
                  <Courses />
                </PageTransition>
              }
            />
            <Route
              path="/gallery"
              element={
                <PageTransition>
                  <Gallery />
                </PageTransition>
              }
            />
            <Route
              path="/contact"
              element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              }
            />
            <Route
              path="/privacy"
              element={
                <PageTransition>
                  <Privacy />
                </PageTransition>
              }
            />
          </Routes>
          </Suspense>
          </AnimatePresence>
        </main>
        <Footer />
        <WhatsAppButton />
        <ScrollToTop />
        <Chatbot />
        {/* Dream Country quiz — floating launcher sits above the chatbot robot */}
        <DreamQuizLauncher />
        {/* Quiz modal is rendered once for the whole app */}
        <DreamCountryQuiz />
      </DreamQuizProvider>
  );
};

export default App;
