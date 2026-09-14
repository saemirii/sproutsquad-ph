import { AcademyModule, Lesson, Challenge } from '../../types';
import { clamp, scoreToTierAndReward } from './challengeHelpers';

export const module5: AcademyModule = {
  id: 'module-5',
  number: 5,
  stage: 'Sapling',
  icon: 'level-bloom',
  title: 'Turn Browsers into Buyers',
  tagline: 'Sales, Conversion & Analytics',
  intro: "Getting attention is only half the job. This module covers how interested people actually become paying customers — and how to read the numbers that tell you what's working.",
  lessonIds: ['lesson-5-1', 'lesson-5-2', 'lesson-5-3', 'lesson-5-4', 'lesson-5-5'],
  checkpointId: 'checkpoint-5',
};

export const module5Lessons: Lesson[] = [
  {
    id: 'lesson-5-1',
    moduleId: 'module-5',
    number: '5.1',
    title: 'From Stranger to Customer',
    estimatedMinutes: 35,
    hook: '"A customer messages DoodleDrop asking about a custom sticker, then goes silent. What happened between \'interested\' and \'never bought\'?"',
    simplifiedExplanation: "The sales journey describes the steps a stranger typically moves through before becoming a paying, repeat customer: Prospecting (finding potential customers), Understanding customer needs (asking questions instead of just pitching), Presentation (showing how your product fits their need), Handling objections (addressing hesitations like price or timing calmly, not defensively), Closing (actually asking for the sale), and Follow-up (checking in after the sale to build repeat business).\n\nMany small business owners skip straight to presentation without understanding needs, or forget to actually ask for the sale (closing) after a great conversation.",
    concept: {
      body: "DepEd's Senior High School Entrepreneurship curriculum has students actually implement a simple business and sell the product or service to potential customers as part of the applied-track requirements — selling is treated as a practiced skill, not a one-time event. OpenStax's Introduction to Business breaks that skill into the same six steps used in this lesson.",
      sources: [
        { title: 'K to 12 Senior High School Applied Track Subject — Entrepreneurship (Curriculum Guide) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/14442' },
        { title: 'Introduction to Business, 12.7: The Importance of Personal Selling (Steps in the Selling Process) — OpenStax / Rice University', url: 'https://openstax.org/books/introduction-business-2e/pages/12-7-the-importance-of-personal-selling' },
      ],
    },
    activity: {
      title: 'Fix the Broken Conversation',
      prompt: "You'll see a short chat where a seller jumps straight from greeting to price, skipping needs and objections. Rewrite the conversation to include all 6 steps of the sales journey, in the correct order.",
    },
    inLessonScenario: {
      title: "DoodleDrop's Silent Customer",
      prompt: 'A customer asks DoodleDrop about custom stickers, then stops replying after hearing the price. Using the sales journey steps, identify which step DoodleDrop likely skipped, and write one message that addresses a possible objection (e.g., price, timing) instead of just repeating the price.',
    },
    quiz: [
      {
        id: 'lesson-5-1-q1',
        format: 'short_answer',
        prompt: 'Put these in order: Closing, Prospecting, Handling Objections, Presentation, Follow-up, Understanding Needs.',
        modelAnswer: 'Prospecting → Understanding Needs → Presentation → Handling Objections → Closing → Follow-up.',
        explanation: 'The sales journey moves from finding a customer, to understanding them, to presenting a fit, to handling hesitations, to actually asking for the sale, to keeping the relationship going afterward.',
      },
      {
        id: 'lesson-5-1-q2',
        format: 'short_answer',
        prompt: "What often happens if a seller never actually 'closes' (asks for the sale)?",
        modelAnswer: 'The customer may stay interested but never actually buy.',
        explanation: 'A great conversation that never asks for the sale can end in polite interest instead of a completed order — closing is the step that turns interest into revenue.',
      },
    ],
  },
  {
    id: 'lesson-5-2',
    moduleId: 'module-5',
    number: '5.2',
    title: 'The Conversion Funnel',
    estimatedMinutes: 35,
    hook: '"1,000 people saw PixelPop\'s post. 50 clicked the link. 5 messaged. 1 bought. Where did everyone else go?"',
    simplifiedExplanation: "The conversion funnel describes how a large group of people gradually narrows down to actual customers, in stages: Awareness (they learn you exist), Interest (they want to know more), Consideration (they're comparing you to alternatives), Purchase (they buy), and Repeat action (they buy again or refer others). It's called a funnel because the numbers shrink at every stage — not everyone who becomes aware will buy, and that's normal.\n\nUnderstanding the funnel helps you diagnose problems: if lots of people are 'aware' but few show 'interest,' the issue might be your message. If people show interest but don't 'purchase,' the issue might be price, trust, or an unclear call to action.",
    concept: {
      body: "The classic AIDA marketing model — Attention, Interest, Desire, Action — describes the stages a consumer moves through before purchasing, visualized as a funnel where 'each stage has fewer consumers than the one before.'",
      sources: [
        { title: 'AIDA Model (Research Starters) — EBSCO Information Services', url: 'https://www.ebsco.com/research-starters/marketing/aida-model/' },
      ],
    },
    activity: {
      title: 'Diagnose the Funnel',
      prompt: 'Given 3 different funnel shapes (e.g., many aware but few interested; many interested but few purchase), match each shape to the most likely underlying problem: unclear message, weak call to action, price mismatch, or trust issue.',
    },
    inLessonScenario: {
      title: "PixelPop's Numbers",
      prompt: "1,000 people saw PixelPop's post (Awareness). 50 clicked to learn more (Interest). 5 messaged to ask questions (Consideration). 1 actually paid (Purchase). At which stage is PixelPop losing the most people, and name one possible fix.",
    },
    shopOsTieIn: {
      note: "Shop OS's storefront analytics show views, clicks, and completed orders — the exact stages of your funnel — so you can see where customers are dropping off.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-5-2-q1',
        format: 'short_answer',
        prompt: 'List the 5 stages of a basic conversion funnel.',
        modelAnswer: 'Awareness, Interest, Consideration, Purchase, Repeat action.',
        explanation: "These five stages describe the same narrowing crowd — from everyone who's simply aware you exist down to the handful who become repeat, referring customers.",
      },
    ],
  },
  {
    id: 'lesson-5-3',
    moduleId: 'module-5',
    number: '5.3',
    title: 'Conversion Math',
    estimatedMinutes: 35,
    hook: '"Two shops both got 100 visitors. One made 20 sales, the other made 2. The raw visitor count told you nothing — the percentage did."',
    simplifiedExplanation: "Conversion metrics turn funnel stages into simple percentages you can compare over time: Views→Clicks (what % of people who saw your post clicked?), Clicks→Orders (what % of people who clicked actually bought?), and Visitors→Customers (overall, what % of everyone who encountered your shop became a paying customer?).\n\nThe formula is always: (smaller number ÷ larger number) × 100. Example: if 200 people viewed a product and 20 bought it, the conversion rate is (20 ÷ 200) × 100 = 10%.",
    concept: {
      body: "The percentage math behind a conversion rate is exactly what DepEd's Grade 11 Business Mathematics curriculum covers under ratio, proportion, and percentage.",
      sources: [
        { title: 'Business Mathematics (Curriculum Guide, Grade 11) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16008' },
        { title: 'AIDA Model (Research Starters) — EBSCO Information Services', url: 'https://www.ebsco.com/research-starters/marketing/aida-model/' },
      ],
    },
    activity: {
      title: 'Calculate the Conversion Rate',
      prompt: 'Calculate conversion rate (%) for 3 scenarios: (1) 150 views, 15 clicks. (2) 40 clicks, 8 orders. (3) 500 visitors, 25 customers.',
    },
    inLessonScenario: {
      title: 'Which Shop Is Doing Better?',
      prompt: 'Cozy Corner: 300 views, 60 orders. DoodleDrop: 900 views, 90 orders. Which shop has more raw orders, and which shop has the higher CONVERSION RATE? Explain why looking only at total orders can be misleading.',
    },
    shopOsTieIn: {
      note: "Shop OS calculates your view-to-order conversion rate automatically in your analytics tab, so you don't need to do this math by hand once your shop is live.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-5-3-q1',
        format: 'multiple_choice',
        prompt: 'The conversion rate formula is:',
        options: ['Larger number ÷ smaller number', '(Smaller number ÷ larger number) × 100', 'Revenue − Expenses', 'Views + Clicks'],
        correctIndex: 1,
        explanation: 'Conversion rate always compares the smaller downstream number to the larger upstream number, expressed as a percentage.',
      },
      {
        id: 'lesson-5-3-q2',
        format: 'short_answer',
        prompt: 'If 250 people view a product and 25 buy it, the conversion rate is:',
        modelAnswer: '10%',
        explanation: '(25 ÷ 250) × 100 = 10% — exactly the smaller-over-larger formula from this lesson.',
      },
    ],
  },
  {
    id: 'lesson-5-4',
    moduleId: 'module-5',
    number: '5.4',
    title: 'Read the Dashboard',
    estimatedMinutes: 35,
    hook: '"A number going down isn\'t automatically bad news, and a number going up isn\'t automatically good news — until you ask \'why?\'"',
    simplifiedExplanation: "Reading business metrics well means going beyond the raw number to ask three questions every time: What changed? (identify the specific metric and how much it moved), Why might it have changed? (consider possible causes — seasonality, a competitor, a price change, a broken link), and What should the business do next? (a specific, testable action, not just a vague reaction).\n\nA common mistake is reacting to a single day's number instead of a trend over time, or assuming a cause without checking it.",
    concept: {
      body: "The SBA advises small businesses to track marketing costs against the revenue generated and monitor return on investment (ROI) — reading the 'why' behind performance data, not just the raw totals.",
      sources: [
        { title: 'Marketing and Sales — SBA', url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales' },
      ],
    },
    activity: {
      title: 'What Changed, Why, What Next?',
      prompt: 'Given a simple chart showing orders dropping 40% in one week, write one sentence for each: What changed? Two possible reasons why? One specific next action to test.',
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Sudden Dip",
      prompt: "Crumb & Co.'s weekly orders dropped from 60 to 35 right after exam week began. Using the three-question framework, analyze what likely happened and propose one action for the following week.",
    },
    shopOsTieIn: {
      note: "Shop OS's weekly summary highlights the biggest changes automatically — use the three-question framework any time a number surprises you.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-5-4-q1',
        format: 'short_answer',
        prompt: 'Name the three questions to ask when reading any business metric.',
        modelAnswer: 'What changed? Why might it have changed? What should we do next?',
        explanation: 'This three-question habit turns a raw number into an actual decision instead of a knee-jerk reaction.',
      },
    ],
  },
  {
    id: 'lesson-5-5',
    moduleId: 'module-5',
    number: '5.5',
    title: 'Sales Mission: Fix the Funnel',
    estimatedMinutes: 35,
    hook: '"Every SproutSquad business has one stage of its funnel quietly leaking customers. Your mission: find it and fix it."',
    simplifiedExplanation: 'This lesson combines everything from Module 5: the sales journey, the conversion funnel, conversion math, and the 3-question analysis framework.\n\nReal businesses rarely have one single problem — they usually have one weakest stage that, if improved, would help the most. Finding that stage requires looking at the actual numbers, not guessing based on gut feeling.',
    concept: {
      body: 'Combining the funnel model with the personal-selling process gives a complete view: the funnel shows where customers drop off, and the selling-process steps suggest what specific action addresses that stage.',
      sources: [
        { title: 'AIDA Model (Research Starters) — EBSCO Information Services', url: 'https://www.ebsco.com/research-starters/marketing/aida-model/' },
        { title: 'Introduction to Business, 12.7: The Importance of Personal Selling (Steps in the Selling Process) — OpenStax / Rice University', url: 'https://openstax.org/books/introduction-business-2e/pages/12-7-the-importance-of-personal-selling' },
      ],
    },
    activity: {
      title: 'Full Funnel Audit',
      prompt: "You are given full funnel numbers for one SproutSquad business (views, clicks, messages, orders, repeat orders). Calculate the conversion rate between each stage, identify the weakest stage, and propose one specific fix tied to that stage (not a generic 'market more' answer).",
    },
    inLessonScenario: {
      title: "PixelPop's Full Funnel",
      prompt: 'PixelPop: 800 views → 120 clicks → 30 messages → 3 orders → 0 repeat orders. Identify the single stage losing the highest percentage of people, and design one specific, testable fix for that exact stage using ideas from this module.',
    },
    shopOsTieIn: {
      note: "This kind of full-funnel view is exactly what Shop OS's analytics dashboard is built to show at a glance.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-5-5-q1',
        format: 'short_answer',
        prompt: 'Why is it better to find the SINGLE weakest funnel stage than to try fixing everything at once?',
        modelAnswer: 'Limited time and resources are better spent on the highest-impact problem rather than spread thin across everything.',
        explanation: 'Focusing on the one stage losing the most people gives the biggest return on limited time and effort, instead of making small, scattered changes everywhere.',
      },
    ],
  },
];

/** Stage-to-stage health benchmarks used only to identify the single weakest
 * stage (item 4 of the checkpoint spec) — a separate concern from the overall
 * conversion figure the score itself is based on. */
const STAGE_BENCHMARKS = {
  viewsToClicks: 10,
  clicksToMessages: 15,
  messagesToOrders: 20,
} as const;

type WeakStageKey = 'viewsToClicks' | 'clicksToMessages' | 'messagesToOrders';

const WEAK_STAGE_FEEDBACK: Record<WeakStageKey, string> = {
  viewsToClicks:
    "Your weakest stage is views → clicks — not enough of the people who see your post are curious enough to click through. Sharpen your hook or headline (Lesson 5.2) so it's more specific about what's inside, instead of just posting and hoping.",
  clicksToMessages:
    "Your weakest stage is clicks → messages — people click but don't ask questions. Your storefront or product page likely isn't clarifying value or price clearly enough to spark a real conversation — tighten the presentation step of the sales journey (Lesson 5.1).",
  messagesToOrders:
    "Your weakest stage is messages → orders — people are engaging enough to ask questions, but conversations aren't converting into sales. Revisit Lesson 5.1's sales journey: are objections (price, timing) being handled calmly, and is anyone actually closing (asking for the sale)?",
};

export const module5Checkpoint: Challenge = {
  id: 'checkpoint-5',
  moduleId: 'module-5',
  mode: 'simulation',
  title: 'Fix the Funnel',
  tagline: 'Adjust a fictional shop\'s full funnel — views, clicks, messages, orders — and find the one stage that\'s quietly losing you the most customers.',
  icon: 'level-bloom',
  startingCapital: 0,
  decisions: [
    {
      key: 'views',
      label: 'Post/storefront views',
      type: 'number',
      min: 200,
      max: 3000,
      step: 100,
      default: 1200,
      unit: 'views',
    },
    {
      key: 'clicks',
      label: 'Clicks to learn more',
      type: 'number',
      min: 20,
      max: 500,
      step: 10,
      default: 180,
      unit: 'clicks',
    },
    {
      key: 'messages',
      label: 'Messages / questions asked',
      type: 'number',
      min: 5,
      max: 150,
      step: 5,
      default: 40,
      unit: 'messages',
    },
    {
      key: 'orders',
      label: 'Completed orders',
      type: 'number',
      min: 0,
      max: 50,
      step: 1,
      default: 4,
      unit: 'orders',
    },
  ],
  compute: (decisions, _startingCapital) => {
    const viewsRaw = Math.max(0, Number(decisions.views) || 0);
    const clicksRaw = Math.max(0, Number(decisions.clicks) || 0);
    const messagesRaw = Math.max(0, Number(decisions.messages) || 0);
    const ordersRaw = Math.max(0, Number(decisions.orders) || 0);

    // A funnel can't gain people at a later stage, so clamp each stage to
    // never exceed the one before it, before computing any rates.
    const views = viewsRaw;
    const clicks = Math.min(clicksRaw, views);
    const messages = Math.min(messagesRaw, clicks);
    const orders = Math.min(ordersRaw, messages);

    const viewsToClicks = views > 0 ? (clicks / views) * 100 : 0;
    const clicksToMessages = clicks > 0 ? (messages / clicks) * 100 : 0;
    const messagesToOrders = messages > 0 ? (orders / messages) * 100 : 0;
    const overallConversion = views > 0 ? (orders / views) * 100 : 0;

    // Identify the single weakest stage: whichever stage sits furthest below
    // its own healthy benchmark, proportionally (rate ÷ benchmark).
    const stageRates: Record<WeakStageKey, number> = { viewsToClicks, clicksToMessages, messagesToOrders };
    const weakestKey = (Object.keys(stageRates) as WeakStageKey[]).reduce((worst, key) => {
      const ratio = stageRates[key] / STAGE_BENCHMARKS[key];
      const worstRatio = stageRates[worst] / STAGE_BENCHMARKS[worst];
      return ratio < worstRatio ? key : worst;
    }, 'viewsToClicks' as WeakStageKey);

    // Overall conversion (orders ÷ views) already compounds all three stage
    // rates together, so it's the simplest honest measure of total funnel
    // health — a healthy full funnel lands around 4%+, which is why it's
    // scaled by 25 here.
    const score = Math.round(clamp(overallConversion * 25, 0, 100));
    const { tier, xpAwarded, seedsAwarded } = scoreToTierAndReward(score);

    const breakdown = [
      { label: 'Views → Clicks', value: `${viewsToClicks.toFixed(1)}%` },
      { label: 'Clicks → Messages', value: `${clicksToMessages.toFixed(1)}%` },
      { label: 'Messages → Orders', value: `${messagesToOrders.toFixed(1)}%` },
      { label: 'Overall Conversion (Views → Orders)', value: `${overallConversion.toFixed(1)}%` },
    ];

    const feedback = [
      WEAK_STAGE_FEEDBACK[weakestKey],
      "As Lesson 5.5 teaches, fixing this one weakest stage first is a better use of limited time than trying to overhaul the entire funnel at once.",
    ];

    return { score, tier, breakdown, feedback, xpAwarded, seedsAwarded };
  },
};
