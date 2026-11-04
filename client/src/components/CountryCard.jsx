import { motion } from "framer-motion";

const CountryCard = ({ country, index, decorative = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="min-w-[200px] bg-white rounded-2xl p-6 shadow-md border border-sky/10 flex flex-col items-center text-center"
      aria-hidden={decorative || undefined}
    >
      <span className="text-5xl">{country.flag}</span>
      <h3 className="mt-4 font-display text-lg font-bold text-navy">{country.name}</h3>
      <p className="mt-1 text-sm text-navy/60">{country.note}</p>
    </motion.div>
  );
};

export default CountryCard;
