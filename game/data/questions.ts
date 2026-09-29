
import { Question } from '../../types';

// Each question is authored in every language; options must stay in the same order
// across languages so correctIndex applies to all of them.
const QUESTION_POOL: Question[] = [
  // 1. General Knowledge (معلومات عامة)
  {
    id: 'q1', correctIndex: 0, category: 'trivia',
    text: { ar: 'كم عدد أيام الأسبوع؟', en: 'How many days are in a week?' },
    options: { ar: ['٧', '٥', '١٠'], en: ['7', '5', '10'] }
  },
  {
    id: 'q2', correctIndex: 0, category: 'science',
    text: { ar: 'ما لون السماء في النهار؟', en: 'What color is the sky during the day?' },
    options: { ar: ['أزرق', 'أخضر', 'أحمر'], en: ['Blue', 'Green', 'Red'] }
  },
  {
    // "نور" has 3 letters in Arabic; English uses a 3-letter word so the answer stays the same.
    id: 'q3', correctIndex: 0, category: 'language',
    text: { ar: 'كم عدد حروف كلمة نور؟', en: 'How many letters are in the word "Sun"?' },
    options: { ar: ['٣', '٢', '٤'], en: ['3', '2', '4'] }
  },
  {
    id: 'q4', correctIndex: 1, category: 'math',
    text: { ar: 'أيهما أكبر؟', en: 'Which is bigger?' },
    options: { ar: ['٣', '٥', '١'], en: ['3', '5', '1'] }
  },
  {
    id: 'q5', correctIndex: 2, category: 'trivia',
    text: { ar: 'ما الحيوان الذي يقول "موو"؟', en: 'Which animal says "Moo"?' },
    options: { ar: ['قط', 'كلب', 'بقرة'], en: ['Cat', 'Dog', 'Cow'] }
  },

  // 2. Simple Math (رياضيات بسيطة)
  {
    id: 'm1', correctIndex: 1, category: 'math',
    text: { ar: '٢ + ١ = ؟', en: '2 + 1 = ?' },
    options: { ar: ['٤', '٣', '١'], en: ['4', '3', '1'] }
  },
  {
    id: 'm2', correctIndex: 2, category: 'math',
    text: { ar: '٥ − ٢ = ؟', en: '5 − 2 = ?' },
    options: { ar: ['٢', '٤', '٣'], en: ['2', '4', '3'] }
  },
  {
    id: 'm3', correctIndex: 2, category: 'math',
    text: { ar: 'أي رقم أصغر؟', en: 'Which number is smaller?' },
    options: { ar: ['٩', '٧', '١'], en: ['9', '7', '1'] }
  },

  // 3. Basic Language (لغة)
  {
    id: 'l1', correctIndex: 2, category: 'language',
    text: { ar: 'حرف (أ) يأتي:', en: 'In the alphabet, the letter (A) comes:' },
    options: { ar: ['في النهاية', 'في الوسط', 'في البداية'], en: ['At the end', 'In the middle', 'At the beginning'] }
  },
  {
    id: 'l2', correctIndex: 2, category: 'language',
    text: { ar: 'كلمة كتاب تعني:', en: 'The word "book" means:' },
    options: { ar: ['لعبة', 'حيوان', 'شيء نقرأ به'], en: ['A game', 'An animal', 'Something we read'] }
  },

  // 4. Astrolabe Puzzle (Special)
  {
    id: 'puzzle_astrolabe', correctIndex: 1, category: 'science',
    text: { ar: 'صل النجوم! ما شكل هذا البرج السماوي؟', en: 'Connect the stars! What shape is this constellation?' },
    options: { ar: ['العقرب', 'الأسد (Leo)', 'الميزان'], en: ['Scorpio', 'Leo', 'Libra'] }
  }
];

export const getQuestions = (): Question[] => {
    // Shuffle questions for randomness every run
    return [...QUESTION_POOL].sort(() => Math.random() - 0.5);
};
