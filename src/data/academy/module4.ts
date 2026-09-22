import { AcademyModule, Lesson, Challenge } from '../../types';
import { caseStudyScoreToResult } from './challengeHelpers';

export const module4: AcademyModule = {
  id: 'module-4',
  number: 4,
  stage: 'Sapling',
  icon: 'level-bud',
  title: 'Grow Your Brand',
  tagline: 'Branding & Marketing Channels',
  intro: 'A great product with no clear brand and no plan to reach customers stays invisible. This module turns your value proposition into a recognizable brand people choose again and again.',
  lessonIds: ['lesson-4-1', 'lesson-4-2', 'lesson-4-3', 'lesson-4-4', 'lesson-4-5'],
  checkpointId: 'checkpoint-4',
};

export const module4Lessons: Lesson[] = [
  {
    id: 'lesson-4-1',
    moduleId: 'module-4',
    number: '4.1',
    title: 'What Is a Brand?',
    estimatedMinutes: 20,
    hook: "\"A logo is a picture. A brand is a feeling. Cozy Corner's plushies could have any logo — but customers keep coming back because of how the shop makes them feel: cozy, cared for, a little nostalgic.\"",
    beats: [
      "A **logo** is just a picture. A **brand** is the overall feeling and perception customers have about your business — built through every interaction, not only the visuals.",
      '**Brand identity** covers colors, fonts, and logo, but also your tone of voice, your values, and what it feels like to actually buy from you.',
      "**Customer perception** is the real scoreboard — it's how people actually feel about you, which can end up different from how you meant to come across.",
    ],
    whyItMatters: 'Customers happily pay more for a brand they **trust and feel connected to** — a strong brand is often a business\'s most valuable asset, even though it never shows up on a price tag.',
    quickStat: "PixelPop and Crumb & Co. sell completely different things, but customers can fall for either one's vibe just the same — brand isn't tied to what you're selling.",
    activity: {
      title: 'Logo vs. Brand Sort',
      steps: [
        "**Sort each of these six items** into either 'Logo' or 'Brand.'",
        'The items: color scheme, the feeling customers get after a purchase, the icon on packaging, how a complaint is handled, the font used in posts, whether customers trust the shop.',
      ],
    },
    inLessonScenario: {
      title: 'Same Logo, Different Feelings',
      steps: [
        'Two competing sticker shops use nearly identical minimalist logos.',
        '**Shop A** replies to every customer message within an hour with friendly, personal notes.',
        '**Shop B** is slow and formal.',
        '**Which shop** is more likely to build a stronger brand (not just logo)? Explain why.',
      ],
    },
    quiz: [
      {
        id: 'lesson-4-1-q1',
        format: 'multiple_choice',
        prompt: 'A brand is best described as:',
        options: ['A logo', 'A color palette only', 'The overall feeling and perception customers have', "The business's legal name"],
        correctIndex: 2,
        explanation: 'A logo is just a visual symbol — a brand is the overall feeling and perception customers build through every interaction with the business.',
      },
    ],
  },
  {
    id: 'lesson-4-2',
    moduleId: 'module-4',
    number: '4.2',
    title: 'Brand Strategy: Make It Consistent',
    estimatedMinutes: 20,
    hook: "\"PixelPop's designs are bold and modern — but its customer replies are stiff and overly formal. Something feels off, even if customers can't name it.\"",
    beats: [
      'A **brand strategy** lines up five things so they all point the same way: your **target audience**, your **brand promise** (what customers can always count on), your **personality**, your **voice**, and your **visual identity**.',
      "Get all five pointing together and a brand feels trustworthy. Let even one drift — bold visuals paired with a stiff, formal voice — and customers notice, even if they can't say why.",
      '**Consistency** isn\'t just the logo. It has to show up everywhere: captions, replies, packaging, all of it.',
    ],
    whyItMatters: 'Every touchpoint either reinforces your brand or quietly wrecks it — a mismatch a customer notices is **trust leaking out**.',
    quickStat: "DoodleDrop's playful Instagram next to a stiff, formal storefront bio is the same mismatch in a different color scheme — brand inconsistency wears a lot of disguises.",
    activity: {
      title: 'Brand Strategy Snapshot',
      steps: [
        '**Pick one SproutSquad business** to build a Brand Strategy Snapshot for.',
        '**Target audience**: one line.',
        '**Brand promise**: one line — what customers can always count on.',
        '**Personality**: exactly 3 words.',
        '**Voice**: one word or phrase (formal, casual, playful, etc.).',
        '**Visual identity**: 2 colors + 1 style word.',
      ],
    },
    inLessonScenario: {
      title: "PixelPop's Mismatch",
      steps: [
        "PixelPop's visuals are bold and modern, but its customer service replies are stiff and formal.",
        '**Identify** which of the 5 brand strategy elements is out of sync.',
        '**Rewrite one sample customer reply** to match the bold, modern personality.',
      ],
    },
    shopOsTieIn: {
      note: "Shop OS lets you set your shop's colors, tagline, and description in one place — use this checklist to make sure all three match your brand strategy before publishing.",
      deepLink: { sellerTab: 'settings' },
    },
    quiz: [
      {
        id: 'lesson-4-2-q1',
        format: 'short_answer',
        prompt: 'Name the 5 elements of a brand strategy covered in this lesson.',
        modelAnswer: 'Target audience, brand promise, personality, voice, visual identity.',
        explanation: 'A brand strategy is consistent only when all five elements — audience, promise, personality, voice, and visuals — point in the same direction.',
      },
    ],
  },
  {
    id: 'lesson-4-3',
    moduleId: 'module-4',
    number: '4.3',
    title: 'Marketing Channels: Where Do Customers Find You?',
    estimatedMinutes: 20,
    hook: '"Crumb & Co. spends hours posting on a platform where none of its actual customers spend time. Meanwhile, word-of-mouth from happy classmates brings in more orders than any post."',
    beats: [
      'A **marketing channel** is any way you reach customers — social media, online marketplaces, messaging apps, in-person events, or plain **word of mouth**.',
      "No channel is automatically \"best.\" The right one is wherever your specific target customer already spends their attention — not whatever's trending.",
      "List the channels you're actually using, then track what each one costs against what it brings back. If you can't keep it up, it's not a real channel for you.",
    ],
    whyItMatters: "Chasing a trendy channel your customers don't even use is **wasted effort that only feels like progress**.",
    quickStat: "Cozy Corner's regulars mostly came from campus group chats, not ads — sometimes the free channel beats the paid one.",
    activity: {
      title: 'Match the Channel to the Customer',
      steps: [
        '**Four target customers**: busy parents, students on campus, teachers, and online shoppers nationwide.',
        '**Four channel options**: social media, word of mouth at school, email newsletter, online marketplace.',
        '**Pick the single best-fit channel** for each customer type.',
        '**Justify each choice** in one sentence.',
      ],
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Channel Mix-Up",
      steps: [
        "Crumb & Co.'s target customers are students at their own school.",
        "They've been spending most of their effort on a **national online marketplace**, with little to show for it.",
        '**What channel** might actually work better for a hyper-local, school-based customer base? Explain why.',
      ],
    },
    shopOsTieIn: {
      note: 'Shop OS tracks which channel (link, QR code, or in-app storefront) each order came from, so you can see which channels are actually converting into sales.',
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-4-3-q1',
        format: 'multiple_choice',
        prompt: 'The best marketing channel is the one that:',
        options: ['Is most popular online', 'Costs the least', 'Matches where your target customer already spends attention', 'Every competitor uses'],
        correctIndex: 2,
        explanation: 'No channel is automatically best — the right channel is wherever your specific target customer already spends their time and attention.',
      },
    ],
  },
  {
    id: 'lesson-4-4',
    moduleId: 'module-4',
    number: '4.4',
    title: 'Pricing: More Than Guessing',
    estimatedMinutes: 20,
    hook: '"Cozy Corner priced a keychain at \'cost plus ₱20\' with no other thinking involved — until a competitor\'s nearly identical product, priced ₱30 higher, kept selling out."',
    beats: [
      'Pricing isn\'t "cost plus whatever feels right." Weigh four things together: **Cost** (never sell below what it costs you), **Value** (what it\'s worth to the customer), **Competition** (what similar products charge nearby), and **Customer perception** (too cheap can read as low-quality).',
      "**Mark-up** is what you add on top of cost, as a percentage of cost. **Margin** is your profit as a percentage of the selling price — they're not the same number. A ₱60-cost item priced at ₱90 has a 50% mark-up, but only a 33% margin.",
      'Sometimes a **lower margin that sells more** beats a higher margin that just sits on the shelf. Pricing is a trade-off, not a formula.',
    ],
    whyItMatters: 'Mix up mark-up and margin and you can think you\'re profitable while you\'re actually **barely breaking even**.',
    activity: {
      title: 'Four-Factor Price Check',
      steps: [
        '**Pick a product** of your choice.',
        '**Cost**: write your COGS.',
        '**Value**: why would a customer pay for it?',
        '**Competition**: a nearby comparable price.',
        "**Customer perception**: would a very low price seem 'cheap' instead of a bargain?",
        '**Propose a final price** using all four factors together.',
      ],
    },
    inLessonScenario: {
      title: 'Cozy Corner Reconsiders',
      steps: [
        "Cozy Corner's keychain costs **₱75** in COGS.",
        'A similar competitor product sells for **₱180**.',
        '**Using all four pricing factors** (not just cost), propose a price for Cozy Corner\'s keychain and justify it.',
      ],
    },
    shopOsTieIn: {
      note: "When you update a product's price in Shop OS, its margin and gross profit recalculate instantly — helpful for testing different prices before committing.",
      deepLink: { sellerTab: 'products' },
    },
    quiz: [
      {
        id: 'lesson-4-4-q1',
        format: 'short_answer',
        prompt: 'Name the four factors that should influence pricing (besides guessing).',
        modelAnswer: 'Cost, value, competition, and customer perception.',
        explanation: 'A thoughtful price weighs all four factors together — cost alone is only one piece of the decision.',
      },
      {
        id: 'lesson-4-4-q2',
        format: 'multiple_choice',
        prompt: 'True or False: The lowest possible price is always the best pricing strategy.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: "A price that's too low can make a product seem cheap or low-quality, and it ignores value and competition entirely.",
      },
    ],
  },
  {
    id: 'lesson-4-5',
    moduleId: 'module-4',
    number: '4.5',
    title: 'Build a Mini Campaign',
    estimatedMinutes: 20,
    hook: '"You now have a brand, a channel, and a price. It\'s time to put them together into one focused push."',
    beats: [
      'A **campaign** ties five pieces into one push: **Target audience**, **Main message** (the one idea to remember), **Channel**, **Call to action** (the exact next step), and **Success metric** (the number that tells you it worked).',
      'Campaigns flop for two reasons: trying to say too many things at once, or having **no clear call to action**.',
      "Always compare what a campaign costs against what it brings back. A campaign with no number attached is just a guess dressed up as a launch.",
    ],
    whyItMatters: 'A campaign with **no clear next step** leaves even an interested customer with nothing to do — which means nothing happens.',
    activity: {
      title: 'Build Your Mini Campaign',
      steps: [
        '**Pick one SproutSquad business** to build a mini campaign for.',
        '**Target audience**: who this campaign is for.',
        '**Main message**: one sentence — the one idea to remember.',
        '**Channel**: where the campaign runs.',
        "**Call to action**: the exact words you'd use.",
        '**Success metric**: a specific number you\'d track.',
      ],
    },
    inLessonScenario: {
      title: "DoodleDrop's Launch Week",
      steps: [
        'DoodleDrop is launching a new sticker pack with **one week and no budget**.',
        '**Design a mini campaign** using only free tools: school group chat, word of mouth, one social post.',
        "**What's the single call to action** you'd use?",
        '**What number** would tell DoodleDrop the campaign worked?',
      ],
    },
    shopOsTieIn: {
      note: "Shop OS's order source tracking (from Lesson 4.3) is exactly how you'd measure your campaign's success metric in a real launch.",
      deepLink: { sellerTab: 'overview' },
    },
    quiz: [
      {
        id: 'lesson-4-5-q1',
        format: 'short_answer',
        prompt: 'Why do vague campaigns (with no clear call to action) usually fail?',
        modelAnswer: "Interested customers don't know exactly what step to take next, so they don't act.",
        explanation: 'A campaign needs one clear next step — without it, even an interested customer has no obvious way to follow through.',
      },
    ],
  },
];

export const module4Checkpoint: Challenge = {
  id: 'checkpoint-4',
  moduleId: 'module-4',
  mode: 'caseStudy',
  title: 'Brand Challenge',
  tagline: 'Take PixelPop through every decision from Module 4 — brand consistency, channel fit, pricing judgment, and campaign launch — in one connected case.',
  icon: 'level-bud',
  steps: [
    {
      id: 'step-brand-consistency',
      prompt: "PixelPop's visual brand is bold and modern — bright colors, playful type, confident layouts. But its customer replies have stayed stiff and formal, and a customer recently asked 'wait, is this the same shop?' What should PixelPop do with its reply tone?",
      choices: [
        { label: 'Rewrite replies to match the bold, modern personality already in its visuals — confident, energetic, still helpful', scoreDelta: 10, feedback: "Right — brand strategy only works when personality and voice match the visual identity. Matching the reply tone to the bold, modern brand is what actually fixes the mismatch a customer already noticed." },
        { label: "Switch to a neutral, safe tone that's polite but doesn't lean bold or playful either way", scoreDelta: 5, feedback: "This is consistent, but it throws away the bold, modern personality that makes PixelPop memorable — 'safe and bland' isn't the same as 'on-brand.'" },
        { label: 'Keep the current stiff, formal tone — it sounds more professional for a design business', scoreDelta: 1, feedback: "This keeps the exact mismatch that made a customer ask if it's the same shop. 'Professional' doesn't have to mean stiff — it has to mean consistent with the rest of the brand." },
      ],
    },
    {
      id: 'step-channel',
      prompt: "PixelPop's target customers are students who need logos for their own small businesses. Which marketing channel should PixelPop invest its effort in?",
      choices: [
        { label: 'Campus student-org networks and word of mouth, sharing a portfolio link directly where those students already talk business', scoreDelta: 10, feedback: "Correct — this channel sits exactly where PixelPop's specific target customer (students starting their own small businesses) already spends attention, not just wherever traffic happens to be large." },
        { label: 'A broad national online marketplace, since it reaches the most people', scoreDelta: 4, feedback: "Reach isn't the same as fit — a national marketplace buries PixelPop among sellers with no connection to the specific student-founder audience it's trying to reach." },
        { label: 'A print flyer campaign around the neighborhood', scoreDelta: 1, feedback: "Flyers have no clear connection to this specific audience — student founders looking for a logo aren't primarily reached by neighborhood print flyers." },
      ],
    },
    {
      id: 'step-pricing',
      prompt: "PixelPop's logo design costs ₱150 in software/time-equivalent cost. A nearby freelance competitor charges ₱600 for a comparable logo. What price should PixelPop set?",
      choices: [
        { label: 'Around ₱450–₱550 — priced using value and competition, not just cost', scoreDelta: 10, feedback: "Right — this reflects the value a professional logo offers a student founder and stays credibly close to the ₱600 competitor price, instead of anchoring only on cost." },
        { label: '₱180 — just barely above cost, to be safe', scoreDelta: 5, feedback: "This ignores value and competition entirely, and a price this far below a ₱600 comparable can make PixelPop's work look 'cheap' rather than like a bargain." },
        { label: "₱900 — well above the competitor, since PixelPop's work is better", scoreDelta: 2, feedback: "Pricing far above the competitor with no clear justification a customer can see is a customer-perception risk, not a pricing strategy — it can price PixelPop out of its own target market." },
      ],
    },
    {
      id: 'step-campaign',
      prompt: 'PixelPop is launching a student-logo-design special. Which call to action should anchor the campaign?',
      choices: [
        { label: '"DM us your business name for a free logo concept sketch — goal: 15 DMs this week" — a specific action tied to a trackable number', scoreDelta: 10, feedback: 'Exactly right — a specific call to action paired with a clear success metric is what makes a campaign measurable, not just a nice announcement.' },
        { label: '"Check out our new service!" — a friendly, general announcement', scoreDelta: 5, feedback: 'This tells people the service exists, but gives no specific next step and no way to measure whether the campaign worked.' },
        { label: 'Just post the new pricing with no explicit ask', scoreDelta: 1, feedback: 'With no call to action at all, even an interested student has no obvious next step to take — and PixelPop has no way to track whether the launch worked.' },
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
      'This checkpoint mirrors your real Brand Challenge worksheet: brand strategy, marketing channel, pricing, and a 5-part mini campaign.',
      totalScore >= maxPossibleScore * 0.8
        ? "You consistently matched each decision to PixelPop's actual audience and brand — that's exactly how a brand stays coherent as a shop grows."
        : 'Revisit any step where you scored low — in each one, the strongest choice was the one that stayed consistent with the brand and audience already established, not the safest or most tempting shortcut.',
    ]
  ),
};
