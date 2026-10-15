/**
 * SAMPLE CONTENT — every title, description and quote in this file is
 * placeholder copy. Replace freely; pages read from here and need no redesign.
 */
import heroSunrise from "@/assets/hero-sunrise.jpg";
import lake from "@/assets/lake-breathing.jpg";
import lotus from "@/assets/lotus.jpg";
import forest from "@/assets/forest-dawn.jpg";

export const images = { heroSunrise, lake, lotus, forest };

export type Category = "meditation" | "mantras" | "breathing" | "relaxation";
export type Difficulty = "Beginner" | "Intermediate" | "All levels";
export type Mood = "calm" | "anxious" | "tired" | "low" | "restless" | "grateful";
export type Goal = "focus" | "sleep" | "stress" | "gratitude" | "energy" | "self-compassion";

export interface Session {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  intro: string;
  steps: string[];
  durationMin: number;
  difficulty: Difficulty;
  category: Category;
  image: string;
  moods: Mood[];
  goals: Goal[];
  /** Optional playable audio URL. None of the sample sessions ship audio yet. */
  audioUrl?: string;
}

export const categoryLabels: Record<Category, string> = {
  meditation: "Meditation",
  mantras: "Mantras",
  breathing: "Breathing",
  relaxation: "Relaxation",
};

export const moodOptions: { id: Mood; label: string }[] = [
  { id: "calm", label: "Calm" },
  { id: "anxious", label: "Anxious" },
  { id: "tired", label: "Tired" },
  { id: "low", label: "Low" },
  { id: "restless", label: "Restless" },
  { id: "grateful", label: "Grateful" },
];

export const goalOptions: { id: Goal; label: string }[] = [
  { id: "focus", label: "Better focus" },
  { id: "sleep", label: "Restful sleep" },
  { id: "stress", label: "Less stress" },
  { id: "gratitude", label: "More gratitude" },
  { id: "energy", label: "Gentle energy" },
  { id: "self-compassion", label: "Self-compassion" },
];

export const sessions: Session[] = [
  {
    id: "mindful-breathing",
    title: "Mindful Breathing",
    subtitle: "Calm your mind and increase focus",
    description: "A gentle practice of following the breath to settle a busy mind.",
    intro:
      "Find a comfortable seat, soften your gaze and let your shoulders drop. For the next few minutes, there is nothing to fix — only the breath to notice.",
    steps: ["Settle into posture", "Notice the natural breath", "Count four in, six out", "Rest in stillness"],
    durationMin: 10,
    difficulty: "Beginner",
    category: "breathing",
    image: lake,
    moods: ["anxious", "restless"],
    goals: ["focus", "stress"],
  },
  {
    id: "morning-gratitude",
    title: "Morning Gratitude",
    subtitle: "Build a positive mindset for the day",
    description: "Begin the day by recalling three small things you are thankful for.",
    intro:
      "As the day begins, gently bring to mind the people, moments and simple comforts that support you.",
    steps: ["Arrive with three breaths", "Recall one person", "Recall one moment", "Set an intention"],
    durationMin: 10,
    difficulty: "Beginner",
    category: "meditation",
    image: lotus,
    moods: ["low", "calm", "grateful"],
    goals: ["gratitude", "energy"],
  },
  {
    id: "mantra-inner-peace",
    title: "Mantra for Inner Peace",
    subtitle: "Chant and feel the calm within",
    description: "Repeat a simple calming phrase, silently or aloud, to steady attention.",
    intro: "Choose a soft phrase such as “Om Shanti” and let its rhythm carry your attention.",
    steps: ["Choose your mantra", "Repeat with the breath", "Let the sound soften", "Sit in silence"],
    durationMin: 5,
    difficulty: "All levels",
    category: "mantras",
    image: lotus,
    moods: ["anxious", "restless", "calm"],
    goals: ["stress", "focus"],
  },
  {
    id: "gentle-yoga-relaxation",
    title: "Gentle Yoga for Relaxation",
    subtitle: "Release tension and feel light",
    description: "Slow, seated stretches paired with the breath to unwind the body.",
    intro: "Move slowly and only within comfort. Stop any movement that does not feel right for you.",
    steps: ["Neck rolls", "Seated side stretch", "Gentle twist", "Forward fold & rest"],
    durationMin: 15,
    difficulty: "Beginner",
    category: "relaxation",
    image: forest,
    moods: ["tired", "restless"],
    goals: ["stress", "sleep", "energy"],
  },
  {
    id: "body-scan-sleep",
    title: "Evening Body Scan",
    subtitle: "Unwind before sleep",
    description: "Move attention slowly from head to toe, softening each area.",
    intro: "Lie down if you like. Let the floor or bed hold your full weight.",
    steps: ["Settle and breathe", "Scan head and shoulders", "Scan torso and arms", "Scan legs and feet"],
    durationMin: 20,
    difficulty: "All levels",
    category: "relaxation",
    image: lake,
    moods: ["tired", "anxious"],
    goals: ["sleep", "stress"],
  },
  {
    id: "box-breathing",
    title: "Box Breathing",
    subtitle: "Four steady counts to reset",
    description: "Inhale, hold, exhale, hold — each for four counts.",
    intro: "A simple, structured rhythm to return to whenever you feel scattered.",
    steps: ["Inhale for four", "Hold for four", "Exhale for four", "Hold for four"],
    durationMin: 5,
    difficulty: "Beginner",
    category: "breathing",
    image: forest,
    moods: ["anxious", "restless"],
    goals: ["focus", "stress"],
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness",
    subtitle: "Kindness towards yourself and others",
    description: "Offer warm wishes to yourself, a loved one and the wider world.",
    intro: "Gently repeat: may I be well, may I be peaceful, may I be kind to myself.",
    steps: ["Wishes for yourself", "For someone you love", "For someone neutral", "For all beings"],
    durationMin: 12,
    difficulty: "Intermediate",
    category: "meditation",
    image: heroSunrise,
    moods: ["low", "grateful"],
    goals: ["self-compassion", "gratitude"],
  },
  {
    id: "om-chanting",
    title: "Om Chanting",
    subtitle: "Resonance and stillness",
    description: "Long, slow chants of Om followed by quiet listening.",
    intro: "Let each chant fade completely before beginning the next.",
    steps: ["Deep inhale", "Chant A-U-M", "Listen to the silence", "Repeat gently"],
    durationMin: 8,
    difficulty: "Intermediate",
    category: "mantras",
    image: heroSunrise,
    moods: ["calm", "low"],
    goals: ["focus", "energy"],
  },
];

export const getSession = (id: string) => sessions.find((s) => s.id === id);

export const quotes = [
  { text: "A calm mind is the foundation of a beautiful life.", source: "Sample quote" },
  { text: "You are not your thoughts; you are the awareness that notices them.", source: "Sample quote" },
  { text: "Small steps, taken gently, become a path.", source: "Sample quote" },
  { text: "Breathe in stillness, breathe out what you no longer need.", source: "Sample quote" },
  { text: "The present moment is the only place where life is lived.", source: "Sample quote" },
  { text: "Discipline of the senses is the doorway to freedom.", source: "Sample quote" },
  { text: "Be kind to yourself — growth is quiet work.", source: "Sample quote" },
];

/** Deterministic "quote of the day" so it doesn't change on every render. */
export const quoteForDate = (d: Date) => {
  const day = Math.floor(d.getTime() / 86_400_000);
  return quotes[day % quotes.length]!;
};

export const reflectionPrompts = [
  "What is one thing you noticed today that you usually overlook?",
  "Where in your body do you feel tension right now? Breathe into it.",
  "What would it look like to be gentle with yourself this evening?",
  "Name one person who made today a little easier.",
];

export interface ExploreCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  /** Where the card leads. */
  to: { kind: "recommendations"; filter: Category | "all" } | { kind: "wisdom" } | { kind: "meditation" };
}

export const exploreCategories: ExploreCategory[] = [
  { id: "meditation", title: "Meditation", description: "Settle the mind with guided sits.", image: lake, to: { kind: "recommendations", filter: "meditation" } },
  { id: "breathing", title: "Breathing exercises", description: "Simple rhythms to calm and focus.", image: forest, to: { kind: "recommendations", filter: "breathing" } },
  { id: "yoga", title: "Yoga & relaxation", description: "Gentle movement to release tension.", image: heroSunrise, to: { kind: "recommendations", filter: "relaxation" } },
  { id: "mantras", title: "Mantras & spiritual practice", description: "Chant, repeat and rest in sound.", image: lotus, to: { kind: "recommendations", filter: "mantras" } },
  { id: "wisdom", title: "Daily wisdom", description: "Short reflections for each day.", image: lotus, to: { kind: "wisdom" } },
  { id: "mindfulness", title: "Guided mindfulness", description: "Browse every guided session.", image: forest, to: { kind: "meditation" } },
];

export const sampleUser = {
  name: "Shikku",
  tagline: "Student • Dreamer • Seeker",
  /** SAMPLE: not measured — shown with a "sample" label in the UI. */
  sampleWellnessPercent: 72,
  sampleStreakDays: 12,
};
