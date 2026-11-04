/**
 * Fly High Consultancy — "Find Your Dream Country" quiz data.
 *
 * IMPORTANT (data honesty):
 * - No tuition fees, living costs, visa rules or admission requirements are
 *   stated as fact anywhere in this file. Everything except what a visitor
 *   tells us about themselves is INDICATIVE and must be verified by our
 *   counsellors with the visitor before any application is made.
 * - `costTier` is a relative, internal comparison (1 = generally lower cost
 *   of the whole study journey, 5 = generally higher). It exists only so the
 *   recommendation engine can rank budget compatibility. It is NOT a fee
 *   quote. Actual costs vary by university, course, city and lifestyle.
 * - Requirements, intakes, language scores and scholarships change
 *   frequently — the UI always shows "Contact our counsellor for updated
 *   information" instead of numbers we cannot verify.
 *
 * Images: Unsplash (free to use). Flags: flagcdn.com (free CDN) with emoji
 * fallback rendered by the UI if the CDN image fails to load.
 */

export const VERIFY_NOTE = "Contact our counsellor for updated information";

export const BUDGET_OPTIONS = [
  { id: "under-10", label: "Under ₹10 Lakhs", level: 1 },
  { id: "10-20", label: "₹10–20 Lakhs", level: 2 },
  { id: "20-35", label: "₹20–35 Lakhs", level: 3 },
  { id: "35-50", label: "₹35–50 Lakhs", level: 4 },
  { id: "50plus", label: "₹50 Lakhs+", level: 5 },
];

export const COUNTRIES = [
  {
    id: "canada",
    name: "Canada",
    flagEmoji: "🇨🇦",
    flagImg: "https://flagcdn.com/w160/ca.png",
    image:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Toronto skyline with the CN Tower",
    tagline: "Popular study-then-work pathway and a large Indian student community",
    // Indicative relative cost of the full journey. NOT a fee quote.
    costTier: 3,
    costLabel: "Moderate to High",
    popularCourses: [
      "Business & Management",
      "Computer Science & IT",
      "Engineering",
      "Healthcare",
      "Hospitality & Tourism",
    ],
    intakes: "September and January are the main intakes; some programmes also start in May",
    language: "English proficiency is expected — exact scores vary by institution and course",
    workNote:
      "Part-time work during studies and post-study work pathways are common topics for Canada, but rules and eligibility change. Our counsellor will confirm what applies to your case — work is never guaranteed.",
    pathways: ["Direct university entry", "College diploma pathways", "Postgraduate (Master's) pathways"],
    whyPoints: [
      "Wide choice of colleges and universities across provinces",
      "Post-study work pathways that students frequently ask about",
      "Strong demand for Business, IT and Healthcare graduates",
    ],
  },
  {
    id: "uk",
    name: "United Kingdom",
    flagEmoji: "🇬🇧",
    flagImg: "https://flagcdn.com/w160/gb.png",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Big Ben and the Houses of Parliament in London",
    tagline: "One-year Master's degrees and globally recognised universities",
    costTier: 4,
    costLabel: "High",
    popularCourses: [
      "Business & Management",
      "Arts & Humanities",
      "Computer Science & IT",
      "Engineering",
      "Healthcare",
    ],
    intakes: "September is the main intake; many programmes also start in January",
    language: "English proficiency is expected — exact scores vary by university and course",
    workNote:
      "Part-time-work and graduate-route questions are common, but UK rules change and depend on your course and institution. Our counsellor will confirm what applies to your case — work is never guaranteed.",
    pathways: ["Direct university entry", "One-year Master's pathways", "Foundation programmes for some profiles"],
    whyPoints: [
      "Many Master's degrees complete in about one year",
      "Deeply respected universities and strong programme choice",
      "Good fit for Business, Arts and a wide range of subjects",
    ],
  },
  {
    id: "australia",
    name: "Australia",
    flagEmoji: "🇦🇺",
    flagImg: "https://flagcdn.com/w160/au.png",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Sydney Opera House and harbour",
    tagline: "Career-focused study with strong demand in healthcare and engineering",
    costTier: 4,
    costLabel: "High",
    popularCourses: [
      "Healthcare",
      "Engineering",
      "Hospitality & Tourism",
      "Computer Science & IT",
      "Business & Management",
    ],
    intakes: "February and July are the main intakes",
    language: "English proficiency is expected — exact scores vary by institution and course",
    workNote:
      "Part-time work during studies and post-study pathways are common topics for Australia, but rules change and depend on your course, level and location. Our counsellor will confirm what applies — work is never guaranteed.",
    pathways: ["Direct university entry", "Diploma-to-degree pathways", "Postgraduate (Master's) pathways"],
    whyPoints: [
      "Hands-on, career-linked courses in Healthcare and Engineering",
      "February and July intakes suit mid-year planning",
      "Popular with students balancing study and part-time work",
    ],
  },
  {
    id: "germany",
    name: "Germany",
    flagEmoji: "🇩🇪",
    flagImg: "https://flagcdn.com/w160/de.png",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Colourful half-timbered houses in a German town",
    tagline: "Very low tuition at many public universities, famous for engineering",
    costTier: 2,
    costLabel: "Lower (public universities) to Moderate",
    popularCourses: [
      "Engineering",
      "Computer Science & IT",
      "Business & Management",
      "Arts & Humanities",
    ],
    intakes: "October (winter semester) and April (summer semester) are the main intakes",
    language:
      "English-taught programmes exist alongside German-taught ones — many programmes expect German proficiency. Our counsellor will check what your shortlisted courses need.",
    workNote:
      "Germany has structured work and post-study pathways, but they depend on your qualification, language level and the rules in force. Our counsellor will confirm what applies — work is never guaranteed.",
    pathways: [
      "Public university entry (low/no tuition at many institutions)",
      "Preparatory (Studienkolleg) pathways for some profiles",
      "English-taught Master's pathways",
    ],
    whyPoints: [
      "Among the most affordable respected destinations for engineering and IT",
      "Strong industry links with German employers",
      "Attractive for budget-conscious, academically strong students",
    ],
  },
  {
    id: "ireland",
    name: "Ireland",
    flagEmoji: "🇮🇪",
    flagImg: "https://flagcdn.com/w160/ie.png",
    image:
      "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Green cliffs and coastline in Ireland",
    tagline: "English-speaking EU destination, strong for business and tech",
    costTier: 3,
    costLabel: "Moderate to High",
    popularCourses: [
      "Business & Management",
      "Computer Science & IT",
      "Healthcare",
      "Arts & Humanities",
    ],
    intakes: "September is the main intake; some programmes start in January/February",
    language: "English proficiency is expected — exact scores vary by institution and course",
    workNote:
      "Ireland is home to many global companies and graduates often ask about work pathways. Eligibility depends on your course, qualification and the rules in force — our counsellor will confirm what applies. Work is never guaranteed.",
    pathways: ["Direct university entry", "Postgraduate (Master's) pathways"],
    whyPoints: [
      "English-speaking EU base with many global tech and pharma employers",
      "Friendly, welcoming campuses and strong Indian student communities",
      "Good fit for Business and IT postgraduate study",
    ],
  },
  {
    id: "newzealand",
    name: "New Zealand",
    flagEmoji: "🇳🇿",
    flagImg: "https://flagcdn.com/w160/nz.png",
    image:
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Lake and mountains in New Zealand",
    tagline: "Safe, scenic and career-linked — especially for hospitality and IT",
    costTier: 4,
    costLabel: "High",
    popularCourses: [
      "Hospitality & Tourism",
      "Computer Science & IT",
      "Healthcare",
      "Business & Management",
      "Engineering",
    ],
    intakes: "February and July are the main intakes",
    language: "English proficiency is expected — exact scores vary by institution and course",
    workNote:
      "New Zealand is a popular choice for students planning part-time work and post-study pathways, but rules change and depend on your course and level. Our counsellor will confirm what applies — work is never guaranteed.",
    pathways: ["Direct university entry", "Diploma-to-degree pathways", "Postgraduate (Master's) pathways"],
    whyPoints: [
      "Safe, peaceful environment with a high quality of life",
      "Practical, career-linked programmes in tourism and IT",
      "Popular with students looking for work-while-study options",
    ],
  },
  {
    id: "usa",
    name: "USA",
    flagEmoji: "🇺🇸",
    flagImg: "https://flagcdn.com/w160/us.png",
    image:
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "New York City skyline",
    tagline: "Biggest range of universities and research opportunities",
    costTier: 5,
    costLabel: "High to Very High",
    popularCourses: [
      "Computer Science & IT",
      "Engineering",
      "Business & Management",
      "Arts & Humanities",
      "Healthcare",
    ],
    intakes: "August/September is the main intake; many programmes also start in January",
    language: "English proficiency is expected — exact scores vary by university and course",
    workNote:
      "USA work options during study are typically limited (for example, on-campus roles); post-study options depend on your status and rules in force. Our counsellor will confirm what applies — work is never guaranteed.",
    pathways: ["Direct university entry", "Community-college transfer pathways", "Postgraduate (Master's / PhD) pathways"],
    whyPoints: [
      "The widest choice of universities, courses and research options",
      "Strong for Computer Science, Engineering and Business",
      "Flexible course structures in many programmes",
    ],
  },
];

export const COUNTRY_MAP = Object.fromEntries(COUNTRIES.map((c) => [c.id, c]));

/**
 * Course-fit score per country (max 15). Rough, relative fit between a
 * country's strengths and the field — not a claim about specific universities.
 */
export const COURSE_FIT = {
  canada:      { business: 13, cs_it: 15, engineering: 13, healthcare: 13, hospitality: 11, arts: 11, other: 10 },
  uk:          { business: 15, cs_it: 13, engineering: 12, healthcare: 13, hospitality: 11, arts: 15, other: 10 },
  australia:   { business: 13, cs_it: 13, engineering: 13, healthcare: 15, hospitality: 13, arts: 12, other: 10 },
  germany:     { business: 10, cs_it: 13, engineering: 15, healthcare: 8,  hospitality: 8,  arts: 10, other: 9  },
  ireland:     { business: 15, cs_it: 12, engineering: 8,  healthcare: 13, hospitality: 10, arts: 10, other: 9  },
  newzealand:  { business: 11, cs_it: 10, engineering: 8,  healthcare: 11, hospitality: 15, arts: 10, other: 9  },
  usa:         { business: 13, cs_it: 15, engineering: 13, healthcare: 12, hospitality: 8,  arts: 13, other: 10 },
};

/**
 * Goal-fit score per country (max 20). For work-related goals we favour the
 * destinations where students MOST often ask about structured study-to-work
 * pathways. These are never presented as guaranteed outcomes.
 */
export const GOAL_FIT = {
  canada:      { study: 20, work: 17, study_work: 20, explore: 17 },
  uk:          { study: 20, work: 8,  study_work: 17, explore: 17 },
  australia:   { study: 20, work: 17, study_work: 20, explore: 17 },
  germany:     { study: 20, work: 14, study_work: 16, explore: 17 },
  ireland:     { study: 20, work: 11, study_work: 17, explore: 17 },
  newzealand:  { study: 20, work: 15, study_work: 19, explore: 17 },
  usa:         { study: 20, work: 6,  study_work: 10, explore: 17 },
};

/** Qualification-fit score per country (max 10). */
export const QUALIFICATION_FIT = {
  canada:      { "12th": 10, bachelor: 10, master: 9, diploma: 10, other: 7 },
  uk:          { "12th": 10, bachelor: 10, master: 9, diploma: 9,  other: 7 },
  australia:   { "12th": 10, bachelor: 10, master: 9, diploma: 10, other: 7 },
  germany:     { "12th": 9,  bachelor: 10, master: 9, diploma: 6,  other: 6 },
  ireland:     { "12th": 10, bachelor: 10, master: 9, diploma: 9,  other: 7 },
  newzealand:  { "12th": 10, bachelor: 10, master: 9, diploma: 10, other: 7 },
  usa:         { "12th": 10, bachelor: 10, master: 9, diploma: 8,  other: 7 },
};

/**
 * Timeline-fit score per country (max 5). Kept deliberately flat: only
 * destinations known for typically faster, January-friendly processing get a
 * small nudge when the visitor plans to go within 3 months.
 */
export const TIMELINE_FIT = {
  canada:      { "3m": 5, "6m": 5, "1y": 5, "more-1y": 5, exploring: 5 },
  uk:          { "3m": 5, "6m": 5, "1y": 5, "more-1y": 5, exploring: 5 },
  australia:   { "3m": 5, "6m": 5, "1y": 5, "more-1y": 5, exploring: 5 },
  germany:     { "3m": 3, "6m": 5, "1y": 5, "more-1y": 5, exploring: 5 },
  ireland:     { "3m": 4, "6m": 5, "1y": 5, "more-1y": 5, exploring: 5 },
  newzealand:  { "3m": 4, "6m": 5, "1y": 5, "more-1y": 5, exploring: 5 },
  usa:         { "3m": 3, "6m": 5, "1y": 5, "more-1y": 5, exploring: 5 },
};

export const QUIZ_QUESTIONS = [
  {
    id: "goal",
    question: "What is your main goal?",
    hint: "Choose what matters most to you right now.",
    type: "single",
    options: [
      { id: "study", label: "Study Abroad", desc: "Pursue a degree or diploma at a foreign university", icon: "FiBookOpen" },
      { id: "work", label: "Work Abroad", desc: "Explore realistic international work pathways", icon: "FiBriefcase" },
      { id: "study_work", label: "Study + Part-time Work", desc: "Study while working part-time", icon: "FiLayers" },
      { id: "explore", label: "Explore International Opportunities", desc: "Not sure yet — help me discover options", icon: "FiCompass" },
    ],
  },
  {
    id: "qualification",
    question: "What is your highest education qualification?",
    hint: "We will suggest pathways that actually accept your profile.",
    type: "single",
    options: [
      { id: "12th", label: "12th Pass", desc: "Completed higher secondary / senior secondary", icon: "FiEdit3" },
      { id: "bachelor", label: "Bachelor's Degree", desc: "Graduated with an undergraduate degree", icon: "FiAward" },
      { id: "master", label: "Master's Degree", desc: "Completed postgraduate studies", icon: "FiTrendingUp" },
      { id: "diploma", label: "Diploma", desc: "Diploma or polytechnic qualification", icon: "FiTool" },
      { id: "other", label: "Other", desc: "Something else — counsellor will guide you", icon: "FiMoreHorizontal" },
    ],
  },
  {
    id: "budget",
    question: "What is your approximate total budget?",
    hint: "Tuition + living for the whole study journey. All figures indicative.",
    type: "single",
    options: BUDGET_OPTIONS.map((b) => ({
      id: b.id,
      label: b.label,
      desc: b.id === "under-10" ? "Tightest budget" :
            b.id === "10-20" ? "Affordable options" :
            b.id === "20-35" ? "Comfortable middle range" :
            b.id === "35-50" ? "Premium destinations opening up" : "All destinations open",
      icon: "FiCreditCard",
    })),
  },
  {
    id: "preferredCountries",
    question: "Which country do you prefer?",
    hint: "Pick one or more — or choose No Preference.",
    type: "multi",
    exclusiveNone: "none",
    options: [
      ...COUNTRIES.map((c) => ({ id: c.id, label: c.name, desc: c.tagline, flagEmoji: c.flagEmoji, flagImg: c.flagImg })),
      { id: "none", label: "No Preference", desc: "Show me the best-matched destinations", icon: "FiGlobe" },
    ],
  },
  {
    id: "course",
    question: "Which course or field interests you?",
    hint: "Choose the field closest to your interest.",
    type: "single",
    options: [
      { id: "business", label: "Business and Management", desc: "MBA, BBA, management & marketing", icon: "FiBriefcase" },
      { id: "cs_it", label: "Computer Science and IT", desc: "Software, data, AI, networks", icon: "FiMonitor" },
      { id: "engineering", label: "Engineering", desc: "Mechanical, civil, electrical & more", icon: "FiTool" },
      { id: "healthcare", label: "Healthcare", desc: "Nursing, medicine, allied health", icon: "FiHeart" },
      { id: "hospitality", label: "Hospitality and Tourism", desc: "Hotel management, tourism, culinary", icon: "FiCoffee" },
      { id: "arts", label: "Arts and Humanities", desc: "Literature, design, social sciences", icon: "FiFeather" },
      { id: "other", label: "Other", desc: "Something else — counsellor will guide you", icon: "FiMoreHorizontal" },
    ],
  },
  {
    id: "timeline",
    question: "When are you planning to go abroad?",
    hint: "A rough idea is enough — this helps us plan your intakes.",
    type: "single",
    options: [
      { id: "3m", label: "Within 3 Months", desc: "Urgent — let's move fast", icon: "FiZap" },
      { id: "6m", label: "Within 6 Months", desc: "Soon — good time to start", icon: "FiClock" },
      { id: "1y", label: "Within 1 Year", desc: "Planning for the next intake", icon: "FiCalendar" },
      { id: "more-1y", label: "More than 1 Year", desc: "Early planning stage", icon: "FiMap" },
      { id: "exploring", label: "Just Exploring", desc: "Only gathering information", icon: "FiSearch" },
    ],
  },
];

export const EMPTY_ANSWERS = {
  goal: null,
  qualification: null,
  budget: null,
  preferredCountries: [],
  course: null,
  timeline: null,
};

/** Human-readable labels used in summaries, share text and the enquiry form. */
export const ANSWER_LABELS = (() => {
  const map = {};
  QUIZ_QUESTIONS.forEach((q) => {
    map[q.id] = {};
    q.options.forEach((o) => {
      map[q.id][o.id] = o.label;
    });
  });
  return map;
})();

export const labelFor = (questionId, optionId) => ANSWER_LABELS[questionId]?.[optionId] ?? optionId;
