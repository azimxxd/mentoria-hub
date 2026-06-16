// Maps seed course/opportunity titles to their bundled cover image in
// /public/covers. The static covers are named by the local seed id, but in
// Supabase mode the same items have UUID ids — so we resolve by title instead,
// which is stable across both data backends.

const TITLE_TO_COVER: Record<string, string> = {
  // Courses
  "English for Academic Success": "course_english",
  "Math Foundations": "course_math",
  "Physics Foundations": "course_physics",
  "Intro to Economics": "course_econ",
  // Opportunities
  "National Mathematics Olympiad": "opp_natmath",
  "Junior Business Case Competition": "opp_bizcase",
  "STEM Summer School Abroad": "opp_stemsummer",
  "Future Leaders Scholarship": "opp_scholarship",
  "TeenHack Coding Hackathon": "opp_hackathon",
  "Young Researchers Program": "opp_research",
  "Financial Literacy Challenge": "opp_finlit",
  "Eco Volunteering Initiative": "opp_volunteer",
  "Tech Startup Internship": "opp_internship",
  "International Debate Tournament": "opp_debate",
  "SAT Bootcamp Scholarship": "opp_satprep",
  "Biology Knowledge Olympiad": "opp_bioolymp",
};

/** Returns the bundled cover path for a known seed title, or undefined. */
export function coverForTitle(title?: string): string | undefined {
  if (!title) return undefined;
  const slug = TITLE_TO_COVER[title.trim()];
  return slug ? `/covers/${slug}.png` : undefined;
}
