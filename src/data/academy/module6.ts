import { AcademyModule, Lesson, Challenge } from '../../types';
import { scoreToTierAndReward, clamp } from './challengeHelpers';

export const module6: AcademyModule = {
  id: 'module-6',
  number: 6,
  stage: 'Sapling',
  icon: 'level-cultivator',
  title: 'Plan Your Growth',
  tagline: 'Financial Planning & Control',
  intro: "Selling well isn't enough if you don't plan ahead. This module teaches you to give every peso a job, prepare for good and bad months, and understand the difference between a plan and reality.",
  lessonIds: ['lesson-6-1', 'lesson-6-2', 'lesson-6-3', 'lesson-6-4', 'lesson-6-5'],
  checkpointId: 'checkpoint-6',
};

export const module6Lessons: Lesson[] = [
  {
    id: 'lesson-6-1',
    moduleId: 'module-6',
    number: '6.1',
    title: 'Budgeting: Give Every Peso a Job',
    estimatedMinutes: 20,
    hook: '"Crumb & Co. earns ₱6,000 this month. Without a plan, it\'s gone within days — some on ingredients, some on a whim purchase, some unaccounted for."',
    beats: [
      "A **budget** is a plan for what comes in and what goes out — it gives every peso a job **before** you spend it, instead of deciding in the moment.",
      "Split expected income into buckets: **ingredients/materials**, **packaging**, **marketing**, and **savings** — nothing left to chance.",
      "Money tight? Decide your **priority order** now — essentials first, extras later — so you're never deciding under pressure.",
    ],
    whyItMatters: "**Every peso needs a job** before you spend it — skip the plan, and ₱6,000 quietly disappears into whims and unaccounted extras.",
    quickStat: 'Rule of thumb: budget savings first, not last — treat it like a bill you owe yourself, not a leftover treat.',
    activity: {
      title: 'Give Every Peso a Job',
      steps: [
        'Crumb & Co. expects **₱6,000 income** this month.',
        '**Allocate it across at least 4 categories**: ingredients, packaging, marketing, and savings/emergency fund.',
        '**Explain your reasoning** for each amount.',
      ],
      illustration: 'budget-allocation',
    },
    inLessonScenario: {
      title: 'The No-Plan Trap',
      steps: [
        'Without a budget, Crumb & Co. spent ₱6,000 in two weeks — some on ingredients, some on a personal treat, and ran short before restocking for a big order.',
        '**Identify 2 specific ways** a simple budget would have prevented this.',
      ],
    },
    shopOsTieIn: {
      note: "Shop OS's expense tracker can be tagged by category, letting you compare your planned budget to what you actually spent each month.",
      deepLink: { sellerTab: 'expenses' },
    },
    quiz: [
      {
        id: 'lesson-6-1-q1',
        format: 'multiple_choice',
        prompt: "A budget's main purpose is to:",
        options: ['Guarantee profit', 'Plan spending and income in advance', 'Replace record-keeping', 'Set prices'],
        correctIndex: 1,
        explanation: "A budget doesn't guarantee profit or replace bookkeeping — it's a plan that assigns a job to every peso of expected income and expenses in advance.",
      },
    ],
  },
  {
    id: 'lesson-6-2',
    moduleId: 'module-6',
    number: '6.2',
    title: 'Forecasting: What Might Happen?',
    estimatedMinutes: 20,
    hook: '"Cozy Corner wants to know: if next month is slow, okay, or great — will they still be able to pay for materials?"',
    beats: [
      "A **forecast** isn't a promise — it's your best current guess, and it updates as new information comes in (unlike a budget, which is locked in from day one).",
      "Run three quick scenarios: **best case**, **expected case**, and **worst case** — a slow week, a broken supplier, a canceled order.",
      "A rough plan for the worst case, made now, is what keeps a bad month **manageable** instead of a full-blown crisis.",
    ],
    whyItMatters: "**Planning for the worst case in advance** is what turns a bad month into an inconvenience instead of an emergency.",
    quickStat: "Rule of thumb: a forecast you never update isn't a forecast — it's just an old guess.",
    activity: {
      title: 'Three Scenarios',
      steps: [
        "For Cozy Corner's next month, write one sentence each for the **best case**, **expected case**, and **worst case** sales performance.",
        'Then write **one action** Cozy Corner could take now to prepare for the worst case.',
      ],
    },
    inLessonScenario: {
      title: "PixelPop's Slow Season",
      steps: [
        'PixelPop knows that client requests usually slow down during school exam weeks.',
        "**Using the three scenarios**, forecast PixelPop's next exam-week month.",
        '**Propose one action** to prepare in advance.',
      ],
    },
    quiz: [
      {
        id: 'lesson-6-2-q1',
        format: 'short_answer',
        prompt: "What's the difference between a budget and a forecast?",
        modelAnswer: 'A budget is a plan for spending/income; a forecast is an updated estimate of what will likely actually happen.',
        explanation: "A budget is decided in advance and doesn't change once set; a forecast keeps getting updated as new information comes in during the period.",
      },
    ],
  },
  {
    id: 'lesson-6-3',
    moduleId: 'module-6',
    number: '6.3',
    title: 'Cash Flow: Keep the Shop Alive',
    estimatedMinutes: 20,
    hook: '"DoodleDrop is profitable every month on paper — but almost ran out of cash in March because three big customers all paid late at once."',
    beats: [
      "**Cash flow** is about timing, not totals — money moving in and out, and whether it lines up with when your bills are actually due.",
      "A **cash-flow projection** flags trouble early: rent's due Tuesday, but your biggest payment isn't landing until Thursday.",
      "Check **actual vs. projected** every week or month — small timing gaps are easy to fix early, brutal to discover last-minute.",
    ],
    whyItMatters: "You can be **profitable on paper** and still run out of cash — timing is what actually keeps the shop running.",
    quickStat: 'Rule of thumb: profit is an opinion, cash is a fact — a bank balance never lies.',
    activity: {
      title: 'Build a Simple Cash-Flow Projection',
      steps: [
        'For the next 4 weeks, list expected **cash IN** (from sales) and **cash OUT** (for supplies, delivery, etc.) for a business of your choice.',
        '**Identify any week** where outflows might exceed inflows.',
        '**Propose one way** to prepare for it.',
      ],
    },
    inLessonScenario: {
      title: "DoodleDrop's Timing Gap",
      steps: [
        'DoodleDrop expects **₱4,000** from three big customers in the same week that **rent** for a shared workspace (₱1,500) is due.',
        'If even one customer pays late, **what happens**?',
        '**Propose one way** DoodleDrop could reduce this risk in future months.',
      ],
    },
    shopOsTieIn: {
      note: "Shop OS's upcoming-payments view lets you see expected inflows before they arrive, so you can compare them against known upcoming expenses.",
      deepLink: { sellerTab: 'expenses' },
    },
    quiz: [
      {
        id: 'lesson-6-3-q1',
        format: 'short_answer',
        prompt: 'What is a cash-flow projection used for?',
        modelAnswer: 'Estimating future cash inflows and outflows to spot potential shortages before they happen.',
        explanation: "A cash-flow projection looks ahead at timing — not just whether you're profitable on paper, but whether the cash will physically be there when a bill is due.",
      },
    ],
  },
  {
    id: 'lesson-6-4',
    moduleId: 'module-6',
    number: '6.4',
    title: 'Plan for a Bad Month',
    estimatedMinutes: 20,
    hook: '"Every business eventually has a bad month. The businesses that survive are the ones that planned for it before it happened."',
    beats: [
      "A bad month is rarely just one problem — usually it's **lower sales**, a **surprise expense**, a **late payment**, and an **inventory mismatch**, all landing at once.",
      "The fix isn't luck — it's a small **buffer** (savings) and a **priority list** decided in advance, before the pressure hits.",
      "When money's tight: essentials and anything you owe get paid first, everything optional waits.",
    ],
    whyItMatters: "**A priority list decided in advance** turns a bad month into a checklist instead of a panic.",
    activity: {
      title: 'Priority List for a Tight Month',
      steps: [
        "**List 5 possible expenses** for a small business (rent, ingredients, owner's personal allowance, marketing, loan repayment).",
        '**Rank them** in the order they should be paid first if money is tight.',
        '**Justify your #1 and #5** choices.',
      ],
    },
    inLessonScenario: {
      title: "Cozy Corner's Bad Month",
      steps: [
        "Cozy Corner faces all four bad-month problems at once this month: **sales down 30%**, a **sewing machine broke** (₱1,000 repair), a customer's **₱800 payment is 2 weeks late**, and there's **₱2,000 of unsold inventory** sitting unused.",
        'Using your priority list approach, **decide what Cozy Corner should do first, second, and third** — and why.',
      ],
    },
    quiz: [
      {
        id: 'lesson-6-4-q1',
        format: 'short_answer',
        prompt: "Name the four common problems that combine to create a 'bad month.'",
        modelAnswer: 'Lower sales, unexpected expense, delayed payment, inventory problem.',
        explanation: 'These four rarely happen alone — a bad month usually means two or more hit at the same time, which is exactly why a buffer and a priority list matter.',
      },
    ],
  },
  {
    id: 'lesson-6-5',
    moduleId: 'module-6',
    number: '6.5',
    title: 'Budget vs. Forecast vs. Actual',
    estimatedMinutes: 20,
    hook: '"Three numbers, three different questions: what did you plan, what do you now expect, and what actually happened?"',
    beats: [
      "**Budget** = what you planned before the month started. **Forecast** = your updated guess as new info comes in. **Actual** = what really happened.",
      "Comparing all three side by side shows whether your predictions are getting **sharper over time** — not just whether you hit the number.",
    ],
    whyItMatters: "**Comparing budget, forecast, and actual** turns every month into practice for predicting your own business better.",
    quickStat: "PixelPop tracks all three every month — not to catch itself being wrong, but to get less wrong next time.",
    activity: {
      title: 'Three-Column Comparison',
      steps: [
        'Create a **3-column table** (Budget / Forecast / Actual) for one month of sales for any SproutSquad business.',
        '**Fill in believable numbers** for each column.',
        'Write **one sentence** explaining the biggest gap between any two columns and a possible reason for it.',
      ],
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Report Card",
      steps: [
        'Crumb & Co. **budgeted ₱6,000** in sales, **revised its forecast** mid-month to ₱7,200 after a surprise bulk order, and **actually earned ₱6,800**.',
        '**Explain what each number tells** Crumb & Co.',
        'Was this a "**good**" or "**concerning**" result overall?',
      ],
    },
    shopOsTieIn: {
      note: "Shop OS lets you set a monthly sales goal (your budget) and compares it automatically against actual results at month's end.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-6-5-q1',
        format: 'match',
        prompt: 'Match: (a) Budget, (b) Forecast, (c) Actual — to: (1) what really happened, (2) what you planned, (3) your current updated expectation.',
        pairs: [
          { left: 'Budget', right: 'what you planned' },
          { left: 'Forecast', right: 'your current updated expectation' },
          { left: 'Actual', right: 'what really happened' },
        ],
        modelAnswer: 'a-2, b-3, c-1.',
        explanation: 'Budget is the original plan made before the period started, forecast is the running updated estimate during the period, and actual is the final real result once it ends.',
      },
    ],
  },
];

export const module6Checkpoint: Challenge = {
  id: 'checkpoint-6',
  moduleId: 'module-6',
  mode: 'simulation',
  title: 'Plan Every Peso',
  tagline: "Allocate Crumb & Co.'s ₱6,000 month across budget categories and see how ready you'd be for a bad one.",
  icon: 'level-cultivator',
  startingCapital: 6000,
  decisions: [
    {
      key: 'ingredientsBudget',
      label: 'Ingredients / materials budget',
      type: 'number',
      min: 0,
      max: 6000,
      step: 100,
      default: 3000,
      unit: '₱',
    },
    {
      key: 'packagingBudget',
      label: 'Packaging budget',
      type: 'number',
      min: 0,
      max: 2000,
      step: 50,
      default: 600,
      unit: '₱',
    },
    {
      key: 'marketingBudget',
      label: 'Marketing budget',
      type: 'number',
      min: 0,
      max: 2000,
      step: 50,
      default: 400,
      unit: '₱',
    },
    {
      key: 'savingsBudget',
      label: 'Savings / emergency fund',
      type: 'number',
      min: 0,
      max: 3000,
      step: 100,
      default: 500,
      unit: '₱',
    },
    {
      key: 'expectDelayedPayment',
      label: 'Are you planning for at least one customer paying late this month?',
      type: 'toggle',
      default: false,
    },
  ],
  compute: (decisions, startingCapital) => {
    const monthlyIncome = 6000;

    const ingredientsBudget = Math.max(0, Number(decisions.ingredientsBudget) || 0);
    const packagingBudget = Math.max(0, Number(decisions.packagingBudget) || 0);
    const marketingBudget = Math.max(0, Number(decisions.marketingBudget) || 0);
    const savingsBudget = Math.max(0, Number(decisions.savingsBudget) || 0);
    const expectDelayedPayment = Boolean(decisions.expectDelayedPayment);

    const totalAllocated = ingredientsBudget + packagingBudget + marketingBudget + savingsBudget;
    const unallocated = monthlyIncome - totalAllocated;
    const savingsRatio = savingsBudget / monthlyIncome;

    // Start at a neutral midpoint, then reward/penalize based on Module 6's
    // core lessons: don't over-allocate beyond real income (6.1), keep a
    // real buffer (6.4), and proactively plan for a late payment (6.3/6.4).
    let score = 50;
    if (unallocated < 0) {
      // Over-allocated beyond the real ₱6,000 income — a serious planning miss.
      score -= 35;
    } else if (unallocated > monthlyIncome * 0.3) {
      // A large chunk of income left with no job at all is also a miss,
      // per Lesson 6.1's "every peso needs a job."
      score -= 10;
    }
    score += Math.min(savingsRatio * 200, 30);
    if (expectDelayedPayment) {
      score += 15;
    }
    score = clamp(score, 0, 100);
    const roundedScore = Math.round(score);

    const { tier, xpAwarded, seedsAwarded } = scoreToTierAndReward(roundedScore);

    const breakdown = [
      { label: 'Total Allocated', value: `₱${totalAllocated.toLocaleString()}` },
      { label: 'Unallocated (job-less pesos)', value: `₱${unallocated.toLocaleString()}` },
      { label: 'Savings as % of Income', value: `${(savingsRatio * 100).toFixed(1)}%` },
      { label: 'Planned for a Late Payment', value: expectDelayedPayment ? 'Yes' : 'No' },
    ];

    const feedback: string[] = [
      "Every peso needs a job before you spend it — that's the difference between a real budget and just watching money disappear (Lesson 6.1).",
    ];
    if (unallocated < 0) {
      feedback.push(`You've allocated ₱${Math.abs(unallocated).toLocaleString()} more than your real ₱${monthlyIncome.toLocaleString()} monthly income — this plan spends money you don't actually have yet.`);
    } else if (savingsRatio < 0.1) {
      feedback.push("Your savings/emergency buffer is thin — aim for at least 10% of income so a bad month (Lesson 6.4) becomes a manageable challenge instead of a crisis.");
    } else if (!expectDelayedPayment) {
      feedback.push('Consider planning for at least one late-paying customer, as Module 6 teaches — cash rarely arrives exactly on schedule.');
    } else {
      feedback.push("This is a well-prepared plan: fully allocated, a solid savings buffer, and ready for a late payment.");
    }

    return {
      score: roundedScore,
      tier,
      breakdown,
      feedback,
      xpAwarded,
      seedsAwarded,
    };
  },
};
