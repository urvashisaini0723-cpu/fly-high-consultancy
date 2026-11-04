import { useEffect } from "react";
import SectionHeading from "../components/SectionHeading";
import TeamCard from "../components/TeamCard";
import SEO, { breadcrumbSchema, webPageSchema } from "../components/SEO";
import { owners, team, ownerMessage } from "../data/team";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const BASE_URL = "https://fly-high-consultancy.vercel.app";

const Owner = () => {
  useEffect(() => { document.title = "Meet the Leaders Behind Fly High | Fly High Consultancy"; }, []);
  return (
    <>
      <SEO
        title="Meet the Team | Fly High Consultancy Owners Pehowa"
        description="Meet the leaders behind Fly High Consultancy Pehowa. Our managing directors and team provide honest study abroad & visa guidance with personalised support."
        path="/owner"
        schema={[
          webPageSchema(
            "/owner",
            "Meet the Team - Fly High Consultancy Owners Pehowa",
            "Meet the leaders behind Fly High Consultancy Pehowa. Our managing directors and team provide honest study abroad & visa guidance with personalised support."
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Owner", path: "/owner" },
          ]),
          ...owners.map((o) => ({
            "@context": "https://schema.org",
            "@type": "Person",
            name: o.name,
            jobTitle: o.role,
            description: o.bio,
            image: o.image ? `${BASE_URL}${o.image}` : null,
            worksFor: {
              "@type": "Organization",
              name: "Fly High Consultancy",
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Pehowa",
              addressRegion: "Kurukshetra",
              addressCountry: "IN",
            },
          })),
        ]}
      />
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-navy to-sky/20 text-white min-h-[50vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-sky font-semibold tracking-widest uppercase text-sm">Home / Owner</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-4">Meet the Leaders Behind Fly High</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">
            The people driving our mission of honest, personal guidance.
          </p>
        </div>
      </section>

      {/* Owners alternating */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-20">
          {owners.map((o, i) => (
            <motion.div
              key={o.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`grid md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}
            >
              <div className="md:[direction:ltr] aspect-[4/3] rounded-2xl overflow-hidden border border-sky/20 bg-gradient-to-br from-sky/30 to-navy/10 flex items-center justify-center text-navy/40">
                {o.image ? (
                  <img src={o.image} alt={`${o.name}, ${o.role} at Fly High Consultancy`} width="400" height="300" loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                ) : (
                  "[Add photo]"
                )}
              </div>
              <div className="md:[direction:ltr]">
                <h3 className="font-display text-4xl font-bold text-navy">{o.name}</h3>
                <p className="text-[#C2410C] font-semibold mt-1">{o.role}</p>
                <p className="mt-4 text-navy/70 leading-relaxed text-lg">{o.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Our Team" title="The people behind the scenes" />
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((m) => (
              <TeamCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* Message */}
      <section className="py-24 bg-gradient-to-b from-navy to-sky/20 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <FaQuoteLeft className="text-5xl text-sky mx-auto mb-6" />
          <p className="font-display text-2xl md:text-3xl italic leading-relaxed">
            "{ownerMessage}"
          </p>
          <p className="mt-6 text-[#C2410C] font-semibold">— The Founders, Fly High Consultancy</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold">Ready to fly high?</h2>
        <a href="/contact" className="inline-block mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-orange to-gold text-white font-bold">
          Get in touch
        </a>
      </section>
    </>
  );
};

export default Owner;
