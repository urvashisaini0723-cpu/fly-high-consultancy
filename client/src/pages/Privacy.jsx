import { useEffect } from "react";
import { Link } from "react-router-dom";
import SEO, { breadcrumbSchema, webPageSchema } from "../components/SEO";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Fly High Consultancy";
  }, []);

  return (
    <>
      <SEO
        title="Privacy Policy | Fly High Consultancy"
        description="How Fly High Consultancy collects, uses and protects the personal details you share through our website — enquiry form and Find Your Dream Country quiz."
        path="/privacy"
        schema={[
          webPageSchema(
            "/privacy",
            "Privacy Policy | Fly High Consultancy",
            "How Fly High Consultancy collects, uses and protects the personal details you share through our website."
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy" },
          ]),
        ]}
      />

      <section className="relative bg-navy pt-32 pb-16 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <p className="text-sky font-semibold tracking-widest uppercase text-sm">Home / Privacy</p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold">Privacy Policy</h1>
          <p className="mt-3 text-white/70 max-w-2xl">
            How Fly High Consultancy handles the personal details you share with us. Last updated: November 2026.
          </p>
        </div>
      </section>

      <section className="py-16 bg-cloud">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-8 text-navy/85 leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">1. What we collect</h2>
            <p className="mt-2">
              When you submit our contact or counselling enquiry forms (including the "Find Your Dream Country" quiz),
              we collect only what you type or select: your name, phone number, email, city/state, preferred contact
              method, quiz answers, academic details and any message you choose to add. We do not collect payment
              details through this website and we do not run third-party advertising trackers.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-navy">2. Why we collect it</h2>
            <p className="mt-2">
              Solely so our counsellors can respond to your enquiry — assess your profile, suggest destinations, courses
              and next steps, and contact you on your preferred channel. Quiz answers are used only to generate your
              preliminary recommendations and to help the counsellor understand your goals.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-navy">3. How it is processed and stored</h2>
            <p className="mt-2">
              Enquiries are sent directly to our counselling desk by email through our configured delivery provider, and
              a copy is recorded on our server for follow-up. We do not sell, rent or publicly share your personal
              details. Data may be processed only by the email/infrastructure providers required to deliver your message
              to us.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-navy">4. Your choices</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>You may ask us to delete the enquiry we hold about you at any time.</li>
              <li>You may ask what we hold about you and correct it.</li>
              <li>You may withdraw consent to be contacted — we will stop outreach related to that enquiry.</li>
              <li>Ticking the consent box on a form is required before we store or use your details.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these, call or WhatsApp <a href="tel:+919306142129" className="text-sky font-semibold hover:underline">+91 93061 42129</a> or
              email <a href="mailto:urvashisaini0723@gmail.com" className="text-sky font-semibold hover:underline">urvashisaini0723@gmail.com</a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-navy">5. Retention</h2>
            <p className="mt-2">
              We keep enquiry records only as long as needed to follow up with you, support any application you pursue
              with us, and meet legal or record-keeping obligations. Where no longer needed, details are deleted on
              request or during periodic clean-ups.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-navy">6. Security</h2>
            <p className="mt-2">
              We restrict access to enquiry data to authorised team members. No system is perfectly secure, but we apply
              reasonable technical and organisational measures to protect your information, and we encourage you never to
              share passwords, OTPs or payment details with us or anyone else.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-navy">7. Children</h2>
            <p className="mt-2">
              If you are under 18, please submit the form together with a parent or guardian, or ask them to contact us.
            </p>
          </div>

          <div className="rounded-2xl border border-navy/15 bg-white p-5">
            <h2 className="font-display text-lg font-bold text-navy">Questions?</h2>
            <p className="mt-1 text-sm">
              Fly High Consultancy · 2nd Floor, Amar Complex, Near New PNB Bank, Pehowa, Kurukshetra, Haryana – 136128<br />
              Phone / WhatsApp: <a href="tel:+919306142129" className="text-sky font-semibold hover:underline">+91 93061 42129</a><br />
              Email: <a href="mailto:urvashisaini0723@gmail.com" className="text-sky font-semibold hover:underline">urvashisaini0723@gmail.com</a><br />
              Hours: Monday–Saturday, 10:00 AM – 7:00 PM
            </p>
            <Link to="/contact" className="mt-3 inline-block rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-[#122a4d] transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Privacy;
