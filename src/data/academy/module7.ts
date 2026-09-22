import { AcademyModule, Lesson, Challenge } from '../../types';
import { clamp, scoreToTierAndReward } from './challengeHelpers';

export const module7: AcademyModule = {
  id: 'module-7',
  number: 7,
  stage: 'Bloom',
  icon: 'level-rooted-founder',
  title: 'Read Your Numbers',
  tagline: 'Financial Analysis',
  intro: "You've tracked money in and out. Now it's time to analyze it — turning raw numbers into real business decisions using margins, break-even points, and simple health-check ratios.",
  lessonIds: ['lesson-7-1', 'lesson-7-2', 'lesson-7-3', 'lesson-7-4', 'lesson-7-5'],
  checkpointId: 'checkpoint-7',
};

export const module7Lessons: Lesson[] = [
  {
    id: 'lesson-7-1',
    moduleId: 'module-7',
    number: '7.1',
    title: 'Selling Price vs. COGS',
    estimatedMinutes: 20,
    hook: '"Two products sell for the same price. One earns Crumb & Co. ₱90 in gross profit; the other earns ₱20. Same price, very different business."',
    beats: [
      '**Selling price** is what the customer pays. **COGS** is the direct cost of making that one product — ingredients, materials, packaging.',
      '**Gross profit** = Selling price − COGS. It\'s plain subtraction, but it\'s the number every deeper calculation in this module builds on.',
    ],
    whyItMatters: 'Two products can share a price tag and still be worlds apart — the one with the fatter **gross profit** is doing more for your business, even if a customer can\'t tell the difference.',
    activity: {
      title: 'Quick Gross Profit Drill',
      steps: [
        '**Calculate gross profit** for 4 products, each with a given selling price and COGS.',
        '**Rank them** from highest to lowest gross profit per unit.',
      ],
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Two Cookies",
      steps: [
        '**Cookie A** sells for ₱150, COGS ₱60.',
        '**Cookie B** sells for ₱150, COGS ₱130.',
        'Both sell equally well.',
        'Which cookie should Crumb & Co. prioritize promoting, and why does "same price" not mean "same value to the business"?',
      ],
    },
    shopOsTieIn: {
      note: 'Shop OS shows gross profit per product automatically once you enter COGS — useful for spotting which products like Cookie B are quietly underperforming.',
      deepLink: { sellerTab: 'products' },
    },
    quiz: [
      {
        id: 'lesson-7-1-q1',
        format: 'multiple_choice',
        prompt: 'Gross profit = ?',
        options: ['Selling price + COGS', 'Selling price − COGS', 'COGS − Selling price', 'Selling price ÷ COGS'],
        correctIndex: 1,
        explanation: "Gross profit is what's left from the selling price after covering the direct cost (COGS) of that specific product.",
      },
    ],
  },
  {
    id: 'lesson-7-2',
    moduleId: 'module-7',
    number: '7.2',
    title: 'Unit Economics',
    estimatedMinutes: 20,
    hook: "\"Selling more isn't automatically good — if each unit barely covers its own cost, more sales can mean more work for barely more profit.\"",
    beats: [
      '**Unit economics** means checking profit one sale at a time, not just as one lump total.',
      '**Variable cost per unit** is the cost that grows with every unit made — materials, packaging, anything that scales with production, similar to COGS.',
      '**Contribution margin** = Price per unit − Variable cost per unit. A ₱180 keychain with a ₱75 variable cost leaves a ₱105 contribution margin — ₱105 chipping away at rent and other fixed costs every time one sells.',
    ],
    whyItMatters: '**Contribution margin isn\'t profit yet** — it\'s the fuel that pays off fixed costs first, which is why a flood of low-margin sales can add up to less real money than a handful of high-margin ones.',
    activity: {
      title: 'Calculate Contribution Margin',
      steps: [
        '**Calculate the contribution margin per unit** for 3 products, given their selling price and variable cost per unit.',
        'Identify which product **"contributes"** the most toward covering the shop\'s fixed costs.',
      ],
    },
    inLessonScenario: {
      title: "Cozy Corner's Per-Unit Reality",
      steps: [
        "Cozy Corner's keychain: price ₱180, variable cost ₱75.",
        '**Calculate the contribution margin per unit.**',
        "If Cozy Corner sells 40 keychains this month, what's the **TOTAL contribution margin**?",
      ],
    },
    quiz: [
      {
        id: 'lesson-7-2-q1',
        format: 'multiple_choice',
        prompt: 'Contribution margin per unit = ?',
        options: ['Price ÷ Variable cost', 'Price − Variable cost', 'Price + Fixed costs', 'Fixed costs ÷ Price'],
        correctIndex: 1,
        explanation: "Contribution margin per unit is price minus variable cost per unit — what's left to cover fixed costs and profit.",
      },
      {
        id: 'lesson-7-2-q2',
        format: 'short_answer',
        prompt: 'If price = ₱200 and variable cost = ₱140, contribution margin = ?',
        modelAnswer: '₱60',
        explanation: 'Contribution margin per unit = Price − Variable cost = ₱200 − ₱140 = ₱60.',
      },
    ],
  },
  {
    id: 'lesson-7-3',
    moduleId: 'module-7',
    number: '7.3',
    title: 'Gross Margin & Net Margin',
    estimatedMinutes: 20,
    hook: '"Two shops both made ₱10,000 gross profit this month. One has ₱50,000 in sales; the other has ₱15,000. Which one is actually healthier?"',
    beats: [
      '**Gross margin** = (Gross Profit ÷ Revenue) × 100 — the % of every peso of sales left after direct product costs.',
      '**Net margin** = (Net Profit ÷ Revenue) × 100, where Net Profit also subtracts operating expenses — the % left after literally everything.',
      'Percentages let you compare fairly across sizes. Crumb & Co.\'s ₱15,000 revenue and ₱6,000 gross profit works out to a 40% gross margin — a number you can stack up against a shop twice its size.',
    ],
    whyItMatters: '**Peso profit alone can mislead** — a bigger shop can post a bigger number and still be less efficient per sale than a smaller one.',
    quickStat: "Rule of thumb: if net margin keeps shrinking while revenue climbs, costs are quietly outgrowing sales — worth an expense check before it becomes a real problem.",
    activity: {
      title: 'Calculate Both Margins',
      steps: [
        'Given revenue, COGS, and operating expenses for a business, **calculate gross margin %** and **net margin %**.',
        '**Explain in one sentence** what each percentage tells the owner.',
      ],
    },
    inLessonScenario: {
      title: 'Which Shop Is Healthier?',
      steps: [
        '**Shop A**: ₱50,000 revenue, ₱10,000 gross profit (20% margin).',
        '**Shop B**: ₱15,000 revenue, ₱10,000 gross profit.',
        "**Calculate Shop B's gross margin %.**",
        'Which shop is **more efficient** per peso of sales, even though their PESO gross profit is identical?',
      ],
    },
    shopOsTieIn: {
      note: 'Shop OS displays gross margin % alongside peso amounts in your financial summary — always compare both, not peso amounts alone.',
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-7-3-q1',
        format: 'multiple_choice',
        prompt: 'Gross margin formula:',
        options: ['Gross Profit − Revenue', '(Gross Profit ÷ Revenue) × 100', 'Revenue ÷ Gross Profit', 'COGS ÷ Revenue'],
        correctIndex: 1,
        explanation: 'Gross margin expresses gross profit as a percentage of revenue: (Gross Profit ÷ Revenue) × 100.',
      },
      {
        id: 'lesson-7-3-q2',
        format: 'short_answer',
        prompt: 'Why compare margins (%) instead of just peso profit between two businesses?',
        modelAnswer: 'Because margins account for differences in size, making comparisons fair.',
        explanation: "A percentage adjusts for how much revenue was needed to generate that profit, so it's a fair way to compare businesses of different sizes.",
      },
    ],
  },
  {
    id: 'lesson-7-4',
    moduleId: 'module-7',
    number: '7.4',
    title: 'Break-Even: When Do We Stop Losing?',
    estimatedMinutes: 20,
    hook: '"PixelPop pays ₱3,000/month for design software no matter how many projects it takes. How many projects does it need before that cost stops being a loss?"',
    beats: [
      '**Fixed costs** don\'t budge no matter how much you sell — rent, a monthly subscription. **Variable costs** move with every unit — materials, packaging.',
      'The **break-even point** is where total revenue exactly equals total costs. No profit, no loss — yet.',
      'Break-even units = Fixed Costs ÷ Contribution Margin per Unit. PixelPop\'s ₱3,000/month software cost ÷ ₱500 contribution margin per logo = 6 projects just to break even.',
    ],
    whyItMatters: 'Every sale before break-even is just **paying off fixed costs** — the real profit only starts on project #7.',
    quickStat: 'Break-even isn\'t one universal number — a snack stall might break even at 40 cookies a day, a design shop at 6 logos a month. It all comes down to your own fixed costs and margin.',
    image: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/CVP-TC-Sales-PL-BEP.svg',
      alt: 'Break-even chart showing Total Costs and Sales lines crossing at the break-even point, with Profit and Loss regions on either side',
      attribution: 'Image: Nils R. Barth / Wikimedia Commons (public domain)',
    },
    activity: {
      title: 'Find the Break-Even Point',
      steps: [
        'Given fixed costs and contribution margin per unit for 3 different mini-businesses, **calculate the break-even point** in units for each.',
      ],
    },
    inLessonScenario: {
      title: "PixelPop's Break-Even Month",
      steps: [
        "PixelPop's fixed cost is ₱3,000/month (software subscription).",
        'Each logo project has a selling price of ₱800 and variable cost of ₱300 (**contribution margin = ₱500**).',
        "**Calculate PixelPop's break-even point** in projects per month.",
        'If PixelPop completes 9 projects this month, **calculate its profit**.',
      ],
    },
    shopOsTieIn: {
      note: 'Once you set your fixed costs and per-product contribution margin in Shop OS, it can calculate your break-even point automatically each month.',
      deepLink: { sellerTab: 'expenses' },
    },
    quiz: [
      {
        id: 'lesson-7-4-q1',
        format: 'multiple_choice',
        prompt: 'Break-even units = ?',
        options: ['Fixed Costs × Contribution Margin', 'Fixed Costs ÷ Contribution Margin per Unit', 'Revenue ÷ COGS', 'Variable Costs ÷ Price'],
        correctIndex: 1,
        explanation: 'Break-even units = Fixed Costs ÷ Contribution Margin per Unit — the point where total revenue exactly equals total costs.',
      },
      {
        id: 'lesson-7-4-q2',
        format: 'short_answer',
        prompt: 'If fixed costs = ₱4,000 and contribution margin per unit = ₱200, break-even = ?',
        modelAnswer: '20 units',
        explanation: 'Break-even units = Fixed Costs ÷ Contribution Margin per Unit = ₱4,000 ÷ ₱200 = 20 units.',
      },
    ],
  },
  {
    id: 'lesson-7-5',
    moduleId: 'module-7',
    number: '7.5',
    title: 'Ratios: Health Checks for a Business',
    estimatedMinutes: 20,
    hook: '"A business can look busy and successful while quietly owing more than it owns. Ratios catch what a glance at sales numbers alone can miss."',
    beats: [
      '**Liquidity** asks: can you pay your short-term bills? **Working Capital** = Current Assets − Current Liabilities.',
      '**Profitability** asks: are you actually making money relative to sales? The gross and net margins from Lesson 7.3 are profitability ratios.',
      '**Leverage** asks how much of the business runs on borrowed money. **Debt-to-Equity Ratio** = Total Liabilities ÷ Equity — the higher it climbs, the more the business leans on debt instead of the owner\'s own money.',
    ],
    whyItMatters: 'Sales totals only tell part of the story — a **quick ratio check** is what tells you whether growth is actually making the business healthier, or just busier.',
    quickStat: 'Three ratios, three questions: can you pay today\'s bills (liquidity), are you actually profitable (profitability), and who really owns the business — you or your lenders (leverage)?',
    activity: {
      title: 'Calculate Three Ratios',
      steps: [
        'Given a simple balance sheet, calculate three numbers: **Working Capital**, **Debt-to-Equity Ratio**, and **Net Margin**.',
      ],
    },
    inLessonScenario: {
      title: "Cozy Corner's Health Check",
      steps: [
        'Cozy Corner: Current Assets ₱6,000, Current Liabilities ₱2,000, Total Liabilities ₱2,000, Equity ₱8,000.',
        '**Calculate Working Capital** and **Debt-to-Equity Ratio**.',
        "Is Cozy Corner's short-term financial health (liquidity) currently **strong or weak**?",
      ],
    },
    shopOsTieIn: {
      note: "Shop OS's financial health panel calculates these same ratios automatically from your recorded assets, liabilities, and monthly profit.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-7-5-q1',
        format: 'multiple_choice',
        prompt: 'Working Capital = ?',
        options: ['Current Assets − Current Liabilities', 'Total Assets ÷ Total Liabilities', 'Revenue − Expenses', 'Equity + Liabilities'],
        correctIndex: 0,
        explanation: 'Working Capital = Current Assets − Current Liabilities — it measures whether short-term assets are enough to cover short-term bills.',
      },
      {
        id: 'lesson-7-5-q2',
        format: 'multiple_choice',
        prompt: 'A HIGH debt-to-equity ratio generally means:',
        options: ['The business is funded mostly by the owner', 'The business relies heavily on borrowed money', 'The business has no liabilities', 'The business is very liquid'],
        correctIndex: 1,
        explanation: "A high debt-to-equity ratio means more of the business is funded by borrowed money relative to the owner's own investment.",
      },
    ],
  },
];

export const module7Checkpoint: Challenge = {
  id: 'checkpoint-7',
  moduleId: 'module-7',
  mode: 'simulation',
  title: "PixelPop's Numbers Challenge",
  tagline: "Adjust PixelPop's pricing, costs, and balance sheet to see how contribution margin, break-even, working capital, and debt-to-equity move together.",
  icon: 'level-rooted-founder',
  startingCapital: 9500,
  decisions: [
    {
      key: 'pricePerProject',
      label: 'Selling price per project',
      type: 'number',
      min: 400,
      max: 2000,
      step: 50,
      default: 800,
      unit: '₱',
    },
    {
      key: 'variableCostPerProject',
      label: 'Variable cost per project',
      type: 'number',
      min: 50,
      max: 1000,
      step: 25,
      default: 280,
      unit: '₱',
    },
    {
      key: 'fixedCosts',
      label: 'Fixed costs per month',
      type: 'number',
      min: 500,
      max: 8000,
      step: 100,
      default: 2600,
      unit: '₱',
    },
    {
      key: 'projectsThisMonth',
      label: 'Projects completed this month',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      default: 9,
      unit: 'projects',
    },
    {
      key: 'currentAssets',
      label: 'Current assets',
      type: 'number',
      min: 1000,
      max: 20000,
      step: 500,
      default: 7000,
      unit: '₱',
    },
    {
      key: 'currentLiabilities',
      label: 'Current liabilities',
      type: 'number',
      min: 0,
      max: 10000,
      step: 250,
      default: 1500,
      unit: '₱',
    },
    {
      key: 'equity',
      label: "Owner's equity",
      type: 'number',
      min: 1000,
      max: 20000,
      step: 500,
      default: 9500,
      unit: '₱',
    },
  ],
  compute: (decisions, _startingCapital) => {
    const pricePerProject = Math.max(0, Number(decisions.pricePerProject) || 0);
    const variableCostPerProject = Math.max(0, Number(decisions.variableCostPerProject) || 0);
    const fixedCosts = Math.max(0, Number(decisions.fixedCosts) || 0);
    const projectsThisMonth = Math.max(0, Number(decisions.projectsThisMonth) || 0);
    const currentAssets = Math.max(0, Number(decisions.currentAssets) || 0);
    const currentLiabilities = Math.max(0, Number(decisions.currentLiabilities) || 0);
    const equity = Math.max(0, Number(decisions.equity) || 0);

    // Simplified checkpoint: total liabilities = current liabilities (matches
    // the PDF's own PixelPop numbers, where Current Liabilities = Total Liabilities).
    const totalLiabilities = currentLiabilities;

    const contributionMargin = pricePerProject - variableCostPerProject;
    const hasBreakEven = contributionMargin > 0;
    const breakEvenProjects = hasBreakEven ? fixedCosts / contributionMargin : Infinity;
    const monthlyProfit = projectsThisMonth * contributionMargin - fixedCosts;
    const workingCapital = currentAssets - currentLiabilities;
    const debtToEquity = equity > 0 ? totalLiabilities / equity : Infinity;

    // (a) Break-even signal — up to 40 points: full marks at or above
    // break-even, scaled down the further below it a shop falls.
    let breakEvenScore = 0;
    if (hasBreakEven) {
      if (breakEvenProjects <= 0) {
        breakEvenScore = 40;
      } else {
        const ratio = projectsThisMonth / breakEvenProjects;
        breakEvenScore = 40 * clamp(ratio, 0, 1);
      }
    }

    // (b) Liquidity signal — up to 35 points: a current ratio (assets ÷
    // liabilities) of 2.0 or higher is treated as fully healthy.
    let liquidityScore = 35;
    if (currentLiabilities > 0) {
      const currentRatio = currentAssets / currentLiabilities;
      liquidityScore = 35 * clamp(currentRatio / 2, 0, 1);
    }

    // (c) Leverage signal — up to 25 points: debt-to-equity under 0.5 is
    // treated as fully healthy, scaling down to 0 by a ratio of 2.0.
    let leverageScore = 25;
    if (debtToEquity === Infinity) {
      leverageScore = 0;
    } else if (debtToEquity > 0.5) {
      leverageScore = 25 * clamp(1 - (debtToEquity - 0.5) / 1.5, 0, 1);
    }

    const rawScore = breakEvenScore + liquidityScore + leverageScore;
    const score = Math.round(clamp(rawScore, 0, 100));
    const { tier, xpAwarded, seedsAwarded } = scoreToTierAndReward(score);

    const breakdown = [
      { label: 'Contribution Margin per Project', value: `₱${Math.round(contributionMargin).toLocaleString()}` },
      { label: 'Break-Even Point (projects)', value: hasBreakEven ? `${breakEvenProjects.toFixed(1)} projects` : 'Not reachable — costs exceed price' },
      { label: "This Month's Profit", value: `₱${Math.round(monthlyProfit).toLocaleString()}` },
      { label: 'Working Capital', value: `₱${Math.round(workingCapital).toLocaleString()}` },
      { label: 'Debt-to-Equity Ratio', value: debtToEquity === Infinity ? 'Undefined — no equity recorded' : debtToEquity.toFixed(2) },
    ];

    const feedback: string[] = [];

    if (!hasBreakEven) {
      feedback.push(`At ₱${pricePerProject.toLocaleString()} per project against a ₱${variableCostPerProject.toLocaleString()} variable cost, this project isn't profitable at all — no break-even point exists until the price rises above the variable cost.`);
    } else {
      feedback.push(`Each project contributes ₱${Math.round(contributionMargin).toLocaleString()} toward fixed costs, so PixelPop needs about ${breakEvenProjects.toFixed(1)} projects a month to break even. At ${projectsThisMonth} projects, that's a monthly ${monthlyProfit >= 0 ? 'profit' : 'loss'} of ₱${Math.round(Math.abs(monthlyProfit)).toLocaleString()}.`);
    }

    if (workingCapital >= 0) {
      feedback.push(`With ₱${currentAssets.toLocaleString()} in current assets against ₱${currentLiabilities.toLocaleString()} in current liabilities, working capital is a healthy ₱${Math.round(workingCapital).toLocaleString()} — PixelPop can comfortably cover its short-term bills.`);
    } else {
      feedback.push(`Working capital is negative (₱${Math.round(workingCapital).toLocaleString()}) — current liabilities exceed current assets, meaning PixelPop may struggle to cover its short-term bills.`);
    }

    if (debtToEquity === Infinity) {
      feedback.push("With no recorded equity, the debt-to-equity ratio can't be calculated — every peso of liability is unsupported by an owner investment.");
    } else if (debtToEquity < 0.5) {
      feedback.push(`A debt-to-equity ratio of ${debtToEquity.toFixed(2)} means PixelPop is funded mostly by its owner's own investment, not borrowed money — a healthy sign.`);
    } else {
      feedback.push(`A debt-to-equity ratio of ${debtToEquity.toFixed(2)} shows PixelPop is relying more heavily on borrowed money relative to owner equity — worth watching as liabilities grow.`);
    }

    feedback.push(`Financial health summary: break-even is ${hasBreakEven ? `${breakEvenProjects.toFixed(1)} projects/month` : 'unreachable at this price and cost'}, working capital is ₱${Math.round(workingCapital).toLocaleString()}, and debt-to-equity is ${debtToEquity === Infinity ? 'undefined' : debtToEquity.toFixed(2)} — together these combine into a "${tier}" score of ${score}/100.`);

    return { score, tier, breakdown, feedback, xpAwarded, seedsAwarded };
  },
};
