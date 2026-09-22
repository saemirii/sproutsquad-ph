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
    estimatedMinutes: 20,
    hook: '"A customer messages DoodleDrop asking about a custom sticker, then goes silent. What happened between \'interested\' and \'never bought\'?"',
    beats: [
      "Every sale moves through the same six steps: **prospecting** (finding the right person), **understanding needs** (asking questions instead of pitching), and **presentation** (showing exactly how you fit what they need).",
      "Then come **handling objections** (answering hesitations like price or timing calmly), **closing** (actually asking for the sale), and **follow-up** (checking in afterward so they come back).",
      "Most sellers skip straight to presentation without asking a single question — or have a great chat and never actually close.",
    ],
    whyItMatters: 'A seller who never **closes** just gets polite interest, not a sale.',
    quickStat: 'Cozy Corner\'s founder now ends every chat with one closing line — "want me to set this aside for you?" — instead of just answering questions and hoping.',
    activity: {
      title: 'Fix the Broken Conversation',
      steps: [
        "You'll see a short chat where a seller jumps straight from greeting to price, skipping needs and objections.",
        '**Rewrite the conversation** to include all 6 steps of the sales journey, in the correct order.',
      ],
    },
    inLessonScenario: {
      title: "DoodleDrop's Silent Customer",
      steps: [
        'A customer asks DoodleDrop about custom stickers, then stops replying after hearing the price.',
        'Using the sales journey steps, **identify which step** DoodleDrop likely skipped.',
        '**Write one message** that addresses a possible objection (e.g., price, timing) instead of just repeating the price.',
      ],
    },
    quiz: [
      {
        id: 'lesson-5-1-q1',
        format: 'sort',
        prompt: 'Put these in order: Closing, Prospecting, Handling Objections, Presentation, Follow-up, Understanding Needs.',
        items: ['Closing', 'Prospecting', 'Handling Objections', 'Presentation', 'Follow-up', 'Understanding Needs'],
        correctOrder: [1, 5, 3, 2, 0, 4],
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
    estimatedMinutes: 20,
    hook: '"1,000 people saw PixelPop\'s post. 50 clicked the link. 5 messaged. 1 bought. Where did everyone else go?"',
    beats: [
      "A **funnel** narrows in stages: **Awareness** (they learn you exist), **Interest** (they want to know more), and **Consideration** (they're comparing you to alternatives).",
      'Then **Purchase** (they buy) and **Repeat** (they buy again or refer a friend). Numbers shrink at every stage — that\'s normal, not failure.',
      'Lots of people aware but few interested? Fix your **message**. Interested people who never buy? Check your **price**, **trust**, or **call to action**.',
    ],
    whyItMatters: 'A funnel shows you exactly **which stage** is quietly losing customers, instead of leaving you to guess.',
    quickStat: "Crumb & Co.'s funnel narrows fast too: 400 people walk past the stall, 80 stop to look, only 12 actually order — the same shrinking shape shows up in every shop.",
    activity: {
      title: 'Diagnose the Funnel',
      steps: [
        "You're given **3 different funnel shapes** (e.g., many aware but few interested; many interested but few purchase).",
        '**Match each shape** to the most likely underlying problem: unclear message, weak call to action, price mismatch, or trust issue.',
      ],
    },
    inLessonScenario: {
      title: "PixelPop's Numbers",
      steps: [
        "1,000 people saw PixelPop's post (**Awareness**).",
        '50 clicked to learn more (**Interest**).',
        '5 messaged to ask questions (**Consideration**).',
        '1 actually paid (**Purchase**).',
        '**Identify which stage** PixelPop is losing the most people at, and **name one possible fix**.',
      ],
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
    estimatedMinutes: 20,
    hook: '"Two shops both got 100 visitors. One made 20 sales, the other made 2. The raw visitor count told you nothing — the percentage did."',
    beats: [
      'Turn funnel stages into percentages: **views → clicks**, **clicks → orders**, **visitors → customers**.',
      'The formula never changes: (smaller number ÷ larger number) × 100. 200 views, 20 buyers? That\'s (20 ÷ 200) × 100 = **10%**.',
    ],
    whyItMatters: "**Percentages**, not raw totals, tell you who's actually winning — more visitors doesn't always mean more sales.",
    quickStat: 'PixelPop once had way fewer views than a competitor but double the conversion rate — smaller crowd, sharper close.',
    activity: {
      title: 'Calculate the Conversion Rate',
      steps: [
        '**Calculate the conversion rate (%)** for 3 scenarios.',
        '**(1)** 150 views, 15 clicks.',
        '**(2)** 40 clicks, 8 orders.',
        '**(3)** 500 visitors, 25 customers.',
      ],
    },
    inLessonScenario: {
      title: 'Which Shop Is Doing Better?',
      steps: [
        '**Cozy Corner**: 300 views, 60 orders.',
        '**DoodleDrop**: 900 views, 90 orders.',
        '**Identify** which shop has more raw orders, and which shop has the higher conversion rate.',
        '**Explain** why looking only at total orders can be misleading.',
      ],
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
    estimatedMinutes: 20,
    hook: '"A number going down isn\'t automatically bad news, and a number going up isn\'t automatically good news — until you ask \'why?\'"',
    beats: [
      'Three questions turn any number into a decision: **What changed?** **Why might it have changed?** **What should you do next?**',
      'A single bad day isn\'t proof of a real problem — check the **trend** before you panic and change everything.',
    ],
    whyItMatters: 'Reacting to one dip instead of a **trend** means fixing a problem that might not even be real.',
    quickStat: "Track cost against results, not just results alone — a sales spike that cost twice as much to get isn't actually a win.",
    activity: {
      title: 'What Changed, Why, What Next?',
      steps: [
        "You're given a simple chart showing **orders dropping 40%** in one week.",
        '**What changed?** Write one sentence.',
        '**Why might it have changed?** Give two possible reasons.',
        '**What should you do next?** Propose one specific action to test.',
      ],
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Sudden Dip",
      steps: [
        "Crumb & Co.'s weekly orders dropped from **60 to 35** right after exam week began.",
        'Using the **three-question framework**, analyze what likely happened.',
        '**Propose one action** for the following week.',
      ],
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
    estimatedMinutes: 20,
    hook: '"Every SproutSquad business has one stage of its funnel quietly leaking customers. Your mission: find it and fix it."',
    beats: [
      'This mission pulls together everything from Module 5: the **sales journey**, the **funnel**, and **conversion math**.',
      'Most shops don\'t have one giant problem — they have **one weak stage** quietly leaking customers. Numbers find it faster than gut feeling ever will.',
    ],
    whyItMatters: 'Fixing your **single weakest stage** first beats a scattershot overhaul of everything at once.',
    activity: {
      title: 'Full Funnel Audit',
      steps: [
        "You're given full funnel numbers for one SproutSquad business (views, clicks, messages, orders, repeat orders).",
        '**Calculate the conversion rate** between each stage.',
        '**Identify the weakest stage**.',
        "**Propose one specific fix** tied to that stage — not a generic 'market more' answer.",
      ],
    },
    inLessonScenario: {
      title: "PixelPop's Full Funnel",
      steps: [
        '**PixelPop**: 800 views → 120 clicks → 30 messages → 3 orders → 0 repeat orders.',
        '**Identify the single stage** losing the highest percentage of people.',
        '**Design one specific, testable fix** for that exact stage using ideas from this module.',
      ],
      illustration: 'conversion-funnel',
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
