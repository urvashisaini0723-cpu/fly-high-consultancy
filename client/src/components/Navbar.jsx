import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

const links = [
  { to: "/", label: "Home" },
  { to: "/owner", label: "Owner" },
  { to: "/courses", label: "Courses" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  // Clicking the logo/name always lands on the Home page top.
  // Same page: smooth-scroll to top. Other pages: Link navigates to "/" and
  // App's route effect handles the scroll.
  const handleLogoClick = (e) => {
    setOpen(false);
    if (location.pathname === "/") {
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav shadow-lg py-2 bg-navy/80"
          : "bg-navy/40 backdrop-blur-md py-4"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link
          to="/"
          onClick={handleLogoClick}
          aria-label="Fly High Consultancy — go to home top"
          className="flex items-center gap-3 text-white font-display font-extrabold text-2xl md:text-3xl"
        >
          <img src="/logo.webp" alt="Fly High Consultancy logo with airplane emblem" width="64" height="64" loading="eager" decoding="async" className="h-14 w-14 md:h-16 md:w-16 object-contain" />
          <span className="leading-none">
            FLY <span className="text-sky">HIGH</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.to} className="relative">
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `text-white font-medium hover:text-sky transition-colors ${
                    isActive ? "text-sky" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="relative inline-block">
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange rounded-full"
                      />
                    )}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="hidden md:inline-flex px-5 py-2 rounded-full bg-gradient-to-r from-orange to-gold text-white font-semibold shadow-lg hover:shadow-orange/40 transition-shadow btn-primary"
          >
            Book Free Consultation
          </Link>
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="md:hidden fixed inset-y-0 right-0 w-3/4 max-w-sm bg-navy/95 backdrop-blur-xl z-50 p-6 flex flex-col gap-2"
          >
            <button
              className="self-end text-white text-2xl mb-4"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <FiX />
            </button>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-white font-medium ${
                    isActive ? "bg-sky/20 text-sky" : "hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="mt-4 px-5 py-3 rounded-full bg-gradient-to-r from-orange to-gold text-white font-semibold text-center"
            >
              Book Free Consultation
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
