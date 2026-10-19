import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiPhone, FiMail, FiMessageSquare, FiSend, FiCheck, FiAlertCircle } from "react-icons/fi";

const INTERESTS = [
  "Tourist Visa",
  "Study Abroad",
  "Document Checking",
  "Biometric Guidance",
  "IELTS / PTE",
  "Interview Preparation",
];

const ContactForm = ({ compact = false }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.interest) {
      setStatus("error");
      setErrorMsg("Please select your interest.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setForm({ name: "", phone: "", email: "", interest: "", message: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="boarding-pass p-6 md:p-8">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto rounded-full bg-teal text-white flex items-center justify-center text-4xl"
            >
              <FiCheck />
            </motion.div>
            <h3 className="mt-6 font-display text-2xl font-bold text-navy">
              Enquiry Sent!
            </h3>
            <p className="mt-2 text-navy/70">
              Thank you! We will contact you shortly.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 px-6 py-2 rounded-full bg-sky text-white font-semibold"
            >
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    placeholder="Your name"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-navy/20 focus:border-sky focus:ring-2 focus:ring-sky/30 outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-navy/20 focus:border-sky focus:ring-2 focus:ring-sky/30 outline-none bg-white"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-navy/20 focus:border-sky focus:ring-2 focus:ring-sky/30 outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Select Your Interest</label>
              <select
                name="interest"
                value={form.interest}
                onChange={onChange}
                required
                className="w-full px-3 py-3 rounded-xl border border-navy/20 focus:border-sky focus:ring-2 focus:ring-sky/30 outline-none bg-white"
              >
                <option value="">-- Select --</option>
                {INTERESTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Message</label>
              <div className="relative">
                <FiMessageSquare className="absolute left-3 top-3 text-navy/40" />
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={compact ? 3 : 4}
                  placeholder="Tell us about your plans..."
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-navy/20 focus:border-sky focus:ring-2 focus:ring-sky/30 outline-none bg-white resize-none"
                />
              </div>
            </div>
            <p className="text-xs text-navy/60">Your information is safe with us.</p>
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <FiAlertCircle />
                {errorMsg}
              </div>
            )}
            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange to-gold text-white font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {status === "loading" ? (
                "Sending..."
              ) : (
                <>
                  Send Enquiry <FiSend />
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactForm;
