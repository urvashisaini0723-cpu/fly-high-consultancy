import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-navy via-[#0e2a52] to-sky/30 flex items-center">
      {/* floating clouds */}
      <motion.div
        className="absolute top-20 left-[5%] text-white/20 text-6xl select-none"
        animate={{ x: [0, 30, 0], y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁
      </motion.div>
      <motion.div
        className="absolute top-40 right-[10%] text-white/15 text-7xl select-none"
        animate={{ x: [0, -40, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-[20%] text-white/10 text-5xl select-none"
        animate={{ x: [0, 25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁
      </motion.div>

      {/* dotted flight path + plane */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
        <motion.path
          d="M -50 400 Q 200 150, 450 300 T 900 250 T 1250 320"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeDasharray="6 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.g
          animate={{ x: [0, 400, 800, 1200], y: [0, -120, -30, -80] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <g transform="translate(50,400) rotate(-15)">
            <path d="M0 0 L30 -8 L34 0 L30 8 Z" fill="#FF7A3D" />
            <path d="M30 0 L45 -3 L45 3 Z" fill="#F5B83D" />
          </g>
        </motion.g>
      </svg>

      {/* hero image */}
      <div className="absolute right-[4%] top-1/2 -translate-y-1/2 w-[460px] hidden lg:block">
        <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
          <img
            src="/hero.webp"
            alt="Fly High Consultancy"
            className="w-full h-[340px] object-cover object-center"
          />
        </div>
      </div>

      {/* content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sky text-sm font-semibold backdrop-blur border border-sky/30">
            ✈ Study Abroad · Tourist Visa · Test Prep
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Your Journey Abroad <br />
            <span className="bg-gradient-to-r from-sky to-orange bg-clip-text text-transparent">
              Starts Here.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            Professional study abroad and tourist visa consultancy with document guidance, biometric support and interview preparation — from Pehowa, for the world.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-orange to-gold text-white font-bold shadow-2xl hover:shadow-orange/50 transition-shadow flex items-center gap-2"
            >
              Get Free Consultation <FiArrowRight />
            </Link>
            <Link
              to="/courses"
              className="px-7 py-3.5 rounded-full border-2 border-sky text-white font-bold hover:bg-sky/10 transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        </motion.div>
      </div>

      {/* bottom wave */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 100" className="w-full h-24" preserveAspectRatio="none">
          <path d="M0,60 C360,120 1080,0 1440,60 L1440,100 L0,100 Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
