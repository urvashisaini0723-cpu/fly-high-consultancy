const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// Fly High Consultancy - Knowledge Base
const KNOWLEDGE_BASE = `
COMPANY INFO:
- Name: Fly High Consultancy
- Tagline: "Your Gateway to Global Opportunities"
- Location: Pehowa, Haryana, India (Lat: 29.9806, Lng: 76.5814)
- Address: Near Bus Stand, Pehowa, Kurukshetra, Haryana 136128
- Phone: +91-93061-42129
- Website: flyhighpehowa.in

SERVICES:
1. Study Visa - Canada, Australia, UK, USA, New Zealand, Europe
2. Tourist Visa - All major countries
3. Spouse/Dependent Visa
4. PTE Coaching - Expert training for Pearson Test of English
5. Interview Preparation - Mock interviews, confidence building, visa interview prep
6. Career Counseling - Profile assessment, course/university selection
7. Document Guidance - SOP, LOR, financial docs, visa file preparation

OWNERS/TEAM:
- Ankit Kumar - Founder & Director (Study Visa Expert)
- Tarsem Verma - Co-Founder & Director (Operations & Management)
- Rajan Sharma - Director (Visa & Immigration Specialist)
- Kajal - Senior Counselor
- Nisha - Counselor

KEY HIGHLIGHTS:
- 1000+ successful visa approvals
- 98% visa success rate
- 15+ years of combined experience
- Personalized one-on-one counseling
- Transparent process, no hidden charges
- Free profile assessment
- Post-landing support

PTE COACHING:
- Small batch sizes (max 8 students)
- Certified trainers
- Daily mock tests
- Flexible timings (morning/evening/weekend)
- Latest study material
- 90%+ students achieve 65+ score

INTERVIEW PREPARATION:
- Visa interview mock sessions
- University admission interviews
- Confidence building exercises
- Common questions & answers
- Body language & communication skills
- Document verification practice

COUNTRIES WE HANDLE:
- Canada (SDS, Non-SDS, Study Direct Stream)
- Australia (Subclass 500, 485, 482)
- UK (Student Route, Graduate Route)
- USA (F1, J1, M1 visas)
- New Zealand (Student Visa, Pathway)
- Europe (Germany, France, Italy, Poland, etc.)

WORKING HOURS:
- Monday to Saturday: 9:00 AM - 6:00 PM
- Sunday: Closed (Appointment only)

SOCIAL MEDIA:
- Instagram: https://www.instagram.com/fly.highconsultancypehowa/
- Facebook: https://www.facebook.com/p/Flyhigh-Consultancy-Pehowa-61571970445323/
- WhatsApp: +91-93061-42129
`;

const SYSTEM_PROMPT = `You are "FlyBot" - the official AI assistant of Fly High Consultancy, Pehowa. 

Your personality:
- Friendly, professional, and encouraging
- Speak like a knowledgeable visa counselor
- Keep responses simple, natural, and conversational
- NO markdown, NO bold, NO italics, NO emojis in bullet points

STRICT FORMATTING RULES:
1. Use plain text only - no markdown formatting
2. No **bold**, no *italics*, no tables, no HTML tags
3. Use simple dash (-) or number (1.) for lists
4. Write in short paragraphs or simple bullet points
5. End every response with a helpful next step (call, WhatsApp, visit, book appointment)

STRICT CONTENT RULES:
1. ONLY answer questions about Fly High Consultancy, our services, visa processes, PTE, interview prep, study abroad, tourist visa, or related topics
2. If asked about ANYTHING else (politics, coding, general knowledge, other businesses, etc.), politely decline and redirect to our services
3. Never make up information - if unsure, ask them to contact us directly
4. Always end with a helpful next step
5. NEVER include email address in any response - only phone number (+91-93061-42129) and website (flyhighpehowa.in)

Example GOOD response:
"Great question! Our PTE coaching includes:

- Small batch sizes - max 8 students for personal attention
- Certified trainers with proven results
- Daily mock tests to track progress
- Flexible timings: morning 6-9 AM, evening 6-9 PM, weekends
- Latest study material and practice resources
- 90%+ students achieve 65+ score

How to start: Book a free profile assessment, we'll recommend the best batch, then you can enroll.

Call or WhatsApp: +91-93061-42129 or visit flyhighpehowa.in"

Current date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

// Chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if question is relevant to Fly High
    const irrelevantKeywords = [
      "politics", "election", "government policy", "cricket", "movie", "celebrity",
      "stock market", "crypto", "bitcoin", "programming", "coding", "software",
      "recipe", "cooking", "health", "medical", "disease", "treatment",
      "weather", "news", "sports", "entertainment", "game", "music"
    ];
    
    const lowerMsg = message.toLowerCase();
    const isIrrelevant = irrelevantKeywords.some(kw => lowerMsg.includes(kw));
    
    // Allow visa, study abroad, PTE, interview, career, immigration related
    const relevantKeywords = [
      "visa", "study", "abroad", "pte", "ielts", "toefl", "interview", "career",
      "counsel", "university", "college", "admission", "application", "document",
      "sop", "lor", "financial", "bank", "statement", "guarantee", "sponsor",
      "canada", "australia", "uk", "usa", "new zealand", "europe", "germany",
      "fly high", "pehowa", "consultancy", "tourist", "spouse", "dependent",
      "immigration", "pr", "permanent resident", "work permit", "post study",
      "mock test", "coaching", "training", "score", "band", "preparation"
    ];
    
    const isRelevant = relevantKeywords.some(kw => lowerMsg.includes(kw));
    
    // If clearly irrelevant and not relevant, reject
    if (isIrrelevant && !isRelevant && message.length > 20) {
      return res.json({
        reply: "I'm FlyBot, your Fly High Consultancy assistant! 🛫 I specialize only in study visas, tourist visas, PTE coaching, interview preparation, and immigration guidance. For other topics, please visit our office or WhatsApp us at +91-93061-42129 for personalized counseling! 📱"
      });
    }

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\nKNOWLEDGE BASE:\n" + KNOWLEDGE_BASE },
          ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", response.status, err);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again or contact us directly!";

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ 
      reply: "Oops! Something went wrong. Please try again in a moment, or reach us directly at +91-93061-42129 / urvashisaini0723@gmail.com 🙏" 
    });
  }
});

module.exports = router;