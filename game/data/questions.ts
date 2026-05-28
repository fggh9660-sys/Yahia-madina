
import { Question } from '../../types';

const QUESTION_POOL: Question[] = [
  // ─────────────────────────────────────────────────────────────
  // STAGE 1 — Desert / Heritage (التراث العربي)
  // Bahasa, sejarah, warisan, geografi semenanjung
  // ─────────────────────────────────────────────────────────────
  { id: 'h1', text: 'ما عاصمة المملكة العربية السعودية؟', options: ['الرياض', 'جدة', 'مكة'], correctIndex: 0, category: 'geography', stage: 1, theme: 'heritage' },
  { id: 'h2', text: 'في أي صحراء تقع مدينة الحكمة؟', options: ['الكبرى', 'العربية', 'جوبي'], correctIndex: 1, category: 'geography', stage: 1, theme: 'heritage' },
  { id: 'h3', text: 'كم عدد حروف كلمة "نور"؟', options: ['٣', '٢', '٤'], correctIndex: 0, category: 'language', stage: 1, theme: 'heritage' },
  { id: 'h4', text: 'حرف (أ) يأتي في:', options: ['النهاية', 'الوسط', 'البداية'], correctIndex: 2, category: 'language', stage: 1, theme: 'heritage' },
  { id: 'h5', text: 'كلمة "كتاب" تعني:', options: ['لعبة', 'حيوان', 'شيء نقرأ فيه'], correctIndex: 2, category: 'language', stage: 1, theme: 'heritage' },
  { id: 'h6', text: 'ما هو الحيوان الذي يُلقب بسفينة الصحراء؟', options: ['الحصان', 'الجمل', 'الغزال'], correctIndex: 1, category: 'trivia', stage: 1, theme: 'heritage' },
  { id: 'h7', text: 'ما لون الرمل في الصحراء؟', options: ['ذهبي', 'أزرق', 'أخضر'], correctIndex: 0, category: 'trivia', stage: 1, theme: 'heritage' },
  { id: 'h8', text: 'النخلة تعطينا:', options: ['التفاح', 'التمر', 'الموز'], correctIndex: 1, category: 'trivia', stage: 1, theme: 'heritage' },
  { id: 'h9', text: 'كم عدد فصول السنة؟', options: ['٣', '٤', '٥'], correctIndex: 1, category: 'trivia', stage: 1, theme: 'heritage' },
  { id: 'h10', text: 'ما الحرف الأول من الأبجدية العربية؟', options: ['ب', 'ت', 'أ'], correctIndex: 2, category: 'language', stage: 1, theme: 'heritage' },

  // ─────────────────────────────────────────────────────────────
  // STAGE 2 — City / Knowledge (العلوم والمعرفة)
  // Sains, matematika, astronomi, logika — Bayt al-Hikma tema
  // ─────────────────────────────────────────────────────────────
  { id: 'k1', text: 'ما اسم الكوكب الذي نعيش عليه؟', options: ['المريخ', 'الأرض', 'الزهرة'], correctIndex: 1, category: 'science', stage: 2, theme: 'knowledge' },
  { id: 'k2', text: '٢ + ١ = ؟', options: ['٤', '٣', '١'], correctIndex: 1, category: 'math', stage: 2, theme: 'knowledge' },
  { id: 'k3', text: '٥ − ٢ = ؟', options: ['٢', '٤', '٣'], correctIndex: 2, category: 'math', stage: 2, theme: 'knowledge' },
  { id: 'k4', text: 'أي رقم أصغر؟', options: ['٩', '٧', '١'], correctIndex: 2, category: 'math', stage: 2, theme: 'knowledge' },
  { id: 'k5', text: 'ما لون السماء في النهار؟', options: ['أزرق', 'أخضر', 'أحمر'], correctIndex: 0, category: 'science', stage: 2, theme: 'knowledge' },
  { id: 'k6', text: 'الشمس نجم أم كوكب؟', options: ['نجم', 'كوكب', 'قمر'], correctIndex: 0, category: 'science', stage: 2, theme: 'knowledge' },
  { id: 'k7', text: 'كم عدد قارات العالم؟', options: ['٥', '٧', '٩'], correctIndex: 1, category: 'geography', stage: 2, theme: 'knowledge' },
  { id: 'k8', text: 'أي شكل له ثلاثة أضلاع؟', options: ['مربع', 'دائرة', 'مثلث'], correctIndex: 2, category: 'math', stage: 2, theme: 'knowledge' },
  { id: 'k9', text: 'كم عدد أرجل العنكبوت؟', options: ['٦', '٨', '١٠'], correctIndex: 1, category: 'science', stage: 2, theme: 'knowledge' },
  { id: 'k10', text: 'صل النجوم! ما شكل هذا البرج السماوي؟', options: ['العقرب', 'الأسد', 'الميزان'], correctIndex: 1, category: 'science', stage: 2, theme: 'knowledge' },

  // ─────────────────────────────────────────────────────────────
  // GENERAL — fallback pool if a stage runs out
  // ─────────────────────────────────────────────────────────────
  { id: 'g1', text: 'كم عدد أيام الأسبوع؟', options: ['٧', '٥', '١٠'], correctIndex: 0, category: 'trivia', theme: 'general' },
  { id: 'g2', text: 'أيهما أكبر؟', options: ['٣', '٥', '١'], correctIndex: 1, category: 'math', theme: 'general' },
  { id: 'g3', text: 'ما الحيوان الذي يقول "موو"؟', options: ['قط', 'كلب', 'بقرة'], correctIndex: 2, category: 'trivia', theme: 'general' },
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
