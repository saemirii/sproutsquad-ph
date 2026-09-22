import { Order, Expense, Product, BusinessMetrics, HealthInsight } from '../types';

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface FifoBatch {
  unitCost: number;
  unitsRemaining: number;
}

/** Consumes FIFO batches (already sorted oldest-first) for one product's
 * one cost category. Units sold beyond what's actually been logged as
 * purchased are costed at the last known unit cost rather than ₱0 — ₱0
 * would silently inflate Gross Profit just because a purchase hasn't been
 * logged yet. A category with zero batches ever logged isn't treated as a
 * gap at all (₱0 cost, no flag) — a product simply not needing packaging,
 * say, shouldn't permanently trip a warning; `unmatchedUnits` only fires
 * when the category HAS some logged history but not enough to cover every
 * unit sold, which is an unambiguous data gap. */
function consumeFifoBatches(batches: FifoBatch[], unitsToConsume: number): { cost: number; unmatchedUnits: number } {
  let remaining = unitsToConsume;
  let cost = 0;
  let lastUnitCost = 0;
  for (const batch of batches) {
    if (remaining <= 0) break;
    const consumed = Math.min(batch.unitsRemaining, remaining);
    cost += consumed * batch.unitCost;
    remaining -= consumed;
    lastUnitCost = batch.unitCost;
  }
  // Compute the gap flag from `remaining` before folding the fallback
  // estimate into `cost` below — otherwise the fallback would always
  // "use up" the shortfall and this could never fire.
  const unmatchedUnits = batches.length > 0 ? remaining : 0;
  if (remaining > 0 && lastUnitCost > 0) {
    cost += remaining * lastUnitCost;
  }
  return { cost, unmatchedUnits };
}

/** Per-product FIFO cost of goods, matched to units sold in Completed
 * orders only. Each product's "Inventory", "Materials & Supplies" and
 * "Packaging" expenses (the ones with a productId + unitsPurchased) form
 * independent FIFO queues, oldest batch first — this is what lets a
 * ₱10,000/100-unit batch followed by a ₱20,000/100-unit restock cost a
 * 150-unit sale as 100 units from the first batch + 50 from the second,
 * instead of one blended average. */
export function calculateFifoCogs(
  products: Product[],
  expenses: Expense[],
  completedOrders: Order[]
): { cogs: number; hasUnmatchedUnits: boolean; zeroCogsProducts: string[] } {
  let totalCogs = 0;
  let hasUnmatchedUnits = false;
  const zeroCogsProducts: string[] = [];

  for (const product of products) {
    const unitsSold = completedOrders.reduce(
      (sum, o) => sum + o.items.filter((i) => i.productId === product.id).reduce((s, i) => s + i.quantity, 0),
      0
    );
    if (unitsSold === 0) continue;

    // Zero cost data at all (neither category ever logged for this
    // product) is a distinct, worse case than a partial gap — it's what
    // silently produces a "100% margin" that looks great but is actually
    // just missing data, not real profitability.
    let productHasAnyCogsData = false;

    (['Inventory', 'Materials & Supplies', 'Packaging'] as const).forEach((category) => {
      const categoryExpenses = expenses.filter((e) => e.category === category && e.productId === product.id && e.unitsPurchased && e.unitsPurchased > 0);
      if (categoryExpenses.length > 0) productHasAnyCogsData = true;

      const batches: FifoBatch[] = categoryExpenses
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({ unitCost: e.amount / (e.unitsPurchased as number), unitsRemaining: e.unitsPurchased as number }));

      const { cost, unmatchedUnits } = consumeFifoBatches(batches, unitsSold);
      totalCogs += cost;
      if (unmatchedUnits > 0) hasUnmatchedUnits = true;
    });

    if (!productHasAnyCogsData) zeroCogsProducts.push(product.name);
  }

  return { cogs: totalCogs, hasUnmatchedUnits, zeroCogsProducts };
}

export function calculateBusinessMetrics(
  orders: Order[],
  expenses: Expense[],
  products: Product[],
  completedLessonIds: string[] = []
): BusinessMetrics {
  // Filter active and non-cancelled orders for this business
  const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');

  // Total Revenue (all non-cancelled orders, any fulfillment stage)
  const revenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Total Expenses (all logged cash outflows, every category)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Gross Profit — Completed orders only, matched against FIFO cost of
  // goods. Net profit and operating-expense allocation are deliberately no
  // longer tracked: opex doesn't map cleanly to "per unit sold," so mixing
  // it into a margin number was misleading more than it was informative.
  const completedOrdersList = orders.filter((o) => o.orderStatus === 'Completed');
  const completedRevenue = completedOrdersList.reduce((sum, o) => sum + o.totalAmount, 0);
  const { cogs, hasUnmatchedUnits, zeroCogsProducts } = calculateFifoCogs(products, expenses, completedOrdersList);
  const hasIncompleteCogsData = hasUnmatchedUnits || zeroCogsProducts.length > 0;
  const grossProfit = completedRevenue - cogs;
  const grossProfitMargin = completedRevenue > 0 ? Math.round((grossProfit / completedRevenue) * 100 * 10) / 10 : 0;

  // Order & Units statistics
  const orderCount = validOrders.length;
  const unitsSold = validOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const averageOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Inventory analytics
  const inventoryValue = products.reduce((sum, p) => sum + p.inventoryCount * p.costPrice, 0);
  const lowStockProducts = products.filter((p) => p.inventoryCount <= 6 && p.isAvailable);

  // Calculate Expense Breakdown by Category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });

  const packagingExpense = expenseByCategory['Packaging'] || 0;
  const packagingRatio = totalExpenses > 0 ? (packagingExpense / totalExpenses) * 100 : 0;

  // Health Score Algorithm (0 - 100)
  // 1. Margin Score (35 pts) — now Gross Margin, since net margin is no
  // longer tracked at all.
  let marginScore = 0;
  if (grossProfitMargin >= 45) marginScore = 35;
  else if (grossProfitMargin >= 35) marginScore = 30;
  else if (grossProfitMargin >= 25) marginScore = 24;
  else if (grossProfitMargin >= 15) marginScore = 16;
  else if (grossProfitMargin > 0) marginScore = 10;
  else marginScore = 0;

  // 2. Expense Efficiency Score (25 pts)
  let expenseScore = 25;
  if (packagingRatio > 25) expenseScore -= 10;
  else if (packagingRatio > 18) expenseScore -= 5;
  if (totalExpenses > revenue && revenue > 0) expenseScore -= 10;

  // 3. Order & Fulfillment Score (20 pts)
  const fulfillmentRate = orderCount > 0 ? completedOrdersList.length / orderCount : 1;
  const orderScore = Math.round(fulfillmentRate * 15) + (orderCount > 0 ? 5 : 0);

  // 4. Inventory Health (10 pts)
  const outOfStockCount = products.filter((p) => p.inventoryCount === 0).length;
  let inventoryScore = 10;
  if (outOfStockCount > 0) inventoryScore -= 5;
  if (lowStockProducts.length > 2) inventoryScore -= 3;
  inventoryScore = Math.max(0, inventoryScore);

  // 5. Academy & Learning Engagement (10 pts)
  const academyScore = Math.min(10, completedLessonIds.length * 3);

  const rawScore = marginScore + expenseScore + orderScore + inventoryScore + academyScore;
  const healthScore = Math.min(100, Math.max(10, rawScore));

  let healthStatus: BusinessMetrics['healthStatus'] = 'Growing Seedling';
  if (healthScore >= 80) healthStatus = 'Thriving Sprout';
  else if (healthScore >= 65) healthStatus = 'Growing Seedling';
  else if (healthScore >= 50) healthStatus = 'Sprouting Sprout';
  else healthStatus = 'Needs Nurturing';

  // Rule-based Actionable Recommendations Engine
  const insights: HealthInsight[] = [];

  // Insight 1: Packaging cost alert (Key differentiator from prompt!)
  if (packagingRatio >= 20) {
    insights.push({
      id: 'ins-pkg',
      type: 'warning',
      title: `Packaging is ${Math.round(packagingRatio)}% of total expenses`,
      description: `Your packaging expenses are currently ₱${packagingExpense.toLocaleString()}, which is above the healthy 12-15% benchmark for student businesses.`,
      metricImpact: `-₱${Math.round(packagingExpense * 0.35).toLocaleString()} potential monthly savings`,
      recommendedAction: 'Switch to unbranded kraft boxes with a custom rubber stamp (saves up to 60%) or buy boxes in bulk with batchmates in Divisoria.',
      actionTab: 'expenses',
      category: 'Packaging',
    });
  }

  // Insight 2: Gross Margin Health (Completed orders only)
  if (completedRevenue > 0 && grossProfitMargin < 30) {
    insights.push({
      id: 'ins-margin',
      type: 'warning',
      title: `Gross margin is ${grossProfitMargin}% (Below 35% Target)`,
      description: 'Your gross margin leaves little room for unexpected ingredient price spikes or delivery fares.',
      metricImpact: 'Protect your student allowance from sudden cost inflation',
      recommendedAction: 'Review your product Cost of Goods Sold (COGS). Consider adjusting individual product prices by ₱15–₱25 or bundling items.',
      actionTab: 'products',
      category: 'Margin',
    });
  } else if (completedRevenue > 0 && grossProfitMargin >= 35 && zeroCogsProducts.length === 0) {
    // Deliberately excludes the zeroCogsProducts case above — a margin
    // propped up by missing cost data isn't "strong," and showing both
    // insights together would be a contradictory good-news/bad-news pair.
    insights.push({
      id: 'ins-margin-good',
      type: 'positive',
      title: `Strong Gross Margin (${grossProfitMargin}%)`,
      description: 'You are retaining healthy profit from your completed campus orders! Your pricing covers direct product costs well.',
      recommendedAction: 'Keep your current supplier rates locked in and reinvest surplus into upcoming batch drops.',
      actionTab: 'analytics',
      category: 'Margin',
    });
  }

  // Insight 2b: Incomplete cost data — flagged so a high Gross Margin
  // doesn't quietly mislead someone who just hasn't logged all their
  // inventory/packaging purchases yet.
  if (hasUnmatchedUnits) {
    insights.push({
      id: 'ins-cogs-gap',
      type: 'tip',
      title: 'Some sold units have no logged purchase cost yet',
      description: "Your Gross Margin may look higher than it really is until every batch of materials or packaging you've bought is logged with its unit count.",
      recommendedAction: 'Log any missing "Inventory," "Materials & Supplies," or "Packaging" expenses with the product and number of units they were for.',
      actionTab: 'expenses',
      category: 'Margin',
    });
  }

  // Insight 2c: Zero cost data at all — worse than a partial gap, since
  // it's exactly what produces a misleadingly "perfect" 100% margin
  // instead of a merely-optimistic one.
  if (zeroCogsProducts.length > 0) {
    insights.push({
      id: 'ins-cogs-zero',
      type: 'warning',
      title: `${zeroCogsProducts.length} Product${zeroCogsProducts.length > 1 ? 's' : ''} ${zeroCogsProducts.length > 1 ? 'Have' : 'Has'} No Cost Data Yet`,
      description: "Your Gross Margin is currently treating these as free to make, which inflates it. Log their materials/packaging purchases to see a real number.",
      items: zeroCogsProducts.map((name) => ({ label: name, meta: 'No cost logged', urgent: true })),
      recommendedAction: 'Log an "Inventory," "Materials & Supplies," or "Packaging" expense for each, with the product and number of units.',
      actionTab: 'expenses',
      category: 'Margin',
    });
  }

  // Insight 3: Low-stock warning
  if (lowStockProducts.length > 0) {
    insights.push({
      id: 'ins-stock',
      type: 'action_needed',
      title: `${lowStockProducts.length} Product${lowStockProducts.length > 1 ? 's' : ''} Running Low on Stock`,
      description: 'You risk missing campus pre-orders for the next meetup drop.',
      items: lowStockProducts.map((p) => ({
        label: p.name,
        meta: p.inventoryCount === 0 ? 'Out of stock' : `${p.inventoryCount} left`,
        urgent: p.inventoryCount === 0,
      })),
      recommendedAction: 'Restock raw supplies or bake/craft a new batch before your next campus meetup schedule.',
      actionTab: 'products',
      category: 'Inventory',
    });
  }

  // Insight 4: Pending orders check
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing');
  if (pendingOrders.length > 0) {
    insights.push({
      id: 'ins-orders-pending',
      type: 'action_needed',
      title: `${pendingOrders.length} Order${pendingOrders.length > 1 ? 's' : ''} Awaiting Preparation / Pickup`,
      description: `Total of ₱${pendingOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()} in active student orders waiting for your action.`,
      recommendedAction: 'Mark orders as "Ready for Pickup" and notify buyers of their designated campus meetup spot.',
      actionTab: 'orders',
      category: 'Volume',
    });
  }

  // Insight 5: Academy learning prompt
  if (completedLessonIds.length < 2) {
    insights.push({
      id: 'ins-academy',
      type: 'tip',
      title: 'Level Up Your Sprout Health Score with Academy Lessons',
      description: 'Complete practical 5-minute modules on "Pricing for Real Profit" and "Campus Marketing Drops" to earn badges and boost your Health Score.',
      recommendedAction: 'Open the Sprout Academy tab to take a 2-minute quiz and earn the Master Pricer badge.',
      actionTab: 'academy',
      category: 'Cashflow',
    });
  }

  return {
    revenue,
    expenses: totalExpenses,
    completedRevenue,
    cogs,
    grossProfit,
    grossProfitMargin,
    hasIncompleteCogsData,
    orderCount,
    unitsSold,
    averageOrderValue,
    inventoryValue,
    lowStockCount: lowStockProducts.length,
    healthScore,
    healthStatus,
    healthScoreBreakdown: {
      marginScore,
      expenseScore,
      orderScore,
      inventoryScore,
      academyScore,
    },
    insights,
  };
}
