import { Order, Expense, Product, BusinessMetrics, HealthInsight } from '../types';

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateBusinessMetrics(
  orders: Order[],
  expenses: Expense[],
  products: Product[],
  completedLessonIds: string[] = []
): BusinessMetrics {
  // Filter active and non-cancelled orders for this business
  const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
  
  // Total Revenue
  const revenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit
  const profit = revenue - totalExpenses;

  // Profit Margin (%)
  const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100 * 10) / 10 : 0;

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
  // 1. Margin Score (35 pts)
  let marginScore = 0;
  if (profitMargin >= 45) marginScore = 35;
  else if (profitMargin >= 35) marginScore = 30;
  else if (profitMargin >= 25) marginScore = 24;
  else if (profitMargin >= 15) marginScore = 16;
  else if (profitMargin > 0) marginScore = 10;
  else marginScore = 0;

  // 2. Expense Efficiency Score (25 pts)
  let expenseScore = 25;
  if (packagingRatio > 25) expenseScore -= 10;
  else if (packagingRatio > 18) expenseScore -= 5;
  if (totalExpenses > revenue && revenue > 0) expenseScore -= 10;

  // 3. Order & Fulfillment Score (20 pts)
  const completedOrders = orders.filter((o) => o.orderStatus === 'Completed').length;
  const fulfillmentRate = orderCount > 0 ? completedOrders / orderCount : 1;
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

  // Insight 2: Profit Margin Health
  if (profitMargin < 30 && revenue > 0) {
    insights.push({
      id: 'ins-margin',
      type: 'warning',
      title: `Profit margin is ${profitMargin}% (Below 35% Target)`,
      description: 'Your profit margin leaves little room for unexpected ingredient price spikes or delivery fares.',
      metricImpact: 'Protect your student allowance from sudden cost inflation',
      recommendedAction: 'Review your product Cost of Goods Sold (COGS). Consider adjusting individual product prices by ₱15–₱25 or bundling items.',
      actionTab: 'products',
      category: 'Margin',
    });
  } else if (profitMargin >= 35) {
    insights.push({
      id: 'ins-margin-good',
      type: 'positive',
      title: `Strong Profit Margin (${profitMargin}%)`,
      description: 'You are retaining healthy profit from your campus orders! Your pricing covers all direct material costs well.',
      recommendedAction: 'Keep your current supplier rates locked in and reinvest surplus into upcoming batch drops.',
      actionTab: 'analytics',
      category: 'Margin',
    });
  }

  // Insight 3: Low-stock warning
  if (lowStockProducts.length > 0) {
    const names = lowStockProducts.map((p) => `"${p.name}" (${p.inventoryCount} left)`).join(', ');
    insights.push({
      id: 'ins-stock',
      type: 'action_needed',
      title: `${lowStockProducts.length} Product${lowStockProducts.length > 1 ? 's' : ''} Running Low on Stock`,
      description: `Low inventory for: ${names}. You risk missing campus pre-orders for the next meetup drop.`,
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
    profit,
    profitMargin,
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
