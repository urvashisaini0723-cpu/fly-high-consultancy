import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import Owner from "./pages/Owner";
import Courses from "./pages/Courses";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // On hard refresh (F5) always open the Home page, no matter which page you were on
  // (privacy policy is exempt — deep links to it must survive refresh)
  useEffect(() => {
    if (
      location.key === "default" &&
      window.location.pathname !== "/" &&
      window.location.pathname !== "/privacy"
    ) {
      navigate("/", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    (window).__lenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  if (loading) return <Loader />;

  return (
    <DreamQuizProvider>
      <Navbar />
      <main className="pt-0">
        <AnimatePresence mode="wait">
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
