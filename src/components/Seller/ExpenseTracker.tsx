import React, { useState } from 'react';
import {
  Plus,
  Receipt,
  Trash2,
  Pencil,
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
import { Icon } from '../Icon';

const COGS_CATEGORIES: ExpenseCategory[] = ['Inventory', 'Materials & Supplies', 'Packaging'];

const EMPTY_FORM = {
  description: '',
  amount: 350,
  category: 'Inventory' as ExpenseCategory,
  supplierOrStore: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  productId: '',
  unitsPurchased: '' as number | '',
};

export const ExpenseTracker: React.FC = () => {
  const { sellerExpenses, sellerProducts, addExpense, updateExpense, deleteExpense, activeBusinessMetrics } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form State
  const [description, setDescription] = useState(EMPTY_FORM.description);
  const [amount, setAmount] = useState<number>(EMPTY_FORM.amount);
  const [category, setCategory] = useState<ExpenseCategory>(EMPTY_FORM.category);
  const [supplierOrStore, setSupplierOrStore] = useState(EMPTY_FORM.supplierOrStore);
  const [date, setDate] = useState(EMPTY_FORM.date);
  const [notes, setNotes] = useState(EMPTY_FORM.notes);
  const [productId, setProductId] = useState(EMPTY_FORM.productId);
  const [unitsPurchased, setUnitsPurchased] = useState<number | ''>(EMPTY_FORM.unitsPurchased);
  const [formError, setFormError] = useState('');

  const isCogsCategory = COGS_CATEGORIES.includes(category);

  const categories: ExpenseCategory[] = [
    'Inventory',
    'Packaging',
    'Materials & Supplies',
    'Transportation',
    'Marketing',
    'Rent',
    'Tools & Equipment',
    'Other Expenses',
  ];

  const resetForm = () => {
    setDescription(EMPTY_FORM.description);
    setAmount(EMPTY_FORM.amount);
    setCategory(EMPTY_FORM.category);
    setSupplierOrStore(EMPTY_FORM.supplierOrStore);
    setDate(EMPTY_FORM.date);
    setNotes(EMPTY_FORM.notes);
    setProductId(EMPTY_FORM.productId);
    setUnitsPurchased(EMPTY_FORM.unitsPurchased);
    setFormError('');
    setEditingExpenseId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setDescription(exp.description);
    setAmount(exp.amount);
    setCategory(exp.category);
    setSupplierOrStore(exp.supplierOrStore || '');
    setDate(exp.date);
    setNotes(exp.notes || '');
    setProductId(exp.productId || '');
    setUnitsPurchased(exp.unitsPurchased ?? '');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Calculate expense breakdown
  const categoryTotals: Record<string, number> = {};
  sellerExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const sortedCategoryTotals = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const totalExpense = sellerExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!description || !amount) return;

    if (isCogsCategory) {
      if (!productId) {
        setFormError('Pick which product this was bought for — Gross Profit is matched per product.');
        return;
      }
      if (!unitsPurchased || unitsPurchased <= 0) {
        setFormError('Enter how many units this expense bought (e.g. 500 bags).');
        return;
      }
    }

    const linkedProduct = isCogsCategory ? sellerProducts.find((p) => p.id === productId) : undefined;

    const expenseFields = {
      description,
      amount: Number(amount),
      category,
      supplierOrStore,
      date,
      notes,
      productId: isCogsCategory ? productId : undefined,
      productName: linkedProduct?.name,
      unitsPurchased: isCogsCategory ? Number(unitsPurchased) : undefined,
    };

    if (editingExpenseId) {
      const existing = sellerExpenses.find((exp) => exp.id === editingExpenseId);
      if (existing) {
        updateExpense({ ...existing, ...expenseFields });
      }
    } else {
      addExpense(expenseFields);
    }

    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
            Expense Logger/Tracker
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            Record packaging, ingredients, and transportation expenses to keep profit calculations accurate
          </p>
        </div>

        <button
          id="log-expense-btn"
          onClick={openAddModal}
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

        <div className="bg-white p-5 rounded-3xl border border-[#EDE4D8] shadow-xs sm:col-span-2">
          <span className="text-[11px] font-bold text-[#8C7A6D]">Expense Breakdown by Category</span>
          {sortedCategoryTotals.length === 0 ? (
            <p className="text-xs text-[#8C7A6D] mt-2">No expenses logged yet.</p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {sortedCategoryTotals.map(([cat, amt]) => {
                const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-[#3B2F27]">{cat}</span>
                      <span className="text-[#7A6B5F]">{formatPHP(amt)} · {pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B8E6D5]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                      {exp.productName && exp.unitsPurchased && (
                        <p className="text-[10px] text-[#207559] font-semibold">
                          {exp.productName} · {exp.unitsPurchased} units (₱{Math.round((exp.amount / exp.unitsPurchased) * 100) / 100}/unit)
                        </p>
                      )}
                      {exp.notes && (
                        <p className="text-[10px] text-[#8C7A6D] italic">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        exp.category === 'Packaging'
                          ? 'bg-[#FFF0E6] text-[#C2410C]'
                          : exp.category === 'Materials & Supplies' || exp.category === 'Inventory'
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-[#A39284] hover:text-[#194E3B] hover:bg-[#EBFBF0] rounded-lg transition-colors cursor-pointer"
                          title="Edit expense"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
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
                      </div>
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
                  <Icon name="sellerOS-expenses" className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                  {editingExpenseId ? 'Edit Business Expense' : 'Log Business Expense'}
                </h3>
              </div>

              <button
                onClick={closeModal}
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
                    onChange={(e: any) => { setCategory(e.target.value); setFormError(''); }}
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

              {isCogsCategory && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#F2FBF7] border border-[#9FD9C3] rounded-xl">
                  <div>
                    <label className="block text-[11px] font-bold text-[#194E3B] mb-1">
                      Product
                    </label>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#9FD9C3] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                    >
                      <option value="">Select a product...</option>
                      {sellerProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#194E3B] mb-1">
                      No. of Units
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={unitsPurchased}
                      onChange={(e) => setUnitsPurchased(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2 bg-white border border-[#9FD9C3] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                    />
                  </div>
                  <p className="col-span-2 text-[10px] text-[#194E3B] leading-relaxed">
                    Which product this bought, and how many units — this is what lets Gross Profit match cost to units actually sold.
                  </p>
                </div>
              )}

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

              {formError && (
                <p className="text-[11px] font-semibold text-[#991B1B] bg-[#FEE2E2] px-3 py-2 rounded-xl">{formError}</p>
              )}

              <div className="pt-3 border-t border-[#F0E9DF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#54453C] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingExpenseId ? 'Save Changes' : 'Save Expense Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
