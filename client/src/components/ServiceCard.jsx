import { useRef, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "react-icons/fi";

const ServiceCard = ({ service, index }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const Icon = Icons[service.icon] || Icons.FiStar;

  const handleMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 12, y: x * -12 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-sky/10"
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky to-teal flex items-center justify-center text-white text-3xl mb-6"
        whileHover={{ rotate: 8, scale: 1.05 }}
      >
        <Icon />
      </motion.div>
      <h3 className="font-display text-2xl font-bold text-navy">{service.title}</h3>
      <p className="mt-3 text-navy/70 leading-relaxed">{service.desc}</p>
      <div className="mt-6 h-1 w-12 bg-gradient-to-r from-orange to-gold rounded-full group-hover:w-24 transition-all duration-300" />
    </motion.div>
  );
};

export default ServiceCard;
