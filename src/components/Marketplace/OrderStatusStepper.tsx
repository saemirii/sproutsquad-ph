import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { FulfillmentType, OrderStatus } from '../../types';

interface Step {
  status: OrderStatus;
  label: string;
  icon: string;
}

const stepsFor = (fulfillmentType: FulfillmentType): Step[] => {
  const middleStep: Step =
    fulfillmentType === 'Dorm Delivery'
      ? { status: 'Out for Delivery', label: 'Out for Delivery', icon: '🚚' }
      : { status: 'Ready for Pickup', label: 'Ready', icon: '📍' };

  return [
    { status: 'Pending', label: 'Placed', icon: '🌱' },
    { status: 'Preparing', label: 'Preparing', icon: '🥣' },
    middleStep,
    // Deliberately not a checkmark — that's reserved for isDone below, via
    // the lucide CheckCircle2. Reusing ✅ here would make the last step
    // look "already complete" even when it hasn't been reached yet.
    { status: 'Completed', label: 'Done', icon: '🏁' },
  ];
};

interface OrderStatusStepperProps {
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ status, fulfillmentType }) => {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#991B1B] bg-[#FEE2E2] border border-[#EF4444]/30 rounded-xl px-2.5 py-1.5">
        <span>🥀</span>
        <span>Order cancelled</span>
      </div>
    );
  }

  const steps = stepsFor(fulfillmentType);
  const currentIndex = Math.max(0, steps.findIndex((s) => s.status === status));

  return (
    <div className="flex items-center">
      {steps.map((step, idx) => {
        // The final step counts as "done" (checkmark, filled) once actually
        // reached, not just "current" like every earlier step — there's no
        // step after it to visually distinguish "in progress" from "arrived".
        const isDone = idx < currentIndex || (idx === currentIndex && status === 'Completed');
        const isCurrent = idx === currentIndex && !isDone;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center gap-1 w-14 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] border-2 transition-colors ${
                  isDone
                    ? 'bg-[#207559] border-[#207559] text-white'
                    : isCurrent
                      ? 'bg-[#B8E6D5] border-[#194E3B] text-[#194E3B]'
                      : 'bg-white border-[#EDE4D8] text-[#C9BCAE]'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.icon}
              </span>
              <span className={`text-[9px] font-bold text-center leading-tight ${isCurrent ? 'text-[#194E3B]' : isDone ? 'text-[#207559]' : 'text-[#A39284]'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 flex-1 -mt-4 ${idx < currentIndex ? 'bg-[#207559]' : 'bg-[#EDE4D8]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
