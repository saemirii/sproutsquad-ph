import React, { useState } from 'react';
import { Boxes, Plus, Trash2, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatPHP } from '../../utils/analytics';

export const BundleBuilder: React.FC = () => {
  const { activeBusiness, sellerProducts, addProduct, deleteProduct } = useApp();

  const componentProducts = sellerProducts.filter((p) => !p.bundledProductIds);
  const bundles = sellerProducts.filter((p) => p.bundledProductIds && p.bundledProductIds.length > 0);

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [inventoryCount, setInventoryCount] = useState<number>(10);
  const [error, setError] = useState('');

  const selectedProducts = componentProducts.filter((p) => selectedIds.includes(p.id));
  const componentsTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const componentsCost = selectedProducts.reduce((sum, p) => sum + p.costPrice, 0);

  const resetForm = () => {
    setName('');
    setSelectedIds([]);
    setPrice(0);
    setInventoryCount(10);
    setError('');
  };

  const toggleProduct = (productId: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      const nextTotal = componentProducts.filter((p) => next.includes(p.id)).reduce((sum, p) => sum + p.price, 0);
      setPrice(Math.round(nextTotal * 0.85));
      return next;
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give this bundle a name.');
      return;
    }
    if (selectedIds.length < 2) {
      setError('Pick at least 2 products to bundle together.');
      return;
    }
    if (price <= 0) {
      setError('Set a bundle price greater than 0.');
      return;
    }

    addProduct({
      name: name.trim(),
      description: `Bundle: ${selectedProducts.map((p) => p.name).join(' + ')}`,
      price,
      costPrice: componentsCost,
      category: selectedProducts[0]?.category || activeBusiness.category,
      inventoryCount,
      unit: 'Bundle',
      imageUrl: selectedProducts[0]?.imageUrl || activeBusiness.logo,
      tags: ['Bundle'],
      isAvailable: true,
      university: activeBusiness.university,
      bundledProductIds: selectedIds,
    });
    resetForm();
    setIsCreating(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#7A6B5F]">
          {bundles.length === 0 ? 'No bundles yet.' : `${bundles.length} bundle${bundles.length === 1 ? '' : 's'} for this shop.`}
        </p>
        <button
          type="button"
          onClick={() => { setIsCreating((prev) => !prev); resetForm(); }}
          disabled={componentProducts.length < 2}
          title={componentProducts.length < 2 ? 'Add at least 2 products first' : undefined}
          className="btn-bouncy inline-flex items-center gap-1.5 rounded-xl bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] text-[11px] font-black px-3 py-1.5 disabled:opacity-50"
        >
          {isCreating ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isCreating ? 'Cancel' : 'New Bundle'}
        </button>
      </div>

      {componentProducts.length < 2 && (
        <p className="text-[11px] text-[#8C7A6D] bg-[#FAF7F2] border border-[#EDE4D8] rounded-xl p-2.5">
          Add at least 2 products in the Products tab before building a bundle.
        </p>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-[#E5DACD] bg-[#FAF7F2] p-3.5 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-[#54453C] mb-1">Bundle Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cookie & Tote Starter Pack"
              className="w-full px-3 py-2 bg-white border border-[#E5DACD] rounded-xl text-xs font-bold text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#54453C] mb-1">Products in this Bundle</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {componentProducts.map((p: Product) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`w-full flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                    selectedIds.includes(p.id) ? 'bg-[#EAF6F0] border-[#9FD9C3]' : 'bg-white border-[#E5DACD]'
                  }`}
                >
                  <span className={`shrink-0 w-4 h-4 rounded-md border flex items-center justify-center ${
                    selectedIds.includes(p.id) ? 'bg-[#207559] border-[#207559]' : 'border-[#D7CBBB]'
                  }`}>
                    {selectedIds.includes(p.id) && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <img src={p.imageUrl} alt={p.name} className="w-7 h-7 rounded-md object-cover border border-[#E5DACD]" />
                  <span className="min-w-0 flex-1 text-xs font-bold text-[#3B2F27] truncate">{p.name}</span>
                  <span className="text-xs font-bold text-[#207559]">{formatPHP(p.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="rounded-xl bg-white border border-[#E5DACD] p-2.5 text-[11px] text-[#6E5D52] flex justify-between">
              <span>Combined individual price:</span>
              <span className="font-bold text-[#3B2F27]">{formatPHP(componentsTotal)}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-[#6E5D52] mb-0.5">Bundle Price (₱)</label>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-white border border-[#E0D5C5] rounded-lg text-xs font-bold text-[#207559]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6E5D52] mb-0.5">Bundle Inventory</label>
              <input
                type="number"
                min={0}
                value={inventoryCount}
                onChange={(e) => setInventoryCount(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-white border border-[#E0D5C5] rounded-lg text-xs"
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-[#991B1B]">{error}</p>}

          <button
            type="submit"
            className="btn-bouncy w-full rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black py-2.5 flex items-center justify-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5" />
            Create Bundle
          </button>
        </form>
      )}

      {bundles.length > 0 && (
        <div className="space-y-2">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="flex items-center gap-2.5 rounded-xl border border-[#EDE4D8] bg-white p-3">
              <img src={bundle.imageUrl} alt={bundle.name} className="w-8 h-8 rounded-lg object-cover border border-[#E5DACD]" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-[#3B2F27] truncate">{bundle.name}</p>
                <p className="text-[10px] text-[#8C7A6D]">
                  {bundle.bundledProductIds?.length} products · {formatPHP(bundle.price)} · {bundle.inventoryCount} in stock
                </p>
              </div>
              <button
                type="button"
                onClick={() => { if (confirm(`Delete bundle "${bundle.name}"?`)) deleteProduct(bundle.id); }}
                title="Delete bundle"
                className="shrink-0 p-1.5 rounded-lg text-[#A39284] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
