import { useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "react-icons/fi";

const TeamCard = ({ member, flip = false }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="perspective-1000 cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-72"
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky to-navy flex flex-col items-center justify-center text-white p-6 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-4xl font-display font-bold mb-4">
            {member.name.charAt(0)}
          </div>
          <h4 className="font-display text-xl font-bold">{member.name}</h4>
          <p className="text-white/80 text-sm mt-1">{member.role}</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-white border border-sky/20 p-6 flex flex-col justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h4 className="font-display text-xl font-bold text-navy">{member.name}</h4>
          <p className="text-orange text-sm font-semibold">{member.role}</p>
          <p className="mt-3 text-navy/70 text-sm leading-relaxed">{member.desc}</p>
          <div className="mt-4 flex gap-3 text-sky">
            <Icons.FiLinkedin size={18} />
            <Icons.FiInstagram size={18} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeamCard;
