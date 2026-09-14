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
    estimatedMinutes: 35,
    hook: '"Crumb & Co. earns ₱6,000 this month. Without a plan, it\'s gone within days — some on ingredients, some on a whim purchase, some unaccounted for."',
    simplifiedExplanation: "A budget is a plan for how you expect to spend and earn money over a specific period — it assigns a 'job' to every peso before you spend it, instead of deciding in the moment. A basic budget includes three parts: expected income (how much you realistically expect to earn), planned expenses (categorized: ingredients/materials, packaging, marketing, savings), and priorities (what gets funded first if money is tight — usually essential costs before optional ones).\n\nBudgeting isn't about restricting spending for its own sake — it's about deciding in advance, calmly, instead of deciding under pressure when the money is already gone.",
    concept: {
      body: "DepEd's Grade 12 Business Finance curriculum has students identify the steps in the financial planning process and illustrate the formula and format for preparing budgets — giving every peso a job is the practical, beginner version of that same process.",
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
      ],
    },
    activity: {
      title: 'Give Every Peso a Job',
      prompt: 'Crumb & Co. expects ₱6,000 income this month. Allocate it across at least 4 categories (ingredients, packaging, marketing, savings/emergency fund), explaining your reasoning for each amount.',
    },
    inLessonScenario: {
      title: 'The No-Plan Trap',
      prompt: 'Without a budget, Crumb & Co. spent ₱6,000 in two weeks — some on ingredients, some on a personal treat, and ran short before restocking for a big order. Identify 2 specific ways a simple budget would have prevented this.',
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
    estimatedMinutes: 35,
    hook: '"Cozy Corner wants to know: if next month is slow, okay, or great — will they still be able to pay for materials?"',
    simplifiedExplanation: "Forecasting means predicting future performance based on assumptions and current information — it's different from a budget (a plan) because a forecast is an estimate of what will likely happen, which gets updated as new information comes in. A useful forecast considers three scenarios: best case (things go better than expected), expected case (your most realistic guess), and worst case (things go worse than expected — e.g., low sales, a delayed order, or a broken supply chain).\n\nPreparing for the worst case in advance — even briefly — means a bad month becomes a manageable challenge instead of a crisis.",
    concept: {
      body: 'DepEd\'s Grade 12 Business Finance curriculum covers financial planning tools and projected financial statements — preparing multiple scenarios (best, expected, worst case) is a practical, beginner-level way to apply that same forward-looking planning.',
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
      ],
    },
    activity: {
      title: 'Three Scenarios',
      prompt: "For Cozy Corner's next month, write one sentence each for best case, expected case, and worst case sales performance, and one action Cozy Corner could take now to prepare for the worst case.",
    },
    inLessonScenario: {
      title: "PixelPop's Slow Season",
      prompt: "PixelPop knows that client requests usually slow down during school exam weeks. Using the three scenarios, forecast PixelPop's next exam-week month, and propose one action to prepare in advance.",
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
    estimatedMinutes: 35,
    hook: '"DoodleDrop is profitable every month on paper — but almost ran out of cash in March because three big customers all paid late at once."',
    simplifiedExplanation: 'Cash flow tracks the actual timing of money moving in (inflows) and out (outflows) of a business. A cash-flow projection estimates future inflows and outflows so you can spot a potential shortage before it happens — for example, seeing that rent is due before an expected big payment arrives.\n\nComparing actual vs. projected cash flow regularly (weekly or monthly) helps a business catch surprises early instead of discovering a problem only when the money is already gone.',
    concept: {
      body: "DepEd's Grade 12 Business Finance curriculum explicitly teaches tools for managing cash, receivables, and inventory, and Grade 12 ABM (FABM2) has students prepare the Cash Flow Statement itself — the timing-gap problem in this lesson is exactly what both courses are designed to prevent.",
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
        { title: 'Fundamentals of Accountancy, Business and Management 2 (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16013' },
      ],
    },
    activity: {
      title: 'Build a Simple Cash-Flow Projection',
      prompt: 'For the next 4 weeks, list expected cash IN (from sales) and cash OUT (for supplies, delivery, etc.) for a business of your choice. Identify any week where outflows might exceed inflows, and propose one way to prepare for it.',
    },
    inLessonScenario: {
      title: "DoodleDrop's Timing Gap",
      prompt: 'DoodleDrop expects ₱4,000 from three big customers in the same week rent for a shared workspace (₱1,500) is due. If even one customer pays late, what happens? Propose one way DoodleDrop could reduce this risk in future months.',
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
    estimatedMinutes: 35,
    hook: '"Every business eventually has a bad month. The businesses that survive are the ones that planned for it before it happened."',
    simplifiedExplanation: "A bad month usually combines more than one problem at once: lower sales than expected, an unexpected expense (a broken tool, a sudden fee), a delayed payment from a customer, or an inventory problem (too much unsold stock, or not enough to fill an order).\n\nPlanning for a bad month means having at least a small buffer (savings) and a pre-decided priority list — what gets paid first if money is tight (usually: essential supplies and any owed payments before optional spending).",
    concept: {
      body: "DepEd's Grade 12 Business Finance curriculum frames financial planning around managing cash, receivables, and inventory together — a 'bad month' is what happens when all three go wrong at once, which is exactly why the planning process is taught as a combined skill, not separate topics.",
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
      ],
    },
    activity: {
      title: 'Priority List for a Tight Month',
      prompt: "List 5 possible expenses for a small business (rent, ingredients, owner's personal allowance, marketing, loan repayment). Rank them in the order they should be paid first if money is tight, and justify your #1 and #5 choices.",
    },
    inLessonScenario: {
      title: "Cozy Corner's Bad Month",
      prompt: "Cozy Corner faces all four bad-month problems at once this month: sales down 30%, a sewing machine broke (₱1,000 repair), a customer's ₱800 payment is 2 weeks late, and there's ₱2,000 of unsold inventory sitting unused. Using your priority list approach, decide what Cozy Corner should do first, second, and third — and why.",
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
    estimatedMinutes: 35,
    hook: '"Three numbers, three different questions: what did you plan, what do you now expect, and what actually happened?"',
    simplifiedExplanation: "Budget = what you planned before the period started. Forecast = what you currently expect, updated as new information comes in during the period. Actual = what really happened once the period is over.\n\nComparing all three side by side — not just looking at 'actual' alone — shows whether your planning process is improving over time, and whether you're getting better at predicting your own business.",
    concept: {
      body: "DepEd's Grade 12 Business Finance curriculum has students prepare budgets and projected financial statements, then compare them against actual results as part of the financial planning process — the same budget/forecast/actual comparison practiced in this lesson.",
      sources: [
        { title: 'Business Finance (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16007' },
      ],
    },
    activity: {
      title: 'Three-Column Comparison',
      prompt: 'Create a 3-column table (Budget / Forecast / Actual) for one month of sales for any SproutSquad business. Fill in believable numbers, then write one sentence explaining the biggest gap between any two columns and a possible reason for it.',
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Report Card",
      prompt: "Crumb & Co. budgeted ₱6,000 in sales, revised its forecast mid-month to ₱7,200 after a surprise bulk order, and actually earned ₱6,800. Explain what each number tells Crumb & Co., and whether this was a 'good' or 'concerning' result overall.",
    },
    shopOsTieIn: {
      note: "Shop OS lets you set a monthly sales goal (your budget) and compares it automatically against actual results at month's end.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-6-5-q1',
        format: 'short_answer',
        prompt: 'Match: (a) Budget, (b) Forecast, (c) Actual — to: (1) what really happened, (2) what you planned, (3) your current updated expectation.',
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
