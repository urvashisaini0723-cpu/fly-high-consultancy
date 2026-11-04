import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import StatsCounter from "../components/StatsCounter";
import CountryCard from "../components/CountryCard";
import ContactForm from "../components/ContactForm";
import DreamCountrySection from "../components/dream/DreamCountrySection";
import SEO, { breadcrumbSchema, webPageSchema } from "../components/SEO";
import { services, stats } from "../data/services";
import { countries } from "../data/countries";
import { owners } from "../data/team";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

const visaDocs = [
  "Passport & photographs",
  "Bank statements & financial proof",
  "ITR / tax documents",
  "Employment or business proof",
  "Travel purpose & itinerary",
  "Invitation / sponsor documents",
  "Previous visa / travel history",
];

const studySteps = [
  "Counselling",
  "Country Selection",
  "Documents",
  "SOP",
  "Application",
  "Interview Prep",
];

const Home = () => {
  useEffect(() => { document.title = "Fly High Consultancy | Study Abroad & Visa Experts in Pehowa"; }, []);
  return (
    <>
      <SEO
        title="Fly High Consultancy | Study Abroad & Visa Experts in Pehowa"
        description="Best study abroad & tourist visa consultancy in Pehowa. Canada, Australia, UK, USA, New Zealand & Europe visas, IELTS/PTE coaching, interview guidance & free consultation."
        path="/"
        schema={[
          webPageSchema(
            "/",
            "Fly High Consultancy - Study Abroad & Visa Experts in Pehowa",
            "Best study abroad & tourist visa consultancy in Pehowa. Canada, Australia, UK, USA, New Zealand & Europe visas, IELTS/PTE coaching, interview guidance & free consultation."
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
          ]),
        ]}
      />
      <Hero />

      {/* Stats */}
      <section className="py-20 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <StatsCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="What we do"
            title="Six Core Services"
            subtitle="End-to-end guidance for your abroad journey."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Tourist Visa */}
      <section className="py-24 bg-gradient-to-b from-navy to-[#122a4d] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              eyebrow="Tourist Visa"
              title="Documents we help you with"
              subtitle="We verify and organise the paperwork that matters most."
              align="left"
              light
            />
            <ul className="space-y-3 mt-4">
              {visaDocs.map((d, i) => (
                <motion.li
                  key={d}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <FiCheckCircle className="text-[#0F766E] text-2xl shrink-0" aria-hidden="true" />
                  <span className="text-lg">{d}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/hero.webp"
                alt="Two Fly High Consultancy advisors at the front desk of the Pehowa office"
                width="600"
                height="360"
                loading="lazy"
                decoding="async"
                className="w-full h-[360px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent flex items-end p-6">
                <div>
                  <div className="text-sky font-display text-xl font-bold">YOUR JOURNEY ABROAD</div>
                  <div className="text-white/80 text-sm mt-1">Professional visa & study abroad guidance</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Study Abroad timeline */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Study Abroad"
            title="Your journey, step by step"
          />
          <div className="flex flex-wrap justify-center gap-4 md:gap-2 items-center">
            {studySteps.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="px-5 py-3 rounded-full bg-navy text-white font-semibold shadow-md">
                  {i + 1}. {s}
                </div>
                {i < studySteps.length - 1 && (
                  <span className="text-sky text-2xl hidden md:inline">→</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Your Dream Country — interactive quiz */}
      <DreamCountrySection />

      {/* Popular Countries marquee */}
      <section id="popular-countries" className="py-24 bg-white overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading
            eyebrow="Destinations"
            title="Popular Countries"
            subtitle="Select a country to see Tourist Visa and Study Visa guidance."
          />
        </div>
        <div className="relative">
          <div className="flex gap-6 animate-marquee w-max">
            {[...countries, ...countries].map((c, i) => (
              <CountryCard key={i} country={c} index={i} decorative={i >= countries.length} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-24 bg-gradient-to-b from-sky/10 to-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Why us" title="Why Choose Fly High" />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Trusted Guidance", d: "Honest, transparent advice tailored to your profile and goals." },
              { t: "Document Focused", d: "Meticulous document checking so your application is complete." },
              { t: "Personalized Support", d: "One-on-one counselling from enquiry to departure." },
            ].map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="font-display text-2xl font-bold text-navy">{f.t}</h3>
                <p className="mt-3 text-navy/70">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Owners preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Leadership" title="Meet the Leaders Behind Fly High" subtitle="The people driving our mission of honest, personal guidance." />
          <div className="grid md:grid-cols-3 gap-8">
            {owners.map((o, i) => (
              <motion.div
                key={o.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-cloud rounded-2xl p-6 shadow-md border border-navy/5"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-sky to-navy text-white flex items-center justify-center text-2xl font-bold">
                  {o.image ? (
                    <img src={o.image} alt={`${o.name}, ${o.role} at Fly High Consultancy`} width="64" height="64" loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                  ) : (
                    o.name.charAt(0)
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-navy">{o.name}</h3>
                <p className="text-orange text-sm font-semibold">{o.role}</p>
                <p className="mt-3 text-navy/70 text-sm line-clamp-3">{o.bio}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/owner" className="inline-block px-7 py-3 rounded-full bg-gradient-to-r from-orange to-gold text-white font-bold shadow-lg">
              Meet the full team
            </Link>
          </div>
        </div>
      </section>

      {/* CTA banner + quick form */}
      <section className="py-24 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Let's discuss your visa requirements
            </h2>
            <p className="mt-4 text-white/70 text-lg">
              Drop a quick enquiry and our counsellor will reach out.
            </p>
          </div>
          <ContactForm compact />
        </div>
      </section>
    </>
  );
};

export default Home;
