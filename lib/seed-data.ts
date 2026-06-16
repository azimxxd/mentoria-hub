import type { Course, Opportunity, User } from "./types";

// Deadlines are generated relative to "now" so the demo always shows
// a realistic mix of urgent / upcoming / far-off opportunities.
function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp_natmath",
    title: "National Mathematics Olympiad",
    organizer: "Republican Olympiad Committee",
    category: "Olympiad",
    direction: "STEM",
    format: "In-person",
    deadline: inDays(6),
    description:
      "The flagship national olympiad in mathematics for secondary school students. Winners gain university scholarships and a place on the national team.",
    requirements: "Grades 9–11. Strong algebra and geometry. School nomination recommended.",
    applyUrl: "https://example.org/apply/math-olympiad",
    gradeMin: 9,
    gradeMax: 11,
    tags: ["math", "olympiad", "stem", "competition", "scholarship"],
  },
  {
    id: "opp_bizcase",
    title: "Junior Business Case Competition",
    organizer: "Mentoria Partners",
    category: "Competition",
    direction: "Business",
    format: "Hybrid",
    deadline: inDays(12),
    description:
      "Teams solve a real startup case and pitch to a panel of founders and investors. Great for future entrepreneurs and finance students.",
    requirements: "Grades 9–12. Teams of 2–4. Submit a one-page application.",
    applyUrl: "https://example.org/apply/biz-case",
    gradeMin: 9,
    gradeMax: 12,
    tags: ["business", "startup", "pitch", "finance", "competition", "teamwork"],
  },
  {
    id: "opp_stemsummer",
    title: "STEM Summer School Abroad",
    organizer: "Global Science Foundation",
    category: "Summer School",
    direction: "STEM",
    format: "In-person",
    deadline: inDays(28),
    description:
      "A two-week residential program covering physics, robotics and applied math with lab work and mentorship from university researchers.",
    requirements: "Grades 10–11. Motivation letter. Intermediate English.",
    applyUrl: "https://example.org/apply/stem-summer",
    gradeMin: 10,
    gradeMax: 11,
    tags: ["stem", "physics", "robotics", "summer", "research", "english"],
  },
  {
    id: "opp_scholarship",
    title: "Future Leaders Scholarship",
    organizer: "Mentoria Foundation",
    category: "Scholarship",
    direction: "Social Impact",
    format: "Online",
    deadline: inDays(18),
    description:
      "A merit-and-need scholarship covering tuition for online courses and exam fees, awarded to students with community impact projects.",
    requirements: "Grades 9–12. Essay on a community project. Reference letter.",
    applyUrl: "https://example.org/apply/scholarship",
    gradeMin: 9,
    gradeMax: 12,
    tags: ["scholarship", "leadership", "social impact", "essay", "community"],
  },
  {
    id: "opp_hackathon",
    title: "TeenHack Coding Hackathon",
    organizer: "DevKids Community",
    category: "Hackathon",
    direction: "Coding",
    format: "Hybrid",
    deadline: inDays(9),
    description:
      "A 48-hour hackathon where students build web or mobile apps that solve a local problem. Beginners welcome; mentors on site.",
    requirements: "Grades 8–12. Basic programming helpful but not required.",
    applyUrl: "https://example.org/apply/teenhack",
    gradeMin: 8,
    gradeMax: 12,
    tags: ["coding", "hackathon", "web", "apps", "programming", "teamwork"],
  },
  {
    id: "opp_research",
    title: "Young Researchers Program",
    organizer: "Academy of Sciences",
    category: "Research",
    direction: "Science",
    format: "Online",
    deadline: inDays(35),
    description:
      "Pairs students with a scientist mentor to complete a small research project over a semester, ending in a published abstract.",
    requirements: "Grades 10–12. Interest in biology, chemistry or physics.",
    applyUrl: "https://example.org/apply/young-researchers",
    gradeMin: 10,
    gradeMax: 12,
    tags: ["research", "science", "biology", "chemistry", "mentorship"],
  },
  {
    id: "opp_finlit",
    title: "Financial Literacy Challenge",
    organizer: "FinFuture",
    category: "Competition",
    direction: "Finance",
    format: "Online",
    deadline: inDays(15),
    description:
      "An online competition testing budgeting, investing and economics knowledge through interactive simulations.",
    requirements: "Grades 9–12. No prior finance experience needed.",
    applyUrl: "https://example.org/apply/fin-challenge",
    gradeMin: 9,
    gradeMax: 12,
    tags: ["finance", "economics", "investing", "competition", "online"],
  },
  {
    id: "opp_volunteer",
    title: "Eco Volunteering Initiative",
    organizer: "GreenSteppe NGO",
    category: "Volunteering",
    direction: "Social Impact",
    format: "In-person",
    deadline: inDays(40),
    description:
      "Join local environmental projects — tree planting, recycling drives and awareness campaigns — and earn a volunteering certificate.",
    requirements: "Grades 8–12. Weekend availability.",
    applyUrl: "https://example.org/apply/eco-volunteer",
    gradeMin: 8,
    gradeMax: 12,
    tags: ["volunteering", "environment", "social impact", "community", "certificate"],
  },
  {
    id: "opp_internship",
    title: "Tech Startup Internship",
    organizer: "Mentoria Partners",
    category: "Internship",
    direction: "Coding",
    format: "Hybrid",
    deadline: inDays(22),
    description:
      "A part-time internship at a local tech startup where students shadow engineers and contribute to a real product.",
    requirements: "Grades 11–12. Familiarity with one programming language.",
    applyUrl: "https://example.org/apply/startup-internship",
    gradeMin: 11,
    gradeMax: 12,
    tags: ["internship", "coding", "startup", "career", "programming"],
  },
  {
    id: "opp_debate",
    title: "International Debate Tournament",
    organizer: "Speak Up League",
    category: "Competition",
    direction: "Social Impact",
    format: "Online",
    deadline: inDays(11),
    description:
      "A British Parliamentary debate tournament held online, building public speaking, critical thinking and English skills.",
    requirements: "Grades 9–12. Upper-intermediate English.",
    applyUrl: "https://example.org/apply/debate",
    gradeMin: 9,
    gradeMax: 12,
    tags: ["debate", "english", "public speaking", "social impact", "competition"],
  },
  {
    id: "opp_satprep",
    title: "SAT Bootcamp Scholarship",
    organizer: "Mentoria Foundation",
    category: "Scholarship",
    direction: "STEM",
    format: "Online",
    deadline: inDays(4),
    description:
      "Free seats in an intensive SAT preparation bootcamp for motivated students planning to apply abroad.",
    requirements: "Grades 10–12. Diagnostic test required.",
    applyUrl: "https://example.org/apply/sat-bootcamp",
    gradeMin: 10,
    gradeMax: 12,
    tags: ["sat", "test prep", "university", "scholarship", "math", "english"],
  },
  {
    id: "opp_bioolymp",
    title: "Biology Knowledge Olympiad",
    organizer: "Republican Olympiad Committee",
    category: "Olympiad",
    direction: "Science",
    format: "In-person",
    deadline: inDays(26),
    description:
      "A staged olympiad in biology covering cells, genetics and ecology, with national winners invited to a summer lab camp.",
    requirements: "Grades 9–11. School-level biology.",
    applyUrl: "https://example.org/apply/bio-olympiad",
    gradeMin: 9,
    gradeMax: 11,
    tags: ["biology", "olympiad", "science", "genetics", "competition"],
  },
];

export const SEED_COURSES: Course[] = [
  {
    id: "course_english",
    title: "English for Academic Success",
    description:
      "Build the academic English you need for essays, presentations and standardized tests like IELTS and SAT.",
    level: "Intermediate",
    subject: "English",
    direction: "Social Impact",
    emoji: "📘",
    tags: ["english", "ielts", "sat", "writing", "academic", "university"],
    lessons: [
      {
        id: "l_eng_1",
        title: "Academic Vocabulary Foundations",
        durationMin: 12,
        content:
          "Academic writing relies on precise, formal vocabulary. In this lesson you'll learn high-frequency academic words, how to replace casual phrases with formal equivalents, and how to use linking words (however, therefore, moreover) to connect ideas. Practice swapping 'a lot of' for 'numerous' and 'get' for 'obtain'.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        quiz: [
          {
            id: "q1",
            question: "Which word is the most formal replacement for 'a lot of'?",
            options: ["lots of", "numerous", "tons of", "plenty"],
            answer: 1,
          },
          {
            id: "q2",
            question: "Which is a linking word that shows contrast?",
            options: ["therefore", "however", "moreover", "because"],
            answer: 1,
          },
        ],
      },
      {
        id: "l_eng_2",
        title: "Structuring an Argument Essay",
        durationMin: 15,
        content:
          "A strong argument essay has an introduction with a clear thesis, body paragraphs each built around one main idea (topic sentence + evidence + explanation), and a conclusion that restates the position. Learn the PEEL structure: Point, Evidence, Explanation, Link.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        quiz: [
          {
            id: "q1",
            question: "What does the 'P' in the PEEL paragraph structure stand for?",
            options: ["Plan", "Point", "Proof", "Phrase"],
            answer: 1,
          },
          {
            id: "q2",
            question: "Where should your thesis statement appear?",
            options: ["Introduction", "First body paragraph", "Conclusion", "Anywhere"],
            answer: 0,
          },
        ],
      },
      {
        id: "l_eng_3",
        title: "Speaking with Confidence",
        durationMin: 10,
        content:
          "Academic speaking rewards clarity over speed. Use signposting language ('First, I'll discuss…', 'To summarize…'), pause deliberately, and support claims with examples. Record yourself, then review pacing and filler words.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        quiz: [
          {
            id: "q1",
            question: "What is 'signposting' in a presentation?",
            options: [
              "Speaking very fast",
              "Using language that guides the listener",
              "Memorizing the whole speech",
              "Avoiding eye contact",
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "course_math",
    title: "Math Foundations",
    description:
      "Strengthen the core algebra and problem-solving skills that power olympiads, the SAT and STEM careers.",
    level: "Beginner",
    subject: "Mathematics",
    direction: "STEM",
    emoji: "📐",
    tags: ["math", "algebra", "problem solving", "sat", "stem", "olympiad"],
    lessons: [
      {
        id: "l_math_1",
        title: "Linear Equations & Inequalities",
        durationMin: 14,
        content:
          "A linear equation has the form ax + b = c. Solve by isolating x: subtract b, then divide by a. Inequalities follow the same steps, but remember to flip the sign when multiplying or dividing by a negative number.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        quiz: [
          {
            id: "q1",
            question: "Solve: 3x + 6 = 21. What is x?",
            options: ["3", "5", "7", "9"],
            answer: 1,
          },
          {
            id: "q2",
            question: "When do you flip an inequality sign?",
            options: [
              "Always",
              "When adding a number",
              "When dividing by a negative number",
              "Never",
            ],
            answer: 2,
          },
        ],
      },
      {
        id: "l_math_2",
        title: "Ratios, Proportions & Percentages",
        durationMin: 13,
        content:
          "Percentages are ratios out of 100. To find 15% of 80, multiply 80 × 0.15 = 12. Proportions let you scale recipes, maps and exchange rates by setting two ratios equal and cross-multiplying.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        quiz: [
          {
            id: "q1",
            question: "What is 20% of 150?",
            options: ["15", "20", "30", "45"],
            answer: 2,
          },
        ],
      },
      {
        id: "l_math_3",
        title: "Intro to Functions",
        durationMin: 16,
        content:
          "A function maps each input to exactly one output. f(x) = 2x + 1 means: take x, double it, add one. Learn to evaluate functions, read them from tables and graphs, and recognize linear vs non-linear behavior.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBubbles.mp4",
        quiz: [
          {
            id: "q1",
            question: "If f(x) = 2x + 1, what is f(3)?",
            options: ["5", "6", "7", "8"],
            answer: 2,
          },
        ],
      },
    ],
  },
  {
    id: "course_physics",
    title: "Physics Foundations",
    description:
      "Understand motion, forces and energy with intuitive examples that connect formulas to the real world.",
    level: "Beginner",
    subject: "Physics",
    direction: "Science",
    emoji: "🔭",
    tags: ["physics", "motion", "energy", "science", "stem"],
    lessons: [
      {
        id: "l_phys_1",
        title: "Motion & Speed",
        durationMin: 12,
        content:
          "Speed = distance ÷ time. Velocity adds direction. Acceleration is how quickly velocity changes. A car going from 0 to 20 m/s in 4 seconds accelerates at 5 m/s².",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quiz: [
          {
            id: "q1",
            question: "A runner covers 100 m in 20 s. What is the average speed?",
            options: ["2 m/s", "5 m/s", "10 m/s", "20 m/s"],
            answer: 1,
          },
        ],
      },
      {
        id: "l_phys_2",
        title: "Forces & Newton's Laws",
        durationMin: 15,
        content:
          "Newton's second law: F = ma. A larger force produces a larger acceleration; a heavier object accelerates less for the same force. Friction and gravity are everyday forces acting on objects.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        quiz: [
          {
            id: "q1",
            question: "In F = ma, what does 'a' represent?",
            options: ["Area", "Acceleration", "Amplitude", "Angle"],
            answer: 1,
          },
        ],
      },
      {
        id: "l_phys_3",
        title: "Energy & Work",
        durationMin: 13,
        content:
          "Work = force × distance. Energy is the capacity to do work and is conserved — it changes form (kinetic ↔ potential) but is never lost. Lifting a book gives it gravitational potential energy.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        quiz: [
          {
            id: "q1",
            question: "Which statement reflects conservation of energy?",
            options: [
              "Energy can be created",
              "Energy changes form but total stays constant",
              "Energy always decreases to zero",
              "Energy only exists as motion",
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "course_econ",
    title: "Intro to Economics",
    description:
      "Learn how markets, money and incentives shape everyday decisions — perfect for future business and finance students.",
    level: "Beginner",
    subject: "Economics",
    direction: "Finance",
    emoji: "💹",
    tags: ["economics", "finance", "business", "markets", "money"],
    lessons: [
      {
        id: "l_econ_1",
        title: "Supply & Demand",
        durationMin: 12,
        content:
          "Demand falls as price rises; supply rises as price rises. The market price settles where the two curves meet — the equilibrium. Shortages push prices up; surpluses push them down.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        quiz: [
          {
            id: "q1",
            question: "What usually happens to demand when price increases?",
            options: ["It increases", "It decreases", "It stays the same", "It doubles"],
            answer: 1,
          },
        ],
      },
      {
        id: "l_econ_2",
        title: "Opportunity Cost",
        durationMin: 11,
        content:
          "Every choice has a cost — the value of the next best alternative you gave up. Spending two hours gaming has the opportunity cost of two hours of studying. Good decisions weigh these trade-offs.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        quiz: [
          {
            id: "q1",
            question: "Opportunity cost is best described as…",
            options: [
              "The money you spend",
              "The value of the next best alternative given up",
              "A type of tax",
              "The total budget",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "l_econ_3",
        title: "Money & Inflation",
        durationMin: 13,
        content:
          "Money is a medium of exchange, a store of value and a unit of account. Inflation is a general rise in prices, which reduces purchasing power. Central banks adjust interest rates to keep inflation stable.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        quiz: [
          {
            id: "q1",
            question: "Inflation means that over time…",
            options: [
              "Money buys more",
              "Prices generally rise and money buys less",
              "Prices are fixed",
              "Banks close",
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
];

export const SEED_USERS: User[] = [
  {
    id: "user_student",
    email: "student@demo.com",
    password: "demo1234",
    name: "Aru Student",
    role: "student",
    onboarded: true,
    grade: 11,
    interests: ["Business", "Coding", "Finance"],
    subjects: ["Mathematics", "English", "Economics"],
    goals: ["Apply to university", "Win a competition", "Learn to code"],
    language: "en",
  },
  {
    id: "user_admin",
    email: "admin@demo.com",
    password: "admin1234",
    name: "Mentoria Admin",
    role: "admin",
    onboarded: true,
    interests: [],
    subjects: [],
    goals: [],
    language: "en",
  },
];

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "English",
  "Physics",
  "Biology",
  "Chemistry",
  "Economics",
  "Computer Science",
  "SAT/IELTS",
];

export const GOAL_OPTIONS = [
  "Apply to university",
  "Win a competition",
  "Learn to code",
  "Improve English",
  "Get a scholarship",
  "Explore a career",
  "Build a project",
  "Volunteer & give back",
];
