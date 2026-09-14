import { AcademyModule, Lesson, Challenge } from '../../types';
import { caseStudyScoreToResult } from './challengeHelpers';

export const module2: AcademyModule = {
  id: 'module-2',
  number: 2,
  stage: 'Sprout',
  icon: 'level-grower',
  title: 'Build Your Shop',
  tagline: 'Business Basics',
  intro: "Now that you know what your business solves and for whom, it's time to decide how it's legally set up. This module covers the basic building blocks of business ownership — and how they apply specifically to entrepreneurs in the Philippines.",
  lessonIds: ['lesson-2-1', 'lesson-2-2', 'lesson-2-3', 'lesson-2-4', 'lesson-2-5'],
  checkpointId: 'checkpoint-2',
};

export const module2Lessons: Lesson[] = [
  {
    id: 'lesson-2-1',
    moduleId: 'module-2',
    number: '2.1',
    title: 'What Is a Business Structure?',
    estimatedMinutes: 35,
    hook: "\"If Cozy Corner's plushies caused an allergic reaction, who would be responsible — the business, or Miggy personally? The answer depends entirely on how the business is legally set up.\"",
    simplifiedExplanation: "A business structure (also called a legal structure) determines three big things: who owns the business, who is responsible for its debts and decisions, and how much liability (legal and financial risk) the owner personally carries if something goes wrong. Different structures exist because businesses have different needs — a single student selling bracelets doesn't need the same structure as three friends running a growing snack brand.\n\nLiability is the key idea to understand before choosing any structure: in some structures, the business and the owner are legally the same (so personal savings and property are at risk if the business owes money); in others, the business is a separate legal entity that can be sued or go into debt without automatically putting the owner's personal belongings at risk.",
    concept: {
      body: "The Philippine Department of Education's Grade 11 ABM curriculum (Fundamentals of Accountancy, Business and Management 1) teaches students to differentiate the forms of business organization and weigh the advantages and disadvantages of each — the same liability tradeoff the SBA highlights: there is no single 'best choice,' only the best fit for a given business.",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — Philippine Department of Education (DepEd)', url: 'https://lrmds.deped.gov.ph/detail/16012' },
        { title: 'Choose a Business Structure — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/launch-your-business/choose-business-structure' },
      ],
    },
    activity: {
      title: 'Liability Line-Up',
      prompt: "You'll see 3 short business scenarios. For each, decide: does it sound like the owner and the business are the 'same' (personal risk), or 'separate' (business risk only)? (1) A student sells snacks alone from home, using her own money. (2) Three friends form a company with its own bank account and its own name registered with the government. (3) A shop owner personally signs every contract and pays suppliers from his own wallet.",
    },
    inLessonScenario: {
      title: 'One Founder, Growing Fast',
      prompt: "PixelPop started as a one-person side hustle. It's now hired 2 part-time designers and is taking on bigger client contracts. What risk does the founder now carry that she didn't before, and why might this be a reason to reconsider her business structure as she grows?",
    },
    jurisdictionNote: 'Legal structures and their names vary by country. This lesson introduces the general idea of ownership and liability. The following lessons show how this applies specifically in the Philippines, where sole proprietorships, partnerships, and corporations each register with a different government agency.',
    quiz: [
      {
        id: 'lesson-2-1-q1',
        format: 'multiple_choice',
        prompt: 'Liability refers to:',
        options: ['How much profit a business makes', 'The legal/financial risk an owner carries', 'The number of products sold', "The business's logo"],
        correctIndex: 1,
        explanation: 'Liability is the legal and financial risk the owner personally carries.',
      },
      {
        id: 'lesson-2-1-q2',
        format: 'multiple_choice',
        prompt: 'True or False: All business structures carry the exact same level of personal risk for the owner.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: "Different structures carry very different levels of personal risk — that's the whole point of choosing one.",
      },
    ],
  },
  {
    id: 'lesson-2-2',
    moduleId: 'module-2',
    number: '2.2',
    title: 'Sole Proprietorship',
    estimatedMinutes: 35,
    hook: '"Aya runs DoodleDrop entirely on her own — no partners, no co-owners. In the Philippines, this makes her a sole proprietor, and there\'s one specific government agency she needs to register with."',
    simplifiedExplanation: "A sole proprietorship is a business owned and run by one person, with no legal separation between the owner and the business. It's the simplest and most common way to start a small business because it requires the least paperwork. The tradeoff: the owner is personally responsible for all business debts — there's no separate 'business self' to absorb the risk.\n\nAdvantages: easy and inexpensive to start, the owner keeps full control and all profits, minimal ongoing paperwork. Disadvantages: unlimited personal liability, harder to raise large amounts of funding, and the business technically ends if the owner stops operating it.",
    concept: {
      body: "DepEd's Grade 11 ABM curriculum lists the sole proprietorship as a foundational form of business organization Filipino students learn to identify and evaluate. Internationally, the SBA notes sole proprietorships 'can be a good choice for low-risk businesses and owners who want to test their business idea before forming a more formal business.'",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — Philippine Department of Education (DepEd)', url: 'https://lrmds.deped.gov.ph/detail/16012' },
        { title: 'Choose a Business Structure — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/launch-your-business/choose-business-structure' },
      ],
    },
    activity: {
      title: 'Would You Choose It?',
      prompt: 'List 2 reasons a first-time student entrepreneur might choose a sole proprietorship, and 2 reasons they might eventually outgrow it. Use DoodleDrop as your example.',
    },
    inLessonScenario: {
      title: "DoodleDrop's First Step",
      prompt: "Aya wants to sell her stickers under the name 'DoodleDrop' instead of her own name, and wants legal protection so no one else nearby can use that name. In the Philippine context, which government agency should she register her business name with first?",
    },
    jurisdictionNote: 'In the Philippines, a sole proprietorship registers its business name with the Department of Trade and Industry (DTI) through the Business Name Registration System (BNRS), which protects the exclusive use of that name. Registering with DTI is separate from registering for taxes with the BIR (covered in Module 3) — both are required to legally operate.',
    quiz: [
      {
        id: 'lesson-2-2-q1',
        format: 'multiple_choice',
        prompt: 'In a sole proprietorship, who is personally responsible for business debts?',
        options: ['No one', 'The government', 'The single owner', 'A board of directors'],
        correctIndex: 2,
        explanation: "In a sole proprietorship there's no legal separation between owner and business — the owner alone carries the debts.",
      },
      {
        id: 'lesson-2-2-q2',
        format: 'multiple_choice',
        prompt: 'In the Philippines, sole proprietors register their business name with:',
        options: ['The SEC', 'The BIR only', 'The DTI', 'The BSP'],
        correctIndex: 2,
        explanation: "DTI's Business Name Registration System (BNRS) is where sole proprietors register.",
      },
    ],
  },
  {
    id: 'lesson-2-3',
    moduleId: 'module-2',
    number: '2.3',
    title: 'Partnerships',
    estimatedMinutes: 35,
    hook: '"Two friends want to launch a snack brand together, splitting the work — one bakes, one handles orders. If they never write anything down about who owns what, what happens the day they disagree?"',
    simplifiedExplanation: "A partnership is a business owned by two or more people who share responsibilities, profits, and risks. It's simple to form — sometimes as easy as agreeing verbally — but that simplicity is exactly why written partnership agreements matter: they spell out how profits are split, who decides what, and what happens if someone wants to leave.\n\nAdvantages: shared workload, combined skills and capital, relatively easy to set up. Risks: partners can be held responsible for decisions made by other partners, personal liability is common (depending on the type of partnership), and disagreements without a clear agreement can break the business.",
    concept: {
      body: "DepEd's Grade 11 ABM curriculum covers partnerships as one of the core forms of business organization, including their advantages and disadvantages. Internationally, the SBA describes partnerships as 'the simplest structure for two or more people to own a business together.'",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — Philippine Department of Education (DepEd)', url: 'https://lrmds.deped.gov.ph/detail/16012' },
        { title: 'Choose a Business Structure — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/launch-your-business/choose-business-structure' },
      ],
    },
    activity: {
      title: 'Draft a Mini Partnership Agreement',
      prompt: 'Write 4 short bullet points that two co-founders should agree on before starting a business together (e.g., how profits are split, who makes final decisions on big purchases, what happens if one partner wants to quit).',
    },
    inLessonScenario: {
      title: "Crumb & Co.'s New Co-Owner",
      prompt: "Crumb & Co.'s founder wants to bring in a friend as a full business partner to help with deliveries and social media. Before agreeing, what 2 questions should they answer together, and which Philippine government agency would this new partnership need to register with?",
    },
    jurisdictionNote: 'In the Philippines, partnerships register with the Securities and Exchange Commission (SEC) through the eSPARC online portal — not with DTI, which is only for sole proprietorships. Partners typically need a notarized Articles of Partnership before registering, and (once approved) still register separately with the BIR for tax purposes.',
    quiz: [
      {
        id: 'lesson-2-3-q1',
        format: 'short_answer',
        prompt: "Crumb & Co.'s founder and her new co-owner agree to everything by a handshake, with nothing written down. Why is a written partnership agreement important, even for friends?",
        modelAnswer: 'It prevents future disagreements by clarifying how profits, decisions, and risks are shared.',
        explanation: 'A written agreement protects the partnership before disagreements happen, not after.',
      },
      {
        id: 'lesson-2-3-q2',
        format: 'multiple_choice',
        prompt: 'In the Philippines, partnerships register with:',
        options: ['DTI', 'SEC', 'BSP', 'PSA'],
        correctIndex: 1,
        explanation: 'Partnerships register with the Securities and Exchange Commission (SEC) through the eSPARC online portal.',
      },
    ],
  },
  {
    id: 'lesson-2-4',
    moduleId: 'module-2',
    number: '2.4',
    title: 'Corporations and Limited-Liability Forms',
    estimatedMinutes: 35,
    hook: '"A big toy company can be sued without its owners losing their personal homes. That protection is one of the biggest reasons corporations exist."',
    simplifiedExplanation: "A corporation is a business structure that is legally separate from its owners — it can own property, sign contracts, and be sued in its own name. This creates limited liability: owners (shareholders) generally only risk the money they invested, not their personal assets.\n\nThis protection comes at a cost: corporations require more formal paperwork, ongoing government reporting, and higher setup costs than a sole proprietorship or simple partnership. Businesses often start small (sole proprietorship or partnership) and convert to a corporation later, once they need more protection, more investors, or more formal structure to grow.",
    concept: {
      body: "DepEd's Grade 11 ABM curriculum covers corporations as a distinct form of business organization with its own advantages and disadvantages. Internationally, the SBA explains corporations 'offer the strongest protection to its owners from personal liability, but the cost to form a corporation is higher... Corporations also require more extensive record-keeping.'",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — Philippine Department of Education (DepEd)', url: 'https://lrmds.deped.gov.ph/detail/16012' },
        { title: 'Choose a Business Structure — U.S. Small Business Administration (SBA)', url: 'https://www.sba.gov/business-guide/launch-your-business/choose-business-structure' },
      ],
    },
    activity: {
      title: 'Sole Prop, Partnership, or Corporation?',
      prompt: 'Match each situation to the most likely structure: (1) One student testing a small idea with ₱500. (2) Two friends co-running a growing snack shop. (3) A company with 5 investors planning to expand nationally and wanting to protect personal assets.',
    },
    inLessonScenario: {
      title: 'PixelPop Goes Big',
      prompt: 'PixelPop is being offered a large contract that requires signing a formal, higher-risk agreement. The founder is worried about personal liability if something goes wrong. What structure characteristic (introduced in this lesson) would most directly address her worry, and why?',
    },
    jurisdictionNote: 'Exact legal rules, minimum capital requirements, and filing steps for corporations vary by country. In the Philippines, corporations and partnerships both register with the SEC via eSPARC; requirements differ from the U.S. corporate system described generally above. Always confirm current requirements directly with the relevant agency (SEC, DTI, or BIR) before registering a real business.',
    quiz: [
      {
        id: 'lesson-2-4-q1',
        format: 'short_answer',
        prompt: "PixelPop's founder wants to know why forming a corporation would protect her personal savings if a client sued the business. What is 'limited liability'?",
        modelAnswer: 'Owners are generally only at risk of losing what they invested, not their personal assets, because the business is a separate legal entity.',
        explanation: 'Limited liability is the protection a corporation gives its owners by legally separating the business from its shareholders.',
      },
      {
        id: 'lesson-2-4-q2',
        format: 'multiple_choice',
        prompt: 'Which structure typically requires the MOST formal record-keeping?',
        options: ['Sole proprietorship', 'Partnership', 'Corporation', 'None of them require records'],
        correctIndex: 2,
        explanation: 'Corporations require more extensive record-keeping and ongoing government reporting than sole proprietorships or partnerships.',
      },
    ],
  },
  {
    id: 'lesson-2-5',
    moduleId: 'module-2',
    number: '2.5',
    title: 'Pick the Setup',
    estimatedMinutes: 35,
    hook: "\"You've learned three structures. Now it's time to apply them to real (fictional) decisions.\"",
    simplifiedExplanation: "Choosing a structure isn't about finding the 'best' one — it's about matching the structure to the business's size, risk, number of owners, and growth plans. A useful checklist: How many owners are there? How much personal risk is the owner willing to accept? Will the business need outside investment soon? How much paperwork can the owner realistically manage right now?",
    concept: {
      body: "DepEd's Grade 11 ABM curriculum asks students to compare forms of business organization and identify the advantages and disadvantages of each — the same comparative approach used in this lesson's case files.",
      sources: [
        { title: 'Fundamentals of Accountancy, Business and Management 1 (Curriculum Guide, Grade 11) — Philippine Department of Education (DepEd)', url: 'https://lrmds.deped.gov.ph/detail/16012' },
      ],
    },
    activity: {
      title: 'Structure Case Files',
      prompt: 'For each mini-case, recommend a structure and name the correct Philippine registration agency: (1) A student selling snacks alone at ₱300 starting capital. (2) Two cousins co-running a plush-toy business who want to split profits 50/50. (3) A group of 4 friends planning to raise outside investment to scale a delivery app nationally.',
    },
    inLessonScenario: {
      title: "The Founders' Meeting",
      prompt: 'The four SproutSquad businesses meet to compare notes. Crumb & Co. (1 owner), DoodleDrop (1 owner, hiring freelancers), Cozy Corner (2 co-owners, informal), and PixelPop (planning to bring in an investor). Which one is most ready to consider moving beyond a sole proprietorship, and what should they do first before changing structures?',
    },
    jurisdictionNote: 'Remember: in the Philippines, sole proprietorships register with DTI, while partnerships and corporations register with the SEC. All business types must still separately register with the BIR for taxes (Module 3).',
    quiz: [
      {
        id: 'lesson-2-5-q1',
        format: 'multiple_choice',
        prompt: "Cozy Corner's two co-owners are debating which structure 'wins.' Based on this lesson, the 'best' business structure is the one that:",
        options: ['Costs the least', "Fits the business's size, risk, and goals", 'Sounds the most official', 'Every business should copy'],
        correctIndex: 1,
        explanation: "There's no universal best structure — the right choice depends on the business's size, risk tolerance, and growth plans.",
      },
      {
        id: 'lesson-2-5-q2',
        format: 'short_answer',
        prompt: 'PixelPop is planning to bring in an outside investor within the year. Before choosing a structure, what 2 questions from this lesson\'s checklist should PixelPop answer first?',
        modelAnswer: 'How many owners will there be, and will the business need outside investment soon — both point toward whether PixelPop should move beyond a sole proprietorship.',
        explanation: 'Matching a structure to a business means checking owner count, risk tolerance, investment plans, and paperwork capacity before deciding.',
      },
    ],
  },
];

export const module2Checkpoint: Challenge = {
  id: 'checkpoint-2',
  moduleId: 'module-2',
  mode: 'caseStudy',
  title: 'Structure Challenge',
  tagline: 'Help three student founders pick a business structure, register it correctly, and protect themselves before a bank loan is on the table.',
  icon: 'level-grower',
  steps: [
    {
      id: 'step-structure',
      prompt: 'Three students want to start a laundry pickup service for boarding students. One provides the motorcycle, one handles bookings, one manages money. Which business structure fits three co-founders splitting responsibilities and profits from day one?',
      choices: [
        { label: 'Partnership — 3 owners sharing roles and profits is exactly what a partnership is built for, with moderate paperwork', scoreDelta: 10, feedback: "Right — a partnership fits naturally when multiple owners are each contributing something different (motorcycle, bookings, money) and sharing profits and decisions." },
        { label: 'Sole proprietorship — keep it simple with one owner', scoreDelta: 2, feedback: "A sole proprietorship only has room for one owner — it doesn't fit 3 people who are all contributing and expect to share in the profits." },
        { label: 'Corporation — set up the strongest legal protection right away', scoreDelta: 5, feedback: "A corporation isn't wrong in theory, but it's overkill this early — the extra paperwork, cost, and formal reporting are a lot for three students just starting out. A partnership fits this stage better." },
      ],
    },
    {
      id: 'step-registration',
      prompt: 'Having settled on a structure, which Philippine government agency should the three co-founders register with?',
      choices: [
        { label: 'SEC — partnerships register with the Securities and Exchange Commission through eSPARC', scoreDelta: 10, feedback: 'Correct — in the Philippines, partnerships (and corporations) register with the SEC, typically after drafting a notarized Articles of Partnership.' },
        { label: 'DTI — register the business name there', scoreDelta: 2, feedback: 'DTI registration is for sole proprietorships only. A partnership with 3 co-owners needs to register with the SEC instead.' },
        { label: 'BIR only — taxes come first', scoreDelta: 3, feedback: 'The BIR is where every business registers for taxes, but that comes after (and separately from) registering the structure itself with the SEC.' },
      ],
    },
    {
      id: 'step-document',
      prompt: 'The three co-founders expect to grow fast and may want a bank loan within a year. What should they document BEFORE registering, and why?',
      choices: [
        { label: 'A written partnership agreement covering how profits are split, who decides what, and what happens if someone wants to leave — settled now, before money or a loan is involved', scoreDelta: 10, feedback: "Exactly right — writing this down now, while everyone still agrees, protects the partnership later when real money (like a loan) and real disagreements are on the line." },
        { label: 'Nothing yet — wait until there\'s an actual dispute to write anything down', scoreDelta: 0, feedback: "Waiting for a dispute is the worst time to write an agreement — by then, trust is already strained and each partner has an incentive to remember things their own way." },
        { label: 'Just split everything equally with no written agreement — trust is enough between friends', scoreDelta: 4, feedback: "Trust matters, but even close friends can disagree once real money, a loan, and unequal workloads enter the picture. Writing it down protects the friendship as much as the business." },
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
      'This checkpoint mirrors a real registration decision: choosing a structure that fits your co-founders, registering with the correct Philippine agency, and documenting your agreement before money is on the line.',
      totalScore >= maxPossibleScore * 0.8
        ? "You matched the structure to the number of owners, registered with the right agency, and protected the partnership in writing before a loan or dispute could test it — that's exactly how a fast-growing shop stays on solid legal footing."
        : 'Revisit any step where you scored low — in each one, the strongest choice was the one that matched the structure to 3 co-owners, registered with the correct agency (SEC, not DTI), and got the agreement in writing before money was involved.',
    ]
  ),
};
