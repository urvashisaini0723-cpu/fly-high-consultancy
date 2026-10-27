import { useState, useEffect } from "react";
import SectionHeading from "../components/SectionHeading";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const galleryImages = Array.from({ length: 24 }, (_, i) => `/gallery/img${i + 1}.jpg`);

const Gallery = () => {
  const [activeIdx, setActiveIdx] = useState(null);
  useEffect(() => { document.title = "Gallery | Fly High Consultancy"; }, []);

  const close = () => setActiveIdx(null);
  const prev = (e) => { e?.stopPropagation(); setActiveIdx((i) => (i + galleryImages.length - 1) % galleryImages.length); };
  const next = (e) => { e?.stopPropagation(); setActiveIdx((i) => (i + 1) % galleryImages.length); };

  useEffect(() => {
    if (activeIdx === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx]);

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-navy to-sky/20 text-white min-h-[50vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-sky font-semibold tracking-widest uppercase text-sm">Home / Gallery</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-4">Gallery</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">
            Moments from our office, counselling sessions and client journeys.
          </p>
        </div>
      </section>

      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Moments" title="Photo Gallery" />
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {galleryImages.map((src, i) => (
              <motion.button
                key={src}
                type="button"
                onClick={() => setActiveIdx(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.05 }}
                className="block w-full break-inside-avoid mb-4 overflow-hidden rounded-2xl shadow-lg bg-white"
              >
                <img
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  loading="lazy"
                  className="w-full h-auto"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.img
              key={activeIdx}
              src={galleryImages[activeIdx]}
              alt={`Gallery ${activeIdx + 1}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={close}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/20 text-white text-2xl flex items-center justify-center hover:bg-white/40"
              aria-label="Close"
            >
              <FiX />
            </button>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 text-white text-3xl flex items-center justify-center hover:bg-white/40"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 text-white text-3xl flex items-center justify-center hover:bg-white/40"
              aria-label="Next"
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;
