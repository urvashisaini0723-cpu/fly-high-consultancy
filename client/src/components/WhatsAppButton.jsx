import { motion } from "framer-motion";
import { FiPhone } from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";

const items = [
  {
    href: "https://www.instagram.com/fly.highconsultancypehowa/",
    label: "Instagram",
    icon: <FaInstagram />,
    bg: "bg-gradient-to-br from-pink-500 to-orange-500",
  },
  {
    href: "https://www.facebook.com/p/Flyhigh-Consultancy-Pehowa-61571970445323/",
    label: "Facebook",
    icon: <FaFacebookF />,
    bg: "bg-blue-600",
  },
  {
    href: "https://wa.me/919306142129",
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
      {items.map((it, i) => (
        <motion.a
          key={it.label}
          href={it.href}
          target={it.href.startsWith("tel") ? "_self" : "_blank"}
          rel="noopener noreferrer"
          aria-label={it.label}
          className={`w-12 h-12 rounded-full ${it.bg} text-white flex items-center justify-center shadow-2xl`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
        >
          {it.icon}
        </motion.a>
      ))}
    </div>
  );
};

export default WhatsAppButton;
