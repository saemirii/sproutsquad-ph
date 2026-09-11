import React from 'react';
import { PackageCheck, AlertTriangle, XCircle, Download } from 'lucide-react';
import { useShop } from '../../context/AppContext';
import { exportInventoryToCsv } from '../../utils/exportInventory';

export const InventoryTracker: React.FC = () => {
  const { sellerProducts, activeBusiness } = useShop();

  const outOfStock = sellerProducts.filter((p) => p.inventoryCount === 0);
  const lowStock = sellerProducts.filter((p) => p.inventoryCount > 0 && p.inventoryCount <= 6);
  const healthyCount = sellerProducts.length - outOfStock.length - lowStock.length;
  const atRisk = [...outOfStock, ...lowStock];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-[#EAF6F0] border border-[#9FD9C3] p-2.5 text-center">
          <p className="text-lg font-black text-[#194E3B]">{healthyCount}</p>
          <p className="text-[9px] font-bold text-[#207559] uppercase tracking-wide">In Stock</p>
        </div>
        <div className="rounded-xl bg-[#FFF3E8] border border-[#F8BA9E] p-2.5 text-center">
          <p className="text-lg font-black text-[#7A341A]">{lowStock.length}</p>
          <p className="text-[9px] font-bold text-[#7A341A] uppercase tracking-wide">Low Stock</p>
        </div>
        <div className="rounded-xl bg-[#FEE2E2] border border-[#F3A9A9] p-2.5 text-center">
          <p className="text-lg font-black text-[#991B1B]">{outOfStock.length}</p>
          <p className="text-[9px] font-bold text-[#991B1B] uppercase tracking-wide">Out of Stock</p>
        </div>
      </div>

      {atRisk.length > 0 && (
        <div className="space-y-1.5">
          {atRisk.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-lg border border-[#EDE4D8] bg-white px-2.5 py-1.5">
              {p.inventoryCount === 0 ? (
                <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
              )}
              <span className="text-xs font-bold text-[#3B2F27] truncate flex-1">{p.name}</span>
              <span className="text-[10px] font-black text-[#8C7A6D] shrink-0">
                {p.inventoryCount === 0 ? 'Out of stock' : `${p.inventoryCount} left`}
              </span>
            </div>
          ))}
        </div>
      )}

      {sellerProducts.length === 0 ? (
        <p className="text-[11px] text-[#8C7A6D]">Add products in the Products tab to start tracking inventory.</p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => exportInventoryToCsv(sellerProducts, activeBusiness.name)}
            className="btn-bouncy w-full rounded-xl bg-[#207559] hover:bg-[#194E3B] text-white text-xs font-black py-2.5 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export to Google Sheets
          </button>
          <p className="text-[10px] text-[#8C7A6D] leading-4">
            Downloads a CSV snapshot of your current inventory — open Google Sheets → File → Import → Upload to bring it in. This is a one-way export, not a live connected sync.
          </p>
        </>
      )}
    </div>
  );
};
