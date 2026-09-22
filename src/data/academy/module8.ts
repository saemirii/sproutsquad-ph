import { AcademyModule, Lesson, Challenge } from '../../types';
import { caseStudyScoreToResult } from './challengeHelpers';

export const module8: AcademyModule = {
  id: 'module-8',
  number: 8,
  stage: 'Bloom',
  icon: 'level-grove',
  title: 'Fuel Your Business',
  tagline: 'Funding, Debt & Equity (Bonus Module)',
  intro: "Every business eventually needs more money than its own sales can cover — a second oven, a bigger inventory order, or breathing room before a slow month passes. This bonus module explores how businesses get funding to grow: what capital is actually used for, the real tradeoffs between borrowing and inviting investors, and how to build a funding pitch a real lender or investor would take seriously.",
  lessonIds: ['lesson-8-1', 'lesson-8-2', 'lesson-8-3', 'lesson-8-4', 'lesson-8-5'],
  checkpointId: 'checkpoint-8',
};

export const module8Lessons: Lesson[] = [
  {
    id: 'lesson-8-1',
    moduleId: 'module-8',
    number: '8.1',
    title: 'Capital: What Does a Business Need Money For?',
    estimatedMinutes: 20,
    hook: '"Crumb & Co. wants to buy a second oven to fulfill bigger orders. That single purchase could double its production capacity — if it had the money."',
    beats: [
      "**Capital** is money used to start, run, or grow a business — it's different from the sales revenue already coming in from customers.",
      '**Working capital** covers the everyday stuff: ingredients, packaging, this week\'s bills. **Inventory**, **equipment**, and **growth** are the other three buckets most funding requests fall into.',
      'Naming the exact bucket a request falls into is what turns "I need money" into a plan someone can actually say yes to.',
    ],
    whyItMatters: "A funder can't say yes to a request they don't understand — **naming the exact use** turns ₱15,000 into a plan instead of a guess.",
    quickStat: "DoodleDrop's bulk sticker paper is inventory. Cozy Corner's new sewing machine is equipment. Same \"I need money,\" completely different bucket.",
    activity: {
      title: "What's the Capital For?",
      steps: [
        '**Label each of these 4 funding requests** as working capital, inventory, equipment, or growth.',
        '**Request 1**: buying a second oven.',
        "**Request 2**: restocking fabric for next month's orders.",
        '**Request 3**: paying a graphic designer this week.',
        '**Request 4**: opening a second small stall.',
      ],
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Oven Decision",
      steps: [
        'Crumb & Co. wants ₱15,000 for a second oven.',
        '**Name the category** of capital use this falls into.',
        '**List the specific evidence** (from Modules 6 & 7) Crumb & Co. should gather to prove the oven will actually pay for itself.',
      ],
    },
    quiz: [
      {
        id: 'lesson-8-1-q1',
        format: 'multiple_choice',
        prompt: 'Money used for short-term daily operations is called:',
        options: ['Equity', 'Working capital', 'Fixed costs', 'Net margin'],
        correctIndex: 1,
        explanation: 'Working capital covers short-term, everyday operations — different from equity (ownership investment), fixed costs, or profit margin.',
      },
    ],
  },
  {
    id: 'lesson-8-2',
    moduleId: 'module-8',
    number: '8.2',
    title: 'Debt vs. Equity',
    estimatedMinutes: 20,
    hook: '"PixelPop needs ₱20,000. One friend offers a loan to be repaid with interest. Another offers to invest in exchange for a share of future profits. Which is the better deal?"',
    beats: [
      '**Debt financing** is money you borrow and pay back, usually with interest — you keep full ownership, but the loan comes due whether or not it was a good month.',
      "**Equity financing** trades away a slice of ownership for cash. No repayment schedule — but the investor now shares in your profits, and often your decisions.",
      'Neither one is automatically the smarter pick. Debt protects your ownership; equity protects your cash flow. The right call depends on which pressure you can actually handle.',
    ],
    whyItMatters: "Pick wrong and you either owe money you don't have, or you've handed away a piece of the business you built. **Match the financing to the risk**, not the other way around.",
    activity: {
      title: 'Debt or Equity?',
      steps: [
        '**Label each of these 3 funding offers** as debt or equity, and note one advantage and one risk of each.',
        '**Offer 1**: a loan repaid monthly with interest.',
        '**Offer 2**: an investor who gets 20% of future profits but no repayment guarantee.',
        '**Offer 3**: a cooperative loan with a fixed repayment schedule.',
      ],
    },
    inLessonScenario: {
      title: "PixelPop's Two Offers",
      steps: [
        'PixelPop needs ₱20,000.',
        '**Offer A**: a loan repaid over 6 months with interest, full ownership kept.',
        '**Offer B**: an investor providing ₱20,000 for 25% ownership, no repayment required.',
        "PixelPop's income is unpredictable month to month — **which offer carries less risk of default**?",
        '**What does PixelPop give up** in exchange under Offer B?',
      ],
    },
    jurisdictionNote: 'In the Philippines, common debt-financing sources for small entrepreneurs include rural banks, cooperatives, and microfinance institutions. Equity financing — bringing in an investor for a share of ownership — is less common for very small or informal businesses, but the same basic tradeoff still applies.',
    quiz: [
      {
        id: 'lesson-8-2-q1',
        format: 'multiple_choice',
        prompt: 'Which financing type requires giving up some ownership?',
        options: ['Debt', 'Equity'],
        correctIndex: 1,
        explanation: 'Equity financing means giving up a share of ownership in exchange for investment; debt keeps ownership fully intact.',
      },
      {
        id: 'lesson-8-2-q2',
        format: 'multiple_choice',
        prompt: 'Which financing type must be repaid regardless of business performance?',
        options: ['Debt', 'Equity'],
        correctIndex: 0,
        explanation: 'A loan (debt) must be repaid on schedule no matter how the business performs that month; equity carries no such guaranteed repayment.',
      },
    ],
  },
  {
    id: 'lesson-8-3',
    moduleId: 'module-8',
    number: '8.3',
    title: 'Leverage: Using Borrowed Money',
    estimatedMinutes: 20,
    hook: '"Borrowing ₱10,000 to buy equipment that earns ₱15,000 extra profit sounds great — until sales drop and that ₱10,000 still has to be repaid."',
    beats: [
      '**Leverage** means using borrowed money to try to boost your returns. A loan that buys equipment which earns more than the loan costs is leverage working in your favor.',
      "But the loan doesn't care how business is going. If sales dip, that borrowed money still comes due — on schedule, no exceptions.",
      'Leverage doesn\'t just multiply your upside. It multiplies your downside at the exact same time.',
    ],
    whyItMatters: '**Leverage cuts both ways** — the same loan that could double your growth is the one you still owe on your worst month.',
    quickStat: "Crumb & Co.'s new oven from Lesson 8.1? That's leverage in action — money borrowed to make more money, due back either way.",
    activity: {
      title: 'Weigh the Leverage',
      steps: [
        'Cozy Corner considers borrowing ₱8,000 for a sewing machine expected to add ₱1,500/month extra profit.',
        '**Calculate** how many months of extra profit it takes to repay the loan.',
        '**Identify one risk** if sales are lower than expected during that period.',
      ],
    },
    inLessonScenario: {
      title: "Cozy Corner's Machine",
      steps: [
        "Using the numbers above, imagine Cozy Corner's sales drop by half for 2 months right after borrowing.",
        '**What specific problem** could this create — even though the sewing machine itself is a genuinely good long-term investment?',
      ],
    },
    quiz: [
      {
        id: 'lesson-8-3-q1',
        format: 'multiple_choice',
        prompt: 'Leverage means:',
        options: ['Avoiding all debt', 'Using borrowed money to try to increase returns', 'Only using personal savings', 'Giving up ownership for investment'],
        correctIndex: 1,
        explanation: "Leverage is the use of borrowed money to try to increase potential returns — it's neither avoiding debt nor giving up ownership.",
      },
      {
        id: 'lesson-8-3-q2',
        format: 'multiple_choice',
        prompt: 'True or False: Leverage only increases opportunity, never risk.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'Leverage cuts both ways — it can increase potential returns, but the debt still must be repaid even if the business underperforms, so it raises risk too.',
      },
    ],
  },
  {
    id: 'lesson-8-4',
    moduleId: 'module-8',
    number: '8.4',
    title: 'Short-Term Financing',
    estimatedMinutes: 20,
    hook: '"DoodleDrop has a big order due Friday but needs to buy printing supplies today — before the customer\'s payment arrives."',
    beats: [
      '**Short-term financing** bridges a timing gap: cash needed now, income arriving soon, usually repaid within weeks or a few months.',
      "It's not the same as a **long-term loan** for a big piece of equipment paid off over years. Short-term financing solves a temporary squeeze, not an ongoing investment.",
      "The tell: if the money's already on its way and you just need to cover the gap until it lands, that's short-term financing — not a case for a bigger loan.",
    ],
    whyItMatters: '**Matching financing to the timeline** keeps a temporary cash squeeze from turning into a longer, more expensive problem.',
    quickStat: "DoodleDrop's Friday deadline and a slow week at any campus shop are the same problem: money that's already coming, just not fast enough.",
    activity: {
      title: 'Spot the Timing Gap',
      steps: [
        '**For 3 scenarios of your choosing**, identify whether the business has a timing gap that short-term financing could solve.',
        "**Explain in one sentence** why it's temporary rather than a long-term need.",
      ],
    },
    inLessonScenario: {
      title: "DoodleDrop's Friday Deadline",
      steps: [
        'DoodleDrop needs ₱1,000 for printing supplies today for an order due Friday.',
        "The customer's ₱3,500 payment arrives next Monday.",
        '**Explain** why this is a short-term financing situation rather than a case for a long-term loan.',
      ],
    },
    jurisdictionNote: 'In the Philippines, short-term and microfinance loans for small entrepreneurs are commonly offered through rural banks, cooperatives, and microfinance NGOs — not just big commercial banks.',
    quiz: [
      {
        id: 'lesson-8-4-q1',
        format: 'short_answer',
        prompt: 'Short-term financing is best suited for:',
        modelAnswer: 'Covering temporary timing gaps between expenses and expected income, not long-term investments.',
        explanation: "Short-term financing bridges the gap until expected income arrives — it isn't meant to fund major, ongoing investments.",
      },
    ],
  },
  {
    id: 'lesson-8-5',
    moduleId: 'module-8',
    number: '8.5',
    title: 'Investment Pitch: Should They Fund You?',
    estimatedMinutes: 20,
    hook: '"You have 2 minutes to convince a potential funder that your business deserves their money. What do they actually need to hear?"',
    beats: [
      "A strong funding pitch covers six things: your **business idea**, the **purpose of the funding**, exactly how the **money will be used**, your **basic financials**, the **risk** involved, and the **return** for whoever's funding you.",
      "Skip even one of these and the pitch feels incomplete — a funder can't say yes to a request they don't fully understand.",
      'Numbers beat adjectives. "This machine pays for itself in 8 months" lands harder than "this will really help my business."',
    ],
    whyItMatters: "**A funder can't say yes to what they don't understand** — leaving out even one of the six pieces turns an easy yes into a hard pass.",
    activity: {
      title: 'Build a One-Page Pitch',
      steps: [
        'Using any SproutSquad business, **write a one-page pitch** covering all 6 elements:',
        '**Business idea**.',
        '**Purpose of funding**.',
        '**Expected use of money**.',
        '**Key financial numbers**.',
        '**Risk**.',
        '**Potential return** for the funder.',
      ],
    },
    inLessonScenario: {
      title: "The Investor's Questions",
      steps: [
        "A potential investor asks PixelPop: **'What happens to my investment if you don't get enough clients next month?'**",
        "Using what you've learned about risk (Module 6) and break-even (Module 7), **write a thoughtful, honest 2-3 sentence answer** PixelPop could give.",
      ],
    },
    quiz: [
      {
        id: 'lesson-8-5-q1',
        format: 'short_answer',
        prompt: 'List the 6 elements a solid funding pitch should include.',
        modelAnswer: 'Business idea, purpose of funding, expected use of money, financial information, risk, and potential return.',
        explanation: 'A funder needs all six pieces to judge both the opportunity and the risk — leaving any out makes the pitch feel incomplete.',
      },
    ],
  },
];

export const module8Checkpoint: Challenge = {
  id: 'checkpoint-8',
  moduleId: 'module-8',
  mode: 'caseStudy',
  title: 'Funding Challenge',
  tagline: 'Take Cozy Corner through every decision from Module 8 — debt vs. equity, repayment math, risk, and a funding pitch — in one connected case.',
  icon: 'level-grove',
  steps: [
    {
      id: 'step-debt-equity',
      prompt: "Cozy Corner needs ₱10,000 to buy a second sewing machine. Its income is fairly steady month to month, and the founder wants to keep full ownership and decision-making control. Which financing type fits best?",
      choices: [
        { label: 'Take out a loan (debt) — keeps full ownership, and steady income means repayment risk is manageable', scoreDelta: 10, feedback: 'Right — with steady income and a wish to keep full control, debt is the better fit: repayment is a fixed, predictable obligation, not a piece of the business given away.' },
        { label: 'Bring in an investor (equity) for a small % of ownership, to avoid repayment pressure', scoreDelta: 5, feedback: "Reasonable, but this gives up ownership and future decision-making unnecessarily — with steady income, Cozy Corner doesn't need to trade away control just to avoid a manageable repayment." },
        { label: 'Borrow informally from a friend with no clear terms at all', scoreDelta: 1, feedback: "Even a loan from a friend needs clear written terms — interest (if any), repayment schedule, and what happens if a payment is missed. This is exactly the kind of vague agreement Module 2's partnership-agreement lesson warns against." },
      ],
    },
    {
      id: 'step-repayment-math',
      prompt: 'If financed as a ₱10,000 loan, and the machine adds ₱1,200/month in extra profit, about how many months would it take to repay the loan from that extra profit alone?',
      choices: [
        { label: 'About 8-9 months', scoreDelta: 10, feedback: "Correct — ₱10,000 ÷ ₱1,200 ≈ 8.3 months. That's the real timeline Cozy Corner should plan its budget and cash flow around." },
        { label: 'About 2 months', scoreDelta: 1, feedback: 'Too fast — ₱10,000 ÷ ₱1,200 is about 8.3 months, not 2. Underestimating the payback period risks a cash crunch if Cozy Corner assumes the loan clears sooner than it will.' },
        { label: 'About 20 months', scoreDelta: 1, feedback: 'Too slow — ₱10,000 ÷ ₱1,200 is about 8.3 months, not 20. Overestimating the payback period can make a genuinely good investment look worse than it is.' },
      ],
    },
    {
      id: 'step-risk',
      prompt: "What's the most realistic risk Cozy Corner should plan for after taking this loan?",
      choices: [
        { label: 'Sales could dip for a month or two right after borrowing, so the loan repayment should be budgeted for even in a slower month, not just the best case', scoreDelta: 10, feedback: 'Exactly right — this is leverage cutting both ways (Lesson 8.3): the loan still has to be repaid on schedule even if a month or two underperforms, so the repayment plan needs room for that.' },
        { label: "Only worry about the sewing machine breaking down — that's the real risk", scoreDelta: 4, feedback: "Equipment failure is worth planning for, but it's not the most immediate risk here — the loan payment is due on a fixed schedule regardless of machine condition or sales, which is the bigger near-term exposure." },
        { label: "No real risk once the machine is bought, since it's a 'good investment'", scoreDelta: 0, feedback: 'A good investment can still create a cash problem — leverage (Lesson 8.3) means the debt is owed regardless of how sales perform in any given month, so treating this as risk-free is exactly the trap to avoid.' },
      ],
    },
    {
      id: 'step-pitch',
      prompt: 'Which pitch to a potential funder is strongest?',
      choices: [
        { label: "A pitch that names Cozy Corner's business idea, states the exact ₱10,000 use of funds, cites the ₱1,200/month expected extra profit and ~8-month payback, and honestly names the risk of a slower month", scoreDelta: 10, feedback: 'This is the strongest pitch — it covers the business idea, purpose, use of funds, real numbers, and an honest risk, exactly the six elements Lesson 8.5 lays out.' },
        { label: 'A pitch that states only the ₱10,000 amount requested, with no numbers or risk discussion', scoreDelta: 4, feedback: 'This names the ask but leaves out the numbers and risk a funder needs to judge it — an incomplete pitch is a harder pitch to say yes to.' },
        { label: "A pitch that says 'trust me, it'll work out' with no numbers at all", scoreDelta: 0, feedback: "A funder can't evaluate a request with no numbers, no plan, and no acknowledged risk — this is the pitch most likely to be turned down." },
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
      'This checkpoint mirrors your real Funding Challenge: choosing between debt and equity, calculating a realistic payback period, planning for risk, and building a funding pitch a real lender or investor could act on.',
      totalScore >= maxPossibleScore * 0.8
        ? "You consistently grounded each decision in Cozy Corner's real numbers and real risk — that's exactly the judgment a funder looks for before saying yes."
        : 'Revisit any step where you scored low — in each one, the strongest choice was the one backed by an actual number or an honestly named risk, not the safest-sounding guess.',
    ]
  ),
};
