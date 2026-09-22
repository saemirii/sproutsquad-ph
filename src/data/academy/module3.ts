import { AcademyModule, Lesson, Challenge } from '../../types';
import { clamp, scoreToTierAndReward } from './challengeHelpers';

export const module3: AcademyModule = {
  id: 'module-3',
  number: 3,
  stage: 'Seedling',
  icon: 'tab-academy',
  title: 'Know Your Money',
  tagline: 'Finance Fundamentals',
  intro: "Money confusion kills more small businesses than bad products do. This is the longest module in the Academy — and the most important. You'll build your financial vocabulary piece by piece, using real pesos and the real SproutSquad businesses you already know: telling profit from cash, revenue from COGS, and learning to read the financial statements that tell your business's whole story.",
  lessonIds: ['lesson-3-1', 'lesson-3-2', 'lesson-3-3', 'lesson-3-4', 'lesson-3-5', 'lesson-3-6', 'lesson-3-7'],
  checkpointId: 'checkpoint-3',
};

export const module3Lessons: Lesson[] = [
  {
    id: 'lesson-3-1',
    moduleId: 'module-3',
    number: '3.1',
    title: 'Keep Business Money Separate',
    estimatedMinutes: 20,
    hook: "\"Miggy used his snack money to buy Cozy Corner supplies, then used shop earnings to buy lunch. Two months later, he had no idea if the business was actually making money.\"",
    beats: [
      "**Separate your money** from day one — a simple envelope, notebook, or dedicated e-wallet all count. Mix personal and business cash and you'll never know if you're actually profitable.",
      "**Recordkeeping** doesn't need fancy software to start. It needs consistency — log every sale and expense as it happens, not from memory at the end of the month.",
    ],
    whyItMatters: "Mixed money means mixed-up answers — **you can't manage what you can't see clearly**.",
    quickStat: "Even one 'quick borrow' from the register a week can turn a profitable month into a loss on paper.",
    activity: {
      title: 'Separate or Mixed?',
      steps: [
        "**Review 5 short transaction scenarios** (e.g., 'bought ingredients using shop earnings,' 'used shop earnings to buy a phone case').",
        "**Label each** as 'business expense' or 'personal expense — should NOT come from the shop.'",
      ],
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Missing Money",
      steps: [
        "Crumb & Co. made ₱4,000 in sales this month, but the owner isn't sure how much profit remains because some cash was used for snacks, some for ingredients, and some was lent to a friend.",
        '**Propose one simple system** (using a notebook, envelope, or e-wallet) Crumb & Co. could start using this week to avoid this next month.',
      ],
    },
    shopOsTieIn: {
      note: "Shop OS keeps every sale and expense in one place automatically — once your habit of separating money is set, Shop OS becomes the 'notebook' that never mixes things up.",
      deepLink: { sellerTab: 'expenses' },
    },
    quiz: [
      {
        id: 'lesson-3-1-q1',
        format: 'short_answer',
        prompt: 'Why should business and personal money be kept separate?',
        modelAnswer: 'So you can accurately tell if the business is actually profitable and keep clean records.',
        explanation: 'Mixing money makes it nearly impossible to see whether the business itself is profitable, and it breaks the basic recordkeeping habit every business needs from day one.',
      },
    ],
  },
  {
    id: 'lesson-3-2',
    moduleId: 'module-3',
    number: '3.2',
    title: 'Money In, Money Out',
    estimatedMinutes: 20,
    hook: "\"Crumb & Co. sells a box of cookies for ₱150. But how much of that ₱150 is actually profit, once you count flour, sugar, packaging, and the tricycle ride to deliver it?\"",
    beats: [
      "**Revenue** is every peso that comes in from sales, before subtracting anything. **COGS** (Cost of Goods Sold) is the direct cost of what you actually sold — materials, packaging, and getting it to the customer.",
      "Rent, marketing, your phone bill? Those are **operating expenses** — they show up whether you sell anything today or not.",
      "**Revenue − COGS = Gross Profit.** Crumb & Co. sells cookies for ₱150 and spends ₱60 on flour, sugar, butter, and the box — that's ₱90 gross profit, before rent or delivery even enter the picture.",
    ],
    whyItMatters: "Mix up COGS with operating expenses and your **pricing math breaks** — you'll think you're earning more than you actually are.",
    quickStat: "Forgetting packaging costs in your COGS is one of the most common pricing mistakes — even ₱5 a unit adds up fast at 100 sales.",
    activity: {
      title: 'Sort the Costs',
      steps: [
        "You'll see a list of **8 costs** for a small snack business (flour, rent, packaging, social media ads, sugar, delivery fuel for that specific order, phone bill, box printing).",
        "**Sort each** into 'COGS' or 'Operating Expense.'",
      ],
    },
    inLessonScenario: {
      title: "Cozy Corner's Cost Breakdown",
      steps: [
        'Cozy Corner sells a plush keychain for ₱180. Direct materials (fabric, stuffing, keyring) cost ₱65 and packaging costs ₱10.',
        '**Calculate**: Revenue, COGS, and Gross Profit for one keychain.',
      ],
    },
    shopOsTieIn: {
      note: "Enter your product's COGS directly into Shop OS when you list a product — this lets Shop OS calculate your gross profit and margin automatically every time you make a sale.",
      deepLink: { sellerTab: 'products' },
    },
    quiz: [
      {
        id: 'lesson-3-2-q1',
        format: 'multiple_choice',
        prompt: 'COGS stands for:',
        options: ['Cost of Great Sales', 'Cost of Goods Sold', 'Cost of General Spending', 'Customer Order Growth Statistic'],
        correctIndex: 1,
        explanation: 'COGS is the direct cost of making or acquiring exactly what you sold — materials, packaging, and transit to the customer.',
      },
      {
        id: 'lesson-3-2-q2',
        format: 'multiple_choice',
        prompt: 'Revenue − COGS = ?',
        options: ['Net Profit', 'Gross Profit', 'Operating Expense', 'Equity'],
        correctIndex: 1,
        explanation: 'Revenue minus COGS gives Gross Profit — the money left over before other operating costs like rent or marketing are subtracted.',
      },
      {
        id: 'lesson-3-2-q3',
        format: 'short_answer',
        prompt: 'If revenue = ₱180 and COGS = ₱75, gross profit = ?',
        modelAnswer: '₱105',
        explanation: 'Gross Profit = Revenue − COGS = ₱180 − ₱75 = ₱105.',
      },
    ],
  },
  {
    id: 'lesson-3-3',
    moduleId: 'module-3',
    number: '3.3',
    title: 'Revenue Recognition: When Did You Earn It?',
    estimatedMinutes: 20,
    hook: "\"PixelPop finishes a logo design on March 28th but the client doesn't pay until April 3rd. Did PixelPop earn that money in March or April?\"",
    beats: [
      "**Revenue recognition** is about timing — when do you actually count income as earned? Two methods answer that differently.",
      "**Cash method**: record income only when cash lands in your hand, expenses only when paid. **Accrual method**: record income when it's earned — work done, product delivered — even if payment comes later.",
      "Most brand-new businesses start with cash — it's simpler. Once you're extending credit or holding inventory, accrual gives a truer month-to-month picture.",
    ],
    whyItMatters: "Use the wrong method and a great month can look like a loss — **timing changes the whole story**.",
    activity: {
      title: 'Cash or Accrual?',
      steps: [
        'PixelPop finishes work March 28, gets paid April 3.',
        '**Decide** whether the business would record the income in March or April under **(a) the cash method** and **(b) the accrual method**.',
      ],
    },
    inLessonScenario: {
      title: "DoodleDrop's Batch Order",
      steps: [
        'DoodleDrop delivers 50 stickers to a school club on May 30, but the club treasurer pays on June 5 (end of the school budget cycle).',
        '**Under the accrual method**, in which month should DoodleDrop record this as revenue?',
        'Why might this matter if DoodleDrop wants to know how well May actually performed?',
      ],
    },
    jurisdictionNote: "For Philippine tax filing, the BIR has its own rules on which businesses may use the cash basis versus the accrual basis, and PFRS (Philippine Financial Reporting Standards, based on IFRS) generally requires accrual accounting for financial statements. This lesson teaches the underlying concept; check current BIR rules or a licensed accountant before choosing a method for real tax filing.",
    quiz: [
      {
        id: 'lesson-3-3-q1',
        format: 'multiple_choice',
        prompt: 'Under the accrual method, income is recorded when it is:',
        options: ['Paid in cash', 'Earned, regardless of when paid', 'Spent on supplies', 'Deposited in a bank'],
        correctIndex: 1,
        explanation: "Accrual accounting records income when it's earned — when the work is done or the product delivered — not when cash actually changes hands.",
      },
      {
        id: 'lesson-3-3-q2',
        format: 'multiple_choice',
        prompt: 'Which method is simpler for a brand-new, very small business to start with?',
        options: ['Accrual', 'Cash'],
        correctIndex: 1,
        explanation: 'The cash method is simpler because it only tracks money as it is actually received or paid — most beginner businesses start here.',
      },
    ],
  },
  {
    id: 'lesson-3-4',
    moduleId: 'module-3',
    number: '3.4',
    title: 'Cash ≠ Profit',
    estimatedMinutes: 20,
    hook: "\"Crumb & Co.'s books say they made ₱8,000 profit this month. But there's only ₱1,200 in the cash box. What happened?\"",
    beats: [
      "**Profitable on paper** doesn't always mean cash in the register. Unpaid customer orders, bills due later, or cash tied up in unsold inventory can all eat into what's actually sitting in the drawer.",
      "**Profit** measures performance over time. **Cash** measures what you can spend right now. Two different questions, two different answers.",
    ],
    whyItMatters: "Even a genuinely profitable business can **run out of cash and fail** if the timing doesn't line up — this trips up more small businesses than bad products ever do.",
    quickStat: "Rule of thumb: if more than 20-30% of your revenue is sitting in unpaid orders, double-check your cash cushion before you spend it.",
    activity: {
      title: 'Where Did the Cash Go?',
      steps: [
        'Crumb & Co. shows ₱8,000 profit but only ₱1,200 cash.',
        '**Given**: ₱3,500 in unpaid customer orders, ₱2,000 spent on flour bought in bulk (not yet all used), and ₱1,300 owed to a supplier due next week.',
        "**Explain in your own words** where the 'missing' cash actually is.",
      ],
    },
    inLessonScenario: {
      title: 'The Big Order Trap',
      steps: [
        'PixelPop accepts a huge client order and spends ₱5,000 upfront on premium design software to complete it, expecting ₱15,000 in revenue.',
        "The client won't pay until **30 days after delivery**.",
        '**What cash problem** could PixelPop face in the meantime, even though the order is very profitable on paper?',
      ],
    },
    shopOsTieIn: {
      note: "Shop OS's dashboard shows both profit AND current cash on hand as separate numbers — checking both regularly helps you avoid the 'profitable but broke' trap.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-3-4-q1',
        format: 'multiple_choice',
        prompt: 'True or False: A business can show a profit and still run out of cash.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Profit and cash are different things — unpaid orders, bills due later, and cash tied up in inventory can all leave a profitable business with little cash on hand.',
      },
      {
        id: 'lesson-3-4-q2',
        format: 'short_answer',
        prompt: 'Name one reason profit and cash can differ.',
        modelAnswer: 'Unpaid customer orders, bills due later, or cash tied up in unsold inventory.',
        explanation: "Profit measures performance on paper; cash measures what's actually available right now — the two can diverge for several reasons.",
      },
    ],
  },
  {
    id: 'lesson-3-5',
    moduleId: 'module-3',
    number: '3.5',
    title: 'The Business Equation',
    estimatedMinutes: 20,
    hook: '"Every business, no matter how small, follows one equation that always has to balance — like a seesaw that can never tip."',
    beats: [
      "**Assets = Liabilities + Equity.** This is the accounting equation, and it always has to balance — no exceptions.",
      "**Assets** are everything the business owns with value: cash, inventory, equipment, even money customers owe you (**accounts receivable**). **Liabilities** are what you owe others — suppliers (**accounts payable**), loans.",
      "**Equity** is what's left for the owner once liabilities are subtracted from assets. Cozy Corner with ₱10,000 in assets and ₱3,000 owed to a supplier? Owner's equity is exactly ₱7,000.",
    ],
    whyItMatters: "If the equation doesn't balance, **something in your records is wrong** — it's the fastest gut-check for catching mistakes.",
    quickStat: "Every peso a business owns is either borrowed (a liability) or earned by the owner (equity) — there's no third option.",
    activity: {
      title: 'Balance the Equation',
      steps: [
        '**Fill in the missing number** for 3 mini-cases.',
        '**Case 1**: Assets ₱12,000, Liabilities ₱4,500, Equity = ?',
        '**Case 2**: Liabilities ₱2,000, Equity ₱9,000, Assets = ?',
        '**Case 3**: Assets ₱6,300, Equity ₱6,300, Liabilities = ?',
      ],
    },
    inLessonScenario: {
      title: "Cozy Corner's Snapshot",
      steps: [
        'Cozy Corner has: ₱2,500 cash, ₱1,800 unsold inventory, and ₱900 owed by a customer (accounts receivable).',
        'It owes ₱1,200 to a fabric supplier (accounts payable).',
        "**Calculate total assets**, then calculate **owner's equity**.",
      ],
    },
    shopOsTieIn: {
      note: "Shop OS's financial summary is built on this same equation — your 'Owner's Equity' figure updates automatically as your assets and what you owe change.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-3-5-q1',
        format: 'multiple_choice',
        prompt: 'The accounting equation is:',
        options: ['Revenue − Expenses = Profit', 'Assets = Liabilities + Equity', 'Price − Cost = Margin', 'Assets + Equity = Liabilities'],
        correctIndex: 1,
        explanation: 'Assets = Liabilities + Equity is the accounting equation, and it must always balance.',
      },
      {
        id: 'lesson-3-5-q2',
        format: 'multiple_choice',
        prompt: 'Money a customer owes your business is called:',
        options: ['Accounts payable', 'Accounts receivable', 'Equity', 'COGS'],
        correctIndex: 1,
        explanation: 'Accounts receivable is money owed to the business by its customers; accounts payable is money the business owes to others.',
      },
    ],
  },
  {
    id: 'lesson-3-6',
    moduleId: 'module-3',
    number: '3.6',
    title: 'Meet the Financial Statements',
    estimatedMinutes: 20,
    hook: "\"If a bank asked to see Crumb & Co.'s finances, which single piece of paper would tell the whole story? The answer: no single one — you need three, and they're connected.\"",
    beats: [
      "The **Income Statement** shows performance over time — revenue, expenses, and the resulting profit or loss for a month, a quarter, whatever period you pick.",
      "The **Balance Sheet** is a snapshot at one exact moment: what you own, what you owe, what's left over. The **Cash Flow Statement** tracks actual cash moving in and out, separate from profit.",
      "They connect: profit from the Income Statement flows into equity on the Balance Sheet, and the Cash Flow Statement explains why cash on hand doesn't always match reported profit.",
    ],
    whyItMatters: "**No single statement tells the whole story** — reading just one is like judging a business with half a book.",
    activity: {
      title: 'Match the Statement',
      steps: [
        '**Match each question** to the correct statement.',
        '**(1)** "How much profit did we make in March?"',
        '**(2)** "What do we own and owe right now?"',
        '**(3)** "Did we actually receive enough cash to pay rent this week?"',
      ],
    },
    inLessonScenario: {
      title: 'Investor Questions',
      steps: [
        "A relative offers to lend PixelPop ₱10,000 but wants to see 'how the business is doing' first.",
        '**Which financial statement(s)** should PixelPop prepare?',
        '**What specific question** does each one answer for the lender?',
      ],
    },
    shopOsTieIn: {
      note: 'Shop OS automatically generates simplified versions of all three statements from your recorded sales and expenses — no separate bookkeeping software needed to get started.',
      deepLink: { sellerTab: 'overview' },
    },
    jurisdictionNote: "Under Philippine Financial Reporting Standards (PFRS), the 'Income Statement' is officially called the Statement of Comprehensive Income (SCI), and the 'Balance Sheet' is officially called the Statement of Financial Position (SFP) — these are the exact terms you'll see on official Philippine financial statements and tax filings.",
    quiz: [
      {
        id: 'lesson-3-6-q1',
        format: 'multiple_choice',
        prompt: 'Which statement shows performance OVER a period of time?',
        options: ['Balance Sheet', 'Income Statement', 'None of them'],
        correctIndex: 1,
        explanation: 'The Income Statement (Statement of Comprehensive Income under PFRS) covers a period of time, such as a month or a quarter.',
      },
      {
        id: 'lesson-3-6-q2',
        format: 'multiple_choice',
        prompt: 'Which statement is a snapshot at ONE point in time?',
        options: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement'],
        correctIndex: 1,
        explanation: 'The Balance Sheet (Statement of Financial Position under PFRS) captures what a business owns and owes at one specific moment.',
      },
    ],
  },
  {
    id: 'lesson-3-7',
    moduleId: 'module-3',
    number: '3.7',
    title: 'Accounting Software & Records',
    estimatedMinutes: 20,
    hook: "\"Aya used to track DoodleDrop's sales in her memory. Now that she has 40 regular customers, memory isn't good enough anymore.\"",
    beats: [
      "**Records** — organized, dated info on every sale and expense — stop being optional once you have more customers than you can remember.",
      "Good records answer instantly: how much did we sell this week, what's our best-seller, are we actually profitable? No guessing required.",
      "A spreadsheet or an app like Shop OS beats memory and scattered paper notes — fewer errors, and problems get caught early instead of at month's end.",
    ],
    whyItMatters: "Once you register with the BIR, proper recordkeeping stops being a nice habit and becomes a **legal requirement** — build it early and it's just routine by then.",
    activity: {
      title: 'Design a Simple Record Sheet',
      steps: [
        "**Sketch a simple table** with columns you'd use to record every sale for a week (e.g., Date, Product, Quantity, Price, Total, Payment Method).",
        '**Add one column** that would help you calculate profit later.',
      ],
    },
    inLessonScenario: {
      title: 'DoodleDrop Outgrows Memory',
      steps: [
        'DoodleDrop now has 40 regular customers and can no longer remember who ordered what.',
        '**What specific problems** could this cause for pricing, restocking, and tax registration later?',
        "**What's the simplest first step** DoodleDrop could take this week?",
      ],
    },
    shopOsTieIn: {
      note: "This is exactly what Shop OS's order history and sales log are built for — every transaction is recorded automatically the moment a sale happens.",
      deepLink: { sellerTab: 'orders' },
    },
    jurisdictionNote: 'Once a business formally registers with the BIR in the Philippines, it becomes legally required to keep official books of accounts and issue receipts — this lesson focuses on the general habit of recordkeeping; Module 2 covers the Philippine registration requirements themselves.',
    quiz: [
      {
        id: 'lesson-3-7-q1',
        format: 'short_answer',
        prompt: 'Why do good records matter even for a very small business?',
        modelAnswer: 'They let you track profitability, spot problems early, and prepare for tax registration and growth.',
        explanation: 'Even the smallest business benefits from records — they turn guesswork into clear answers about profitability and readiness to grow.',
      },
    ],
  },
];

export const module3Checkpoint: Challenge = {
  id: 'checkpoint-3',
  moduleId: 'module-3',
  mode: 'simulation',
  title: 'Profit vs. Cash Simulator',
  tagline: "Adjust a Crumb & Co.-style month's revenue, costs, and unpaid orders to see why profit on paper isn't the same as cash in hand.",
  icon: 'tab-academy',
  startingCapital: 15000,
  decisions: [
    {
      key: 'revenue',
      label: 'Monthly revenue',
      type: 'number',
      min: 5000,
      max: 30000,
      step: 500,
      default: 15000,
      unit: '₱',
    },
    {
      key: 'cogs',
      label: 'Cost of Goods Sold (COGS)',
      type: 'number',
      min: 1000,
      max: 15000,
      step: 500,
      default: 6000,
      unit: '₱',
    },
    {
      key: 'operatingExpenses',
      label: 'Other operating expenses (rent, marketing, etc.)',
      type: 'number',
      min: 500,
      max: 10000,
      step: 250,
      default: 3000,
      unit: '₱',
    },
    {
      key: 'unpaidPercent',
      label: '% of revenue still unpaid by customers',
      type: 'number',
      min: 0,
      max: 60,
      step: 5,
      default: 17,
      unit: '%',
      helpText: "Money customers owe you but haven't paid yet (accounts receivable)",
    },
  ],
  compute: (decisions, _startingCapital) => {
    const revenue = Math.max(0, Number(decisions.revenue) || 0);
    const cogs = Math.max(0, Number(decisions.cogs) || 0);
    const operatingExpenses = Math.max(0, Number(decisions.operatingExpenses) || 0);
    const unpaidPercent = clamp(Number(decisions.unpaidPercent) || 0, 0, 100);

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - operatingExpenses;
    const unpaidAmount = revenue * (unpaidPercent / 100);
    const estimatedCashOnHand = netProfit - unpaidAmount;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    const rawScore = 50 + netMargin * 1.0 - (unpaidPercent - 10) * 1.0;
    const score = Math.round(clamp(rawScore, 0, 100));
    const { tier, xpAwarded, seedsAwarded } = scoreToTierAndReward(score);

    const breakdown = [
      { label: 'Gross Profit', value: `₱${Math.round(grossProfit).toLocaleString()}` },
      { label: 'Net Profit', value: `₱${Math.round(netProfit).toLocaleString()}` },
      { label: 'Estimated Cash on Hand', value: `₱${Math.round(estimatedCashOnHand).toLocaleString()}` },
      { label: 'Net Margin', value: `${Math.round(netMargin * 10) / 10}%` },
    ];

    const feedback: string[] = [
      `Even with a Net Profit of ₱${Math.round(netProfit).toLocaleString()}, ₱${Math.round(unpaidAmount).toLocaleString()} of this month's revenue is still sitting in unpaid customer orders — just like Crumb & Co. and PixelPop learned, profit on paper isn't the same as cash actually in hand.`,
    ];
    if (estimatedCashOnHand < 0) {
      feedback.push("Your estimated cash on hand is negative — a real cash shortfall. Even a profitable business can struggle to pay suppliers or rent if too much revenue is tied up in unpaid orders.");
    } else if (netMargin < 10) {
      feedback.push(`Your net margin is thin at ${Math.round(netMargin * 10) / 10}% — a small rise in costs or unpaid orders could push you into a cash shortfall next month.`);
    } else {
      feedback.push('This is a healthy result — a solid net margin and a manageable gap between profit and cash on hand.');
    }

    return { score, tier, breakdown, feedback, xpAwarded, seedsAwarded };
  },
};
