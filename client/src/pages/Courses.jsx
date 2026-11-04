import { useState, useEffect } from "react";
import SectionHeading from "../components/SectionHeading";
import ContactForm from "../components/ContactForm";
import SEO, { breadcrumbSchema, webPageSchema } from "../components/SEO";
import { courses } from "../data/courses";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";

const BASE_URL = "https://fly-high-consultancy.vercel.app";

const learningSteps = ["Enroll", "Learn", "Practice", "Mock Test", "Ready"];

const faqs = [
  { q: "Do you have fixed batches?", a: "We offer regular and flexible batches. Contact us for current timings." },
  { q: "Are there demo classes?", a: "Yes, you can attend a demo class before enrolling. Visit our office." },
  { q: "Is fees affordable?", a: "Our fees are affordable. Visit our office or enquire for details." },
  { q: "Do you provide study material?", a: "Yes, complete study material is provided with each course." },
  { q: "Is interview prep included?", a: "Interview Preparation is available as a separate course and can be bundled." },
];

const Courses = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [openCourse, setOpenCourse] = useState(null);
  useEffect(() => { document.title = "Study Abroad & Training Courses | Fly High Consultancy"; }, []);

  return (
    <>
      <SEO
        title="IELTS & PTE Coaching Pehowa | Language Training Courses"
        description="IELTS, PTE & spoken English coaching in Pehowa. Affordable language training with mock tests, interview preparation and study abroad support. Enquire now."
        path="/courses"
        schema={[
          webPageSchema(
            "/courses",
            "IELTS & PTE Coaching Pehowa - Language Training Courses",
            "IELTS, PTE & spoken English coaching in Pehowa. Affordable language training with mock tests, interview preparation and study abroad support. Enquire now."
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" },
          ]),
          ...courses.map((c) => ({
            "@context": "https://schema.org",
            "@type": "Course",
            name: c.title,
            description: c.desc,
            provider: {
              "@type": "Organization",
              name: "Fly High Consultancy",
            },
            url: `${BASE_URL}/courses`,
            educationalLevel: "Intermediate",
            coursePrerequisites: "None",
          })),
        ]}
      />
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-navy to-sky/20 text-white min-h-[50vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-sky font-semibold tracking-widest uppercase text-sm">Home / Courses</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-4">Language & Interview Training</h1>
          <p className="mt-4 text-white/80 text-lg max-w-2xl">
            Affordable fees. Visit our office for details.
          </p>
        </div>
      </section>

      {/* Course cards */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Courses" title="Choose your program" />
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {courses.map((c, i) => {
              const Icon = Icons[c.icon] || Icons.FiBook;
              const isOpen = openCourse === c.id;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl shadow-lg border border-sky/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenCourse(isOpen ? null : c.id)}
                    className="w-full text-left p-8 flex items-center gap-4 hover:bg-sky/5 transition-colors"
                  >
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-orange to-gold flex items-center justify-center text-white text-3xl">
                      <Icon />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-2xl font-bold text-navy">{c.title}</h2>
                      <p className="mt-1 text-navy/70">{c.desc}</p>
                      <p className="mt-2 text-[#0284C7] font-semibold text-sm">
                        {isOpen ? "Hide details ▲" : "Click to view modules ▼"}
                      </p>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6">
                          <h3 className="font-display font-bold text-navy mb-3">Modules / What you'll learn</h3>
                          <ul className="space-y-2">
                            {c.learn.map((l) => (
                              <li key={l} className="flex items-start gap-2 text-sm text-navy/80">
                                <span className="text-[#0F766E] mt-0.5">✓</span>
                                {l}
                              </li>
                            ))}
                          </ul>
                          <a
                            href="/contact"
                            className="mt-6 inline-block text-center px-6 py-3 rounded-full bg-gradient-to-r from-sky to-teal text-white font-semibold shadow hover:shadow-lg"
                          >
                            Enquire Now
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why learn with us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="Why us" title="Why learn with Fly High" />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Well-trained trainers", d: "Experienced faculty focused on results." },
              { t: "Affordable fees", d: "Quality coaching at pocket-friendly pricing." },
              { t: "Practice sessions", d: "Regular mocks, speaking practice and feedback." },
            ].map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-cloud rounded-2xl p-8"
              >
                <h3 className="font-display text-xl font-bold text-navy">{f.t}</h3>
                <p className="mt-2 text-navy/70">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning journey */}
      <section className="py-24 bg-gradient-to-b from-navy to-[#122a4d] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <SectionHeading eyebrow="Journey" title="Your learning journey" light />
          <div className="flex flex-wrap justify-center gap-4 items-center">
            {learningSteps.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="px-6 py-3 rounded-full bg-white/10 border border-sky/30 backdrop-blur font-semibold">
                  {s}
                </div>
                {i < learningSteps.length - 1 && <span className="text-[#0284C7] text-2xl">→</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-cloud">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <SectionHeading eyebrow="FAQ" title="Frequently asked" />
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-5 py-4 text-left"
                >
                  <span className="font-semibold text-navy">{f.q}</span>
                  <FiChevronDown
                    className={`transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-navy/70">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + enquiry */}
      <section className="py-24 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Let's discuss your goals</h2>
            <p className="mt-4 text-white/70 text-lg">Enquire now and start your preparation journey.</p>
          </div>
          <ContactForm compact />
        </div>
      </section>
    </>
  );
};

export default Courses;
