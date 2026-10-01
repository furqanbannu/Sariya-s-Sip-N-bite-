import React from 'react';
import { Check, Flame, Bell, CheckCircle, Clock, Utensils, RefreshCw, XCircle } from 'lucide-react';
import { OrderStatus } from '../types/restaurant';

interface OrderProgressTimelineProps {
  status: OrderStatus;
  estimatedTime?: string;
  orderType?: 'dine_in' | 'room_service' | 'takeaway';
  onAdvance?: () => void;
  compact?: boolean;
  orderId?: string;
}

interface StepConfig {
  key: OrderStatus;
  title: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIMELINE_STEPS: StepConfig[] = [
  {
    key: 'pending',
    title: 'Order Placed',
    sublabel: 'In Queue',
    icon: Utensils,
  },
  {
    key: 'preparing',
    title: 'Kitchen Preparing',
    sublabel: 'Stone Fired',
    icon: Flame,
  },
  {
    key: 'ready',
    title: 'Ready',
    sublabel: 'Plated Hot',
    icon: Bell,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    sublabel: 'Served',
    icon: CheckCircle,
  },
];

export const OrderProgressTimeline: React.FC<OrderProgressTimelineProps> = ({
  status,
  estimatedTime = '20–25 mins',
  orderType = 'dine_in',
  onAdvance,
  compact = false,
  orderId,
}) => {
  // If order is cancelled, show clear cancellation notice
  if (status === 'cancelled') {
    return (
      <div className="p-3 bg-[#1e1414] border border-[#522525] text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#f87171]">
          <XCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-[11px] font-mono">
            Order Cancelled
          </span>
        </div>
        <span className="text-[10px] text-[#a87a7a]">Kitchen ticket closed</span>
      </div>
    );
  }

  // Calculate current active step index (0 to 3)
  const getStepIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  // Calculate bar fill percentage
  const getProgressPercentage = (idx: number): number => {
    switch (idx) {
      case 0:
        return 12; // Start of order placed
      case 1:
        return 42; // Kitchen preparing
      case 2:
        return 74; // Ready
      case 3:
        return 100; // Delivered
      default:
        return 12;
    }
  };

  const progressPercent = getProgressPercentage(currentIndex);

  // Status message copy
  const getStatusNarration = () => {
    switch (status) {
      case 'pending':
        return 'Order acknowledged by Mall Road kitchen brigade. Ticket is lined up in order queue.';
      case 'preparing':
        return 'Chef is currently flame-broiling steaks, firing pizzas, and hand-tossing pastas.';
      case 'ready':
        return orderType === 'room_service'
          ? 'Plated and covered on hot trays. Attendant dispatched to your hotel suite.'
          : orderType === 'takeaway'
          ? 'Packaged hot at the pickup counter on Mall Road.'
          : 'Plated hot under heat lamps. Server expediting directly to your table.';
      case 'delivered':
        return 'Delivered and served. Enjoy your hot mountain meal!';
      default:
        return 'Order in progress.';
    }
  };

  return (
    <div
      className={`bg-[#0d0f15] border border-[#222634] ${
        compact ? 'p-3' : 'p-4 sm:p-5'
      } relative overflow-hidden`}
    >
      {/* Subtle Warm Highlight for active status */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{
          backgroundColor:
            status === 'preparing'
              ? '#f6ad55'
              : status === 'ready'
              ? '#e5c378'
              : status === 'delivered'
              ? '#7fb385'
              : '#c5a880',
        }}
        aria-hidden="true"
      />

      {/* Header bar (when not compact) */}
      {!compact && (
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#1f2330]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'delivered'
                  ? 'bg-[#7fb385]'
                  : 'bg-[#f6ad55] animate-ping'
              }`}
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a880] font-bold">
              Step-by-Step Kitchen Pipeline
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8a857b]">
              ETA: <strong className="text-[#ede8e1]">{estimatedTime}</strong>
            </span>
            {onAdvance && status !== 'delivered' && (
              <button
                type="button"
                onClick={onAdvance}
                className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#1c202c] hover:bg-[#c5a880] text-[#c5a880] hover:text-[#0e0f12] transition-colors border border-[#30374a] flex items-center gap-1"
                title="Advance order to next milestone"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Next Step</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Visual Step Timeline Track */}
      <div className="relative pt-2 pb-1">
        {/* Background Track Line */}
        <div className="absolute top-[22px] sm:top-[26px] left-[6%] right-[6%] h-[3px] bg-[#1a1e28] z-0" />

        {/* Animated Active Progress Fill Line */}
        <div
          className="absolute top-[22px] sm:top-[26px] left-[6%] h-[3px] bg-gradient-to-r from-[#c5a880] via-[#f6ad55] to-[#7fb385] z-0 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(0, Math.min(progressPercent - 6, 88))}%` }}
        />

        {/* 4 Step Nodes */}
        <div className="grid grid-cols-4 relative z-10">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                {/* Node Circle */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-500 mb-1.5 ${
                    isCompleted
                      ? 'bg-[#1b2f21] text-[#7fb385] border-2 border-[#3e6848] shadow-sm'
                      : isCurrent
                      ? status === 'preparing'
                        ? 'bg-[#f6ad55] text-[#0e0f12] border-2 border-[#ffedd5] ring-4 ring-[#f6ad55]/30 animate-pulse font-bold shadow-lg'
                        : status === 'ready'
                        ? 'bg-[#e5c378] text-[#0e0f12] border-2 border-[#fef08a] ring-4 ring-[#e5c378]/30 animate-pulse font-bold shadow-lg'
                        : 'bg-[#c5a880] text-[#0e0f12] border-2 border-[#fef3c7] ring-4 ring-[#c5a880]/30 font-bold shadow-lg'
                      : 'bg-[#13161f] text-[#555a6d] border border-[#232734]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <StepIcon className="w-4 h-4" />
                  ) : (
                    <span className="font-mono text-[11px] font-semibold">{idx + 1}</span>
                  )}
                </div>

                {/* Primary Step Label */}
                <span
                  className={`text-[11px] sm:text-xs font-semibold tracking-tight transition-colors ${
                    isCurrent
                      ? status === 'preparing'
                        ? 'text-[#f6ad55]'
                        : status === 'ready'
                        ? 'text-[#e5c378]'
                        : 'text-[#f3ede4]'
                      : isCompleted
                      ? 'text-[#ede8e1]'
                      : 'text-[#62687c]'
                  }`}
                >
                  {step.title}
                </span>

                {/* Sub-label */}
                <span
                  className={`text-[9px] sm:text-[10px] font-mono mt-0.5 ${
                    isCurrent
                      ? 'text-[#c5a880] font-semibold uppercase'
                      : isCompleted
                      ? 'text-[#7fb385]'
                      : 'text-[#505466]'
                  }`}
                >
                  {isCurrent ? '● Active' : isCompleted ? '✓ Done' : step.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Contextual Status Narration */}
      <div className="mt-3.5 pt-2.5 border-t border-[#1b1f2b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex items-start gap-1.5 text-[#bbb5a7] leading-relaxed">
          <span className="text-[10px] font-mono uppercase font-bold text-[#c5a880] shrink-0 mt-0.5">
            Stage {currentIndex + 1}/4:
          </span>
          <span>{getStatusNarration()}</span>
        </div>

        {compact && onAdvance && status !== 'delivered' && (
          <button
            type="button"
            onClick={onAdvance}
            className="self-end sm:self-auto px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#1c202c] hover:bg-[#c5a880] text-[#c5a880] hover:text-[#0e0f12] transition-colors border border-[#30374a] shrink-0 flex items-center gap-1"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Advance</span>
          </button>
        )}
      </div>
    </div>
  );
};
