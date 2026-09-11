import React, { useState } from 'react';
import {
  Plus,
  Receipt,
  Trash2,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  Tag,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { useShop } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { formatPHP } from '../../utils/analytics';

export const ExpenseTracker: React.FC = () => {
  const { sellerExpenses, addExpense, deleteExpense, activeBusinessMetrics } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(350);
  const [category, setCategory] = useState<ExpenseCategory>('Materials & Supplies');
  const [supplierOrStore, setSupplierOrStore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const categories: ExpenseCategory[] = [
    'Materials & Supplies',
    'Packaging',
    'Logistics & Campus Fare',
    'Marketing & Promo',
    'Stall & Fair Booth',
    'Tools & Equipment',
    'Other Expenses',
  ];

  // Calculate expense breakdown
  const categoryTotals: Record<string, number> = {};
  sellerExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const totalExpense = sellerExpenses.reduce((sum, e) => sum + e.amount, 0);
  const packagingTotal = categoryTotals['Packaging'] || 0;
  const packagingRatio = totalExpense > 0 ? Math.round((packagingTotal / totalExpense) * 100) : 0;

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addExpense({
      description,
      amount: Number(amount),
      category,
      supplierOrStore,
      date,
      notes,
    });

    setDescription('');
    setAmount(250);
    setSupplierOrStore('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
            Expense & Cashflow Logger
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            Record packaging, ingredients, fare, and stalls to keep profit calculations accurate
          </p>
        </div>

        <button
          id="log-expense-btn"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-extrabold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Expense (₱)</span>
        </button>
      </div>

      {/* Expense Insights Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C7A6D]">Total Recorded Expenses</span>
          <div className="text-2xl font-black text-[#8C3A27] font-['Nunito',sans-serif] mt-1">
            {formatPHP(totalExpense)}
          </div>
          <p className="text-[11px] text-[#7A6B5F] mt-1">{sellerExpenses.length} transaction entries</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#8C7A6D]">Packaging Share Ratio</span>
            {packagingRatio >= 20 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FFF0E6] text-[#EA580C]">
                High
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-[#3B2F27] font-['Nunito',sans-serif] mt-1">
            {packagingRatio}%
          </div>
          <p className="text-[11px] text-[#7A6B5F] mt-1">
            {formatPHP(packagingTotal)} (Target: &lt; 15%)
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#8C7A6D]">Packaging Cost Rule</span>
          <p className="text-xs text-[#6E5D52] leading-relaxed">
            💡 Buying kraft boxes in bulk at Divisoria or using a rubber logo stamp can save up to 60% on unboxing costs!
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-[#EDE4D8] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#EDE4D8] bg-[#FAF7F2] flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#7A6B5F]">
            Recorded Business Outflows
          </h3>
          <span className="text-xs text-[#8C7A6D]">Sorted by date</span>
        </div>

        {sellerExpenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8C7A6D]">
            No expenses recorded yet. Click "Log New Expense" to record your supplies.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#8C7A6D] text-[10px] uppercase font-bold border-b border-[#EDE4D8]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Store / Supplier</th>
                  <th className="py-3 px-4">Amount (₱)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFEB]">
                {sellerExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FFFDF7] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#7A6B5F] whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#3B2F27]">{exp.description}</p>
                      {exp.notes && (
                        <p className="text-[10px] text-[#8C7A6D] italic">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        exp.category === 'Packaging'
                          ? 'bg-[#FFF0E6] text-[#C2410C]'
                          : exp.category === 'Materials & Supplies'
                          ? 'bg-[#EBFBF0] text-[#065F46]'
                          : 'bg-[#FAF4ED] text-[#6E5D52]'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6E5D52]">
                      {exp.supplierOrStore || '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#8C3A27] text-xs">
                      {formatPHP(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.description}"?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="p-1.5 text-[#A39284] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A231E]/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#F0E9DF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFD3BA] text-[#7A2E1E] flex items-center justify-center font-bold">
                  🧾
                </div>
                <h3 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                  Log Business Expense
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[#7A6B5F] hover:bg-[#F2EAE0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 50 pcs Kraft Cookie Boxes & Custom Stickers"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Amount (₱ PHP)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-sm font-bold text-[#8C3A27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Expense Category
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Supplier / Store / Route
                  </label>
                  <input
                    type="text"
                    value={supplierOrStore}
                    onChange={(e) => setSupplierOrStore(e.target.value)}
                    placeholder="e.g. Divisoria Tutuban, Shopee, S&R"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bought with roommate to split bulk discount"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                />
              </div>

              <div className="pt-3 border-t border-[#F0E9DF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#54453C] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Expense Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
