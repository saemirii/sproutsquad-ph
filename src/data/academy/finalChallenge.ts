import { Challenge, ChallengeResult } from '../../types';
import { clamp, scoreToTierAndReward } from './challengeHelpers';

/** The capstone from the source curriculum: "You'll take one business
 * through every stage of the Academy, from problem to funding decision" —
 * 21 decision points spanning all 8 modules, using PixelPop (the digital
 * design service already established in Modules 1, 4, and 7) as the
 * through-line so its numbers stay consistent with what students already
 * calculated in those checkpoints (₱800/project, ₱280 variable cost,
 * ₱2,600 fixed costs/month).
 *
 * This is the single largest reward in the app by design — a 3x ceiling
 * over a normal module checkpoint — computed directly here rather than via
 * the shared scoreToTierAndReward/caseStudyScoreToResult helpers, which
 * are deliberately capped at the normal-checkpoint ceiling. */
const FINAL_CHALLENGE_XP_CEILING = 450;
const FINAL_CHALLENGE_SEEDS_CEILING = 300;

const finalChallengeScoreToResult = (totalScore: number, maxPossibleScore: number): ChallengeResult => {
  const pct = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const score = Math.round(clamp(pct, 0, 100));
  const { tier } = scoreToTierAndReward(score);
  const rewardRatio = score / 100;
  return {
    score,
    tier,
    breakdown: [{ label: 'Decisions scored', value: `${totalScore} / ${maxPossibleScore} points` }],
    feedback: [
      "This is the full 21-decision journey from the SproutSquad Business Challenge — problem, research, targeting, positioning, value, structure, revenue, COGS, pricing, branding, channel, sales, conversion, budget, forecast, cash flow, unit economics, margins, break-even, financial health, and funding.",
      score >= 80
        ? "You carried PixelPop's own numbers and decisions consistently from Module 1 all the way through Module 8 — that's exactly what running a real business over time looks like."
        : 'Revisit any step where you scored low — the strongest choice at each step was always the one that stayed consistent with PixelPop\'s actual numbers and target customer, not the most tempting shortcut.',
    ],
    xpAwarded: Math.round(FINAL_CHALLENGE_XP_CEILING * rewardRatio),
    seedsAwarded: Math.round(FINAL_CHALLENGE_SEEDS_CEILING * rewardRatio),
  };
};

export const finalChallenge: Challenge = {
  id: 'final-business-challenge',
  moduleId: 'capstone',
  mode: 'caseStudy',
  title: 'The SproutSquad Business Challenge',
  tagline: "Take PixelPop through all 21 decisions, from problem to funding — the same business, the same numbers, start to finish.",
  icon: 'level-grove',
  steps: [
    {
      id: 'final-1-problem',
      prompt: '1. Customer problem — PixelPop is a student digital design service. Which problem is the strongest foundation to build on?',
      choices: [
        { label: 'Student entrepreneurs running their own small side businesses have no fast, affordable way to get professional-looking logos and graphics', scoreDelta: 10, feedback: 'Right — specific problem, specific customer, clearly tied to a willingness to pay.' },
        { label: 'People generally like nice-looking designs', scoreDelta: 2, feedback: "This is too vague — it's not tied to a specific customer or a reason they'd pay for it." },
        { label: 'Everyone eventually needs a logo someday', scoreDelta: 3, feedback: "\"Eventually, someday\" isn't an urgent problem — there's no specific customer feeling this pain right now." },
      ],
    },
    {
      id: 'final-2-research',
      prompt: '2. Market research — before building a service menu, what should PixelPop do first?',
      choices: [
        { label: 'Interview or survey actual students who run small side businesses about their current design needs and budget', scoreDelta: 10, feedback: 'Correct — primary research directly from the target customer beats guessing every time.' },
        { label: 'Guess based on what sounds like a good idea', scoreDelta: 1, feedback: 'This is exactly the "tantsa" guessing trap Module 1 warns against.' },
        { label: 'Copy whatever a random unrelated design agency does', scoreDelta: 3, feedback: "A design agency serving a totally different customer isn't reliable evidence for what PixelPop's specific students actually need." },
      ],
    },
    {
      id: 'final-3-target',
      prompt: "3. Target market — PixelPop can't serve everyone well. Which segment should it target?",
      choices: [
        { label: 'Student entrepreneurs who need affordable logos/graphics for their own small businesses', scoreDelta: 10, feedback: "Right — matches the problem PixelPop already identified, and it's a segment PixelPop can realistically serve." },
        { label: 'Large national corporations needing full brand overhauls', scoreDelta: 1, feedback: "Wrong scale entirely — a solo student design service can't realistically compete for corporate contracts." },
        { label: 'Literally anyone who might ever want a design', scoreDelta: 2, feedback: '"Anyone" is not a target — trying to serve everyone usually means serving no one especially well.' },
      ],
    },
    {
      id: 'final-4-positioning',
      prompt: '4. Positioning — how should PixelPop position itself against other student designers?',
      choices: [
        { label: '"The fast, affordable design partner for student entrepreneurs — professional results in days, not weeks"', scoreDelta: 10, feedback: 'Strong — clear, specific, and directly answers why THIS target customer should pick PixelPop.' },
        { label: '"The cheapest designer around, no matter what"', scoreDelta: 4, feedback: 'Competing purely on being the cheapest is the weakest, least defensible form of positioning.' },
        { label: '"We do every kind of design for every kind of client"', scoreDelta: 2, feedback: 'A generic, unfocused positioning statement gives the target customer no real reason to choose PixelPop specifically.' },
      ],
    },
    {
      id: 'final-5-value',
      prompt: "5. Value proposition — which best expresses PixelPop's value to its target customer?",
      choices: [
        { label: '"Get a professional logo in 48 hours for less than the cost of your first printed banner"', scoreDelta: 10, feedback: 'Correct — concrete, benefit-focused, and speaks directly to a student founder\'s real constraints (time and budget).' },
        { label: '"We make logos."', scoreDelta: 2, feedback: "This states a feature, not a value proposition — it doesn't say why a customer should choose PixelPop over any alternative." },
        { label: '"Trust us, we\'re good."', scoreDelta: 1, feedback: 'This asks for trust without giving the customer any concrete reason to extend it.' },
      ],
    },
    {
      id: 'final-6-structure',
      prompt: '6. Business structure — PixelPop is one founder testing the idea alone, with no partners or outside investors yet. What structure fits best?',
      choices: [
        { label: 'Sole proprietorship — simplest to start, full control, matches a single founder testing an idea', scoreDelta: 10, feedback: 'Right — a sole proprietorship is the natural fit for one founder at this early, low-risk stage.' },
        { label: 'Corporation — maximum liability protection from day one', scoreDelta: 4, feedback: 'Overkill for a single-founder side hustle — more paperwork and cost than the business needs yet.' },
        { label: 'Partnership — split ownership with a co-founder', scoreDelta: 2, feedback: "There's no second co-founder in this scenario, so a partnership doesn't apply yet." },
      ],
    },
    {
      id: 'final-7-revenue',
      prompt: '7. Revenue and expenses — PixelPop charges ₱800 per logo project. Which statement correctly describes revenue?',
      choices: [
        { label: 'Revenue is the total ₱800 collected per project, before subtracting any costs', scoreDelta: 10, feedback: 'Correct — revenue is everything brought in from sales, before any costs are subtracted.' },
        { label: 'Revenue is whatever profit is left after all expenses', scoreDelta: 2, feedback: "That's profit, not revenue — revenue comes first, before subtracting costs." },
        { label: 'Revenue is the same thing as COGS', scoreDelta: 1, feedback: 'Revenue (money in) and COGS (a cost) are two completely different things.' },
      ],
    },
    {
      id: 'final-8-cogs',
      prompt: "8. COGS — PixelPop's variable cost per logo project (software time, assets) is ₱280. What is PixelPop's COGS per project?",
      choices: [
        { label: '₱280', scoreDelta: 10, feedback: 'Correct — that direct per-project cost is exactly what COGS measures.' },
        { label: '₱800', scoreDelta: 2, feedback: "That's the selling price, not the direct cost of producing the project." },
        { label: '₱2,600', scoreDelta: 1, feedback: "That's PixelPop's monthly fixed cost (the software subscription), not the per-project COGS." },
      ],
    },
    {
      id: 'final-9-pricing',
      prompt: 'Ω9. Pricing — a nearby freelance competitor charges ₱600 for a comparable logo. Is PixelPop\'s ₱800 price justified?',
      choices: [
        { label: "Yes — the faster turnaround and student-focused value proposition justify pricing above the competitor, as long as customers see that value", scoreDelta: 10, feedback: 'Right — pricing should weigh value and differentiation, not just match or undercut the competition.' },
        { label: "No — always price at cost plus a tiny markup (e.g. ₱300) no matter what competitors charge", scoreDelta: 3, feedback: "Pricing purely off cost ignores value and competition entirely — two of the four factors Module 4 teaches." },
        { label: "Price far above everyone at ₱1,500 with no justification", scoreDelta: 2, feedback: "A price with no connection to cost, value, or competition risks feeling arbitrary and losing customers." },
      ],
    },
    {
      id: 'final-10-branding',
      prompt: "10. Branding — PixelPop's visuals are bold and modern. What should its customer-service tone be?",
      choices: [
        { label: 'Also bold, modern, and energetic — consistent with the visual brand at every touchpoint', scoreDelta: 10, feedback: 'Correct — consistency across every touchpoint is what makes a brand feel trustworthy and memorable.' },
        { label: 'Stiff and formal, regardless of the visual brand', scoreDelta: 2, feedback: 'A mismatched tone quietly erodes trust, even when each piece looks fine in isolation.' },
        { label: "It doesn't matter as long as the designs look good", scoreDelta: 3, feedback: 'Brand is more than visuals — tone of voice and experience matter just as much.' },
      ],
    },
    {
      id: 'final-11-channel',
      prompt: '11. Marketing channel — where should PixelPop focus its marketing effort?',
      choices: [
        { label: 'Word of mouth and campus student-org networks, where its target customers (student entrepreneurs) already gather', scoreDelta: 10, feedback: 'Right — the best channel is wherever the specific target customer already spends attention.' },
        { label: 'A national marketplace with no connection to PixelPop\'s campus-based target customer', scoreDelta: 3, feedback: "This channel doesn't match where PixelPop's specific target customer actually is." },
        { label: 'Print flyers posted randomly around town', scoreDelta: 2, feedback: 'Untargeted and hard to measure — unlikely to reach the specific student-founder audience efficiently.' },
      ],
    },
    {
      id: 'final-12-sales',
      prompt: '12. Sales journey — a prospective client asks about a logo, then goes quiet after hearing the price. What should PixelPop do?',
      choices: [
        { label: 'Address the likely objection directly (e.g. payment plans, or what\'s included) instead of just repeating the price', scoreDelta: 10, feedback: 'Correct — handling objections is a distinct step in the sales journey, not just repeating the pitch.' },
        { label: 'Say nothing further and wait', scoreDelta: 2, feedback: 'Never following up (or closing) is one of the most common reasons an interested lead never becomes a customer.' },
        { label: 'Immediately lower the price with no explanation', scoreDelta: 4, feedback: "Discounting without understanding the actual objection first can leave money on the table unnecessarily." },
      ],
    },
    {
      id: 'final-13-conversion',
      prompt: '13. Conversion — PixelPop\'s funnel: 800 views → 120 clicks → 30 messages → 3 orders. Which stage is losing the highest percentage of people?',
      choices: [
        { label: 'Messages → Orders (only 10% of people who message end up ordering)', scoreDelta: 10, feedback: 'Correct — 3/30 = 10% is the weakest conversion rate of the three stages (views→clicks is 15%, clicks→messages is 25%).' },
        { label: 'Views → Clicks', scoreDelta: 3, feedback: "At 120/800 = 15%, this isn't actually the weakest stage here." },
        { label: 'Nothing needs fixing — 3 orders is still a win', scoreDelta: 1, feedback: 'A very low messages→orders rate is a real, fixable signal — something in the closing/pricing conversation is likely losing people.' },
      ],
    },
    {
      id: 'final-14-budget',
      prompt: "14. Budget — PixelPop earns about ₱6,000 some months. How should that income be handled?",
      choices: [
        { label: 'Allocate it across categories (software, marketing, savings) in advance, including a real emergency fund', scoreDelta: 10, feedback: "Right — giving every peso a job in advance is exactly what a budget is for." },
        { label: 'Spend it as it comes in with no plan, and save whatever happens to be left', scoreDelta: 2, feedback: 'This is the "no-plan trap" — money without a job in advance tends to just disappear.' },
        { label: 'Commit to spending ₱9,000 this month because business "feels good" lately', scoreDelta: 1, feedback: 'Allocating more than actual expected income guarantees a shortfall.' },
      ],
    },
    {
      id: 'final-15-forecast',
      prompt: '15. Forecast — PixelPop knows client requests slow down during exam weeks. What should it do?',
      choices: [
        { label: 'Prepare a best/expected/worst-case forecast, with a specific plan for the worst case (the slow exam-week month)', scoreDelta: 10, feedback: 'Correct — planning for the worst case in advance turns a bad month into a manageable challenge instead of a crisis.' },
        { label: 'Only plan assuming every month will be as good as the best month', scoreDelta: 2, feedback: 'Planning only for the best case leaves PixelPop unprepared when a predictable slow season actually arrives.' },
        { label: "Don't forecast at all — just react when it happens", scoreDelta: 1, feedback: 'Since this slowdown is predictable, not forecasting for it wastes a chance to prepare in advance.' },
      ],
    },
    {
      id: 'final-16-cashflow',
      prompt: '16. Cash flow — a client\'s ₱800 payment won\'t arrive for 30 days after the logo is delivered. What should PixelPop understand about this?',
      choices: [
        { label: 'This creates a timing gap — the revenue is real, but the cash isn\'t in hand yet, which could strain short-term cash if it happens with several clients at once', scoreDelta: 10, feedback: 'Right — this is exactly the profit-vs-cash timing gap Module 3 and Module 6 both teach.' },
        { label: 'Cash and revenue always arrive at the same time, so there\'s nothing to plan for', scoreDelta: 1, feedback: 'This is precisely the mistaken assumption that catches businesses off guard — cash and revenue are not the same thing.' },
        { label: 'Ignore it since the order is still profitable on paper', scoreDelta: 3, feedback: "Being profitable on paper doesn't pay this month's bills if the cash hasn't actually arrived yet." },
      ],
    },
    {
      id: 'final-17-unit-econ',
      prompt: '17. Unit economics — price ₱800, variable cost ₱280. What is the contribution margin per project?',
      choices: [
        { label: '₱520 (₱800 − ₱280)', scoreDelta: 10, feedback: 'Correct — contribution margin is price minus variable cost per unit.' },
        { label: '₱280', scoreDelta: 2, feedback: "That's the variable cost itself, not what's left after subtracting it from price." },
        { label: '₱1,080 (₱800 + ₱280)', scoreDelta: 1, feedback: 'Contribution margin subtracts variable cost from price — it does not add them together.' },
      ],
    },
    {
      id: 'final-18-margins',
      prompt: "18. Profit margins — PixelPop made ₱10,000 gross profit on ₱15,000 revenue; a bigger competitor made ₱10,000 gross profit on ₱80,000 revenue. Who is more efficient per peso of sales?",
      choices: [
        { label: 'PixelPop — its gross margin (67%) is much higher than the competitor\'s (12.5%), even though the peso amount is identical', scoreDelta: 10, feedback: "Correct — margins as a percentage reveal efficiency that identical peso profit alone hides." },
        { label: 'The competitor, because it\'s a bigger business overall', scoreDelta: 3, feedback: 'Being bigger in revenue is not the same as being more efficient per peso of sales — check the margin, not just the size.' },
        { label: "They're equally healthy since the peso profit is the same", scoreDelta: 2, feedback: 'Identical peso profit can hide very different levels of efficiency once you account for how much revenue it took to earn it.' },
      ],
    },
    {
      id: 'final-19-breakeven',
      prompt: "19. Break-even — fixed costs are ₱2,600/month, contribution margin is ₱520/project. How many projects does PixelPop need to break even?",
      choices: [
        { label: '5 projects (₱2,600 ÷ ₱520)', scoreDelta: 10, feedback: 'Correct — break-even units = fixed costs ÷ contribution margin per unit.' },
        { label: '2 projects', scoreDelta: 2, feedback: "This doesn't match the formula — ₱2,600 ÷ ₱520 = 5, not 2." },
        { label: 'Break-even doesn\'t apply to a service business like this', scoreDelta: 1, feedback: 'Break-even applies to any business with fixed costs and a per-unit contribution margin, services included.' },
      ],
    },
    {
      id: 'final-20-health',
      prompt: '20. Financial health — PixelPop is at break-even with positive working capital and a low debt-to-equity ratio. How should this be read?',
      choices: [
        { label: 'Combine all three signals together — a business can look fine on one number while a different ratio quietly reveals a problem, so read them as a set', scoreDelta: 10, feedback: 'Right — no single ratio tells the whole story; reading them together gives the fullest, most honest picture.' },
        { label: 'Only the break-even number actually matters — ignore working capital and debt-to-equity', scoreDelta: 2, feedback: 'Looking at only one ratio can miss real problems the others would have caught.' },
        { label: 'Ratios are optional extra credit, not something a small business really needs to track', scoreDelta: 1, feedback: 'Ratios are exactly how a business catches trouble that a glance at sales numbers alone would miss.' },
      ],
    },
    {
      id: 'final-21-funding',
      prompt: "21. Funding decision — PixelPop wants ₱20,000 to grow, but its monthly income is unpredictable. Debt or equity?",
      choices: [
        { label: 'Equity — giving up a share of ownership removes the repayment pressure that unpredictable income would make risky under a loan', scoreDelta: 10, feedback: 'Right — when income is genuinely unpredictable, avoiding a fixed repayment obligation is usually the safer call, even though it means sharing ownership.' },
        { label: 'Debt, no matter what, because keeping full ownership is always the top priority', scoreDelta: 4, feedback: 'Keeping full ownership matters, but a fixed repayment schedule against unpredictable income is a real default risk worth weighing seriously.' },
        { label: 'Borrow informally from a friend with no clear terms written down', scoreDelta: 1, feedback: 'Even informal money needs clear written terms — this is true for a friend loan just as much as a bank loan.' },
      ],
    },
  ],
  scoreToResult: finalChallengeScoreToResult,
};
