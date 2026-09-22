import { AcademyModule, Lesson, Challenge } from '../../types';
import { caseStudyScoreToResult } from './challengeHelpers';

export const module2: AcademyModule = {
  id: 'module-2',
  number: 2,
  stage: 'Sprout',
  icon: 'level-grower',
  title: 'Build Your Shop',
  tagline: 'Business Basics',
  intro: "Now that you know what your business solves and for whom, it's time to decide how it's legally set up. This module covers the basic building blocks of business ownership — and how they apply specifically to entrepreneurs in the Philippines.",
  lessonIds: ['lesson-2-1', 'lesson-2-2', 'lesson-2-3', 'lesson-2-4', 'lesson-2-5'],
  checkpointId: 'checkpoint-2',
};

export const module2Lessons: Lesson[] = [
  {
    id: 'lesson-2-1',
    moduleId: 'module-2',
    number: '2.1',
    title: 'What Is a Business Structure?',
    estimatedMinutes: 20,
    hook: "\"If Cozy Corner's plushies caused an allergic reaction, who would be responsible — the business, or Miggy personally? The answer depends entirely on how the business is legally set up.\"",
    beats: [
      'A **business structure** decides three things: who owns the business, who answers for its debts, and how much personal risk the owner carries if something goes wrong.',
      'Understand **liability** first. In some structures, you and the business are legally the same thing — your own savings are on the line. In others, the business is separate, so it can owe money without automatically touching what\'s yours.',
      'There\'s no single **best** structure — only the one that fits how big, risky, and multi-owner your business already is.',
    ],
    whyItMatters: 'Pick the wrong structure and a business problem can turn into a **personal** one — your own money and belongings suddenly on the line.',
    quickStat: 'Right now, Crumb & Co., DoodleDrop, and PixelPop are all one-person operations — meaning each founder is personally carrying every peso of business risk, whether they\'ve thought about it or not.',
    activity: {
      title: 'Liability Line-Up',
      steps: [
        "You'll see 3 short business scenarios.",
        "For each, decide: does it sound like the owner and the business are the **'same'** (personal risk), or **'separate'** (business risk only)?",
        '**Scenario 1**: a student sells snacks alone from home, using her own money.',
        '**Scenario 2**: three friends form a company with its own bank account and its own name registered with the government.',
        '**Scenario 3**: a shop owner personally signs every contract and pays suppliers from his own wallet.',
      ],
    },
    inLessonScenario: {
      title: 'One Founder, Growing Fast',
      steps: [
        "PixelPop started as a one-person side hustle. It's now hired **2 part-time designers** and is taking on bigger client contracts.",
        '**What risk** does the founder now carry that she didn\'t before?',
        '**Why** might this be a reason to reconsider her business structure as she grows?',
      ],
    },
    jurisdictionNote: 'Legal structures and their names vary by country. This lesson introduces the general idea of ownership and liability. The following lessons show how this applies specifically in the Philippines, where sole proprietorships, partnerships, and corporations each register with a different government agency.',
    quiz: [
      {
        id: 'lesson-2-1-q1',
        format: 'multiple_choice',
        prompt: 'Liability refers to:',
        options: ['How much profit a business makes', 'The legal/financial risk an owner carries', 'The number of products sold', "The business's logo"],
        correctIndex: 1,
        explanation: 'Liability is the legal and financial risk the owner personally carries.',
      },
      {
        id: 'lesson-2-1-q2',
        format: 'multiple_choice',
        prompt: 'True or False: All business structures carry the exact same level of personal risk for the owner.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: "Different structures carry very different levels of personal risk — that's the whole point of choosing one.",
      },
    ],
  },
  {
    id: 'lesson-2-2',
    moduleId: 'module-2',
    number: '2.2',
    title: 'Sole Proprietorship',
    estimatedMinutes: 20,
    hook: '"Aya runs DoodleDrop entirely on her own — no partners, no co-owners. In the Philippines, this makes her a sole proprietor, and there\'s one specific government agency she needs to register with."',
    beats: [
      'A **sole proprietorship** is a business owned and run by one person — no legal split between owner and business. It\'s the simplest way to start, with the least paperwork.',
      'The tradeoff is **unlimited personal liability**: there\'s no separate business self to absorb the risk if something goes wrong.',
      'The upside: full control, all the profits, and next-to-nothing needed to set up — great for testing an idea before committing further.',
    ],
    whyItMatters: '**Simple to start** also means **fully exposed** — every peso of business debt is legally the owner\'s to pay.',
    quickStat: 'A sole proprietorship technically ends the moment its owner stops running it — there\'s no separate business left behind without the person.',
    activity: {
      title: 'Would You Choose It?',
      steps: [
        '**List 2 reasons** a first-time student entrepreneur might choose a sole proprietorship.',
        '**List 2 reasons** they might eventually outgrow it.',
        'Use **DoodleDrop** as your example.',
      ],
    },
    inLessonScenario: {
      title: "DoodleDrop's First Step",
      steps: [
        "Aya wants to sell her stickers under the name 'DoodleDrop' instead of her own name, and wants legal protection so no one else nearby can use that name.",
        'In the Philippine context, **which government agency** should she register her business name with first?',
      ],
    },
    jurisdictionNote: 'In the Philippines, a sole proprietorship registers its business name with the Department of Trade and Industry (DTI) through the Business Name Registration System (BNRS), which protects the exclusive use of that name. Registering with DTI is separate from registering for taxes with the BIR (covered in Module 3) — both are required to legally operate.',
    quiz: [
      {
        id: 'lesson-2-2-q1',
        format: 'multiple_choice',
        prompt: 'In a sole proprietorship, who is personally responsible for business debts?',
        options: ['No one', 'The government', 'The single owner', 'A board of directors'],
        correctIndex: 2,
        explanation: "In a sole proprietorship there's no legal separation between owner and business — the owner alone carries the debts.",
      },
      {
        id: 'lesson-2-2-q2',
        format: 'multiple_choice',
        prompt: 'In the Philippines, sole proprietors register their business name with:',
        options: ['The SEC', 'The BIR only', 'The DTI', 'The BSP'],
        correctIndex: 2,
        explanation: "DTI's Business Name Registration System (BNRS) is where sole proprietors register.",
      },
    ],
  },
  {
    id: 'lesson-2-3',
    moduleId: 'module-2',
    number: '2.3',
    title: 'Partnerships',
    estimatedMinutes: 20,
    hook: '"Two friends want to launch a snack brand together, splitting the work — one bakes, one handles orders. If they never write anything down about who owns what, what happens the day they disagree?"',
    beats: [
      'A **partnership** is two or more people sharing ownership, work, profits, and risk. It\'s easy to form — sometimes just a verbal handshake.',
      'That ease is also the danger: without a **written agreement**, nothing spells out who decides what, how profits split, or what happens if someone wants out.',
      'Partners can also be held responsible for each other\'s decisions — shared upside comes with **shared liability** too.',
    ],
    whyItMatters: 'A handshake deal works fine until the first disagreement — only a **written agreement** protects the friendship and the business after that.',
    quickStat: 'A partnership can dissolve the moment one partner leaves — without anything in writing, that can mean the whole business ends with them.',
    activity: {
      title: 'Draft a Mini Partnership Agreement',
      steps: [
        '**Write 4 short bullet points** that two co-founders should agree on before starting a business together (e.g., how profits are split, who makes final decisions on big purchases, what happens if one partner wants to quit).',
      ],
    },
    inLessonScenario: {
      title: "Crumb & Co.'s New Co-Owner",
      steps: [
        "Crumb & Co.'s founder wants to bring in a friend as a full business partner to help with deliveries and social media.",
        'Before agreeing, **what 2 questions** should they answer together?',
        '**Which Philippine government agency** would this new partnership need to register with?',
      ],
    },
    jurisdictionNote: 'In the Philippines, partnerships register with the Securities and Exchange Commission (SEC) through the eSPARC online portal — not with DTI, which is only for sole proprietorships. Partners typically need a notarized Articles of Partnership before registering, and (once approved) still register separately with the BIR for tax purposes.',
    quiz: [
      {
        id: 'lesson-2-3-q1',
        format: 'short_answer',
        prompt: "Crumb & Co.'s founder and her new co-owner agree to everything by a handshake, with nothing written down. Why is a written partnership agreement important, even for friends?",
        modelAnswer: 'It prevents future disagreements by clarifying how profits, decisions, and risks are shared.',
        explanation: 'A written agreement protects the partnership before disagreements happen, not after.',
      },
      {
        id: 'lesson-2-3-q2',
        format: 'multiple_choice',
        prompt: 'In the Philippines, partnerships register with:',
        options: ['DTI', 'SEC', 'BSP', 'PSA'],
        correctIndex: 1,
        explanation: 'Partnerships register with the Securities and Exchange Commission (SEC) through the eSPARC online portal.',
      },
    ],
  },
  {
    id: 'lesson-2-4',
    moduleId: 'module-2',
    number: '2.4',
    title: 'Corporations and Limited-Liability Forms',
    estimatedMinutes: 20,
    hook: '"A big toy company can be sued without its owners losing their personal homes. That protection is one of the biggest reasons corporations exist."',
    beats: [
      'A **corporation** is legally separate from its owners — it can own property, sign contracts, and get sued in its own name, not theirs.',
      'That separation creates **limited liability**: owners (shareholders) generally only risk what they invested, not their personal assets.',
      'The tradeoff is more paperwork, higher setup costs, and ongoing government reporting — which is why most businesses start smaller and convert later.',
    ],
    whyItMatters: '**Limited liability** is the whole reason big companies can take big risks — a lawsuit can drain the business without touching a founder\'s personal savings.',
    activity: {
      title: 'Sole Prop, Partnership, or Corporation?',
      steps: [
        '**Match each situation** to the most likely structure.',
        '**Situation 1**: one student testing a small idea with ₱500.',
        '**Situation 2**: two friends co-running a growing snack shop.',
        '**Situation 3**: a company with 5 investors planning to expand nationally and wanting to protect personal assets.',
      ],
    },
    inLessonScenario: {
      title: 'PixelPop Goes Big',
      steps: [
        'PixelPop is being offered a large contract that requires signing a formal, higher-risk agreement. The founder is worried about **personal liability** if something goes wrong.',
        '**What structure characteristic** (introduced in this lesson) would most directly address her worry, and why?',
      ],
    },
    jurisdictionNote: 'Exact legal rules, minimum capital requirements, and filing steps for corporations vary by country. In the Philippines, corporations and partnerships both register with the SEC via eSPARC. Always confirm current requirements directly with the relevant agency (SEC, DTI, or BIR) before registering a real business.',
    quiz: [
      {
        id: 'lesson-2-4-q1',
        format: 'short_answer',
        prompt: "PixelPop's founder wants to know why forming a corporation would protect her personal savings if a client sued the business. What is 'limited liability'?",
        modelAnswer: 'Owners are generally only at risk of losing what they invested, not their personal assets, because the business is a separate legal entity.',
        explanation: 'Limited liability is the protection a corporation gives its owners by legally separating the business from its shareholders.',
      },
      {
        id: 'lesson-2-4-q2',
        format: 'multiple_choice',
        prompt: 'Which structure typically requires the MOST formal record-keeping?',
        options: ['Sole proprietorship', 'Partnership', 'Corporation', 'None of them require records'],
        correctIndex: 2,
        explanation: 'Corporations require more extensive record-keeping and ongoing government reporting than sole proprietorships or partnerships.',
      },
    ],
  },
  {
    id: 'lesson-2-5',
    moduleId: 'module-2',
    number: '2.5',
    title: 'Pick the Setup',
    estimatedMinutes: 20,
    hook: "\"You've learned three structures. Now it's time to apply them to real (fictional) decisions.\"",
    beats: [
      'Choosing a structure isn\'t about finding the **best** one — it\'s about matching the structure to your business right now.',
      'Run through a quick checklist: how many owners are there, how much **personal risk** can you accept, and is outside investment coming soon?',
      'One more question matters just as much: how much paperwork can you realistically keep up with today?',
    ],
    whyItMatters: 'The right structure **fits where your business is now** — not where you hope it\'ll be in five years.',
    quickStat: 'All four SproutSquad founders are still sole proprietors right now — completely normal at this stage, and each one will hit a different signal for when it\'s time to reconsider.',
    activity: {
      title: 'Structure Case Files',
      steps: [
        'For each mini-case, **recommend a structure** and name the correct Philippine registration agency.',
        '**Case 1**: a student selling snacks alone at ₱300 starting capital.',
        '**Case 2**: two cousins co-running a plush-toy business who want to split profits 50/50.',
        '**Case 3**: a group of 4 friends planning to raise outside investment to scale a delivery app nationally.',
      ],
    },
    inLessonScenario: {
      title: "The Founders' Meeting",
      steps: [
        "The four SproutSquad businesses meet to compare notes: **Crumb & Co.** (1 owner), **DoodleDrop** (1 owner, hiring freelancers), **Cozy Corner** (2 co-owners, informal), and **PixelPop** (planning to bring in an investor).",
        '**Which one** is most ready to consider moving beyond a sole proprietorship?',
        '**What should they do first** before changing structures?',
      ],
    },
    jurisdictionNote: 'Remember: in the Philippines, sole proprietorships register with DTI, while partnerships and corporations register with the SEC. All business types must still separately register with the BIR for taxes (Module 3).',
    quiz: [
      {
        id: 'lesson-2-5-q1',
        format: 'multiple_choice',
        prompt: "Cozy Corner's two co-owners are debating which structure 'wins.' Based on this lesson, the 'best' business structure is the one that:",
        options: ['Costs the least', "Fits the business's size, risk, and goals", 'Sounds the most official', 'Every business should copy'],
        correctIndex: 1,
        explanation: "There's no universal best structure — the right choice depends on the business's size, risk tolerance, and growth plans.",
      },
      {
        id: 'lesson-2-5-q2',
        format: 'short_answer',
        prompt: 'PixelPop is planning to bring in an outside investor within the year. Before choosing a structure, what 2 questions from this lesson\'s checklist should PixelPop answer first?',
        modelAnswer: 'How many owners will there be, and will the business need outside investment soon — both point toward whether PixelPop should move beyond a sole proprietorship.',
        explanation: 'Matching a structure to a business means checking owner count, risk tolerance, investment plans, and paperwork capacity before deciding.',
      },
    ],
  },
];

export const module2Checkpoint: Challenge = {
  id: 'checkpoint-2',
  moduleId: 'module-2',
  mode: 'caseStudy',
  title: 'Structure Challenge',
  tagline: 'Help three student founders pick a business structure, register it correctly, and protect themselves before a bank loan is on the table.',
  icon: 'level-grower',
  steps: [
    {
      id: 'step-structure',
      prompt: 'Three students want to start a laundry pickup service for boarding students. One provides the motorcycle, one handles bookings, one manages money. Which business structure fits three co-founders splitting responsibilities and profits from day one?',
      choices: [
        { label: 'Partnership — 3 owners sharing roles and profits is exactly what a partnership is built for, with moderate paperwork', scoreDelta: 10, feedback: "Right — a partnership fits naturally when multiple owners are each contributing something different (motorcycle, bookings, money) and sharing profits and decisions." },
        { label: 'Sole proprietorship — keep it simple with one owner', scoreDelta: 2, feedback: "A sole proprietorship only has room for one owner — it doesn't fit 3 people who are all contributing and expect to share in the profits." },
        { label: 'Corporation — set up the strongest legal protection right away', scoreDelta: 5, feedback: "A corporation isn't wrong in theory, but it's overkill this early — the extra paperwork, cost, and formal reporting are a lot for three students just starting out. A partnership fits this stage better." },
      ],
    },
    {
      id: 'step-registration',
      prompt: 'Having settled on a structure, which Philippine government agency should the three co-founders register with?',
      choices: [
        { label: 'SEC — partnerships register with the Securities and Exchange Commission through eSPARC', scoreDelta: 10, feedback: 'Correct — in the Philippines, partnerships (and corporations) register with the SEC, typically after drafting a notarized Articles of Partnership.' },
        { label: 'DTI — register the business name there', scoreDelta: 2, feedback: 'DTI registration is for sole proprietorships only. A partnership with 3 co-owners needs to register with the SEC instead.' },
        { label: 'BIR only — taxes come first', scoreDelta: 3, feedback: 'The BIR is where every business registers for taxes, but that comes after (and separately from) registering the structure itself with the SEC.' },
      ],
    },
    {
      id: 'step-document',
      prompt: 'The three co-founders expect to grow fast and may want a bank loan within a year. What should they document BEFORE registering, and why?',
      choices: [
        { label: 'A written partnership agreement covering how profits are split, who decides what, and what happens if someone wants to leave — settled now, before money or a loan is involved', scoreDelta: 10, feedback: "Exactly right — writing this down now, while everyone still agrees, protects the partnership later when real money (like a loan) and real disagreements are on the line." },
        { label: 'Nothing yet — wait until there\'s an actual dispute to write anything down', scoreDelta: 0, feedback: "Waiting for a dispute is the worst time to write an agreement — by then, trust is already strained and each partner has an incentive to remember things their own way." },
        { label: 'Just split everything equally with no written agreement — trust is enough between friends', scoreDelta: 4, feedback: "Trust matters, but even close friends can disagree once real money, a loan, and unequal workloads enter the picture. Writing it down protects the friendship as much as the business." },
      ],
    },
  ],
  scoreToResult: (totalScore, maxPossibleScore) => caseStudyScoreToResult(
    totalScore,
    maxPossibleScore,
    [
      { label: 'Decisions scored', value: `${totalScore} / ${maxPossibleScore} points` },
    ],
    [
      'This checkpoint mirrors a real registration decision: choosing a structure that fits your co-founders, registering with the correct Philippine agency, and documenting your agreement before money is on the line.',
      totalScore >= maxPossibleScore * 0.8
        ? "You matched the structure to the number of owners, registered with the right agency, and protected the partnership in writing before a loan or dispute could test it — that's exactly how a fast-growing shop stays on solid legal footing."
        : 'Revisit any step where you scored low — in each one, the strongest choice was the one that matched the structure to 3 co-owners, registered with the correct agency (SEC, not DTI), and got the agreement in writing before money was involved.',
    ]
  ),
};
