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
    estimatedMinutes: 35,
    hook: '"Crumb & Co. wants to buy a second oven to fulfill bigger orders. That single purchase could double its production capacity — if it had the money."',
    simplifiedExplanation: "Capital is money used to start, run, or grow a business — different from the day-to-day sales revenue coming in from customers. Working capital is money used for short-term, everyday operations: buying ingredients this week, paying for packaging, covering the costs that keep the business running right now.\n\nOther common uses of capital include inventory (stocking up on materials or finished products before they're sold), equipment (tools that let a business produce more, or produce better), and growth (expanding into new products, locations, or markets). Naming which category a funding request falls into is the first step toward building a clear, convincing case for that money.",
    concept: {
      body: "DepEd's Grade 12 Business Finance curriculum has students identify uses of funds as part of the financial planning process — the same categories (working capital, inventory, equipment, growth) covered in this lesson. The SBA adds the practical detail that a funding request should specify exactly how funds will be used, since lenders and investors expect a clear plan before they commit money.",
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
        { title: 'Fund Your Business (Debt vs. Equity Financing) — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/plan-your-business/fund-your-business' },
      ],
    },
    activity: {
      title: "What's the Capital For?",
      prompt: "For 4 funding requests — buying a second oven, restocking fabric for next month's orders, paying a graphic designer this week, and opening a second small stall — label each as working capital, inventory, equipment, or growth.",
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Oven Decision",
      prompt: 'Crumb & Co. wants ₱15,000 for a second oven. What category of capital use is this, and what specific evidence should Crumb & Co. gather (from Modules 6 & 7) to prove the oven will actually pay for itself?',
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
    estimatedMinutes: 35,
    hook: '"PixelPop needs ₱20,000. One friend offers a loan to be repaid with interest. Another offers to invest in exchange for a share of future profits. Which is the better deal?"',
    simplifiedExplanation: "Debt financing means borrowing money that must be repaid, usually with interest — the cost of borrowing. The business keeps full ownership, but must repay the loan regardless of how the business performs.\n\nEquity financing means receiving investment in exchange for giving up some ownership or control of the business — the investor shares in future profits (or losses) but isn't guaranteed repayment the way a lender is. Neither is universally 'better': debt keeps ownership intact but adds repayment pressure even in a bad month; equity removes that repayment pressure but means sharing future success (and decisions) with someone else.",
    concept: {
      body: "DepEd's Grade 12 Business Finance curriculum has students compare and contrast the loan requirements of different bank and nonbank institutions, and list entrepreneurs' obligations to creditors — the debt side of this lesson. The SBA adds the equity side: a funding request should specify 'whether you want debt or equity, the terms you'd like applied.'",
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
        { title: 'Fund Your Business (Debt vs. Equity Financing) — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/plan-your-business/fund-your-business' },
      ],
    },
    activity: {
      title: 'Debt or Equity?',
      prompt: 'For 3 funding offers, label each as debt or equity, and note one advantage and one risk of each: (1) A loan repaid monthly with interest. (2) An investor who gets 20% of future profits but no repayment guarantee. (3) A cooperative loan with a fixed repayment schedule.',
    },
    inLessonScenario: {
      title: "PixelPop's Two Offers",
      prompt: "PixelPop needs ₱20,000. Offer A: a loan repaid over 6 months with interest, full ownership kept. Offer B: an investor providing ₱20,000 for 25% ownership, no repayment required. If PixelPop's income is unpredictable month to month, which offer carries less risk of default, and what does PixelPop give up in exchange under Offer B?",
    },
    jurisdictionNote: 'In the Philippines, common debt-financing sources for small entrepreneurs include rural banks, cooperatives, and microfinance institutions regulated by the Bangko Sentral ng Pilipinas (BSP). Equity financing — bringing in an investor for a share of ownership — is less common for very small or informal businesses, but follows the same basic tradeoff explained here.',
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
    estimatedMinutes: 35,
    hook: '"Borrowing ₱10,000 to buy equipment that earns ₱15,000 extra profit sounds great — until sales drop and that ₱10,000 still has to be repaid."',
    simplifiedExplanation: "Leverage means using borrowed money to try to increase potential returns. If the borrowed money is used well — equipment that increases production and profit by more than the loan's cost, for example — leverage can boost growth faster than relying on savings alone.\n\nBut leverage cuts both ways: if the business underperforms, the debt still must be repaid — increasing both the opportunity and the risk at the same time.",
    concept: {
      body: 'DepEd\'s Grade 12 Business Finance curriculum has students explain the risk-return trade-off as a core financial concept — leverage is that trade-off applied specifically to borrowed money: more potential upside, but more risk if the business underperforms.',
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
      ],
    },
    activity: {
      title: 'Weigh the Leverage',
      prompt: 'Cozy Corner considers borrowing ₱8,000 for a sewing machine expected to add ₱1,500/month extra profit. Calculate how many months of extra profit it takes to repay the loan, and identify one risk if sales are lower than expected during that period.',
    },
    inLessonScenario: {
      title: "Cozy Corner's Machine",
      prompt: "Using the numbers above, if Cozy Corner's sales drop by half for 2 months right after borrowing, what specific problem could this create, even though the sewing machine itself is a genuinely good long-term investment?",
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
    estimatedMinutes: 35,
    hook: '"DoodleDrop has a big order due Friday but needs to buy printing supplies today — before the customer\'s payment arrives."',
    simplifiedExplanation: "Short-term financing helps cover timing gaps — moments when a business needs cash now but expected income hasn't arrived yet. It's typically meant to be repaid quickly, often within weeks or months, once the expected cash comes in.\n\nThis is different from long-term financing, like a loan for a major piece of equipment repaid over years — short-term financing solves a temporary gap, not an ongoing investment.",
    concept: {
      body: 'DepEd\'s Grade 12 Business Finance curriculum specifically covers sources and uses of short-term funds as distinct from long-term financing. The Bangko Sentral ng Pilipinas (BSP) documents how Philippine microfinance institutions — rural banks, cooperatives, and microfinance NGOs regulated under BSP policy — provide exactly this kind of small, short-term loan to entrepreneurs.',
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
        { title: 'Microfinancing MSMEs (Inclusive Finance / Economic and Financial Learning Program) — Bangko Sentral ng Pilipinas (BSP)', url: 'https://www.bsp.gov.ph/Inclusive%20Finance/EFLP/EFLP_MSMEs_01b.pdf' },
      ],
    },
    activity: {
      title: 'Spot the Timing Gap',
      prompt: "For 3 scenarios, identify whether the business has a timing gap that short-term financing could solve, and explain in one sentence why it's temporary rather than a long-term need.",
    },
    inLessonScenario: {
      title: "DoodleDrop's Friday Deadline",
      prompt: "DoodleDrop needs ₱1,000 for printing supplies today for an order due Friday, and the customer's ₱3,500 payment arrives next Monday. Explain why this is a short-term financing situation rather than a case for a long-term loan.",
    },
    jurisdictionNote: 'In the Philippines, short-term and microfinance loans for small entrepreneurs are commonly offered through rural banks, cooperatives (registered with the Cooperative Development Authority), and microfinance NGOs — sectors the BSP helps regulate and support as part of its financial-inclusion programs.',
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
    estimatedMinutes: 35,
    hook: '"You have 2 minutes to convince a potential funder that your business deserves their money. What do they actually need to hear?"',
    simplifiedExplanation: "A funding request or investment pitch — whether to a bank, a cooperative, or an individual investor — should clearly cover six things: the business idea (what you do and for whom), the purpose of funding (exactly what the money will be used for), the expected use of money and how it connects to growth, basic financial information (revenue, costs, and profitability), the risk involved, and the potential return for the funder (repayment terms for debt, or expected growth for equity).\n\nLeaving any of these out makes a pitch feel incomplete — a funder can't say yes to a request they don't fully understand.",
    concept: {
      body: 'DepEd\'s Grade 12 Business Finance curriculum has students draw a flow chart of the steps in a loan application and prepare the financial statements that support it — the same information a real Philippine lender or investor will ask for. The SBA adds the pitch-writing angle: a funding request should be supported by financial projections that convince the reader the business is stable and will succeed.',
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
        { title: 'Fund Your Business (Debt vs. Equity Financing) — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/plan-your-business/fund-your-business' },
      ],
    },
    activity: {
      title: 'Build a One-Page Pitch',
      prompt: 'Using any SproutSquad business, write a one-page pitch covering all 6 elements: business idea, purpose of funding, expected use of money, key financial numbers, risk, and potential return for the funder.',
    },
    inLessonScenario: {
      title: "The Investor's Questions",
      prompt: "A potential investor asks PixelPop: 'What happens to my investment if you don't get enough clients next month?' Using what you've learned about risk (Module 6) and break-even (Module 7), write a thoughtful, honest 2-3 sentence answer PixelPop could give.",
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
