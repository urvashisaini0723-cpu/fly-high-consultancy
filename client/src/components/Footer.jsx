import { Link, useLocation } from "react-router-dom";
import { FiSend, FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  const location = useLocation();

  // Clicking a quick link for the page you're already on (e.g. Home while on
  // the home page) scrolls back to the top instead of doing nothing.
  const handleQuickLink = (e, to) => {
    if (location.pathname !== to) return;
    e.preventDefault();
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 font-display font-extrabold text-2xl">
            <img src="/logo.webp" alt="Fly High Consultancy logo with airplane emblem" width="64" height="64" loading="lazy" decoding="async" className="h-16 w-16 object-contain" />
            <span>FLY <span className="text-sky">HIGH</span></span>
          </div>
          <p className="mt-4 text-white/70 text-sm leading-relaxed">
            Professional study abroad and tourist visa consultancy. Your Journey Abroad Starts Here.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="https://www.instagram.com/fly.highconsultancypehowa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky transition-colors">
              <FaInstagram />
            </a>
            <a href="https://www.facebook.com/p/Flyhigh-Consultancy-Pehowa-61571970445323/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky transition-colors">
              <FaFacebookF />
            </a>
            <a href="https://wa.me/919306142129" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-lg mb-4 text-sky">Quick Links</h3>
          <ul className="space-y-2 text-white/70 text-sm">
            {[
              ["/", "Home"],
              ["/owner", "Owner"],
              ["/courses", "Courses"],
              ["/gallery", "Gallery"],
              ["/contact", "Contact"],
              ["/privacy", "Privacy Policy"],
            ].map(([to, l]) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={(e) => handleQuickLink(e, to)}
                  className="hover:text-orange transition-colors"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold text-lg mb-4 text-sky">Contact</h3>
          <ul className="space-y-3 text-white/70 text-sm">
            <li className="flex gap-2">
              <FiMapPin className="mt-0.5 text-orange shrink-0" />
              2nd Floor, Amar Complex, Near New PNB Bank, Pehowa, Kurukshetra, Haryana – 136128
            </li>
            <li className="flex gap-2">
              <FiPhone className="mt-0.5 text-orange shrink-0" />
              <a href="tel:+919306142129" className="hover:text-white">+91 93061 42129</a>
            </li>
            <li className="flex gap-2">
              <FiMail className="mt-0.5 text-orange shrink-0" />
              <a href="mailto:urvashisaini0723@gmail.com" className="hover:text-white">urvashisaini0723@gmail.com</a>
            </li>
            <li className="flex gap-2">
              <FiClock className="mt-0.5 text-orange shrink-0" />
              Mon – Sat: 10:00 AM – 7:00 PM · Sunday closed
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold text-lg mb-4 text-sky">Office Hours</h3>
          <p className="text-white/70 text-sm">Monday to Saturday</p>
          <p className="text-white font-semibold">10:00 AM – 7:00 PM</p>
          <p className="mt-2 text-white/70 text-sm">Sunday: Closed</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-xs text-white/60 leading-relaxed">
          <p className="italic">
            General guidance only. Visa decisions are made by the relevant authorities. For the latest rules, please visit the official government or embassy website of the country.
          </p>
          <p className="mt-2">©️ 2026 Fly High Consultancy, Pehowa.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
