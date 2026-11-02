import { useState, useEffect } from "react";
import SectionHeading from "../components/SectionHeading";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

// The 2nd Anniversary poster stays pinned first, as requested.
const galleryItems = [
  {
    src: "/gallery/featured-anniversary.webp",
    alt: "Fly High Consultancy 2nd anniversary celebration image with team photo, cake and the message Two Years of Trust, Growth and New Beginnings",
  },
  {
    src: "/gallery/img1.webp",
    alt: "Happy client showing his approved visa document at the Fly High Consultancy office in Pehowa",
  },
  {
    src: "/gallery/img2.webp",
    alt: "Fly High Consultancy advisors at the front desk of the Pehowa office with a laptop and globe",
  },
  {
    src: "/gallery/img3.webp",
    alt: "Group photo of Fly High Consultancy staff and clients at the Pehowa office",
  },
  {
    src: "/gallery/img4.webp",
    alt: "Two Fly High Consultancy clients holding their documents in front of a world travel mural",
  },
  {
    src: "/gallery/img5.webp",
    alt: "Fly High Consultancy client and advisor with approved documents at the office",
  },
  {
    src: "/gallery/img6.webp",
    alt: "UK study visa approval poster for Amandeep from Cheeka with a group photo and Fly High Consultancy contact details",
  },
  {
    src: "/gallery/img7.webp",
    alt: "Europe Schengen visa approval poster for Rupinder Singh from Rampur Patala after his move to Spain",
  },
  {
    src: "/gallery/img8.webp",
    alt: "Fly High Consultancy PTE student celebrating a 7 band score and 69 PTE score",
  },
  {
    src: "/gallery/img9.webp",
    alt: "UK study visa success poster for Amandeep from Cheeka, celebrating with the Fly High Consultancy team",
  },
  {
    src: "/gallery/img10.webp",
    alt: "Fly High Consultancy team and clients celebrating a client success at the Pehowa office",
  },
  {
    src: "/gallery/img11.webp",
    alt: "Fly High Consultancy client receiving his approved documents from the team",
  },
  {
    src: "/gallery/img12.webp",
    alt: "Group celebration with the Fly High Consultancy team and clients at the Pehowa office",
  },
  {
    src: "/gallery/img13.webp",
    alt: "Fly High Consultancy team with a client holding his approved visa documents",
  },
  {
    src: "/gallery/img14.webp",
    alt: "Fly High Consultancy advisors handing over approved documents to a client",
  },
  {
    src: "/gallery/img15.webp",
    alt: "Happy client showing his approved documents with the Fly High Consultancy team",
  },
  {
    src: "/gallery/img16.webp",
    alt: "Fly High Consultancy team at an education and immigration partners event",
  },
  {
    src: "/gallery/img17.webp",
    alt: "Fly High Consultancy representative meeting an education partner at a conference",
  },
  {
    src: "/gallery/img18.webp",
    alt: "Fly High Consultancy team with a client holding her documents at the office",
  },
  {
    src: "/gallery/img19.webp",
    alt: "Fly High Consultancy team and students celebrating on a rooftop with the Indian flag",
  },
  {
    src: "/gallery/img20.webp",
    alt: "Fly High Consultancy team receiving a certificate at an education partners event",
  },
  {
    src: "/gallery/img21.webp",
    alt: "Fly High Consultancy client with his passport and approved visa document",
  },
  {
    src: "/gallery/img22.webp",
    alt: "Happy Fly High Consultancy client holding his approved visa and giving a thumbs up",
  },
  {
    src: "/gallery/img23.webp",
    alt: "Fly High Consultancy team and a client with her approved documents in Pehowa",
  },
];

const Gallery = () => {
  const [activeIdx, setActiveIdx] = useState(null);
  useEffect(() => { document.title = "Gallery | Fly High Consultancy"; }, []);

  const close = () => setActiveIdx(null);
  const prev = (e) => { e?.stopPropagation(); setActiveIdx((i) => (i + galleryItems.length - 1) % galleryItems.length); };
  const next = (e) => { e?.stopPropagation(); setActiveIdx((i) => (i + 1) % galleryItems.length); };

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
            {galleryItems.map(({ src, alt }, i) => (
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
                  alt={alt}
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
              src={galleryItems[activeIdx].src}
              alt={galleryItems[activeIdx].alt}
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
