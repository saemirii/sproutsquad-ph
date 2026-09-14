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
    estimatedMinutes: 35,
    hook: "\"A logo is a picture. A brand is a feeling. Cozy Corner's plushies could have any logo — but customers keep coming back because of how the shop makes them feel: cozy, cared for, a little nostalgic.\"",
    simplifiedExplanation: "A brand is not the same as a logo. A logo is a visual symbol; a brand is the overall feeling and perception customers associate with a business — built through every interaction, not just the visuals. Brand identity includes the visuals (colors, fonts, logo) but also tone of voice, values, and the experience of buying from you.\n\nCustomer perception — how people actually feel about your business, which may differ from how you intend it — is the real measure of your brand. This matters because customers often choose a slightly more expensive product from a brand they trust or feel connected to, over a cheaper option from an unfamiliar business.",
    concept: {
      body: "OpenStax explains that a brand 'is a feeling that is made up of the organization's promotion efforts along with consumer meaning' — challenging to measure, but often the most valuable part of a company.",
      sources: [
        { title: 'Principles of Marketing, 9.5: Branding and Brand Development — OpenStax / Rice University', url: 'https://openstax.org/books/principles-marketing/pages/9-5-branding-and-brand-development' },
      ],
    },
    activity: {
      title: 'Logo vs. Brand Sort',
      prompt: "Sort these into 'Logo' or 'Brand': color scheme, the feeling customers get after a purchase, the icon on packaging, how a complaint is handled, the font used in posts, whether customers trust the shop.",
    },
    inLessonScenario: {
      title: 'Same Logo, Different Feelings',
      prompt: 'Two competing sticker shops use nearly identical minimalist logos. One replies to every customer message within an hour with friendly, personal notes. The other is slow and formal. Which shop is more likely to build a stronger brand (not just logo), and why?',
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
    estimatedMinutes: 35,
    hook: "\"PixelPop's designs are bold and modern — but its customer replies are stiff and overly formal. Something feels off, even if customers can't name it.\"",
    simplifiedExplanation: "A brand strategy connects five elements so they all point in the same direction: your target audience (from Module 1's STP), your brand promise (what customers can always expect from you), your personality, your voice (how that personality sounds in writing), and your visual identity (colors, fonts, imagery).\n\nConsistency across all five is what makes a brand feel trustworthy and memorable — inconsistency, even in small details, quietly erodes trust.",
    concept: {
      body: "OpenStax notes that a brand's essence 'must be reinforced at every touchpoint' — meaning consistency across every customer interaction, not just the logo, is what builds lasting brand value.",
      sources: [
        { title: 'Principles of Marketing, 9.5: Branding and Brand Development — OpenStax / Rice University', url: 'https://openstax.org/books/principles-marketing/pages/9-5-branding-and-brand-development' },
      ],
    },
    activity: {
      title: 'Brand Strategy Snapshot',
      prompt: 'For one SproutSquad business, fill in one line each for: Target audience, Brand promise, Personality (3 words), Voice (formal/casual/playful/etc.), Visual identity (2 colors + 1 style word).',
    },
    inLessonScenario: {
      title: "PixelPop's Mismatch",
      prompt: "PixelPop's visuals are bold and modern, but its customer service replies are stiff and formal. Identify which of the 5 brand strategy elements is out of sync, and rewrite one sample customer reply to match the bold, modern personality.",
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
    estimatedMinutes: 35,
    hook: '"Crumb & Co. spends hours posting on a platform where none of its actual customers spend time. Meanwhile, word-of-mouth from happy classmates brings in more orders than any post."',
    simplifiedExplanation: "A marketing channel is any way a business reaches and communicates with customers: social media, online marketplaces, messaging apps, in-person events, email, or simple word of mouth. No single channel is automatically 'best' — the right channel depends on where your specific target customer already spends their time and attention, and what fits your business's resources.\n\nA common mistake is copying whatever channel is trendy instead of asking: does my target customer actually use this, and can I realistically maintain it?",
    concept: {
      body: "DTI's nationwide Negosyo Centers (established under the Go Negosyo Act, RA 10644) exist specifically to connect Filipino MSMEs to marketing training and channel selection, alongside financial literacy support. The SBA's guide to marketing and sales adds the practical planning step: listing the specific channels you'll use, and tracking cost against the revenue each one generates.",
      sources: [
        { title: 'Negosyo Center Program — FAQs — DTI', url: 'https://www.dti.gov.ph/negosyo/negosyo-center/faqs/' },
        { title: 'Marketing and Sales — SBA', url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales' },
      ],
    },
    activity: {
      title: 'Match the Channel to the Customer',
      prompt: 'For 4 different target customers (busy parents, students on campus, teachers, online shoppers nationwide), pick the single best-fit channel from: social media, word of mouth at school, email newsletter, online marketplace. Justify each choice in one sentence.',
    },
    inLessonScenario: {
      title: "Crumb & Co.'s Channel Mix-Up",
      prompt: "Crumb & Co.'s target customers are students at their own school. They've been spending most of their effort on a national online marketplace, with little to show for it. What channel might actually work better for a hyper-local, school-based customer base, and why?",
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
    estimatedMinutes: 35,
    hook: '"Cozy Corner priced a keychain at \'cost plus ₱20\' with no other thinking involved — until a competitor\'s nearly identical product, priced ₱30 higher, kept selling out."',
    simplifiedExplanation: "Pricing is not just 'cost plus a random markup.' A thoughtful price considers at least four factors: Cost (you must at least cover COGS to avoid losing money on every sale), Value (how much the customer believes the product is worth to them), Competition (what similar products cost elsewhere), and Customer perception (a price that's 'too low' can sometimes make a product seem cheap or low-quality, hurting sales). There's no single formula that works for every product — pricing is a judgment call informed by all four factors together.\n\nOne vocabulary note: mark-up is the amount added on top of cost to set a selling price (expressed as a % of cost), while margin is profit expressed as a percentage of the selling price, not the cost. A ₱60-cost item priced at ₱90 has a mark-up of 50% of cost, but a margin of only 33% of the selling price.",
    concept: {
      body: "DepEd's Grade 11 Business Mathematics curriculum has students differentiate mark-on, mark-down, and mark-up, and distinguish mark-up from margin — the exact distinction this lesson teaches. The SBA's marketing guide adds the broader strategy layer: pricing should weigh 'reasonable margins to make a profit,' whether the market will bear the price, and trade-offs between margin and market share.",
      sources: [
        { title: 'Business Mathematics (Curriculum Guide, Grade 11) — DepEd', url: 'https://lrmds.deped.gov.ph/detail/16008' },
        { title: 'Marketing and Sales — SBA', url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales' },
      ],
    },
    activity: {
      title: 'Four-Factor Price Check',
      prompt: "For a product of your choice, write one line under each factor: Cost (your COGS), Value (why a customer would pay for it), Competition (a nearby comparable price), Customer perception (would a very low price seem 'cheap' instead of a bargain?). Then propose a final price.",
    },
    inLessonScenario: {
      title: 'Cozy Corner Reconsiders',
      prompt: "Cozy Corner's keychain costs ₱75 in COGS. A similar competitor product sells for ₱180. Using all four pricing factors (not just cost), propose a price for Cozy Corner's keychain and justify it.",
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
    estimatedMinutes: 35,
    hook: '"You now have a brand, a channel, and a price. It\'s time to put them together into one focused push."',
    simplifiedExplanation: "A simple marketing campaign connects five pieces into one coordinated effort: Target audience (who this campaign speaks to), Main message (the one idea you want them to remember), Channel (where they'll see it), Call to action (the specific next step you want them to take), and Success metric (how you'll know if it worked — e.g., number of orders, messages received, or link clicks).\n\nCampaigns fail most often when they try to say too many things at once, or when there's no clear call to action.",
    concept: {
      body: 'The SBA recommends comparing marketing costs to the revenue generated, and tracking return on investment (ROI) — a reminder that every campaign needs a clear, measurable goal.',
      sources: [
        { title: 'Marketing and Sales — SBA', url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales' },
      ],
    },
    activity: {
      title: 'Build Your Mini Campaign',
      prompt: "For one SproutSquad business, fill in all five campaign elements: Target audience, Main message (one sentence), Channel, Call to action (exact words), Success metric (a specific number you'd track).",
    },
    inLessonScenario: {
      title: "DoodleDrop's Launch Week",
      prompt: 'DoodleDrop is launching a new sticker pack and has one week and no budget. Design a mini campaign using only free tools (school group chat, word of mouth, one social post). What\'s the single call to action you\'d use, and what number would tell DoodleDrop the campaign worked?',
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
