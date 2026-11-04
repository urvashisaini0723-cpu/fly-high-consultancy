import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const StatsCounter = ({ value, suffix = "", label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || value === null) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {};
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className="font-display text-5xl md:text-6xl font-extrabold text-[#0284C7]">
        {value === null ? "Expert" : `${count}${suffix}`}
      </div>
      <div className="mt-2 text-navy/70 font-medium">{label}</div>
    </motion.div>
  );
};

export default StatsCounter;
