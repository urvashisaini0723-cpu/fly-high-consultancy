import { motion } from "framer-motion";

const Loader = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy"
      role="status"
      aria-live="polite"
      aria-label="Loading Fly High Consultancy"
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      <div className="flex flex-col items-center gap-6">
        <svg viewBox="0 0 200 80" className="w-56 h-24" aria-hidden="true">
          <motion.path
            d="M10 60 Q 50 15, 100 40 T 190 25"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="5 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.g
            animate={{ x: [0, 45, 90, 135, 180], y: [0, -15, 5, -10, -5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M0 0 L18 -6 L22 0 L18 6 Z"
              fill="#FF7A3D"
              transform="translate(0,40) rotate(-15)"
            />
          </motion.g>
        </svg>
        <motion.p
          className="text-white font-display text-lg tracking-widest"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          FLY HIGH...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Loader;
