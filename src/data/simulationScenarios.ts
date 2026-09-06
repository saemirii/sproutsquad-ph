import { SimulationDecisionField, SimulationResult, SimulationScenario } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface ScenarioEconomics {
  /** Cost to produce/source one unit (COGS), spent upfront on every unit stocked. */
  costPerUnit: number;
  /** Units sold at the reference price with zero marketing spend. */
  baseDemand: number;
  referencePrice: number;
  /** Marketing spend (₱) that meaningfully starts moving demand. */
  marketingReference: number;
}

/**
 * One shared scoring engine behind every scenario — teaches the same
 * practical entrepreneurship math (revenue, COGS, margin, sell-through,
 * cash risk from unsold inventory) regardless of the storefront theme.
 */
const computeSimulationResult = (
  economics: ScenarioEconomics,
  decisions: Record<string, number | boolean>,
  startingCapital: number
): SimulationResult => {
  const unitsToStock = Math.max(0, Number(decisions.unitsToStock) || 0);
  const pricePerUnit = Math.max(0, Number(decisions.pricePerUnit) || 0);
  const marketingBudget = Math.max(0, Number(decisions.marketingBudget) || 0);
  const packagingCostPerUnit = Math.max(0, Number(decisions.packagingCostPerUnit) || 0);
  const discountPercent = clamp(Number(decisions.discountPercent) || 0, 0, 90);
  const reinvestProfit = Boolean(decisions.reinvestProfit);

  const effectivePrice = pricePerUnit * (1 - discountPercent / 100);
  const priceFactor = clamp(economics.referencePrice / Math.max(1, effectivePrice), 0.4, 2.2);
  const marketingFactor = 1 + Math.log10(1 + marketingBudget / economics.marketingReference) * 0.6;
  const demand = Math.round(economics.baseDemand * priceFactor * marketingFactor);
  const unitsSold = Math.min(unitsToStock, Math.max(0, demand));
  const sellThrough = unitsToStock > 0 ? unitsSold / unitsToStock : 0;

  const inventoryCost = unitsToStock * economics.costPerUnit;
  const packagingCost = unitsSold * packagingCostPerUnit;
  const expenses = inventoryCost + packagingCost + marketingBudget;
  const revenue = unitsSold * effectivePrice;
  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : profit < 0 ? -100 : 0;

  const reinvestment = reinvestProfit ? Math.max(0, profit) * 0.5 : 0;
  const remainingCash = startingCapital - expenses + revenue - reinvestment;

  const healthScore = Math.round(clamp(50 + profitMargin * 1.2 + (sellThrough - 0.5) * 30, 0, 100));

  let businessHealth: SimulationResult['businessHealth'];
  if (profitMargin >= 25) businessHealth = 'Thriving';
  else if (profitMargin >= 10) businessHealth = 'Stable';
  else if (profitMargin >= 0) businessHealth = 'Struggling';
  else businessHealth = 'At Risk';

  let xpAwarded = 15;
  let seedsAwarded = 10;
  if (healthScore >= 80) { xpAwarded = 150; seedsAwarded = 100; }
  else if (healthScore >= 60) { xpAwarded = 100; seedsAwarded = 70; }
  else if (healthScore >= 40) { xpAwarded = 60; seedsAwarded = 40; }
  else if (healthScore >= 20) { xpAwarded = 30; seedsAwarded = 20; }

  const feedback: string[] = [];
  if (sellThrough < 0.6 && unitsToStock > 0) {
    feedback.push(`You only sold ${Math.round(sellThrough * 100)}% of what you stocked — buying less inventory (or pricing/marketing to sell through faster) would free up cash next time.`);
  } else if (sellThrough >= 0.95) {
    feedback.push("You sold out! Next time, consider stocking a little more to capture the demand you left on the table.");
  }
  if (profitMargin < 0) {
    feedback.push('Your expenses outran your revenue — your COGS, packaging, or marketing spend is too high relative to your price.');
  } else if (profitMargin < 15) {
    feedback.push('Your margin is thin. A small price increase or a cheaper sourcing/packaging option would strengthen it.');
  } else {
    feedback.push('Solid profit margin — this pricing and cost structure is healthy.');
  }
  if (marketingBudget > 0 && demand <= unitsToStock * 0.5) {
    feedback.push('Marketing spend had limited payoff here — demand was already outpacing what you stocked.');
  }
  if (discountPercent >= 30) {
    feedback.push('A steep discount moved units, but check whether it left enough margin once packaging and marketing are covered.');
  }

  return {
    revenue: Math.round(revenue),
    expenses: Math.round(expenses),
    profit: Math.round(profit),
    profitMargin: Math.round(profitMargin * 10) / 10,
    remainingCash: Math.round(remainingCash),
    businessHealth,
    healthScore,
    xpAwarded,
    seedsAwarded,
    feedback,
  };
};

const standardDecisions = (opts: {
  unitLabel: string;
  unitMax: number;
  unitDefault: number;
  priceMax: number;
  priceDefault: number;
  marketingMax: number;
  marketingDefault: number;
  packagingLabel: string;
  packagingMax: number;
  packagingDefault: number;
}): SimulationDecisionField[] => [
  {
    key: 'unitsToStock',
    label: `How many ${opts.unitLabel} will you stock?`,
    type: 'number',
    min: 10,
    max: opts.unitMax,
    step: 10,
    default: opts.unitDefault,
    unit: opts.unitLabel,
  },
  {
    key: 'pricePerUnit',
    label: 'Selling price per unit',
    type: 'number',
    min: 10,
    max: opts.priceMax,
    step: 5,
    default: opts.priceDefault,
    unit: '₱',
  },
  {
    key: 'marketingBudget',
    label: 'Marketing budget',
    type: 'number',
    min: 0,
    max: opts.marketingMax,
    step: 25,
    default: opts.marketingDefault,
    unit: '₱',
  },
  {
    key: 'packagingCostPerUnit',
    label: opts.packagingLabel,
    type: 'number',
    min: 0,
    max: opts.packagingMax,
    step: 1,
    default: opts.packagingDefault,
    unit: '₱',
  },
  {
    key: 'discountPercent',
    label: 'Launch discount',
    type: 'number',
    min: 0,
    max: 50,
    step: 5,
    default: 0,
    unit: '%',
  },
  {
    key: 'reinvestProfit',
    label: 'Reinvest 50% of profit into your next batch?',
    type: 'toggle',
    default: false,
  },
];

export const simulationScenarios: SimulationScenario[] = [
  {
    id: 'sim-cookie-shop',
    title: 'Cookie Shop',
    icon: '🍪',
    tagline: 'Run one production cycle of a campus cookie business.',
    category: 'Food Business',
    startingCapital: 2000,
    decisions: standardDecisions({
      unitLabel: 'boxes',
      unitMax: 300,
      unitDefault: 100,
      priceMax: 120,
      priceDefault: 60,
      marketingMax: 1000,
      marketingDefault: 200,
      packagingLabel: 'Packaging cost per box',
      packagingMax: 20,
      packagingDefault: 5,
    }),
    compute: (decisions, startingCapital) =>
      computeSimulationResult(
        { costPerUnit: 25, baseDemand: 120, referencePrice: 60, marketingReference: 300 },
        decisions,
        startingCapital
      ),
  },
  {
    id: 'sim-handmade-bracelets',
    title: 'Handmade Bracelets',
    icon: '📿',
    tagline: 'Price and stock a batch of handmade crafts for a campus fair.',
    category: 'Handmade Products',
    startingCapital: 1500,
    decisions: standardDecisions({
      unitLabel: 'pieces',
      unitMax: 250,
      unitDefault: 80,
      priceMax: 100,
      priceDefault: 45,
      marketingMax: 800,
      marketingDefault: 150,
      packagingLabel: 'Packaging cost per piece',
      packagingMax: 15,
      packagingDefault: 4,
    }),
    compute: (decisions, startingCapital) =>
      computeSimulationResult(
        { costPerUnit: 15, baseDemand: 80, referencePrice: 45, marketingReference: 250 },
        decisions,
        startingCapital
      ),
  },
  {
    id: 'sim-campus-online-shop',
    title: 'Campus Online Shop',
    icon: '🛒',
    tagline: 'Manage a stocking and pricing cycle for an online storefront.',
    category: 'Online Shop',
    startingCapital: 3000,
    decisions: standardDecisions({
      unitLabel: 'units',
      unitMax: 400,
      unitDefault: 150,
      priceMax: 200,
      priceDefault: 90,
      marketingMax: 1500,
      marketingDefault: 300,
      packagingLabel: 'Shipping cost per order',
      packagingMax: 40,
      packagingDefault: 12,
    }),
    compute: (decisions, startingCapital) =>
      computeSimulationResult(
        { costPerUnit: 40, baseDemand: 150, referencePrice: 90, marketingReference: 500 },
        decisions,
        startingCapital
      ),
  },
];
