import React, { useState } from 'react';
import {
  Plus,
  Package,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
  TrendingUp,
  Calculator,
  X,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Upload
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { formatPHP } from '../../utils/analytics';
import { InfoTip } from '../InfoTip';
import { CalendarClock, Lock } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const {
    activeBusiness,
    sellerProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    hasSproutPlus,
    openSubscriptionPage,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(150);
  const [costPrice, setCostPrice] = useState<number>(60);
  const [category, setCategory] = useState<ProductCategory>('Bakes & Treats');
  const [inventoryCount, setInventoryCount] = useState<number>(20);
  const [unit, setUnit] = useState('Box of 4');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80');
  const [tagsInput, setTagsInput] = useState('Bestseller, Fresh');
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderReleaseDate, setPreOrderReleaseDate] = useState('');

  // Built-in Pricing & Margin Calculator State
  const [calcMaterialsCost, setCalcMaterialsCost] = useState<number>(45);
  const [calcPackagingCost, setCalcPackagingCost] = useState<number>(15);
  const [calcTargetMargin, setCalcTargetMargin] = useState<number>(45); // 45% margin target

  const calculatedTotalCOGS = calcMaterialsCost + calcPackagingCost;
  const calculatedSuggestedPrice =
    calcTargetMargin < 100
      ? Math.round(calculatedTotalCOGS / (1 - calcTargetMargin / 100))
      : calculatedTotalCOGS * 2;

  const handleApplyCalculatedPrice = () => {
    setCostPrice(calculatedTotalCOGS);
    setPrice(calculatedSuggestedPrice);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(180);
    setCostPrice(75);
    setCategory(activeBusiness.category);
    setInventoryCount(20);
    setUnit('Piece');
    setImageUrl('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80');
    setTagsInput('StudentMade, CampusFresh');
    setIsPreOrder(false);
    setPreOrderReleaseDate('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setCostPrice(p.costPrice);
    setCategory(p.category);
    setInventoryCount(p.inventoryCount);
    setUnit(p.unit);
    setImageUrl(p.imageUrl);
    setTagsInput(p.tags.join(', '));
    setIsPreOrder(p.isPreOrder || false);
    setPreOrderReleaseDate(p.preOrderReleaseDate || '');
    setIsAddModalOpen(true);
  };

  const handleTogglePreOrder = () => {
    if (!hasSproutPlus) {
      openSubscriptionPage();
      return;
    }
    setIsPreOrder((prev) => !prev);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const preOrderFields = hasSproutPlus
      ? { isPreOrder, preOrderReleaseDate: isPreOrder ? (preOrderReleaseDate || null) : null }
      : { isPreOrder: false, preOrderReleaseDate: null };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        description,
        price: Number(price),
        costPrice: Number(costPrice),
        category,
        inventoryCount: Number(inventoryCount),
        unit,
        imageUrl,
        tags,
        university: activeBusiness.university,
        ...preOrderFields,
      });
    } else {
      addProduct({
        name,
        description,
        price: Number(price),
        costPrice: Number(costPrice),
        category,
        inventoryCount: Number(inventoryCount),
        unit,
        imageUrl,
        tags,
        isAvailable: true,
        university: activeBusiness.university,
        ...preOrderFields,
      });
    }

    setIsAddModalOpen(false);
  };

  const categories: ProductCategory[] = [
    'Bakes & Treats',
    'Crochet & Crafts',
    'Stickers & Stationery',
    'Eco & Planters',
    'Thrift & Fashion',
    'Tech & Accessories',
    'School Supplies',
    'Art & Prints',
  ];

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
            Product Catalog & Unit Margins
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            Manage products, track Cost of Goods Sold (COGS), and calculate margins
          </p>
        </div>

        <button
          id="add-new-product-btn"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-extrabold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer btn-bouncy"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Campus Product</span>
        </button>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#EDE4D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#7A6B5F] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1">
                    COGS (Unit Cost)
                    <InfoTip text="Cost of Goods Sold — what it costs YOU to make one unit (materials + packaging). Not your selling price." />
                  </span>
                </th>
                <th className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1">
                    Unit Profit &amp; Margin
                    <InfoTip align="right" text="Profit per unit = Selling Price − COGS. Margin % = that profit divided by the selling price." />
                  </span>
                </th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Sold</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFEB]">
              {sellerProducts.map((p) => {
                const unitProfit = p.price - p.costPrice;
                const unitMargin = p.price > 0 ? Math.round((unitProfit / p.price) * 100) : 0;
                const isLowStock = p.inventoryCount <= 5;

                return (
                  <tr key={p.id} className="hover:bg-[#FFFDF7] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E5DACD]"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#3B2F27] truncate flex items-center gap-1.5">
                            {p.name}
                            {p.bundledProductIds && p.bundledProductIds.length > 0 && (
                              <span className="text-[9px] font-black uppercase text-[#194E3B] bg-[#B8E6D5] rounded-full px-1.5 py-0.5">Bundle</span>
                            )}
                            {p.isPreOrder && (
                              <span className="text-[9px] font-black uppercase text-[#1B4E6B] bg-[#A8D8EA] rounded-full px-1.5 py-0.5">Pre-Order</span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#8C7A6D]">{p.unit}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF4ED] text-[#6E5D52] border border-[#EADBCE]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-[#207559] text-xs">
                      {formatPHP(p.price)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#8C3A27] text-xs">
                      {formatPHP(p.costPrice)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#3B2F27]">+{formatPHP(unitProfit)}</span>
                        <span className={`text-[10px] ml-1.5 font-bold px-1.5 py-0.2 rounded ${
                          unitMargin >= 40
                            ? 'bg-[#B8E6D5] text-[#194E3B]'
                            : unitMargin >= 25
                            ? 'bg-[#FFD3BA] text-[#7A2E1E]'
                            : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>
                          {unitMargin}% margin
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isLowStock ? 'text-[#DC2626]' : 'text-[#3B2F27]'}`}>
                          {p.inventoryCount}
                        </span>
                        {isLowStock && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FEE2E2] text-[#991B1B]">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-[#7A6B5F]">
                      {p.soldCount} units
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-[#6E5D52] hover:text-[#207559] hover:bg-[#FAF4ED] rounded-lg transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-[#A39284] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A231E]/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-[#F0E9DF] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center font-bold">
                  🌱
                </div>
                <h3 className="font-extrabold text-base text-[#3B2F27] font-['Nunito',sans-serif]">
                  {editingProduct ? 'Edit Product & COGS' : 'Add New Student Product'}
                </h3>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-[#7A6B5F] hover:bg-[#F2EAE0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              
              {/* Product Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Uji Matcha Cookie Box (4 pcs)"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Description & Ingredients / Materials
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what makes this product special for campus buyers..."
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                      Unit (e.g. Box, Piece, Pack)
                    </label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. Box of 4"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                      Initial Inventory Count
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={inventoryCount}
                      onChange={(e) => setInventoryCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                    />
                  </div>
                </div>
              </div>

              {/* Built-in Pricing & COGS Calculator Helper */}
              <div className="p-4 bg-[#FFF9E6] rounded-2xl border border-[#EDE4D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#3B2F27]">
                    <Calculator className="w-4 h-4 text-[#194E3B]" />
                    <span>COGS & Margin Pricing Calculator</span>
                    <InfoTip align="right" text="COGS = Cost of Goods Sold, what it costs you to make ONE unit. Enter your costs and target margin below, and this suggests a selling price that hits it." />
                  </div>
                  <span className="text-[10px] font-bold text-[#7A341A] bg-[#FFD3BA] px-2 py-0.5 rounded-md">
                    Target {calcTargetMargin}% Margin
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-[#6E5D52] mb-0.5">
                      Raw Materials / Unit (₱)
                      <InfoTip text="The cost of ingredients or materials to make ONE unit of this product." />
                    </label>
                    <input
                      type="number"
                      value={calcMaterialsCost}
                      onChange={(e) => setCalcMaterialsCost(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-[#E0D5C5] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-[#6E5D52] mb-0.5">
                      Box & Stickers / Unit (₱)
                      <InfoTip text="Packaging cost per unit — boxes, stickers, tags, thank-you notes, etc." />
                    </label>
                    <input
                      type="number"
                      value={calcPackagingCost}
                      onChange={(e) => setCalcPackagingCost(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-[#E0D5C5] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-[#6E5D52] mb-0.5">
                      Target Margin %
                      <InfoTip text="The % of your selling price you want to keep as profit after covering costs. 35%+ is a healthy target." />
                    </label>
                    <input
                      type="number"
                      value={calcTargetMargin}
                      onChange={(e) => setCalcTargetMargin(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-[#E0D5C5] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EADBCE]/80 text-xs">
                  <div>
                    <span className="text-[#6E5D52]">Calculated COGS: </span>
                    <strong className="text-[#8C3A27] font-bold">{formatPHP(calculatedTotalCOGS)}</strong>
                    <InfoTip text="Materials + Packaging per unit — what it costs you to make one item." />
                    <span className="mx-2 text-[#A39284]">|</span>
                    <span className="text-[#6E5D52]">Suggested Price: </span>
                    <strong className="text-[#207559] font-bold">{formatPHP(calculatedSuggestedPrice)}</strong>
                    <InfoTip text="Selling price needed to hit your target margin. Formula: COGS ÷ (1 − target margin%)." align="right" />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCalculatedPrice}
                    className="px-2.5 py-1 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Apply to Product
                  </button>
                </div>
              </div>

              {/* Final Selling Price & Cost Price Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Selling Price (₱ PHP)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-sm font-bold text-[#207559] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-[#54453C] mb-1">
                    Cost of Goods Sold / Unit (₱ PHP)
                    <InfoTip text="COGS = what it costs you to make one unit (materials + packaging combined). This should always be lower than your selling price." />
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-sm font-bold text-[#8C3A27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>
              </div>

              {/* Pre-Order (Sprout+) */}
              <div className="rounded-2xl border border-[#E5DACD] bg-[#FAF7F2] p-3.5 space-y-2.5">
                <button
                  type="button"
                  onClick={handleTogglePreOrder}
                  className="w-full flex items-center gap-2.5 text-left"
                >
                  <span className={`shrink-0 w-9 h-5 rounded-full transition-colors relative ${isPreOrder ? 'bg-[#207559]' : 'bg-[#E5DACD]'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isPreOrder ? 'left-[18px]' : 'left-0.5'}`} />
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#3B2F27] flex-1">
                    <CalendarClock className="w-3.5 h-3.5 text-[#194E3B]" />
                    Sell as Pre-Order
                  </span>
                  {!hasSproutPlus && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase text-[#7A341A] bg-[#FFD3BA] rounded-full px-2 py-0.5">
                      <Lock className="w-2.5 h-2.5" /> Sprout+
                    </span>
                  )}
                </button>
                {isPreOrder && hasSproutPlus && (
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6E5D52] mb-0.5">
                      Expected availability date (optional)
                    </label>
                    <input
                      type="date"
                      value={preOrderReleaseDate}
                      onChange={(e) => setPreOrderReleaseDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0D5C5] rounded-lg text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                    />
                    <p className="mt-1 text-[10px] text-[#8C7A6D]">
                      Customers can order now — this shows them when to expect it.
                    </p>
                  </div>
                )}
              </div>

              {/* Product Image & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Product Image
                  </label>
                  <div className="flex items-center gap-2 mb-2 rounded-xl border border-[#E5DACD] bg-[#FAF7F2] p-2">
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#E5DACD] bg-white"
                    />
                    <label className="inline-flex items-center gap-1.5 rounded-lg bg-[#B8E6D5] px-2.5 py-2 text-[10px] font-black text-[#194E3B] cursor-pointer hover:bg-[#A3DEC9]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload image</span>
                      <input type="file" accept="image/*" onChange={handleProductImageUpload} className="sr-only" />
                    </label>
                  </div>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste an image URL"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                  <p className="mt-1 text-[10px] text-[#8C7A6D]">Images must be 2MB or smaller.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Bestseller, Matcha, Fresh"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                  />
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-3 border-t border-[#F0E9DF] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#54453C] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
