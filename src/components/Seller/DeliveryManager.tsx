import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Truck,
  PackageCheck,
} from 'lucide-react';
import { useShop } from '../../context/AppContext';
import { DeliveryMethod, Order } from '../../types';
import { formatPHP } from '../../utils/analytics';

export const DeliveryManager: React.FC = () => {
  const { sellerOrders, updateDeliverySchedule } = useShop();
  const [dispatchDrafts, setDispatchDrafts] = useState<Record<string, string>>({});
  const [courierDrafts, setCourierDrafts] = useState<Record<string, DeliveryMethod>>({});

  const dispatchGroups: Array<{
    dateKey: string;
    dateLabel: string;
    couriers: string[];
    orders: Order[];
  }> = Object.entries(
    sellerOrders.reduce<Record<string, { dateLabel: string; couriers: Set<string>; orders: Order[] }>>((groups, order) => {
      const dateKey = order.deliveryDate || 'unscheduled';
      const dateLabel =
        dateKey === 'unscheduled'
          ? 'Dispatch not set'
          : new Date(dateKey).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateLabel,
          couriers: new Set(),
          orders: [],
        };
      }

      groups[dateKey].couriers.add(order.deliveryMethod);
      groups[dateKey].orders.push(order);

      return groups;
    }, {})
  )
    .sort(([a], [b]) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    })
    .map(([dateKey, rawGroup]) => {
      const group = rawGroup as { dateLabel: string; couriers: Set<string>; orders: Order[] };
      return {
        dateKey,
        dateLabel: group.dateLabel,
        couriers: Array.from(group.couriers),
        orders: [...group.orders].sort((a, b) => (a.meetupLocation || '').localeCompare(b.meetupLocation || '')),
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
            Delivery Dispatch Hub
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            Separate delivery scheduling from orders so campus fulfillment stays easier to manage.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBFBF0] text-[#194E3B] text-[10px] font-bold px-2.5 py-1 border border-[#B8E6D5]">
          <Truck className="w-3.5 h-3.5" />
          {sellerOrders.length} scheduled orders
        </span>
      </div>

      {dispatchGroups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EDE4D8] p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-[#FAF7F2] text-[#A39284] rounded-2xl mx-auto flex items-center justify-center text-2xl">
            🚚
          </div>
          <h3 className="font-bold text-base text-[#3B2F27]">No delivery plans yet</h3>
          <p className="text-xs text-[#7A6B5F] max-w-sm mx-auto">
            Orders will appear here once you assign a courier and dispatch date for the next pickup or delivery run.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dispatchGroups.map((group) => (
            <div key={group.dateKey} className="bg-white rounded-3xl border border-[#EDE4D8] p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5EFEB]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#207559]" />
                  <span className="font-extrabold text-xs text-[#3B2F27]">{group.dateLabel}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.couriers.map((courier) => (
                    <span
                      key={`${group.dateKey}-${courier}`}
                      className="inline-flex items-center rounded-full border border-[#D7E9D9] bg-[#F6FBF8] px-2 py-1 text-[10px] font-bold text-[#194E3B]"
                    >
                      {courier}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {group.orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2] p-3 sm:p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-extrabold text-[#3B2F27] text-sm">{order.customerName}</p>
                        <p className="text-[11px] text-[#6E5D52]">{order.orderNumber}</p>
                      </div>

                      <span className="text-[10px] font-bold text-[#207559] bg-[#EBFBF0] border border-[#B8E6D5] px-2 py-0.5 rounded-md">
                        {formatPHP(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6E5D52]">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 border border-[#E5DACD]">
                        <Truck className="w-3 h-3 text-[#1B4E6B]" />
                        {order.deliveryMethod}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-1 border border-[#E5DACD]">
                        <MapPin className="w-3 h-3 text-[#7A341A]" />
                        {order.meetupLocation}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <select
                        value={courierDrafts[order.id] ?? order.deliveryMethod}
                        onChange={(e) => {
                          setCourierDrafts((prev) => ({ ...prev, [order.id]: e.target.value as DeliveryMethod }));
                        }}
                        className="w-full px-2.5 py-2 bg-white border border-[#E5DACD] rounded-xl text-[11px] text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                      >
                        {(['Lalamove', 'J&T Express', 'Cash on Delivery'] as DeliveryMethod[]).map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>

                      <input
                        type="date"
                        value={
                          dispatchDrafts[order.id] ??
                          order.deliveryDate ??
                          new Date(Date.now() + 86400000).toISOString().slice(0, 10)
                        }
                        onChange={(e) => {
                          setDispatchDrafts((prev) => ({ ...prev, [order.id]: e.target.value }));
                        }}
                        className="w-full px-2.5 py-2 bg-white border border-[#E5DACD] rounded-xl text-[11px] text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const selectedCourier = courierDrafts[order.id] ?? order.deliveryMethod;
                          const selectedDate =
                            dispatchDrafts[order.id] ??
                            order.deliveryDate ??
                            new Date(Date.now() + 86400000).toISOString().slice(0, 10);
                          updateDeliverySchedule(order.id, selectedCourier, selectedDate);
                        }}
                        className="px-3 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6E5D52] pt-1 border-t border-[#EDE4D8]">
                      <span>{order.businessName}</span>
                      <span className="inline-flex items-center gap-1 text-[#207559] font-bold">
                        <PackageCheck className="w-3.5 h-3.5" />
                        {order.items.length} items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
