// All player-facing UI strings, per language.
// Arabic is the source dictionary; English must provide every key (enforced by the type below).
// Placeholders use {name} syntax and are filled by t(key, { name: value }).

const ar = {
  // --- App shell / loading ---
  'app.title': 'مدينة العلم',
  'app.tapToBegin': 'اضغط لبدء المغامرة',
  'app.startAdventure': 'ابدأ المغامرة',
  'app.loadingWorld': 'جاري تحميل العالم',
  'app.preparingAdventure': 'جاري تحضير مغامرتك',
  'language.label': 'اللغة',

  // --- Home ---
  'home.openBook': '...افتح الكتاب السحري 📚',
  'home.journey': 'وانطلق في رحلة عبر مدينة مليئة بالأسرار',

  // --- How to play ---
  'howTo.title': 'كيف تلعب؟',
  'howTo.subtitle': 'اتبع الخطوات لتصبح بطلاً',
  'howTo.run.title': 'اركض واقفز',
  'howTo.run.desc': 'اضغط على الشاشة للقفز وتجاوز العقبات',
  'howTo.stars.title': 'اجمع النجوم',
  'howTo.stars.desc': 'النجوم تزيد من نقاطك',
  'howTo.gates.title': 'افتح البوابات',
  'howTo.gates.desc': 'أجب على الأسئلة لتفتح البوابات السحرية',
  'howTo.knowledge.title': 'قوة المعرفة',
  'howTo.knowledge.desc': 'العلم هو مفتاحك للتقدم',
  'howTo.go': 'انطلق',

  // --- Age selection ---
  'age.title': 'اختر فئتك العمرية',
  'age.subtitle': 'لنختار مغامرة تناسبك ✨',
  'age.explorer.title': 'مستكشف صغير',
  'age.explorer.range': '(5-7 سنوات)',
  'age.explorer.desc': 'مغامرات بسيطة وممتعة 🎈',
  'age.student.title': 'طالب ذكي',
  'age.student.range': '(8-10 سنوات)',
  'age.student.desc': 'تحديات تنمي التفكير 🧠',
  'age.scientist.title': 'عالم ناشئ',
  'age.scientist.range': '(11-13 سنوات)',
  'age.scientist.desc': 'تحديات وأسئلة أعمق 🔬',
  'age.hint': 'يمكنك تغيير الفئة لاحقاً',

  // --- Game details ---
  'details.title': 'مغامرة العلم',
  'details.subtitle': 'اجري في شوارع المدينة القديمة واجمع المعرفة!',
  'details.stars': 'اجمع النجوم +10',
  'details.gates': 'افتح البوابات السحرية',
  'details.obstacles': 'احذر من العقبات!',

  // --- In-game HUD ---
  'hud.stars': 'النجوم',
  'hud.distance': 'المسافة',
  'hud.meters': 'م',
  'hud.pause': 'إيقاف مؤقت',
  'hud.soundOff': 'إيقاف الصوت',
  'hud.soundOn': 'تشغيل الصوت',
  'hud.musicOff': 'إيقاف الموسيقى',
  'hud.musicOn': 'تشغيل الموسيقى',

  // --- Overlays ---
  'puzzle.title': 'لغز صغير ✨',
  'climb.title': 'تسلق!',
  'climb.tapFast': 'اضغط بسرعة!',
  'pause.title': 'إيقاف مؤقت',
  'pause.resume': 'متابعة اللعب',
  'pause.restart': 'إعادة المرحلة',
  'pause.mainMenu': 'العودة للقائمة الرئيسية',
  'message.title': 'رسالة جديدة ✨',
  'message.tapToContinue': 'اضغط للمتابعة',
  'question.princeNoor': 'الأمير نور',
  'question.header': 'سؤال البوابة',
  'question.tryAgain': 'حاول مرة أخرى!',
  'question.gateOpening': 'البوابة تفتح...',
  'gameOver.title': 'انتهت اللعبة',
  'gameOver.distance': 'المسافة المقطوعة',
  'gameOver.stars': 'النجوم المجمعة',
  'gameOver.playAgain': 'العب مجدداً',
  'gameOver.mainMenu': 'العودة إلى القائمة الرئيسية',

  // --- Stage results ---
  'results.complete': 'اكتملت المرحلة',
  'results.distance': 'المسافة',
  'results.stars': 'النجوم',
  'results.correct': 'إجابات صحيحة',
  'results.wrong': 'إجابات خاطئة',
  'results.time': 'الوقت',
  'results.continue': 'متابعة',
  'time.minutesSeconds': '{m} د {s} ث',
  'time.seconds': '{s} ث',

  // --- Stage names / titles ---
  'stage.desertTitle': 'المرحلة 1 – طريق الصحراء',
  'stage.cityTitle': 'المرحلة 2 – مدخل المدينة',
  'stage.houseOfWisdom': 'بيت الحكمة',
  'stage.desertEnd': 'نهاية الصحراء',

  // --- Nur guidance messages ---
  'noor.welcome': 'مرحبًا بك في مدينة العلم…\nقد لا تكون الرحلة سهلة،\nلكنني سأكون معك في كل خطوة.',
  'noor.jumpHint': 'اضغط للقفز وتجاوز العقبات!',
  'noor.stageCleared': 'رائع! لقد أنهيت هذه المرحلة بنجاح.',
  'noor.newLight': 'كل خطوة تقرّبك من نورٍ جديد.',
  'noor.sandstormWarning': 'انتبه… عاصفة رملية قادمة!',
  'noor.closeCall': 'أحسنت! ذلك كان وشيكاً! 😅',
  'noor.keepGoing': 'أحسنت! استمر، أنت تتقدم.',
  'noor.tryAgain': 'حاول مرة أخرى.',
  'noor.wellDone': 'أحسنت! 🎉',
  'noor.challengeAhead': 'استعد… التحدي يقترب.',
  'noor.roadCarpetMissed': 'لقد فاتك البساط هذه المرة. لا بأس! 🧞‍♂️',
  'noor.carpetMissed': 'لقد فاتنا البساط! لا تقلق، سيظهر مرة أخرى.',
  'noor.carpetSpotted': 'انظر! بساط الريح السحري! اقفز عليه! 🧞‍♂️',
  'noor.roadCarpetSpotted': 'انظر! بساط سحري على الطريق… اقترب منه! 🧞‍♂️',
  'noor.tryCarpet': 'لنجرب البساط السحري! ✨',
  'noor.carpetGate': 'قبل أن تركب البساط السحري، عليك أن تثبت حكمتك.',
  'noor.onToHouseOfWisdom': 'نكمل طريقنا إلى بيت الحكمة. 🏛️',
  'noor.holdOn': 'تمسك جيداً! لنحلق فوق الغيوم! ✨',
  'noor.levelGate': 'هذه بوابة الانتقال... ستقودنا إلى المدينة.',
  'noor.welcomeKnowledge': 'أهلاً بك في عالم المعرفة. 📚',
  'noor.houseSpotted': 'انظر! بيت الحكمة! 🏛️',
  'noor.houseWelcome': 'أهلاً بك في بيت الحكمة… هنا نهاية الرحلة وبداية العلم. 📚',
  'noor.tentSpotted': 'انظر! خيمة بدوية! لنحتمي بها! ⛺',
  'noor.shelterSafe': 'الحمد لله! نحن في أمان هنا. 🏕️',
  'noor.stormOver': 'الحمد لله! انتهت العاصفة الرملية.',
  'ending.final': 'انتهت الرحلة… وبدأت حكاية جديدة نحو العلم.',

  // --- Mini puzzles ---
  'puzzle.carpetGate': 'بوابة البساط السحري\n\nقبل أن تركب البساط السحري، عليك أن تثبت حكمتك.\n\nاختر الرمز الذي يمثّل المعرفة لتبدأ الرحلة.',
  'puzzle.cityCarpetBox': 'اختر الرمز الذي يمثّل البساط السحري لتحلق فوق المدينة!',
  'puzzle.rewardBox': 'ما الذي يرمز إلى المكافأة؟',
  'puzzle.library1': 'أيُّ هذه الرموز يعبِّر أكثر عن بيت الحكمة؟',
  'puzzle.library2': 'ما الذي يرمز إلى العلم؟',
  'puzzle.library3': 'اختر الرمز الذي يمثّل الحكمة.',
  'puzzle.library4': 'أيُّ لون يُذكّر بالمعرفة والذهب؟',
  'puzzle.storm1': 'انظر إلى النمط: ★ ☆ ★ ☆ ؟ ما الرمز التالي؟',
  'puzzle.storm2': 'ما الشكل الذي يكمل التسلسل؟ ◯ □ ◯ □ ؟',
  'puzzle.storm3': 'اختر الرمز الذي يمثّل المعرفة.',
  'puzzle.storm4': 'أيُّ لون يُذكّر بالصحراء؟',

  // --- Floating pickup text (Phaser) ---
  'float.stars': '+{n} نجمة',
  'float.starsReward': '+{n} نجمة!',
  'float.heart': 'قلب +',
  'float.shield': 'درع حماية!',
};

export type TranslationKey = keyof typeof ar;

const en: Record<TranslationKey, string> = {
  // --- App shell / loading ---
  'app.title': 'City of Knowledge',
  'app.tapToBegin': 'Tap to begin the adventure',
  'app.startAdventure': 'Start the Adventure',
  'app.loadingWorld': 'Loading the world',
  'app.preparingAdventure': 'Preparing your adventure',
  'language.label': 'Language',

  // --- Home ---
  'home.openBook': 'Open the magic book... 📚',
  'home.journey': 'and set off on a journey through a city full of secrets',

  // --- How to play ---
  'howTo.title': 'How to Play?',
  'howTo.subtitle': 'Follow the steps to become a hero',
  'howTo.run.title': 'Run & Jump',
  'howTo.run.desc': 'Tap the screen to jump over obstacles',
  'howTo.stars.title': 'Collect Stars',
  'howTo.stars.desc': 'Stars increase your score',
  'howTo.gates.title': 'Open the Gates',
  'howTo.gates.desc': 'Answer questions to open the magic gates',
  'howTo.knowledge.title': 'The Power of Knowledge',
  'howTo.knowledge.desc': 'Knowledge is your key to moving forward',
  'howTo.go': "Let's Go",

  // --- Age selection ---
  'age.title': 'Choose Your Age Group',
  'age.subtitle': "Let's pick the right adventure for you ✨",
  'age.explorer.title': 'Little Explorer',
  'age.explorer.range': '(Ages 5-7)',
  'age.explorer.desc': 'Simple and fun adventures 🎈',
  'age.student.title': 'Smart Student',
  'age.student.range': '(Ages 8-10)',
  'age.student.desc': 'Challenges that build thinking skills 🧠',
  'age.scientist.title': 'Young Scientist',
  'age.scientist.range': '(Ages 11-13)',
  'age.scientist.desc': 'Deeper challenges and questions 🔬',
  'age.hint': 'You can change your age group later',

  // --- Game details ---
  'details.title': 'The Knowledge Adventure',
  'details.subtitle': 'Run through the streets of the old city and gather knowledge!',
  'details.stars': 'Collect stars +10',
  'details.gates': 'Open the magic gates',
  'details.obstacles': 'Watch out for obstacles!',

  // --- In-game HUD ---
  'hud.stars': 'Stars',
  'hud.distance': 'Distance',
  'hud.meters': 'm',
  'hud.pause': 'Pause',
  'hud.soundOff': 'Mute sound',
  'hud.soundOn': 'Unmute sound',
  'hud.musicOff': 'Turn music off',
  'hud.musicOn': 'Turn music on',

  // --- Overlays ---
  'puzzle.title': 'Mini Puzzle ✨',
  'climb.title': 'Climb!',
  'climb.tapFast': 'Tap fast!',
  'pause.title': 'Paused',
  'pause.resume': 'Resume',
  'pause.restart': 'Restart Stage',
  'pause.mainMenu': 'Back to Main Menu',
  'message.title': 'New Message ✨',
  'message.tapToContinue': 'Tap to continue',
  'question.princeNoor': 'Prince Noor',
  'question.header': 'Gate Question',
  'question.tryAgain': 'Try again!',
  'question.gateOpening': 'The gate is opening...',
  'gameOver.title': 'Game Over',
  'gameOver.distance': 'Distance Covered',
  'gameOver.stars': 'Stars Collected',
  'gameOver.playAgain': 'Play Again',
  'gameOver.mainMenu': 'Back to Main Menu',

  // --- Stage results ---
  'results.complete': 'Stage Complete',
  'results.distance': 'Distance',
  'results.stars': 'Stars',
  'results.correct': 'Correct Answers',
  'results.wrong': 'Wrong Answers',
  'results.time': 'Time',
  'results.continue': 'Continue',
  'time.minutesSeconds': '{m}m {s}s',
  'time.seconds': '{s}s',

  // --- Stage names / titles ---
  'stage.desertTitle': 'Stage 1 – The Desert Road',
  'stage.cityTitle': 'Stage 2 – The City Entrance',
  'stage.houseOfWisdom': 'The House of Wisdom',
  'stage.desertEnd': 'End of the Desert',

  // --- Nur guidance messages ---
  'noor.welcome': 'Welcome to the City of Knowledge…\nThe journey may not be easy,\nbut I will be with you every step of the way.',
  'noor.jumpHint': 'Tap to jump over the obstacles!',
  'noor.stageCleared': 'Amazing! You completed this stage.',
  'noor.newLight': 'Every step brings you closer to a new light.',
  'noor.sandstormWarning': 'Watch out… a sandstorm is coming!',
  'noor.closeCall': 'Well done! That was close! 😅',
  'noor.keepGoing': "Well done! Keep going, you're making progress.",
  'noor.tryAgain': 'Try again.',
  'noor.wellDone': 'Well done! 🎉',
  'noor.challengeAhead': 'Get ready… a challenge is coming.',
  'noor.roadCarpetMissed': "You missed the carpet this time. That's okay! 🧞‍♂️",
  'noor.carpetMissed': "We missed the carpet! Don't worry, it will appear again.",
  'noor.carpetSpotted': 'Look! A magic flying carpet! Jump on it! 🧞‍♂️',
  'noor.roadCarpetSpotted': 'Look! A magic carpet on the road… go closer! 🧞‍♂️',
  'noor.tryCarpet': "Let's try the magic carpet! ✨",
  'noor.carpetGate': 'Before you ride the magic carpet, you must prove your wisdom.',
  'noor.onToHouseOfWisdom': "Let's continue on to the House of Wisdom. 🏛️",
  'noor.holdOn': "Hold on tight! Let's fly above the clouds! ✨",
  'noor.levelGate': 'This is the travel gate... it will lead us to the city.',
  'noor.welcomeKnowledge': 'Welcome to the world of knowledge. 📚',
  'noor.houseSpotted': 'Look! The House of Wisdom! 🏛️',
  'noor.houseWelcome': 'Welcome to the House of Wisdom… here the journey ends and learning begins. 📚',
  'noor.tentSpotted': "Look! A Bedouin tent! Let's take shelter in it! ⛺",
  'noor.shelterSafe': 'Thank goodness! We are safe here. 🏕️',
  'noor.stormOver': 'Thank goodness! The sandstorm is over.',
  'ending.final': 'The journey is over… and a new story of learning begins.',

  // --- Mini puzzles ---
  'puzzle.carpetGate': 'The Magic Carpet Gate\n\nBefore you ride the magic carpet, you must prove your wisdom.\n\nChoose the symbol that represents knowledge to begin the journey.',
  'puzzle.cityCarpetBox': 'Choose the symbol that represents the magic carpet to fly over the city!',
  'puzzle.rewardBox': 'Which one represents the reward?',
  'puzzle.library1': 'Which of these symbols best represents the House of Wisdom?',
  'puzzle.library2': 'What represents knowledge?',
  'puzzle.library3': 'Choose the symbol that represents wisdom.',
  'puzzle.library4': 'Which color reminds you of knowledge and gold?',
  'puzzle.storm1': 'Look at the pattern: ★ ☆ ★ ☆ ? What comes next?',
  'puzzle.storm2': 'Which shape completes the sequence? ◯ □ ◯ □ ?',
  'puzzle.storm3': 'Choose the symbol that represents knowledge.',
  'puzzle.storm4': 'Which color reminds you of the desert?',

  // --- Floating pickup text (Phaser) ---
  'float.stars': '+{n} Stars',
  'float.starsReward': '+{n} Stars!',
  'float.heart': '+1 Heart',
  'float.shield': 'Shield!',
};

export const translations = { ar, en };
