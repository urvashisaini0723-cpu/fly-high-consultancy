import { motion } from "framer-motion";
import { FiPhone } from "react-icons/fi";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";

// Instagram logo using actual image
const InstagramIcon = () => (
  <img 
    src="/instagram-logo.jpeg" 
    alt="Instagram" 
    className="w-full h-full object-cover rounded-lg"
    style={{ width: "20px", height: "20px" }}
  />
);

const items = [
  {
    href: "https://www.instagram.com/fly.highconsultancypehowa/",
    label: "Instagram",
    icon: <InstagramIcon />,
    bg: "bg-white",
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
