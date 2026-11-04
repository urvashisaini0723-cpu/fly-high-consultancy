/**
 * "Find Your Dream Country" — transparent, weighted recommendation engine.
 *
 * This module is deliberately free of UI code and framework imports so it can
 * be unit-tested with plain Node. It never fabricates fees or requirements;
 * it only ranks the structured country profiles from data/dreamCountries.js.
 *
 * Scoring (max 105):
 *   Budget compatibility   30   (relative costTier vs budget band)
 *   Explicit preference    25   (selected country) / 10 ("No Preference")
 *   Goal alignment         20   (study / work / study+work / explore)
 *   Course alignment       15   (field strength per country)
 *   Qualification fit      10
 *   Timeline fit            5
 *
 * Hard honesty rules:
 *   - If a NON-preferred country is 2+ cost tiers above the budget band it is
 *     excluded entirely — we do not recommend destinations we believe are
 *     unaffordable for the visitor.
 *   - If a PREFERRED country is unaffordable on paper, it is still shown
 *     (the visitor asked for it) but (a) its category is capped at
 *     "Worth Exploring", (b) a budget warning is attached, and (c) it never
 *     ranks above a properly-affordable match unless the visitor selected it.
 *   - Work-related goals never promise jobs; a disclaimer is attached to
 *     every result and work-fit is only a coarse relative ranking.
 *   - Below `EXPLORE_MIN` with no preference, a destination is hidden →
 *     the UI shows the "no strong matches" state with counselling instead.
 */

import {
  COUNTRIES,
  BUDGET_OPTIONS,
  COURSE_FIT,
  GOAL_FIT,
  QUALIFICATION_FIT,
  TIMELINE_FIT,
  labelFor,
} from "../data/dreamCountries.js";

export const WEIGHTS = {
  budget: 30,
  preference: 25,
  goal: 20,
  course: 15,
  qualification: 10,
  timeline: 5,
};

export const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0); // 105
export const POTENTIAL_MIN = 72; // "Potential Match"
export const EXPLORE_MIN = 50;   // "Worth Exploring"; below this → not recommended

const BUDGET_LEVEL = Object.fromEntries(BUDGET_OPTIONS.map((b) => [b.id, b.level]));

export const budgetAssessment = (country, budgetId) => {
  const level = BUDGET_LEVEL[budgetId];
  if (!level || !country?.costTier) {
    return { diff: 0, points: 0, status: "unknown", label: "We could not compare budgets" };
  }
  const diff = level - country.costTier;
  if (diff >= 1)  return { diff, points: WEIGHTS.budget, status: "comfortable", label: "Comfortable on this budget" };
  if (diff === 0) return { diff, points: 26, status: "comfortable", label: "Broadly within this budget" };
  if (diff === -1) return { diff, points: 14, status: "stretch", label: "Tight — fees may stretch this budget" };
  if (diff === -2) return { diff, points: 6, status: "mismatch", label: "Likely above this budget" };
  return { diff, points: 0, status: "major-mismatch", label: "Well above this budget" };
};

const preferredList = (answers) => {
  const pref = Array.isArray(answers?.preferredCountries) ? answers.preferredCountries : [];
  return pref.filter((id) => id && id !== "none");
};

export const isWorkGoal = (goal) => goal === "work" || goal === "study_work";

/**
 * Score every country and return the recommendation payload used by the UI.
 * @param {object} answers - { goal, qualification, budget, preferredCountries[], course, timeline }
 */
export function getRecommendations(answers = {}) {
  const pref = preferredList(answers);
  const noPreference = pref.length === 0;
  const results = [];
  const excluded = [];

  for (const country of COUNTRIES) {
    const isPreferred = pref.includes(country.id);
    const budget = budgetAssessment(country, answers.budget);

    // Hard rule: unaffordable non-preferred destinations are excluded.
    if (!isPreferred && budget.diff <= -2) {
      excluded.push({ country, reasons: [budget.label] });
      continue;
    }

    const preference = noPreference ? 10 : isPreferred ? WEIGHTS.preference : 0;
    const goal = GOAL_FIT[country.id]?.[answers.goal] ?? 8;
    const course = COURSE_FIT[country.id]?.[answers.course] ?? 8;
    const qualification = QUALIFICATION_FIT[country.id]?.[answers.qualification] ?? 6;
    const timeline = TIMELINE_FIT[country.id]?.[answers.timeline] ?? 4;

    const score = budget.points + preference + goal + course + qualification + timeline;

    const reasons = [];
    const warnings = [];

    if (budget.status === "comfortable") reasons.push(budget.label);
    else if (budget.status === "stretch") warnings.push("Budget looks tight — expect to stretch with scholarships or part-time earnings");
    else if (budget.status === "mismatch") warnings.push("This destination is likely above your stated budget");
    else if (budget.status === "major-mismatch") warnings.push("This destination is well above your stated budget");

    if (isPreferred) reasons.push("You shortlisted this destination yourself");
    else if (noPreference) reasons.push("Open to all destinations — strong general fit");

    if (goal >= 16) reasons.push("Strongly aligned with your goal");
    else if (goal >= 10) reasons.push("Reasonably aligned with your goal");
    else warnings.push("Weaker alignment with your goal — ask about alternatives");

    if (course >= 13) reasons.push("Known strength in your field of interest");
    else if (course <= 8) warnings.push("Not a headline destination for your field");

    if (qualification >= 9) reasons.push("Your qualification fits the usual entry routes");
    else warnings.push("Entry routes may differ for your qualification — counsellor will verify");

    if (isWorkGoal(answers.goal)) {
      warnings.push("Study-to-work pathways are never guaranteed — eligibility depends on course, language level, status and current rules");
    }

    let category = score >= POTENTIAL_MIN ? "Potential Match" : score >= EXPLORE_MIN ? "Worth Exploring" : null;

    // Preferred country given the visitor explicitly asked: always show, but
    // never call an unaffordable one a "Potential Match".
    if (isPreferred && !category) category = "Worth Exploring";
    if (isPreferred && budget.diff <= -2 && category === "Potential Match") {
      category = "Worth Exploring";
    }

    const percent = Math.round((score / MAX_SCORE) * 100);
    results.push({
      country,
      score,
      maxScore: MAX_SCORE,
      percent,
      category,
      budgetStatus: budget.status,
      budgetPoints: budget.points,
      isPreferred,
      reasons,
      warnings,
    });
  }

  // Preferred-but-excluded countries must not silently disappear.
  for (const id of pref) {
    if (!results.some((r) => r.country.id === id) && !excluded.some((e) => e.country.id === id)) {
      // unknown country id in payload — surface as a safe placeholder
      continue;
    }
  }

  const qualified = results.filter((r) => r.category);

  // Build the top 3 with two hard guarantees:
  //  1. A destination that is a poor budget fit NEVER sneaks into the top 3
  //     just because its other answers look good — unless the visitor
  //     explicitly shortlisted it (then it appears WITH a warning, capped
  //     at "Worth Exploring").
  //  2. A visitor's explicitly preferred destination is never silently
  //     dropped — it claims a slot ahead of non-preferred picks.
  const isHard = (r) => r.budgetStatus === "mismatch" || r.budgetStatus === "major-mismatch";
  const byScoreThenPreference = (a, b) => (b.isPreferred ? 1 : 0) - (a.isPreferred ? 1 : 0) || b.score - a.score;

  const soft = qualified.filter((r) => !isHard(r)).sort(byScoreThenPreference);
  const hard = qualified.filter(isHard).sort(byScoreThenPreference);

  const top = soft.slice(0, 3);
  for (const candidate of hard) {
    if (top.length < 3) {
      top.push(candidate);
      continue;
    }
    if (!candidate.isPreferred) break; // hard non-preferred picks never bump
    // preferred hard pick replaces the weakest non-preferred soft pick
    let weakest = -1;
    for (let i = 0; i < top.length; i += 1) {
      if (!top[i].isPreferred && (weakest === -1 || top[i].score < top[weakest].score)) {
        weakest = i;
      }
    }
    if (weakest >= 0) top[weakest] = candidate;
  }
  top.sort((a, b) => b.score - a.score);
  const noStrongMatches = top.length === 0;

  return {
    top,
    all: qualified,
    excluded,
    noStrongMatches,
    noPreference,
    preferred: pref,
    maxScore: MAX_SCORE,
  };
}

/** Plain-text summary used by Copy / Share buttons. */
export function buildResultsSummary(answers, recommendation) {
  const lines = [];
  const a = answers || {};
  lines.push("Fly High Consultancy — Find Your Dream Country");
  lines.push("");
  lines.push(`Goal: ${labelFor("goal", a.goal) || "—"}`);
  lines.push(`Qualification: ${labelFor("qualification", a.qualification) || "—"}`);
  lines.push(`Budget: ${labelFor("budget", a.budget) || "—"}`);
  const prefs = (a.preferredCountries || [])
    .filter((id) => id !== "none")
    .map((id) => labelFor("preferredCountries", id));
  lines.push(`Preferred: ${prefs.length ? prefs.join(", ") : "No Preference"}`);
  lines.push(`Field: ${labelFor("course", a.course) || "—"}`);
  lines.push(`Timeline: ${labelFor("timeline", a.timeline) || "—"}`);
  lines.push("");
  if (recommendation?.top?.length) {
    lines.push("Recommended destinations:");
    recommendation.top.forEach((r, i) => {
      lines.push(`${i + 1}. ${r.country.name} — ${r.category} (${r.percent}% match strength)`);
    });
  } else {
    lines.push("No strong matches — counselling recommended.");
  }
  lines.push("");
  lines.push("Preliminary guidance only. Not an eligibility, admission, employment or visa guarantee.");
  lines.push("Fly High Consultancy · +91 93061 42129");
  return lines.join("\n");
}
