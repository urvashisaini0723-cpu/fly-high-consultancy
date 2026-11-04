import { useEffect } from "react";
import SectionHeading from "../components/SectionHeading";
import ContactForm from "../components/ContactForm";
import SEO, { breadcrumbSchema, webPageSchema } from "../components/SEO";
import { motion } from "framer-motion";
import { FiTarget, FiEye, FiHeart } from "react-icons/fi";

const About = () => {
  useEffect(() => { document.title = "About Us | Fly High Consultancy"; }, []);
  return (
    <>
      <SEO
        title="About Fly High Consultancy | Study Abroad Consultant Pehowa"
        description="About Fly High Consultancy, the trusted study abroad & visa consultant in Pehowa, Kurukshetra. Honest guidance, document support and interview preparation for overseas education."
        path="/about"
        schema={[
          webPageSchema(
            "/about",
            "About Fly High Consultancy - Study Abroad Consultant Pehowa",
            "About Fly High Consultancy, the trusted study abroad & visa consultant in Pehowa, Kurukshetra. Honest guidance, document support and interview preparation for overseas education."
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about" },
          ]),
        ]}
      />
      {/* hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-navy to-sky/20 text-white overflow-hidden min-h-[60vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-sky font-semibold tracking-widest uppercase text-sm">Home / About Us</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-4">About Us</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">
            We guide students and travellers from Pehowa to the world.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-sky/30 to-navy/10 border border-sky/20 flex items-center justify-center text-navy/40"
          >
            [Add photo]
          </motion.div>
          <div>
            <SectionHeading title="Our Story / Who We Are" align="left" />
            <p className="text-navy/70 leading-relaxed text-lg">
              Fly High Consultancy is a professional study abroad and tourist visa consultancy based in Pehowa, Kurukshetra. We help students and travellers with document guidance, biometric appointments, language preparation and interview readiness — so every step of the journey feels clear and supported.
            </p>
            <p className="mt-4 text-navy/70 leading-relaxed">
              Our counsellors work with you one-on-one, keeping the process simple, honest and personalised. No fake promises — just guidance that works. [Add more story text later.]
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-navy to-sky rounded-2xl p-10 text-white"
          >
            <FiTarget className="text-4xl text-orange mb-4" />
            <h2 className="font-display text-3xl font-bold">Our Mission</h2>
            <p className="mt-4 text-white/85 leading-relaxed">
              To make going abroad accessible, clear and stress-free through honest guidance and meticulous document support.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange to-gold rounded-2xl p-10 text-white"
          >
            <FiEye className="text-4xl text-white mb-4" />
            <h2 className="font-display text-3xl font-bold">Our Vision</h2>
            <p className="mt-4 text-white/95 leading-relaxed">
              To be the most trusted study-abroad and visa consultancy in the region, helping thousands build global futures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Our Process" title="How we work" />
          <div className="grid md:grid-cols-4 gap-6">
            {["Enquiry", "Counselling", "Documents", "Application & Interview"].map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-sky/20 text-sky font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-display font-bold text-navy">{s}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Values" title="Why Trust Us" />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Integrity", d: "Clear, honest advice — no hidden promises." },
              { t: "Care", d: "You are supported at every step of the process." },
              { t: "Excellence", d: "Thorough document review and mock practice." },
            ].map((v, i) => (
              <motion.div
                key={v.t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-cloud rounded-2xl p-8 border border-navy/5"
              >
                <FiHeart className="text-3xl text-orange mb-3" />
                <h3 className="font-display text-xl font-bold text-navy">{v.t}</h3>
                <p className="mt-2 text-navy/70">{v.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location + map */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeading title="Visit our office" align="left" />
            <p className="text-navy/70 text-lg">
              2nd Floor, Amar Complex, Near New PNB Bank, Pehowa, Kurukshetra, Haryana – 136128
            </p>
            <p className="mt-2 text-navy/70">Mon – Sat: 10:00 AM – 7:00 PM · Sunday closed</p>
          </div>
          <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg border border-sky/20">
            <iframe
              title="Fly High Consultancy location"
              src="https://www.google.com/maps?q=29.9806,76.5814&z=15&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold">Let's start your journey</h2>
        <a href="/contact" className="inline-block mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-orange to-gold text-white font-bold">
          Contact Us
        </a>
      </section>
    </>
  );
};

export default About;
