
import { Question } from '../../types';

// Each question is authored in every language; options must stay in the same order
// across languages so correctIndex applies to all of them.
const QUESTION_POOL: Question[] = [
  // ─────────────────────────────────────────────────────────────
  // STAGE 1 — Desert / Heritage (التراث العربي)
  // Bahasa, sejarah, warisan, geografi semenanjung
  // ─────────────────────────────────────────────────────────────
  {
    id: 'h1', correctIndex: 0, category: 'geography', stage: 1, theme: 'heritage',
    text: { ar: 'ما عاصمة المملكة العربية السعودية؟', en: 'What is the capital of Saudi Arabia?' },
    options: { ar: ['الرياض', 'جدة', 'مكة'], en: ['Riyadh', 'Jeddah', 'Makkah'] }
  },
  {
    id: 'h2', correctIndex: 1, category: 'geography', stage: 1, theme: 'heritage',
    text: { ar: 'في أي صحراء تقع مدينة الحكمة؟', en: 'Which desert is the City of Wisdom in?' },
    options: { ar: ['الكبرى', 'العربية', 'جوبي'], en: ['Sahara', 'Arabian', 'Gobi'] }
  },
  {
    // "نور" has 3 letters in Arabic; English uses a 3-letter word so the answer stays the same.
    id: 'h3', correctIndex: 0, category: 'language', stage: 1, theme: 'heritage',
    text: { ar: 'كم عدد حروف كلمة "نور"؟', en: 'How many letters are in the word "Sun"?' },
    options: { ar: ['٣', '٢', '٤'], en: ['3', '2', '4'] }
  },
  {
    id: 'h4', correctIndex: 2, category: 'language', stage: 1, theme: 'heritage',
    text: { ar: 'حرف (أ) يأتي في:', en: 'In the alphabet, the letter (A) comes:' },
    options: { ar: ['النهاية', 'الوسط', 'البداية'], en: ['At the end', 'In the middle', 'At the beginning'] }
  },
  {
    id: 'h5', correctIndex: 2, category: 'language', stage: 1, theme: 'heritage',
    text: { ar: 'كلمة "كتاب" تعني:', en: 'The word "book" means:' },
    options: { ar: ['لعبة', 'حيوان', 'شيء نقرأ فيه'], en: ['A game', 'An animal', 'Something we read'] }
  },
  {
    id: 'h6', correctIndex: 1, category: 'trivia', stage: 1, theme: 'heritage',
    text: { ar: 'ما هو الحيوان الذي يُلقب بسفينة الصحراء؟', en: 'Which animal is called the ship of the desert?' },
    options: { ar: ['الحصان', 'الجمل', 'الغزال'], en: ['Horse', 'Camel', 'Gazelle'] }
  },
  {
    id: 'h7', correctIndex: 0, category: 'trivia', stage: 1, theme: 'heritage',
    text: { ar: 'ما لون الرمل في الصحراء؟', en: 'What color is desert sand?' },
    options: { ar: ['ذهبي', 'أزرق', 'أخضر'], en: ['Golden', 'Blue', 'Green'] }
  },
  {
    id: 'h8', correctIndex: 1, category: 'trivia', stage: 1, theme: 'heritage',
    text: { ar: 'النخلة تعطينا:', en: 'A palm tree gives us:' },
    options: { ar: ['التفاح', 'التمر', 'الموز'], en: ['Apples', 'Dates', 'Bananas'] }
  },
  {
    id: 'h9', correctIndex: 1, category: 'trivia', stage: 1, theme: 'heritage',
    text: { ar: 'كم عدد فصول السنة؟', en: 'How many seasons are in a year?' },
    options: { ar: ['٣', '٤', '٥'], en: ['3', '4', '5'] }
  },
  {
    id: 'h10', correctIndex: 2, category: 'language', stage: 1, theme: 'heritage',
    text: { ar: 'ما الحرف الأول من الأبجدية العربية؟', en: 'What is the first letter of the Arabic alphabet?' },
    options: { ar: ['ب', 'ت', 'أ'], en: ['Ba (ب)', 'Ta (ت)', 'Alif (أ)'] }
  },

  // ─────────────────────────────────────────────────────────────
  // STAGE 2 — City / Knowledge (العلوم والمعرفة)
  // Sains, matematika, astronomi, logika — Bayt al-Hikma tema
  // ─────────────────────────────────────────────────────────────
  {
    id: 'k1', correctIndex: 1, category: 'science', stage: 2, theme: 'knowledge',
    text: { ar: 'ما اسم الكوكب الذي نعيش عليه؟', en: 'What is the name of the planet we live on?' },
    options: { ar: ['المريخ', 'الأرض', 'الزهرة'], en: ['Mars', 'Earth', 'Venus'] }
  },
  {
    id: 'k2', correctIndex: 1, category: 'math', stage: 2, theme: 'knowledge',
    text: { ar: '٢ + ١ = ؟', en: '2 + 1 = ?' },
    options: { ar: ['٤', '٣', '١'], en: ['4', '3', '1'] }
  },
  {
    id: 'k3', correctIndex: 2, category: 'math', stage: 2, theme: 'knowledge',
    text: { ar: '٥ − ٢ = ؟', en: '5 − 2 = ?' },
    options: { ar: ['٢', '٤', '٣'], en: ['2', '4', '3'] }
  },
  {
    id: 'k4', correctIndex: 2, category: 'math', stage: 2, theme: 'knowledge',
    text: { ar: 'أي رقم أصغر؟', en: 'Which number is smaller?' },
    options: { ar: ['٩', '٧', '١'], en: ['9', '7', '1'] }
  },
  {
    id: 'k5', correctIndex: 0, category: 'science', stage: 2, theme: 'knowledge',
    text: { ar: 'ما لون السماء في النهار؟', en: 'What color is the sky during the day?' },
    options: { ar: ['أزرق', 'أخضر', 'أحمر'], en: ['Blue', 'Green', 'Red'] }
  },
  {
    id: 'k6', correctIndex: 0, category: 'science', stage: 2, theme: 'knowledge',
    text: { ar: 'الشمس نجم أم كوكب؟', en: 'Is the Sun a star or a planet?' },
    options: { ar: ['نجم', 'كوكب', 'قمر'], en: ['Star', 'Planet', 'Moon'] }
  },
  {
    id: 'k7', correctIndex: 1, category: 'geography', stage: 2, theme: 'knowledge',
    text: { ar: 'كم عدد قارات العالم؟', en: 'How many continents are there?' },
    options: { ar: ['٥', '٧', '٩'], en: ['5', '7', '9'] }
  },
  {
    id: 'k8', correctIndex: 2, category: 'math', stage: 2, theme: 'knowledge',
    text: { ar: 'أي شكل له ثلاثة أضلاع؟', en: 'Which shape has three sides?' },
    options: { ar: ['مربع', 'دائرة', 'مثلث'], en: ['Square', 'Circle', 'Triangle'] }
  },
  {
    id: 'k9', correctIndex: 1, category: 'science', stage: 2, theme: 'knowledge',
    text: { ar: 'كم عدد أرجل العنكبوت؟', en: 'How many legs does a spider have?' },
    options: { ar: ['٦', '٨', '١٠'], en: ['6', '8', '10'] }
  },
  {
    id: 'k10', correctIndex: 1, category: 'science', stage: 2, theme: 'knowledge',
    text: { ar: 'صل النجوم! ما شكل هذا البرج السماوي؟', en: 'Connect the stars! What shape is this constellation?' },
    options: { ar: ['العقرب', 'الأسد', 'الميزان'], en: ['Scorpio', 'Leo', 'Libra'] }
  },

  // ─────────────────────────────────────────────────────────────
  // GENERAL — fallback pool if a stage runs out
  // ─────────────────────────────────────────────────────────────
  {
    id: 'g1', correctIndex: 0, category: 'trivia', theme: 'general',
    text: { ar: 'كم عدد أيام الأسبوع؟', en: 'How many days are in a week?' },
    options: { ar: ['٧', '٥', '١٠'], en: ['7', '5', '10'] }
  },
  {
    id: 'g2', correctIndex: 1, category: 'math', theme: 'general',
    text: { ar: 'أيهما أكبر؟', en: 'Which is bigger?' },
    options: { ar: ['٣', '٥', '١'], en: ['3', '5', '1'] }
  },
  {
    id: 'g3', correctIndex: 2, category: 'trivia', theme: 'general',
    text: { ar: 'ما الحيوان الذي يقول "موو"؟', en: 'Which animal says "Moo"?' },
    options: { ar: ['قط', 'كلب', 'بقرة'], en: ['Cat', 'Dog', 'Cow'] }
  },
];

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/**
 * M2: stage-aware question pool.
 * - stage=1 → desert/heritage questions first, then general fallback
 * - stage=2 → city/knowledge questions first, then general fallback
 * - undefined → full shuffled pool (legacy behavior)
 */
export const getQuestions = (stage?: number): Question[] => {
    if (stage === 1 || stage === 2) {
        const themed = QUESTION_POOL.filter(q => q.stage === stage);
        const fallback = QUESTION_POOL.filter(q => q.stage === undefined);
        return [...shuffle(themed), ...shuffle(fallback)];
    }
    return shuffle(QUESTION_POOL);
};
