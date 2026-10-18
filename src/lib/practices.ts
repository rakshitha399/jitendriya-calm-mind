/**
 * Guided wellness activities for the For You section.
 * Content is sample copy — supportive, non-judgmental, no health claims.
 */
import birdsBranch from "@/assets/birds-branch.jpg";
import forestSunbeams from "@/assets/forest-sunbeams.jpg";
import journalFlowers from "@/assets/journal-flowers.jpg";
import lakeSunset from "@/assets/lake-sunset-letgo.jpg";
import lotusPond from "@/assets/lotus-pond.jpg";
import sunriseMountains from "@/assets/sunrise-mountains.jpg";

export type PracticeCategory = "emotional" | "mindfulness" | "self-discovery";

export const practiceCategoryLabels: Record<PracticeCategory, string> = {
  emotional: "Emotional Wellness",
  mindfulness: "Mindfulness",
  "self-discovery": "Self-Discovery",
};

export type StepKind = "read" | "breathe" | "phrases" | "reflect" | "intention" | "gratitude" | "closing";

export interface PracticeStep {
  kind: StepKind;
  title: string;
  body: string;
  /** For "phrases" steps. */
  phrases?: string[];
  /** For "reflect" steps — optional reflection questions. */
  questions?: string[];
}

export interface Practice {
  id: string;
  title: string;
  subtitle: string;
  category: PracticeCategory;
  image: string;
  minutes: number;
  steps: PracticeStep[];
  /** Gentle message on the completion screen. */
  closing: string;
}

export const sankalpaValues = ["Patience", "Discipline", "Kindness", "Devotion"] as const;
export type SankalpaValue = (typeof sankalpaValues)[number];

export const sankalpaPresets = [
  "I move through today with patience.",
  "I give my full attention to what matters.",
  "I speak and act with kindness.",
  "I care for my body and my mind.",
];

export const practices: Practice[] = [
  {
    id: "let-go",
    title: "Let Go",
    subtitle: "Emotional reset — acknowledge, reflect, release",
    category: "emotional",
    image: lakeSunset,
    minutes: 7,
    steps: [
      {
        kind: "read",
        title: "Arrive and ground yourself",
        body: "Find a comfortable position. Feel the points where your body is supported. Take three slow breaths, and let your shoulders soften with each exhale. There is nothing to solve right now.",
      },
      {
        kind: "reflect",
        title: "Notice what is here",
        body: "Whatever you are feeling is allowed to be here. You may answer these questions in your mind, or write a few words below — writing is completely optional.",
        questions: [
          "What feeling is present for you right now?",
          "What about this is within your control today?",
          "What are you ready to set down, just for this moment?",
        ],
      },
      {
        kind: "read",
        title: "Choose your next small step",
        body: "You cannot control everything, and you were never meant to. Bring to mind one small thing you can do today, and let the rest wait.",
      },
      {
        kind: "closing",
        title: "A gentle closing",
        body: "You don't have to carry everything at once. What you set down will keep; what matters will remain.",
      },
    ],
    closing: "You don't have to carry everything at once. What you set down will keep; what matters will remain.",
  },
  {
    id: "mindful-breathing",
    title: "Mindful Breathing",
    subtitle: "Settle the mind by following the breath",
    category: "mindfulness",
    image: forestSunbeams,
    minutes: 5,
    steps: [
      {
        kind: "read",
        title: "Settle in",
        body: "Sit tall but relaxed. Soften your gaze or close your eyes. Let your hands rest. For the next few minutes, your only task is to notice the breath.",
      },
      {
        kind: "breathe",
        title: "Follow the circle",
        body: "Breathe in as the circle grows, and out as it softens. Let the breath be natural — the circle is an invitation, not a rule. You can pause whenever you like.",
      },
      {
        kind: "closing",
        title: "Rest in stillness",
        body: "Let the breath return to its own rhythm. Notice the quiet that is already here.",
      },
    ],
    closing: "Well done. Even a few conscious breaths can change the tone of a day.",
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness",
    subtitle: "Kindness towards yourself and others",
    category: "emotional",
    image: birdsBranch,
    minutes: 8,
    steps: [
      {
        kind: "read",
        title: "Begin with yourself",
        body: "Place a hand over your heart if that feels comfortable. Kindness begins at home — offer these phrases to yourself first, slowly, without forcing any feeling.",
      },
      {
        kind: "phrases",
        title: "Phrases for yourself",
        body: "Repeat each phrase silently, letting the words land before moving on.",
        phrases: ["May I be peaceful.", "May I be healthy.", "May I be safe.", "May I be kind to myself."],
      },
      {
        kind: "phrases",
        title: "Phrases for others",
        body: "Now bring to mind someone you care about, then someone neutral, then the wider world.",
        phrases: ["May you be happy and safe.", "May others be happy and safe.", "May all beings be free from suffering."],
      },
      {
        kind: "closing",
        title: "A gentle closing",
        body: "Kindness offered quietly still counts. Carry this warmth with you into the rest of your day.",
      },
    ],
    closing: "Kindness offered quietly still counts. Carry this warmth with you.",
  },
  {
    id: "inner-reflection",
    title: "Inner Reflection",
    subtitle: "Understand your thoughts, experiences and values",
    category: "self-discovery",
    image: journalFlowers,
    minutes: 10,
    steps: [
      {
        kind: "read",
        title: "Create a quiet space",
        body: "This is a conversation with yourself — there are no right answers. Take a breath and let your thoughts slow down before you begin.",
      },
      {
        kind: "reflect",
        title: "Guided questions",
        body: "Consider each question gently. You may write below if you wish — it stays on this device, and you choose whether to save it to your journal at the end.",
        questions: [
          "What has been on your mind lately?",
          "What did a recent experience teach you?",
          "Which value do you want to live by tomorrow?",
        ],
      },
      {
        kind: "closing",
        title: "A gentle closing",
        body: "Understanding grows quietly. Thank you for spending this time with yourself.",
      },
    ],
    closing: "Understanding grows quietly. Thank you for spending this time with yourself.",
  },
  {
    id: "daily-sankalpa",
    title: "Daily Sankalpa",
    subtitle: "Choose a heartfelt intention for today",
    category: "self-discovery",
    image: sunriseMountains,
    minutes: 5,
    steps: [
      {
        kind: "read",
        title: "What is a Sankalpa?",
        body: "Sankalpa means a heartfelt intention or resolve — not a goal to achieve, but a direction to walk in. Choose one that feels true today, and let it guide small moments.",
      },
      {
        kind: "intention",
        title: "Choose your intention",
        body: "Select one of these, or write your own. Then choose the value it honours.",
      },
      {
        kind: "closing",
        title: "A gentle closing",
        body: "Your intention is saved on this device. Return to it whenever the day feels scattered.",
      },
    ],
    closing: "Your intention is saved. Return to it whenever the day feels scattered.",
  },
  {
    id: "gratitude-practice",
    title: "Gratitude Practice",
    subtitle: "Appreciate the meaningful everyday moments",
    category: "emotional",
    image: lotusPond,
    minutes: 5,
    steps: [
      {
        kind: "read",
        title: "Look back gently",
        body: "Gratitude is not about ignoring difficulty — it is about also noticing what quietly supports you. Think of small, ordinary things: a warm drink, a message, a patch of sunlight.",
      },
      {
        kind: "gratitude",
        title: "Three things you appreciate",
        body: "Write up to three things you appreciate today. One is plenty. All fields are optional.",
      },
      {
        kind: "closing",
        title: "A gentle closing",
        body: "What we notice, we nurture. May these small good things stay with you today.",
      },
    ],
    closing: "What we notice, we nurture. May these small good things stay with you today.",
  },
];

export const getPractice = (id: string) => practices.find((p) => p.id === id);
