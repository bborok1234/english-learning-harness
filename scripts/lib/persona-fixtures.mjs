export const personaFixtures = [
  {
    id: "jieun-freeze-day1",
    persona: "jieun",
    scenario: "stuck-repair",
    profile: {
      preferredName: "Jieun",
      motivation: "I freeze when English feels like identity exposure.",
      correctionStyle: "gentle recast first",
      familiarTopics: "coffee, daily routine",
      topicsToAvoid: "public ranking, test scores",
    },
    learnerTurns: ["I don't know how to say it, but coffee good."],
  },
  {
    id: "minho-repair-day1",
    persona: "minho",
    scenario: "stuck-repair",
    profile: {
      preferredName: "Minho",
      motivation: "I want to recover from correction trauma and keep talking.",
      correctionStyle: "after-session correction only",
      familiarTopics: "commute, lunch, work breaks",
      topicsToAvoid: "harsh grammar judgment",
    },
    learnerTurns: ["I don't know how to say it, but lunch was okay."],
  },
  {
    id: "sujin-creative-day1",
    persona: "sujin",
    scenario: "creative-opinion",
    profile: {
      preferredName: "Sujin",
      motivation: "I want expressive English for creative identity.",
      correctionStyle: "gentle recast first",
      familiarTopics: "music, design, stories",
      topicsToAvoid: "generic textbook drills",
    },
    learnerTurns: ["This song feels kind of blue and warm."],
  },
  {
    id: "hyewon-reactivation-day1",
    persona: "hyewon",
    scenario: "reactivation-check-in",
    profile: {
      preferredName: "Hyewon",
      motivation: "I want to reactivate my English without shame about lost ability.",
      correctionStyle: "one elegant recast",
      familiarTopics: "books, travel, quiet weekends",
      topicsToAvoid: "failed former English major framing",
    },
    learnerTurns: ["What I want to say is I used to read more often."],
  },
];

export const prohibitedFixtureClaims = [
  "confident with foreigners",
  "native speaker",
  "your level is low",
  "you made several grammar mistakes",
  "failed former english major",
];
