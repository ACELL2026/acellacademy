/**
 * Seed content.
 *
 * Course copy is the author's own, used as written (copyState: 'authored').
 * Everything else is placeholder in his register, flagged 'needs_review',
 * and renders with an admin-only banner until he edits it — so my words
 * are never shipped under his name by forgetting they were placeholders.
 *
 * TO EDIT: change the text, then change copyState to 'authored'.
 */

export type CopyState = 'authored' | 'needs_review';

export interface SeedBook {
  slug: string;
  title: string;
  description: string;
  level: 'B1' | 'B2' | 'C1' | 'C2' | null;
  status: 'published' | 'coming_soon';
  amountMinor: number | null;
  coverAlt: string;
  copyState: CopyState;
}

export const BOOKS: SeedBook[] = [
  {
    slug: 'english-tenses-and-senses',
    title: 'English Tenses and Senses: From Form to Thought',
    description:
      'A sensory guide to the English tense system. Four lenses — Snapshot, ' +
      'Film, Echo, and Echo in Motion — turn grammar from a set of rules into ' +
      'a way of seeing.',
    level: 'C1',
    status: 'published',
    amountMinor: 45_000, // 45.000 LYD — CONFIRM
    coverAlt: 'Cover of English Tenses and Senses, showing a compass rose',
    copyState: 'needs_review',
  },
  {
    slug: 'mastery-studio',
    title: 'Mastery Studio',
    description: 'A workbook of exercises and projects.',
    level: 'C1',
    status: 'coming_soon',
    amountMinor: null,
    coverAlt: 'Cover of Mastery Studio',
    copyState: 'needs_review',
  },
  {
    slug: 'voice-studio',
    title: 'Voice Studio',
    description: 'A guide to pronunciation and intonation.',
    level: 'B2',
    status: 'coming_soon',
    amountMinor: null,
    coverAlt: 'Cover of Voice Studio',
    copyState: 'needs_review',
  },
  {
    slug: 'style-studio',
    title: 'Style Studio',
    description: 'A guide to style and expression.',
    level: 'C1',
    status: 'coming_soon',
    amountMinor: null,
    coverAlt: 'Cover of Style Studio',
    copyState: 'needs_review',
  },
];

/* ---------------- Beyond Words Mastery B2-C1 ---------------- */

export interface SeedUnit {
  number: number;
  title: string;
  strapline: string;
  performanceTask: string;
}

export const BEYOND_WORDS_UNITS: SeedUnit[] = [
  { number: 1, title: 'Voice and Identity',
    strapline: 'Find your thread. Tell one story that contains the whole.',
    performanceTask: '5-minute personal narrative speech' },
  { number: 2, title: 'Words in Community',
    strapline: 'Navigate disagreement, heal wounds, and discover what you owe.',
    performanceTask: 'Speech or reflective letter on community responsibility' },
  { number: 3, title: 'Global Perspectives',
    strapline: 'Cross borders, read unseen rules, speak for yourself on any stage.',
    performanceTask: 'Presentation: "My Culture in a Global World"' },
  { number: 4, title: 'Power of Ideas',
    strapline: 'Turn frustration into innovation. Prepare for a future you cannot predict.',
    performanceTask: 'TED-style talk: "An Idea That Can Change the World"' },
  { number: 5, title: 'Beyond Words — Legacy',
    strapline: 'Ask what remains. Pass on what you were given.',
    performanceTask: '7–10 minute culminating Legacy Speech' },
];

export const BEYOND_WORDS = {
  slug: 'beyond-words-mastery-b2-c1',
  title: 'Beyond Words Mastery B2-C1',
  level: 'B2–C1',
  lessonCount: 20,
  unitCount: 5,
  amountMinor: 450_000, // 450.000 LYD — CONFIRM
  hook: 'Speak English without erasing yourself.',
  lede:
    'Most English courses teach you to sound like someone else. ' +
    'This one teaches you to sound like yourself — in English.',
  intro:
    'Beyond Words Mastery is a 20-lesson course for advanced learners who want ' +
    'more than grammar drills. You will learn to tell your story, to disagree ' +
    'without losing the relationship, to represent Libya on an international ' +
    'stage, and to turn ideas into impact. You will finish with a portfolio of ' +
    'speeches, bios, and reflections that are unmistakably yours.',
  outcomes: [
    'A 5-minute personal narrative speech that captures who you are',
    'A professional bio in three registers — traditional, accessible, values-driven',
    'A personal brand statement suite',
    'A cross-cultural communication toolkit',
    'A TED-style talk on an idea you believe in',
    'A culminating Legacy Speech on what you want to leave behind',
  ],
  audience: [
    'Libyan and Arab professionals who use English at work and want to use it better',
    'B2–C1 learners preparing for CAE, IELTS, TOEFL, or Trinity ISE',
    'Anyone tired of textbooks that erase their culture',
    'Anyone who wants to speak with authority and warmth — and keep their accent, their values, their story',
  ],
  differentiator:
    'Every lesson is grounded in Libyan voices — Ibrahim Al-Koni, Libyan ' +
    'proverbs, the wisdom of grandmothers who never learned to read but knew ' +
    'how to hold a family together. You will not learn to sound British. You ' +
    'will learn to sound like yourself, in English.',
  closer: 'The thread continues.',
  copyState: 'authored' as CopyState,
};

/* ---------------- services ---------------- */

export interface SeedService {
  slug: string;
  title: string;
  category: string;
  /** All services are 'enquiry' at launch: scope varies per engagement,
   *  and "Contact to discuss" is more honest than a made-up number.
   *  Switching to 'booking' later is config, not a migration. */
  mode: 'enquiry' | 'booking';
  pricing: 'fixed' | 'hourly' | 'from' | 'quote';
  amountMinor: number | null;
  whoFor: string;
  format: string;
  scope: string;
  copyState: CopyState;
}

export const SERVICES: SeedService[] = [
  { slug: 'teaching-mentoring', title: 'Teaching Tips and Mentoring',
    category: 'teaching_mentoring', mode: 'enquiry', pricing: 'quote', amountMinor: null,
    whoFor: 'English teachers who want to sharpen their practice',
    format: 'One-to-one session', scope: 'Discussed per engagement',
    copyState: 'needs_review' },
  { slug: 'research-proofreading', title: 'Research Proofreading and Editing',
    category: 'research_proofreading', mode: 'enquiry', pricing: 'quote', amountMinor: null,
    whoFor: 'Researchers and postgraduate students writing in English',
    format: 'Written report with tracked changes', scope: 'Quoted per manuscript',
    copyState: 'needs_review' },
  { slug: 'curriculum-design', title: 'Curriculum Design Consultation',
    category: 'curriculum_design', mode: 'enquiry', pricing: 'quote', amountMinor: null,
    whoFor: 'Schools, universities, and private academies',
    format: 'Consultation and written recommendations', scope: 'Quoted per project',
    copyState: 'needs_review' },
  { slug: 'materials-development', title: 'Materials Development',
    category: 'materials_development', mode: 'enquiry', pricing: 'quote', amountMinor: null,
    whoFor: 'Institutions and teaching teams',
    format: 'Review or original development', scope: 'Quoted per brief',
    copyState: 'needs_review' },
  { slug: 'academic-writing-support', title: 'Academic Writing Support',
    category: 'academic_writing', mode: 'enquiry', pricing: 'quote', amountMinor: null,
    whoFor: 'Non-native English speakers writing in academic contexts',
    format: 'One-to-one session', scope: 'Discussed per engagement',
    copyState: 'needs_review' },
];

export const CONTACT_EMAIL = 'acellacademy@gmail.com';

export const needsReview = (items: { copyState: CopyState }[]) =>
  items.some((i) => i.copyState === 'needs_review');
