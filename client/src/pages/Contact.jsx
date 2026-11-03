import { useEffect } from "react";
import SectionHeading from "../components/SectionHeading";
import ContactForm from "../components/ContactForm";
import SEO, { breadcrumbSchema, webPageSchema } from "../components/SEO";
import { motion } from "framer-motion";
import { FiMapPin, FiPhone, FiMail, FiClock, FiInstagram, FiFacebook } from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";

const BASE_URL = "https://fly-high-consultancy.vercel.app";

const Contact = () => {
  useEffect(() => { document.title = "Contact Us | Fly High Consultancy"; }, []);
  return (
    <>
      <SEO
        title="Contact Fly High Consultancy Pehowa | Free Visa Consultation"
        description="Contact Fly High Consultancy in Pehowa for study abroad & tourist visa guidance. Visit our office near New PNB Bank or call +91 93061 42129 for free consultation."
        path="/contact"
        schema={[
          webPageSchema(
            "/contact",
            "Contact Fly High Consultancy Pehowa",
            "Contact Fly High Consultancy in Pehowa for study abroad & tourist visa guidance. Visit our office near New PNB Bank or call +91 93061 42129 for free consultation."
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ContactPoint",
            telephone: "+919306142129",
            contactType: "customer service",
            availableLanguage: ["English", "Hindi"],
            areaServed: "Pehowa, Kurukshetra, Haryana",
          },
        ]}
      />
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-navy to-sky/20 text-white min-h-[50vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-sky font-semibold tracking-widest uppercase text-sm">Home / Contact</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-4">Let's Talk About Your Journey</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">
            Reach out and our counsellor will guide you.
          </p>
        </div>
      </section>

      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12">
          {/* form */}
          <div>
            <SectionHeading title="Send us an enquiry" align="left" />
            <ContactForm />
          </div>
          {/* details */}
          <div>
            <SectionHeading title="Contact details" align="left" />
            <div className="space-y-5">
              <div className="flex gap-3 items-start">
                <FiMapPin className="text-orange text-2xl shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-navy">Address</div>
                  <p className="text-navy/70">2nd Floor, Amar Complex, Near New PNB Bank, Pehowa, Kurukshetra, Haryana – 136128</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <FiPhone className="text-orange text-2xl shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-navy">Phone</div>
                  <a href="tel:+919306142129" className="text-sky hover:underline">+91 93061 42129</a>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <FiMail className="text-orange text-2xl shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-navy">Email</div>
                  <a href="mailto:urvashisaini0723@gmail.com" className="text-sky hover:underline">urvashisaini0723@gmail.com</a>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <FaWhatsapp className="text-[#25D366] text-2xl shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-navy">WhatsApp</div>
                  <a href="https://wa.me/919306142129" target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <FiClock className="text-orange text-2xl shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-navy">Office Hours</div>
                  <p className="text-navy/70">Monday – Saturday, 10:00 AM – 7:00 PM · Sunday closed</p>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <a href="https://www.instagram.com/fly.highconsultancypehowa/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-navy/5 flex items-center justify-center text-navy hover:bg-sky hover:text-white transition-colors">
                  <FaInstagram />
                </a>
                <a href="https://www.facebook.com/p/Flyhigh-Consultancy-Pehowa-61571970445323/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-navy/5 flex items-center justify-center text-navy hover:bg-sky hover:text-white transition-colors">
                  <FaFacebookF />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h3 className="font-display text-2xl font-bold text-navy mb-4">Find us on the map</h3>
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border border-sky/20">
            <iframe
              title="Fly High Consultancy map"
              src="https://www.google.com/maps?q=29.9806,76.5814&z=15&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=29.9806,76.5814"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-orange to-gold text-white font-semibold"
          >
            Get Directions
          </a>
        </div>
      </section>

      <section className="py-16 bg-navy text-center text-white/70 text-sm">
        <p className="italic max-w-3xl mx-auto px-4">
          General guidance only. Visa decisions are made by the relevant authorities. For the latest rules, please visit the official government or embassy website of the country.
        </p>
      </section>
    </>
  );
};

export default Contact;
