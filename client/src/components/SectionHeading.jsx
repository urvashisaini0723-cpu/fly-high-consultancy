import { motion } from "framer-motion";

const SectionHeading = ({ eyebrow, title, subtitle, align = "center", light = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}
    >
      {eyebrow && (
        <span className="inline-block text-orange font-semibold uppercase tracking-widest text-sm mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-4xl md:text-5xl lg:text-6xl font-bold ${light ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg md:text-xl max-w-3xl ${align === "center" ? "mx-auto" : ""} ${light ? "text-white/80" : "text-navy/70"}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
