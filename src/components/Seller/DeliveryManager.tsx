import React, { useMemo, useState } from 'react';
import {
  Clock,
  MapPin,
  Truck,
  PackageCheck,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';
import { useShop } from '../../context/AppContext';
import { DeliveryMethod, Order } from '../../types';
import { formatPHP } from '../../utils/analytics';
import { Icon } from '../Icon';

type DispatchTab = 'today' | 'upcoming' | 'past';

// Plain Y-M-D, matching the calendar-date-only value a <input type="date">
// stores in order.deliveryDate — comparing as strings avoids any UTC/local
// timezone drift a Date-object comparison could introduce right at midnight.
const todayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface DispatchGroup {
  dateKey: string;
  dateLabel: string;
  couriers: string[];
  orders: Order[];
}

// Same per-date grouping the hub already used, now reusable across all 3
// tabs — only the sort direction and whether "Dispatch not set" floats to
// the top or bottom differ per tab.
const groupByDispatchDate = (orders: Order[], sortDirection: 'asc' | 'desc', unscheduledFirst: boolean): DispatchGroup[] => {
  const groups = orders.reduce<Record<string, { dateLabel: string; couriers: Set<string>; orders: Order[] }>>((acc, order) => {
    const dateKey = order.deliveryDate || 'unscheduled';
    const dateLabel =
      dateKey === 'unscheduled'
        ? 'Dispatch not set'
        : new Date(dateKey).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    if (!acc[dateKey]) {
      acc[dateKey] = { dateLabel, couriers: new Set(), orders: [] };
    }
    acc[dateKey].couriers.add(order.deliveryMethod);
    acc[dateKey].orders.push(order);
    return acc;
  }, {});

  return Object.entries(groups)
    .sort(([a], [b]) => {
      if (a === 'unscheduled' || b === 'unscheduled') {
        if (a === b) return 0;
        const aFirst = unscheduledFirst ? a === 'unscheduled' : b === 'unscheduled';
        return aFirst ? -1 : 1;
      }
      const diff = new Date(a).getTime() - new Date(b).getTime();
      return sortDirection === 'asc' ? diff : -diff;
    })
    .map(([dateKey, group]) => ({
      dateKey,
      dateLabel: group.dateLabel,
      couriers: Array.from(group.couriers),
      orders: [...group.orders].sort((a, b) => (a.meetupLocation || '').localeCompare(b.meetupLocation || '')),
    }));
};

export const DeliveryManager: React.FC = () => {
  const { sellerOrders, updateDeliverySchedule } = useShop();
  const [activeTab, setActiveTab] = useState<DispatchTab>('today');
  const [dispatchDrafts, setDispatchDrafts] = useState<Record<string, string>>({});
  const [courierDrafts, setCourierDrafts] = useState<Record<string, DeliveryMethod>>({});

  // Once an order is Completed (or Cancelled) it's done — it moves to
  // "Completed / Past" and stops cluttering the tab a seller actually works
  // out of every day, instead of staying mixed in with everything else.
  const { todayOrders, upcomingOrders, pastOrders } = useMemo(() => {
    const today = todayDateString();
    const todayList: Order[] = [];
    const upcomingList: Order[] = [];
    const pastList: Order[] = [];

    for (const order of sellerOrders) {
      const isTerminal = order.orderStatus === 'Completed' || order.orderStatus === 'Cancelled';
      if (isTerminal) {
        pastList.push(order);
      } else if (order.deliveryDate === today) {
        todayList.push(order);
      } else {
        upcomingList.push(order);
      }
    }

    pastList.sort((a, b) =>
      new Date(b.deliveryDate || b.createdAt).getTime() - new Date(a.deliveryDate || a.createdAt).getTime()
    );

    return { todayOrders: todayList, upcomingOrders: upcomingList, pastOrders: pastList };
  }, [sellerOrders]);

  const tabs: { id: DispatchTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'today', label: 'Today', icon: <Clock className="w-3.5 h-3.5" />, count: todayOrders.length },
    { id: 'upcoming', label: 'Upcoming', icon: <CalendarClock className="w-3.5 h-3.5" />, count: upcomingOrders.length },
    { id: 'past', label: 'Completed / Past', icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: pastOrders.length },
  ];

  const isPastTab = activeTab === 'past';
  const activeOrders = activeTab === 'today' ? todayOrders : activeTab === 'upcoming' ? upcomingOrders : pastOrders;

  // Upcoming: soonest date first, but an order with no dispatch date at all
  // is the most urgent thing to act on, so it floats above every dated
  // group rather than sinking to the bottom. Past: most recently
  // completed/cancelled first, per the "most recent → oldest" ask.
  const dispatchGroups = useMemo(
    () => groupByDispatchDate(activeOrders, isPastTab ? 'desc' : 'asc', !isPastTab),
    [activeOrders, isPastTab]
  );

  const emptyStateCopy: Record<DispatchTab, { title: string; body: string }> = {
    today: {
      title: "Nothing dispatching today",
      body: 'Orders scheduled for today\'s date will show up here.',
    },
    upcoming: {
      title: 'No upcoming deliveries',
      body: 'Orders will appear here once you assign a courier and dispatch date for the next pickup or delivery run.',
    },
    past: {
      title: 'No completed or cancelled orders yet',
      body: 'Once an order is marked completed or cancelled, it moves here and out of your active dispatch list.',
    },
  };

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
          {todayOrders.length + upcomingOrders.length} active orders
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn-bouncy shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer border ${
              activeTab === tab.id
                ? 'bg-[#194E3B] border-[#194E3B] text-white'
                : 'bg-white border-[#EDE4D8] text-[#6B5B4F]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span
              className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#FAF3DE] text-[#8C7A6D]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {dispatchGroups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EDE4D8] p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-[#FAF7F2] text-[#A39284] rounded-2xl mx-auto flex items-center justify-center">
            <Icon name="order-out-for-delivery" className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-[#3B2F27]">{emptyStateCopy[activeTab].title}</h3>
          <p className="text-xs text-[#7A6B5F] max-w-sm mx-auto">{emptyStateCopy[activeTab].body}</p>
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
                      {isPastTab && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 border ${
                            order.orderStatus === 'Cancelled'
                              ? 'bg-[#FAF3DE] border-[#EADBCE] text-[#8C7A6D]'
                              : 'bg-[#B8E6D5]/40 border-[#9FD9C3] text-[#194E3B]'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {order.orderStatus}
                        </span>
                      )}
                    </div>

                    {isPastTab ? (
                      <div className="flex items-center justify-between text-[11px] text-[#6E5D52] pt-1 border-t border-[#EDE4D8]">
                        <span>{order.businessName}</span>
                        <span className="inline-flex items-center gap-1 text-[#207559] font-bold">
                          <PackageCheck className="w-3.5 h-3.5" />
                          {order.items.length} items
                        </span>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
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
