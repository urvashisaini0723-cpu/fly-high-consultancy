import { motion } from "framer-motion";
import { FiPhone } from "react-icons/fi";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";

// Original Instagram logo with official gradient colors
const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#feda75"/>
        <stop offset="30%" stopColor="#fa7e1e"/>
        <stop offset="60%" stopColor="#d62976"/>
        <stop offset="85%" stopColor="#962fbf"/>
        <stop offset="100%" stopColor="#4f5bd5"/>
      </linearGradient>
    </defs>
    {/* Outer rounded square */}
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instaGradient)" strokeWidth="2.5"/>
    {/* Circle */}
    <circle cx="12" cy="12" r="6.5" stroke="url(#instaGradient)" strokeWidth="2"/>
    {/* Dot */}
    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#instaGradient)"/>
  </svg>
);

const items = [
  {
    href: "https://www.instagram.com/fly.highconsultancypehowa/",
    label: "Instagram",
    icon: <InstagramIcon />,
    bg: "bg-white", // White background to show the gradient logo
  },
  {
    href: "https://www.facebook.com/p/Flyhigh-Consultancy-Pehowa-61571970445323/",
    label: "Facebook",
    icon: <FaFacebookF />,
    bg: "bg-blue-600",
  },
  {
    href: "https://wa.me/919306142129?text=Hello%20Dear%2C%20how%20can%20I%20help%20you%20with%20FlyHigh%3F",
    label: "WhatsApp",
    icon: <FaWhatsapp size={22} />,
    bg: "bg-[#25D366]",
  },
  {
    href: "tel:+919306142129",
    label: "Call",
    icon: <FiPhone />,
    bg: "bg-orange",
  },
];

const WhatsAppButton = () => {
  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 items-start">
      {items.map((it, i) => (
        <motion.a
          key={it.label}
          href={it.href}
          target={it.href.startsWith("tel") ? "_self" : "_blank"}
          rel="noopener noreferrer"
          aria-label={it.label}
          className={`w-11 h-11 rounded-full ${it.bg} text-white flex items-center justify-center shadow-xl`}
          initial={{ scale: 0, opacity: 0, x: -30 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.15, y: -2 }}
          whileTap={{ scale: 0.92 }}
        >
          {it.icon}
        </motion.a>
      ))}
    </div>
  );
};

export default WhatsAppButton;
