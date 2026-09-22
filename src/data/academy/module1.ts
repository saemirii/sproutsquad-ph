import { AcademyModule, Lesson, Challenge } from '../../types';
import { caseStudyScoreToResult } from './challengeHelpers';

export const module1: AcademyModule = {
  id: 'module-1',
  number: 1,
  stage: 'Sprout',
  icon: 'level-sprout',
  title: 'Find Your Roots',
  tagline: 'Defining Your Value & Market',
  intro: "Every business — even a small one run out of a backpack between classes — starts the same way: someone notices a problem worth solving. In this module you'll learn how to spot real problems, research real customers, and describe why your business deserves to exist.",
  lessonIds: ['lesson-1-1', 'lesson-1-2', 'lesson-1-3', 'lesson-1-4', 'lesson-1-5'],
  checkpointId: 'checkpoint-1',
};

export const module1Lessons: Lesson[] = [
  {
    id: 'lesson-1-1',
    moduleId: 'module-1',
    number: '1.1',
    title: 'What Problem Are You Solving?',
    estimatedMinutes: 20,
    hook: '"Jhun always forgets his umbrella. So do half the students at his school. On rainy days, the school store sells out of ₱20 ponchos in ten minutes. Jhun didn\'t invent ponchos — he just noticed a problem nobody was solving fast enough."',
    beats: [
      "A **product** is what you sell. A **problem** is the reason anyone buys it — beginners almost always start with the wrong one.",
      'Falling for a product idea first ("I want to sell bracelets!") skips the question that actually matters: does anyone **need** this?',
      'Test any idea with three boxes: **Problem → Customer → Solution**. Can\'t fill in all three honestly? You don\'t have a business yet — just a product looking for a reason to exist.',
    ],
    whyItMatters: '**Problem before product** is what separates a real business from a hobby. Skip it, and you\'re just guessing — which is how inventory sits unsold.',
    quickStat: 'Every business in this app — Crumb & Co., DoodleDrop, Cozy Corner — started with a problem, not a product idea.',
    activity: {
      title: 'Problem → Customer → Solution Map',
      steps: [
        'Draw three connected boxes.',
        '**Box 1**: write one real problem you or someone you know faces (school, home, or neighborhood).',
        '**Box 2**: write exactly who feels this problem the most — be specific (not "students," but "Grade 9 students who bike to school and arrive sweaty before first period").',
        '**Box 3**: write one possible solution.',
        '**Test it**: if you removed Box 1, would Box 3 still make sense? If yes, start over — you built a product without a problem.',
      ],
      illustration: 'problem-customer-solution',
    },
    inLessonScenario: {
      title: "DoodleDrop's Dilemma",
      steps: [
        'Aya runs DoodleDrop, a sticker and illustration business, and can only launch one product this month.',
        '**Option 1**: students keep losing their water bottles because they all look the same.',
        '**Option 2**: students want cooler notebook covers.',
        'Using the Problem → Customer → Solution map, which problem is more specific and more clearly tied to a paying customer? **Write one sentence** defending your choice.',
      ],
    },
    shopOsTieIn: {
      note: "Once you've written your Problem → Customer → Solution map, save it as your business's 'About' description in Shop OS — this is the story customers see when they visit your storefront.",
      deepLink: { sellerTab: 'settings' },
    },
    quiz: [
      {
        id: 'lesson-1-1-q1',
        format: 'multiple_choice',
        prompt: 'Which comes first when starting a real business?',
        options: ['A cool product idea', 'A clear problem and customer', 'A logo', 'A price list'],
        correctIndex: 1,
        explanation: 'Businesses exist to solve a problem for a specific customer — the product comes after that, not before.',
      },
      {
        id: 'lesson-1-1-q2',
        format: 'multiple_choice',
        prompt: "True or False: If nobody has a specific problem your product solves, it's still a good business idea as long as the product is well-made.",
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'A well-made product with no real problem behind it is a product looking for a reason to exist — not a business idea yet.',
      },
      {
        id: 'lesson-1-1-q3',
        format: 'short_answer',
        prompt: 'Maria wants to sell scented candles because she thinks they\'re pretty. Fill in the blank: a ______ is a thing you sell; a ______ is the reason someone buys it. What is Maria missing so far?',
        modelAnswer: 'Product; problem (or need). Maria has a product idea but hasn\'t identified the problem or customer it solves for — she needs to find that before she has a real business idea.',
        explanation: 'Product and problem are two different things — a real business idea needs both, not just a product someone likes.',
      },
    ],
  },
  {
    id: 'lesson-1-2',
    moduleId: 'module-1',
    number: '1.2',
    title: "Market Research: Don't Guess",
    estimatedMinutes: 20,
    hook: '"Before Cozy Corner sold a single keychain, its founder Miggy asked 20 classmates one question: \'What\'s the last cute thing you bought, and why?\' Three answers changed his entire product line."',
    beats: [
      '**Market research** just means finding out what\'s actually true about your customers — instead of guessing.',
      '**Primary research** is info you collect yourself: surveys, interviews, watching people. **Secondary research** is info that already exists: reports, competitor pages, existing data.',
      "You don't need money for this — just curiosity. Ask 20 classmates one sharp question, or watch which snacks disappear fastest at the canteen.",
    ],
    whyItMatters: 'Skipping research means building your whole product line on a guess. **One real conversation** with a customer beats ten assumptions.',
    quickStat: 'Observation costs nothing but attention — watching what already sells beats guessing what might.',
    activity: {
      title: 'Design a 5-Question Survey',
      steps: [
        'Write exactly **5 survey questions** to test a product idea for one of the SproutSquad businesses (Crumb & Co., DoodleDrop, Cozy Corner, or PixelPop).',
        "**At least 2 questions** must be about the customer's current behavior (what they already do or buy) — not their opinion of your idea.",
        "People are better at describing what they do than predicting what they'll buy.",
      ],
    },
    inLessonScenario: {
      title: 'Two Audiences, One Budget',
      steps: [
        'PixelPop (a digital design service) can only afford to research one audience this month: **(A)** students who need logos for their own small businesses, or **(B)** parents who want birthday invitation designs.',
        "Before choosing, PixelPop's founder must decide what to research first.",
        '**List 3 questions** she should answer through research (not guessing) before deciding which audience to target.',
      ],
    },
    quiz: [
      {
        id: 'lesson-1-2-q1',
        format: 'multiple_choice',
        prompt: 'Which is an example of primary research?',
        options: ['Reading a government industry report', 'Interviewing 10 customers yourself', 'Looking at a competitor\'s public annual report', 'Searching online statistics'],
        correctIndex: 1,
        explanation: 'Primary research is information you collect yourself — surveys, interviews, and observation all count; existing reports and data are secondary research.',
      },
      {
        id: 'lesson-1-2-q2',
        format: 'short_answer',
        prompt: 'Crumb & Co.\'s founder wants to know if students will actually buy a new snack, not just say they like the idea. Why is watching what customers already buy (observation) more reliable here than just asking their opinion?',
        modelAnswer: 'It shows what customers actually do, which can be more reliable than what they say they\'ll do — people are often more honest in their behavior than in their predictions.',
        explanation: 'Observation captures real behavior; opinions about a hypothetical future purchase are much less reliable.',
      },
    ],
  },
  {
    id: 'lesson-1-3',
    moduleId: 'module-1',
    number: '1.3',
    title: 'STP: Find Your People',
    estimatedMinutes: 20,
    hook: '"Crumb & Co. tried to bake something for everyone — vegan, gluten-free, sugar-free, ultra-sweet — and ended up with a menu nobody loved. When they narrowed down to \'affordable, fun snacks for students with ₱30–₱50 to spend,\' sales tripled."',
    beats: [
      '**Segmentation**: splitting a broad market into smaller groups (by age, budget, habits). **Targeting**: picking which group you\'ll focus on. **Positioning**: deciding how that group sees you vs. everyone else.',
      "Together, that's the **STP model** — and skipping it is why so many campus shops feel forgettable.",
      '"We\'re for everyone" means you compete on price alone. "We\'re the fastest, most affordable snack between classes" gives people an actual reason to remember you.',
    ],
    whyItMatters: 'A **clear target** makes every other decision easier — pricing, marketing, even what to bake next. Trying to please everyone usually pleases no one.',
    quickStat: "A target customer isn't a restriction — it's a filter that makes every other decision (pricing, flavors, marketing) easier.",
    activity: {
      title: 'Segment, Target, Position',
      steps: [
        "Take a broad market: 'people who eat snacks at school.'",
        '**Split it into 4 smaller segments** (e.g., by budget, health goals, or snack timing).',
        'Circle the **ONE segment** you would target if you only had ₱500 in starting capital.',
        "Write a one-sentence **positioning statement**: '[Business] is the [best/fastest/most affordable] choice for [target segment] because ______.'",
      ],
      illustration: 'stp-funnel',
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Crowd",
      steps: [
        'Crumb & Co. could target: **(A)** students who want a cheap daily snack, **(B)** parents ordering treats for class parties, or **(C)** teachers who want a mid-morning coffee pastry.',
        'Given a school-based business with limited baking capacity, **which single segment** should Crumb & Co. target first?',
        'Why does trying to serve all three at once usually backfire?',
      ],
    },
    shopOsTieIn: {
      note: 'Your target segment and positioning statement become the description and tags customers see when searching for your shop in Shop OS — clear positioning helps the right customers find you faster.',
      deepLink: { sellerTab: 'settings' },
    },
    quiz: [
      {
        id: 'lesson-1-3-q1',
        format: 'sort',
        prompt: 'Put these in the correct order: Segmentation, Targeting, Positioning.',
        items: ['Segmentation', 'Targeting', 'Positioning'],
        correctOrder: [0, 1, 2],
        modelAnswer: 'Segmentation first (divide the market), then Targeting (pick a segment), then Positioning (define how you\'re different).',
        explanation: 'You have to divide the market before you can choose a piece of it, and choose a piece before you can decide how to stand out within it.',
      },
      {
        id: 'lesson-1-3-q2',
        format: 'multiple_choice',
        prompt: 'A business that tries to appeal to absolutely everyone usually ends up competing mainly on:',
        options: ['Price', 'Brand story', 'Customer service', 'Packaging'],
        correctIndex: 0,
        explanation: 'Without a clear target and identity, the only thing left to compete on is being the cheapest.',
      },
    ],
  },
  {
    id: 'lesson-1-4',
    moduleId: 'module-1',
    number: '1.4',
    title: 'Value Proposition: Why You?',
    estimatedMinutes: 20,
    hook: '"Two students sell the same phone charms for the same price. One says \'I sell phone charms.\' The other says \'I make one-of-a-kind charms designed from your favorite anime in 24 hours.\' Guess who gets repeat customers."',
    beats: [
      'A **value proposition** answers one question: why should someone choose you — over any competitor, or over doing nothing at all?',
      '"Handmade soap" is a **feature**. "Gentle enough for sensitive skin, made fresh weekly" is a **value proposition** — it says what the customer actually gets.',
      '**Differentiation** doesn\'t have to be the product itself. It can be speed, price, customization, or story. Pick one or two things to be clearly better at — not everything.',
    ],
    whyItMatters: 'Without a clear answer to "why you," a copycat with the same product at the same price beats you on price alone.',
    activity: {
      title: 'Feature → Benefit → Value Proposition',
      steps: [
        "Take any product description (e.g., 'reusable water bottle, 500ml, pastel colors').",
        "**Turn each feature into a benefit** (e.g., 'keeps drinks cold for 12 hours so you're never stuck with warm water').",
        'Combine the strongest benefits into **one value-proposition sentence**.',
        'Do this for a product from any SproutSquad business.',
      ],
    },
    inLessonScenario: {
      title: 'Cozy Corner vs. the Copycat',
      steps: [
        "A new shop starts selling plush keychains identical to Cozy Corner's — same price, same materials.",
        "Cozy Corner's founder must identify **why a customer should still choose her shop**.",
        'List **3 things** (besides the product itself) that could become her value proposition, and pick the strongest one.',
      ],
    },
    shopOsTieIn: {
      note: "Your value proposition becomes your storefront's headline in Shop OS — the first sentence customers read before deciding to browse further.",
      deepLink: { sellerTab: 'settings' },
    },
    quiz: [
      {
        id: 'lesson-1-4-q1',
        format: 'multiple_choice',
        prompt: 'A value proposition should focus mainly on:',
        options: ["The product's ingredients", "The customer's benefit", "The founder's story", "The store's logo"],
        correctIndex: 1,
        explanation: 'A value proposition tells the customer what they get out of choosing you — not just what the product is made of.',
      },
      {
        id: 'lesson-1-4-q2',
        format: 'short_answer',
        prompt: '"Handmade soap" is a feature. What would make it a value proposition instead?',
        modelAnswer: "Connecting it to a specific customer benefit, e.g. 'gentle enough for sensitive skin.'",
        explanation: 'A feature becomes a value proposition once it\'s tied to what the customer actually gains from it.',
      },
    ],
  },
  {
    id: 'lesson-1-5',
    moduleId: 'module-1',
    number: '1.5',
    title: 'Messaging: What Should People Hear?',
    estimatedMinutes: 20,
    hook: "\"PixelPop's Instagram is playful and full of memes. Its actual storefront description reads like a formal business proposal. Customers get confused about who PixelPop even is.\"",
    beats: [
      '**Messaging** is everything you say to customers — captions, product descriptions, even how you reply to a complaint.',
      'Your **brand voice** is your personality in words: playful, professional, warm, bold? **Consistency** means it sounds the same everywhere — social media, storefront, in person.',
      'Quick test: cover up your shop name. Would a regular customer still recognize your post as yours, just from the tone?',
    ],
    whyItMatters: 'Inconsistent voice makes even a great product feel untrustworthy. **Sounding the same everywhere** is free trust-building.',
    activity: {
      title: 'Write a 2-Sentence Brand Message',
      steps: [
        'Pick one SproutSquad business.',
        'Write a **2-sentence message** it could post on social media, using a brand voice you choose (playful, cozy, bold, or minimalist).',
        "Then write the **same announcement in a completely different voice** — notice how much tone changes a customer's impression.",
      ],
    },
    inLessonScenario: {
      title: 'Fix the Mismatch',
      steps: [
        "DoodleDrop's storefront bio says: 'Premium curated illustration services for discerning clients.'",
        "Its Instagram captions say: 'yo check out this sticker lol.'",
        "A customer messages: 'wait are these the same shop?'",
        '**Rewrite ONE of the two** so they sound consistent, and explain in one sentence why you chose to change that one.',
      ],
    },
    shopOsTieIn: {
      note: 'Consistent messaging in Shop OS (shop name, tagline, and product descriptions) helps returning customers instantly recognize and trust your storefront.',
      deepLink: { sellerTab: 'settings' },
    },
    quiz: [
      {
        id: 'lesson-1-5-q1',
        format: 'multiple_choice',
        prompt: 'Brand voice refers to:',
        options: ['The logo colors', 'The personality behind your words', 'The price of your product', 'The number of products you sell'],
        correctIndex: 1,
        explanation: 'Brand voice is the personality that comes through in how you write and speak to customers.',
      },
      {
        id: 'lesson-1-5-q2',
        format: 'short_answer',
        prompt: 'Why does inconsistent messaging hurt a small business, even if the products themselves are good?',
        modelAnswer: 'It confuses customers and can make the business feel less trustworthy or unprofessional.',
        explanation: 'Trust is built partly through consistency — a business that sounds different everywhere feels harder to trust.',
      },
    ],
  },
];

export const module1Checkpoint: Challenge = {
  id: 'checkpoint-1',
  moduleId: 'module-1',
  mode: 'caseStudy',
  title: 'Business Foundation Card',
  tagline: "Take Crumb & Co. through every decision from Module 1 — problem, research, targeting, value, and voice — in one connected case.",
  icon: 'level-sprout',
  steps: [
    {
      id: 'step-problem',
      prompt: "Crumb & Co. is a student bakery. Its founder notices two things: (1) students have no affordable snack between back-to-back classes, and (2) some students want elaborate custom birthday cakes. Which is the stronger problem to build the business around first?",
      choices: [
        { label: 'The affordable between-class snack — it\'s frequent, specific, and tied to a clear daily customer', scoreDelta: 10, feedback: "Right — it's a recurring, specific problem with an obvious, frequent customer. Custom cakes are a real product, but they're occasional and harder to build a daily business on." },
        { label: 'The custom birthday cakes — cakes have a higher price tag', scoreDelta: 4, feedback: 'Higher price isn\'t the same as a stronger problem — custom cakes are occasional, not a recurring need, which makes it a much harder business to build steady demand around.' },
        { label: 'Both equally — try to serve both from day one', scoreDelta: 2, feedback: 'Splitting focus on day one usually means neither problem gets solved well. Module 1 is clear: pick the sharper, more specific problem first.' },
      ],
    },
    {
      id: 'step-research',
      prompt: 'Before finalizing the menu, Crumb & Co. wants to know if students would actually buy a new snack — not just say they like the idea. What should they do first?',
      choices: [
        { label: 'Watch what snacks actually sell out fastest at the canteen this week (observation)', scoreDelta: 10, feedback: 'Exactly right — observation shows real behavior, which predicts real sales far better than opinions about a hypothetical product.' },
        { label: 'Ask 5 friends if they think the idea sounds good', scoreDelta: 4, feedback: 'Friends\' opinions are a start, but they\'re not the same as evidence of what people actually buy — and a sample of 5 close friends is not representative either.' },
        { label: 'Skip research and launch — time is more valuable than data', scoreDelta: 0, feedback: 'Skipping research is exactly the "tantsa" (guessing) trap Module 1 warns against — it risks building a menu nobody actually wants.' },
      ],
    },
    {
      id: 'step-segment',
      prompt: 'Crumb & Co. has limited baking capacity. Three possible customer segments: (A) students who want a cheap daily snack, (B) parents ordering treats for class parties, (C) teachers who want a mid-morning pastry. Which should they target first?',
      choices: [
        { label: 'Students who want a cheap daily snack — matches the problem they already chose, and it\'s the highest-frequency segment', scoreDelta: 10, feedback: 'Correct — this segment matches the original problem and offers the most repeat, day-to-day business, which a small bakery can realistically serve well.' },
        { label: 'All three segments at once, to maximize reach', scoreDelta: 2, feedback: 'Trying to serve all three with limited capacity is exactly the "appeal to everyone, appeal to no one" trap STP is meant to prevent.' },
        { label: 'Parents ordering for class parties — bigger orders mean more revenue per sale', scoreDelta: 5, feedback: 'Bigger orders are appealing, but this segment is occasional and doesn\'t match the daily-snack problem Crumb & Co. already committed to solving.' },
      ],
    },
    {
      id: 'step-value',
      prompt: 'A new stall opens nearby selling nearly identical snacks at the same price. What should be Crumb & Co.\'s value proposition to stay ahead?',
      choices: [
        { label: '"Freshly baked every morning and ready between classes in under 2 minutes" — speed and freshness the copycat can\'t easily match', scoreDelta: 10, feedback: 'Strong choice — this differentiates on something real (speed + freshness) that isn\'t just about being identical-but-cheaper.' },
        { label: 'Lower the price below the competitor\'s', scoreDelta: 3, feedback: 'A pure price war erodes margin fast and doesn\'t build any lasting reason to prefer Crumb & Co. specifically — it\'s the weakest form of differentiation.' },
        { label: 'Do nothing different — the product is already good enough', scoreDelta: 0, feedback: 'With an identical competitor now in the market, doing nothing means customers have no reason to choose Crumb & Co. specifically.' },
      ],
    },
    {
      id: 'step-messaging',
      prompt: "Crumb & Co.'s Instagram captions are playful and full of emoji. Its printed price list is formal and stiff. A regular customer asks 'wait, is this the same shop?' What should Crumb & Co. do?",
      choices: [
        { label: 'Rewrite the price list to match the same warm, playful voice used on Instagram', scoreDelta: 10, feedback: "Right — consistency across every touchpoint is what makes a brand feel trustworthy and recognizable, exactly what Lesson 1.5 teaches." },
        { label: 'Keep both as they are — different formats can have different tones', scoreDelta: 3, feedback: 'A customer noticing the mismatch is a real warning sign — inconsistent voice quietly erodes trust even if each piece looks fine on its own.' },
        { label: 'Make the Instagram captions formal to match the price list instead', scoreDelta: 6, feedback: 'This does fix the inconsistency, but it also throws away the playful voice that likely built Crumb & Co.\'s social following in the first place — matching the livelier format is usually the better direction.' },
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
      'This checkpoint mirrors your real Business Foundation Card: problem, target customer, market insight, positioning, value proposition, mission, and brand voice.',
      totalScore >= maxPossibleScore * 0.8
        ? "You consistently chose the option most tightly tied to the problem and customer you started with — that's exactly how a real foundation stays solid as a shop grows."
        : 'Revisit any step where you scored low — in each one, the strongest choice was the one that stayed closest to the specific problem and customer already chosen, not the most tempting shortcut.',
    ]
  ),
};
