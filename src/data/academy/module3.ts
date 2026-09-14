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
    estimatedMinutes: 35,
    hook: "\"Miggy used his snack money to buy Cozy Corner supplies, then used shop earnings to buy lunch. Two months later, he had no idea if the business was actually making money.\"",
    simplifiedExplanation: "One of the first habits every entrepreneur should build is keeping business money separate from personal money — even a simple envelope, notebook, or separate e-wallet counts. When personal and business money mix, it becomes almost impossible to tell if the business is actually profitable, and it makes basic recordkeeping (tracking what comes in and goes out) far harder.\n\nGood recordkeeping doesn't require fancy software when you're starting out. It requires consistency: writing down every sale and every expense, even small ones, as they happen — not from memory at the end of the month.",
    concept: {
      body: "The Philippine Department of Education's Grade 11 ABM curriculum (Fundamentals of Accountancy, Business and Management 1) teaches recordkeeping and the reasons businesses keep books of accounts from the very first lessons — separating business and personal money is the foundation everything else in this module builds on.",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16012' },
        { title: 'Manage Your Finances — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/manage-your-business/manage-your-finances' },
      ],
    },
    activity: {
      title: 'Separate or Mixed?',
      prompt: "Review 5 short transaction scenarios (e.g., 'bought ingredients using shop earnings,' 'used shop earnings to buy a phone case'). Label each as 'business expense' or 'personal expense — should NOT come from the shop.'",
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Missing Money",
      prompt: "Crumb & Co. made ₱4,000 in sales this month but the owner isn't sure how much profit remains because some cash was used for snacks, some for ingredients, and some was lent to a friend. Propose one simple system (using a notebook, envelope, or e-wallet) Crumb & Co. could start using this week to avoid this next month.",
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
    estimatedMinutes: 35,
    hook: "\"Crumb & Co. sells a box of cookies for ₱150. But how much of that ₱150 is actually profit, once you count flour, sugar, packaging, and the tricycle ride to deliver it?\"",
    simplifiedExplanation: "Revenue is all the money a business brings in from sales, before subtracting anything. Expenses are the costs of running the business. One special category of expense is COGS (Cost of Goods Sold) — the direct cost of making or acquiring exactly what you sold: direct materials (ingredients, fabric, beads), packaging, and transit/shipping to get the product to the customer. Other costs, like rent, marketing, or a phone bill, are operating expenses — they exist even if you sell nothing that day.\n\nExample: Crumb & Co. sells a box of cookies for ₱150 (Revenue). The flour, sugar, butter, and box cost ₱60 total (COGS). Revenue − COGS = ₱90 Gross Profit — the money left over before other operating costs like rent or delivery fuel are subtracted.",
    concept: {
      body: "DepEd's Grade 11 ABM curriculum has students prepare the Statement of Cost of Goods Sold and Gross Profit for a merchandising business — the exact calculation (Revenue − COGS = Gross Profit) taught in this lesson.",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16012' },
      ],
    },
    activity: {
      title: 'Sort the Costs',
      prompt: "You'll see a list of 8 costs for a small snack business (flour, rent, packaging, social media ads, sugar, delivery fuel for that specific order, phone bill, box printing). Sort each into 'COGS' or 'Operating Expense.'",
    },
    inLessonScenario: {
      title: "Cozy Corner's Cost Breakdown",
      prompt: 'Cozy Corner sells a plush keychain for ₱180. Direct materials (fabric, stuffing, keyring) cost ₱65 and packaging costs ₱10. Calculate: Revenue, COGS, and Gross Profit for one keychain.',
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
    estimatedMinutes: 35,
    hook: "\"PixelPop finishes a logo design on March 28th but the client doesn't pay until April 3rd. Did PixelPop earn that money in March or April?\"",
    simplifiedExplanation: "Revenue recognition is about timing — deciding when to count income as earned. Under the cash method, you record income only when cash is actually received, and expenses only when actually paid. Under the accrual method, you record income when it's earned (the work is done or the product delivered) even if payment comes later, and expenses when they're incurred, not necessarily when paid.\n\nMost very small or beginner businesses use the simpler cash method. As a business grows and starts offering credit terms or holding inventory, accrual accounting gives a more accurate month-to-month picture of performance.",
    concept: {
      body: "DepEd's Grade 11 ABM curriculum has students explain the accounting concepts and principles behind financial statements, which include the accrual basis of accounting used under Philippine Financial Reporting Standards. The cash-vs-accrual distinction itself is universal; the U.S. IRS's Publication 538 is cited here only for its especially clear plain-language definitions of the two methods.",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16012' },
        { title: 'Publication 538: Accounting Periods and Methods — Internal Revenue Service (IRS)', url: 'https://www.irs.gov/publications/p538' },
      ],
    },
    activity: {
      title: 'Cash or Accrual?',
      prompt: 'For each scenario, decide whether the business would record the income in March or April under (a) the cash method and (b) the accrual method: PixelPop finishes work March 28, gets paid April 3.',
    },
    inLessonScenario: {
      title: "DoodleDrop's Batch Order",
      prompt: 'DoodleDrop delivers 50 stickers to a school club on May 30 but the club treasurer pays on June 5 (end of the school budget cycle). Under the accrual method, in which month should DoodleDrop record this as revenue? Why might this matter if DoodleDrop wants to know how well May actually performed?',
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
    estimatedMinutes: 35,
    hook: "\"Crumb & Co.'s books say they made ₱8,000 profit this month. But there's only ₱1,200 in the cash box. What happened?\"",
    simplifiedExplanation: "A business can be profitable on paper and still run out of cash — the actual money available right now. This happens when: customers haven't paid yet (unpaid orders / accounts receivable), bills are due later even though the expense already happened, or cash was spent buying inventory that hasn't sold yet.\n\nProfit measures performance over time; cash measures what's actually available today. This is one of the most common reasons small businesses struggle even when they look successful.",
    concept: {
      body: "DepEd's Grade 12 ABM curriculum (Fundamentals of Accountancy, Business and Management 2) devotes a full topic to the Cash Flow Statement precisely because profit and cash tell different stories. The FDIC/SBA's Money Smart for Small Business puts it plainly: 'even profitable businesses can fail if they don't have the right amount of cash available at the right time.'",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 2 (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16013' },
        { title: 'Money Smart for Small Business — Module 10: Managing Cash Flow — FDIC & SBA', url: 'https://www.fdic.gov/consumer-resource-center/mssb-m10-pg.pdf' },
      ],
    },
    activity: {
      title: 'Where Did the Cash Go?',
      prompt: "Crumb & Co. shows ₱8,000 profit but only ₱1,200 cash. Given: ₱3,500 in unpaid customer orders, ₱2,000 spent on flour bought in bulk (not yet all used), ₱1,300 owed to a supplier due next week — explain in your own words where the 'missing' cash actually is.",
    },
    inLessonScenario: {
      title: 'The Big Order Trap',
      prompt: "PixelPop accepts a huge client order and spends ₱5,000 upfront on premium design software to complete it, expecting ₱15,000 in revenue. The client won't pay until 30 days after delivery. What cash problem could PixelPop face in the meantime, even though the order is very profitable on paper?",
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
    estimatedMinutes: 35,
    hook: '"Every business, no matter how small, follows one equation that always has to balance — like a seesaw that can never tip."',
    simplifiedExplanation: "Assets = Liabilities + Equity. This is the accounting equation, and it must always balance. Assets are things the business owns that have value (cash, inventory, equipment, money owed to it by customers — called accounts receivable). Liabilities are what the business owes to others (money owed to suppliers — accounts payable — or loans). Equity is the owner's stake — what's left over for the owner after liabilities are subtracted from assets, including the owner's original investment.\n\nIf Cozy Corner has ₱10,000 in assets and owes ₱3,000 to a supplier, the owner's equity must be ₱7,000.",
    concept: {
      body: "The accounting equation is taught directly in DepEd's Grade 11 ABM curriculum: students are asked to 'illustrate the accounting equation' and 'perform operations involving simple cases with the use of accounting equation.'",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16012' },
      ],
    },
    activity: {
      title: 'Balance the Equation',
      prompt: 'Fill in the missing number for 3 mini-cases: (1) Assets ₱12,000, Liabilities ₱4,500, Equity = ? (2) Liabilities ₱2,000, Equity ₱9,000, Assets = ? (3) Assets ₱6,300, Equity ₱6,300, Liabilities = ?',
    },
    inLessonScenario: {
      title: "Cozy Corner's Snapshot",
      prompt: "Cozy Corner has: ₱2,500 cash, ₱1,800 unsold inventory, and ₱900 owed by a customer (accounts receivable). It owes ₱1,200 to a fabric supplier (accounts payable). Calculate total assets, then calculate owner's equity.",
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
    estimatedMinutes: 35,
    hook: "\"If a bank asked to see Crumb & Co.'s finances, which single piece of paper would tell the whole story? The answer: no single one — you need three, and they're connected.\"",
    simplifiedExplanation: "The Income Statement shows performance over a period of time — revenue, expenses, and resulting profit or loss. The Balance Sheet is a snapshot at one specific moment — what the business owns (assets) and owes (liabilities), and the resulting equity. The Cash Flow Statement tracks the actual cash moving in and out during a period, separate from profit.\n\nThese three connect: profit from the Income Statement flows into equity on the Balance Sheet, and the Cash Flow Statement explains why cash on hand doesn't always match reported profit.",
    concept: {
      body: "DepEd's Grade 12 ABM curriculum has students prepare and connect all of these: the Statement of Financial Position, Statement of Comprehensive Income, Statement of Changes in Equity, and Cash Flow Statement. The U.S. SEC's investor guide makes the same point in plainer terms: 'No one financial statement tells the complete story. But combined, they provide very powerful information.'",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 2 (Curriculum Guide, Grade 12) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16013' },
        { title: "Beginners' Guide to Financial Statements — U.S. Securities and Exchange Commission (SEC)", url: 'https://www.sec.gov/about/reports-publications/beginners-guide-financial-statements' },
      ],
    },
    activity: {
      title: 'Match the Statement',
      prompt: "Match each question to the correct statement: (1) 'How much profit did we make in March?' (2) 'What do we own and owe right now?' (3) 'Did we actually receive enough cash to pay rent this week?'",
    },
    inLessonScenario: {
      title: 'Investor Questions',
      prompt: "A relative offers to lend PixelPop ₱10,000 but wants to see 'how the business is doing' first. Which financial statement(s) should PixelPop prepare, and what specific question does each one answer for the lender?",
    },
    shopOsTieIn: {
      note: 'Shop OS automatically generates simplified versions of all three statements from your recorded sales and expenses — no separate bookkeeping software needed to get started.',
      deepLink: { sellerTab: 'overview' },
    },
    jurisdictionNote: "Under Philippine Financial Reporting Standards (PFRS), the 'Income Statement' is officially called the Statement of Comprehensive Income (SCI), and the 'Balance Sheet' is officially called the Statement of Financial Position (SFP) — these are the exact terms used on official Philippine financial statements, tax filings, and in DepEd's own ABM curriculum.",
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
    estimatedMinutes: 35,
    hook: "\"Aya used to track DoodleDrop's sales in her memory. Now that she has 40 regular customers, memory isn't good enough anymore.\"",
    simplifiedExplanation: "As a business grows, records — organized, dated information about every sale, expense, and customer interaction — become essential, not optional. Good records let an owner answer basic questions instantly: How much did we sell this week? What's our best-selling product? Are we actually profitable? Records also matter for tax registration and compliance once a business formalizes.\n\nElectronic records (spreadsheets, accounting apps, or built-in tools like Shop OS) reduce errors compared to memory or scattered paper notes, and make it much easier to spot problems early.",
    concept: {
      body: "DepEd's Grade 11 ABM curriculum has students identify the uses of the two books of accounts (journals and ledgers) and prepare a chart of accounts — the formal version of the recordkeeping habit this lesson introduces. Once a business registers with the BIR, keeping official books of accounts becomes a legal requirement, not just good practice.",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16012' },
        { title: 'Registration Requirements — Philippine Bureau of Internal Revenue (BIR)', url: 'https://www.bir.gov.ph/registration-requirements-details' },
      ],
    },
    activity: {
      title: 'Design a Simple Record Sheet',
      prompt: "Sketch a simple table with columns you'd use to record every sale for a week (e.g., Date, Product, Quantity, Price, Total, Payment Method). Add one column that would help you calculate profit later.",
    },
    inLessonScenario: {
      title: 'DoodleDrop Outgrows Memory',
      prompt: "DoodleDrop now has 40 regular customers and can no longer remember who ordered what. What specific problems could this cause for pricing, restocking, and tax registration later, and what's the simplest first step DoodleDrop could take this week?",
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
