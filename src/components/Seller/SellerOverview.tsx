import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Zap,
  BarChart3,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { useShop, useSession } from '../../context/AppContext';
import { formatPHP } from '../../utils/analytics';
import { HealthInsight } from '../../types';
import { InfoTip } from '../InfoTip';

export const SellerOverview: React.FC = () => {
  const {
    activeBusiness,
    activeBusinessMetrics,
    sellerOrders,
    sellerExpenses,
    sellerProducts,
  } = useShop();
  const { setSellerTab, setCurrentView } = useSession();

  const {
    revenue,
    expenses,
    profit,
    profitMargin,
    orderCount,
    healthScore,
    healthStatus,
    healthScoreBreakdown,
    insights,
    unitsSold,
    lowStockCount
  } = activeBusinessMetrics;

  const isProfitPositive = profit >= 0;

  // Compute category expense shares
  const expenseCategories: Record<string, number> = {};
  sellerExpenses.forEach((e) => {
    expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
  });

  const packagingTotal = expenseCategories['Packaging'] || 0;
  const packagingRatio = expenses > 0 ? Math.round((packagingTotal / expenses) * 100) : 0;
  const suppliesTotal = expenseCategories['Materials & Supplies'] || 0;
  const suppliesRatio = expenses > 0 ? Math.round((suppliesTotal / expenses) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={activeBusiness.logo}
            alt={activeBusiness.name}
            className="w-14 h-14 rounded-2xl object-cover border border-[#EDE4D8] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#3B2F27] font-['Nunito',sans-serif]">
                {activeBusiness.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9E6] text-[#194E3B] border border-[#EDE4D8]">
                📍 {activeBusiness.university}
              </span>
            </div>
            <p className="text-xs text-[#6B5B4F] mt-0.5">
              Live campus commerce automatically updates your health metrics and profit score.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards (Revenue, Expenses, Profit, Margin) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C7A6D]">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBFBF0] text-[#10B981] flex items-center justify-center text-xs font-black">
              ₱
            </div>
          </div>
          <div className="text-2xl font-black text-[#207559] font-['Nunito',sans-serif]">
            {formatPHP(revenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#7A6B5F]">
            <span>{orderCount} orders placed</span>
            <span className="text-[#207559] font-semibold">{unitsSold} units</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C7A6D]">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF0E6] text-[#E07A5F] flex items-center justify-center text-xs font-black">
              📉
            </div>
          </div>
          <div className="text-2xl font-black text-[#8C3A27] font-['Nunito',sans-serif]">
            {formatPHP(expenses)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#7A6B5F]">
            <span>{sellerExpenses.length} logged records</span>
            <span className="text-[#8C3A27] font-semibold">{packagingRatio}% packaging</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C7A6D] flex items-center gap-1">
              Net Profit
              <InfoTip text="What you actually keep after paying all expenses. Formula: Total Revenue − Total Expenses." />
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
              isProfitPositive ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}>
              {isProfitPositive ? '💰' : '⚠️'}
            </div>
          </div>
          <div className={`text-2xl font-black font-['Nunito',sans-serif] ${
            isProfitPositive ? 'text-[#194E3B]' : 'text-[#991B1B]'
          }`}>
            {formatPHP(profit)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#7A6B5F]">
            <span>Revenue - Expenses</span>
            <span className={isProfitPositive ? 'text-[#207559] font-bold' : 'text-[#991B1B] font-bold'}>
              {isProfitPositive ? 'Profitable' : 'Deficit'}
            </span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C7A6D] flex items-center gap-1">
              Profit Margin
              <InfoTip text="The % of each sale you keep as profit after costs. Formula: (Net Profit ÷ Revenue) × 100. Higher is better — 35%+ is a healthy target for student businesses." />
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
              profitMargin >= 35 ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-[#FEF3C7] text-[#92400E]'
            }`}>
              %
            </div>
          </div>
          <div className="text-2xl font-black text-[#3B2F27] font-['Nunito',sans-serif] flex items-baseline gap-1">
            <span>{profitMargin}%</span>
            <span className="text-[11px] text-[#8C7A6D] font-medium">
              {profitMargin >= 35 ? 'Healthy' : 'Needs boost'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#7A6B5F]">
            <span>Campus Target: 35%+</span>
            <span className="font-semibold text-[#207559]">
              {profitMargin >= 35 ? '✅ On Target' : '⚠️ Below 35%'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Health Score Card & Recommendations Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7">
        
        {/* Left Col: Business Health Score (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <div>
                  <h3 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif] flex items-center gap-1.5">
                    Business Health Score
                    <InfoTip align="right" text="A 0–100 score blending 5 things: profit margin (35 pts), expense efficiency (25 pts), order fulfillment (20 pts), inventory readiness (10 pts), and Sprout Academy progress (10 pts). It's a quick check on your shop's fundamentals, not just how much you've sold." />
                  </h3>
                  <p className="text-[11px] text-[#8C7A6D]">
                    Algorithmic health rating from student commerce data
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                healthScore >= 80
                  ? 'bg-[#B8E6D5] text-[#194E3B]'
                  : healthScore >= 60
                  ? 'bg-[#FFD3BA] text-[#7A2E1E]'
                  : 'bg-[#FEE2E2] text-[#991B1B]'
              }`}>
                {healthStatus}
              </span>
            </div>

            {/* Health Score Visual representation */}
            <div className="my-6 p-6 rounded-3xl bg-[#FFF9E6] border border-[#EDE4D8] text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-black text-[#194E3B] font-['Nunito',sans-serif] tracking-tight">
                  {healthScore}
                  <span className="text-xl text-[#8C7A6D] font-bold">/100</span>
                </div>
                <p className="text-xs font-bold text-[#6B5B4F] mt-1">
                  {healthScore >= 80
                    ? 'Superb! High margin & steady campus order velocity'
                    : healthScore >= 60
                    ? 'Good foundation! Margin optimization will unlock growth'
                    : 'Caution: Expenses are high relative to unit pricing'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 w-full bg-white h-3 rounded-full overflow-hidden border border-[#EDE4D8]">
                <div
                  className="bg-[#B8E6D5] h-full rounded-full transition-all duration-500"
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>

            {/* Scoring Factor Breakdown */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A796D]">
                Score Components Breakdown
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#54453C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#207559]" />
                    <span>Profit Margin Ratio (Max 35 pts)</span>
                    <InfoTip align="right" text="Rewards a higher profit margin. 45%+ margin scores the full 35 pts; it tapers down the lower your margin gets, and hits 0 if you're not profitable." />
                  </span>
                  <span className="font-bold">{healthScoreBreakdown.marginScore}/35</span>
                </div>

                <div className="flex justify-between items-center text-[#54453C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
                    <span>Packaging & Sourcing Efficiency (Max 25 pts)</span>
                    <InfoTip align="right" text="Starts at 25 pts, then loses points if packaging costs eat up too much of your total expenses (over 18% or 25%), or if you're spending more than you earn." />
                  </span>
                  <span className="font-bold">{healthScoreBreakdown.expenseScore}/25</span>
                </div>

                <div className="flex justify-between items-center text-[#54453C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    <span>Order Fulfillment Velocity (Max 20 pts)</span>
                    <InfoTip align="right" text="Rewards actually completing orders, not just receiving them. Based on the share of your orders marked Completed, plus a small bonus just for having order activity." />
                  </span>
                  <span className="font-bold">{healthScoreBreakdown.orderScore}/20</span>
                </div>

                <div className="flex justify-between items-center text-[#54453C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Inventory Buffer & Readiness (Max 10 pts)</span>
                    <InfoTip align="right" text="Starts at 10 pts, then loses points if any product is out of stock, or if more than 2 products are running low (6 units or fewer)." />
                  </span>
                  <span className="font-bold">{healthScoreBreakdown.inventoryScore}/10</span>
                </div>

                <div className="flex justify-between items-center text-[#54453C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    <span>Academy Knowledge Mastery (Max 10 pts)</span>
                    <InfoTip align="right" text="Earn 3 pts for every Sprout Academy lesson you complete, capped at 10 pts. The fastest factor to improve — finish a lesson to see it move." />
                  </span>
                  <span className="font-bold">{healthScoreBreakdown.academyScore}/10</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSellerTab('academy')}
            className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#EADBCE] text-[#54453C] text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Learn how to boost score in Academy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Col: Rule-Based & AI Recommendations Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFD3BA] text-[#7A2E1E] flex items-center justify-center text-base">
                  🦉
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                    Actionable Insights & Recommendations
                  </h3>
                  <p className="text-[11px] text-[#8C7A6D]">
                    Rule-based intelligence generated from your exact numbers
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B8E6D5]/60 text-[#194E3B] px-2.5 py-1 rounded-lg">
                Live Analysis
              </span>
            </div>

            {/* List of rule-based insights */}
            <div className="space-y-3">
              {insights.map((ins) => {
                const isWarning = ins.type === 'warning';
                const isAction = ins.type === 'action_needed';
                const isPositive = ins.type === 'positive';

                return (
                  <div
                    key={ins.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isWarning
                        ? 'bg-[#FFF9F5] border-[#FED7AA]'
                        : isAction
                        ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                        : isPositive
                        ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                        : 'bg-[#FAF7F2] border-[#EDE4D8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isWarning && <AlertTriangle className="w-4 h-4 text-[#EA580C]" />}
                          {isAction && <Zap className="w-4 h-4 text-[#16A34A]" />}
                          {isPositive && <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />}
                          {!isWarning && !isAction && !isPositive && (
                            <Lightbulb className="w-4 h-4 text-[#CA8A04]" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-[#3B2F27]">
                            {ins.title}
                          </h4>
                          <p className="text-[11px] text-[#6E5D52] leading-relaxed">
                            {ins.description}
                          </p>
                          {ins.metricImpact && (
                            <p className="text-[11px] font-bold text-[#EA580C]">
                              💡 Impact: {ins.metricImpact}
                            </p>
                          )}
                        </div>
                      </div>

                      {ins.actionTab && (
                        <button
                          onClick={() => {
                            if (ins.actionTab === 'academy') {
                              setCurrentView('academy');
                            } else {
                              setSellerTab(ins.actionTab as any);
                            }
                          }}
                          className="shrink-0 px-2.5 py-1 bg-white hover:bg-[#FAF7F2] border border-[#E5DACD] text-[#3B2F27] text-[11px] font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Resolve →
                        </button>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                      <span className="text-[#54453C] font-semibold">
                        Action: {ins.recommendedAction}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense Distribution Visual Breakdown */}
          <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-[#3B2F27] uppercase tracking-wider flex items-center justify-between">
              <span>Expense Allocation Breakdown</span>
              <button
                onClick={() => setSellerTab('expenses')}
                className="text-[11px] text-[#207559] hover:underline font-semibold"
              >
                + Log Expense
              </button>
            </h3>

            {/* Multi-segment bar */}
            <div className="w-full bg-[#FAF7F2] h-3 rounded-full overflow-hidden flex border border-[#EDE4D8]">
              <div
                style={{ width: `${suppliesRatio}%` }}
                className="bg-[#207559] h-full"
                title={`Supplies: ${suppliesRatio}%`}
              />
              <div
                style={{ width: `${packagingRatio}%` }}
                className="bg-[#E07A5F] h-full"
                title={`Packaging: ${packagingRatio}%`}
              />
              <div
                style={{ width: `${Math.max(0, 100 - suppliesRatio - packagingRatio)}%` }}
                className="bg-[#A8D8EA] h-full"
                title="Other Expenses"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#6E5D52] pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#207559]" />
                <span>Materials & Raw Ingredients ({suppliesRatio}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]" />
                <span>Packaging Boxes & Stickers ({packagingRatio}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A8D8EA]" />
                <span>Fare & Stall Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
