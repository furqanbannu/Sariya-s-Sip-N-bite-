import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart2, Calendar, Award } from 'lucide-react';
import { OrderRecord } from '../types/restaurant';

interface MonthlySpendingChartProps {
  orders: OrderRecord[];
}

interface MonthlyDataPoint {
  month: string;
  yearMonth: string;
  timestamp: number;
  spend: number;
  ordersCount: number;
  dineIn: number;
  roomService: number;
  takeaway: number;
}

export const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({ orders }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Compute monthly data from user orders
  const { monthlyData, totalSpend, peakMonth, averageSpend } = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const monthMap = new Map<string, MonthlyDataPoint>();

    // Baseline past 5 calendar months if needed so the curve is always continuous and informative
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      monthMap.set(key, {
        month: monthName,
        yearMonth: key,
        timestamp: d.getTime(),
        spend: 0,
        ordersCount: 0,
        dineIn: 0,
        roomService: 0,
        takeaway: 0,
      });
    }

    validOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleString('en-US', { month: 'short' });

      let point = monthMap.get(key);
      if (!point) {
        point = {
          month: monthName,
          yearMonth: key,
          timestamp: d.getTime(),
          spend: 0,
          ordersCount: 0,
          dineIn: 0,
          roomService: 0,
          takeaway: 0,
        };
        monthMap.set(key, point);
      }

      point.spend += order.total;
      point.ordersCount += 1;
      if (order.orderType === 'dine_in') point.dineIn += order.total;
      else if (order.orderType === 'room_service') point.roomService += order.total;
      else if (order.orderType === 'takeaway') point.takeaway += order.total;
    });

    const sortedData = Array.from(monthMap.values()).sort((a, b) => a.timestamp - b.timestamp);

    const total = sortedData.reduce((acc, curr) => acc + curr.spend, 0);
    const activeMonths = sortedData.filter((d) => d.spend > 0);
    const avg = activeMonths.length > 0 ? Math.round(total / activeMonths.length) : 0;

    let peak = sortedData[0];
    sortedData.forEach((d) => {
      if (d.spend > (peak?.spend || 0)) {
        peak = d;
      }
    });

    return {
      monthlyData: sortedData,
      totalSpend: total,
      peakMonth: peak || { month: 'N/A', spend: 0 },
      averageSpend: avg,
    };
  }, [orders]);

  // Custom Dark Luxury Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyDataPoint = payload[0].payload;
      return (
        <div className="bg-[#12141a] border border-[#c5a880]/60 p-3 shadow-2xl text-xs min-w-[170px] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#252834] pb-1.5 mb-2">
            <span className="font-display font-semibold text-[#f3ede4] tracking-wide">
              {data.month} Dining
            </span>
            <span className="text-[10px] text-[#8a857b] font-mono">
              {data.ordersCount} {data.ordersCount === 1 ? 'visit' : 'visits'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[#8a857b] text-[11px]">Total Spent:</span>
              <span className="font-mono text-sm font-bold text-[#c5a880] tabular-nums">
                Rs {data.spend.toLocaleString()}
              </span>
            </div>

            {data.dineIn > 0 && (
              <div className="flex justify-between text-[10px] text-[#a9a499]">
                <span>Dine-In Hall:</span>
                <span className="font-mono">Rs {data.dineIn.toLocaleString()}</span>
              </div>
            )}
            {data.roomService > 0 && (
              <div className="flex justify-between text-[10px] text-[#a9a499]">
                <span>Room Service:</span>
                <span className="font-mono">Rs {data.roomService.toLocaleString()}</span>
              </div>
            )}
            {data.takeaway > 0 && (
              <div className="flex justify-between text-[10px] text-[#a9a499]">
                <span>Takeaway:</span>
                <span className="font-mono">Rs {data.takeaway.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-1.5 border-t border-[#20232c] flex justify-between text-[10px] text-[#7fb385]">
              <span>Points Earned:</span>
              <span className="font-mono font-semibold">+{Math.floor(data.spend / 20)} pts</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 bg-[#14161f] border border-[#252834] my-2">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-[#222530] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#20232d] border border-[#3b3f4f] flex items-center justify-center text-[#c5a880]">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-display text-base font-semibold text-[#f3ede4] leading-tight">
              Monthly Spending Trend
            </h4>
            <p className="text-[10px] text-[#8a857b]">
              Murree dining analytics across visits
            </p>
          </div>
        </div>

        {/* Chart View Toggle (Zero-Pill Discipline) */}
        <div className="flex items-center gap-1 bg-[#0e0f14] p-0.5 border border-[#222530]">
          <button
            onClick={() => setChartType('area')}
            className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors ${
              chartType === 'area'
                ? 'bg-[#c5a880] text-[#0e0f12]'
                : 'text-[#8a857b] hover:text-[#ede8e1]'
            }`}
            title="Area Trend Curve"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Trend</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors ${
              chartType === 'bar'
                ? 'bg-[#c5a880] text-[#0e0f12]'
                : 'text-[#8a857b] hover:text-[#ede8e1]'
            }`}
            title="Monthly Bars"
          >
            <BarChart2 className="w-3 h-3" />
            <span>Bars</span>
          </button>
        </div>
      </div>

      {/* Quantitative Summary Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-[#0d0f14] border border-[#1f222d] text-center text-xs">
        <div className="p-1">
          <span className="text-[10px] text-[#8a857b] block">Total Tracked</span>
          <span className="font-mono text-xs font-bold text-[#ede8e1] tabular-nums mt-0.5 block">
            Rs {totalSpend.toLocaleString()}
          </span>
        </div>
        <div className="p-1 border-x border-[#1f222d]">
          <span className="text-[10px] text-[#8a857b] block">Peak Month</span>
          <span className="font-mono text-xs font-bold text-[#c5a880] tabular-nums mt-0.5 block">
            {peakMonth.month} (Rs {peakMonth.spend.toLocaleString()})
          </span>
        </div>
        <div className="p-1">
          <span className="text-[10px] text-[#8a857b] block">Monthly Avg</span>
          <span className="font-mono text-xs font-bold text-[#ede8e1] tabular-nums mt-0.5 block">
            Rs {averageSpend.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={monthlyData} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGoldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c5a880" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#c5a880" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f222d" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#68645c"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#252834' }}
              />
              <YAxis
                stroke="#68645c"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#252834' }}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#c5a880"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#spendGoldGradient)"
                activeDot={{ r: 4, fill: '#f6e05e', stroke: '#12141a', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={monthlyData} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f222d" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#68645c"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#252834' }}
              />
              <YAxis
                stroke="#68645c"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#252834' }}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spend" fill="#c5a880" radius={[2, 2, 0, 0]} maxBarSize={32} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1f222d] text-[10px] text-[#8a857b] mt-1">
        <span>Updates in real-time as new orders are placed</span>
        <span className="text-[#c5a880]">Sariya's Sip N Bite · Murree</span>
      </div>
    </div>
  );
};
