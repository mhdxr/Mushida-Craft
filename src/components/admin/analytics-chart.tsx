"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  name: string;
  inquiries: number;
  orders: number;
};

// Data *mock* tren mingguan/bulanan.
// Ke depannya ini bisa di-*fetch* dari Supabase.
const MOCK_DATA: DataPoint[] = [
  { name: "Sen", inquiries: 4, orders: 1 },
  { name: "Sel", inquiries: 6, orders: 3 },
  { name: "Rab", inquiries: 8, orders: 4 },
  { name: "Kam", inquiries: 5, orders: 2 },
  { name: "Jum", inquiries: 12, orders: 7 },
  { name: "Sab", inquiries: 16, orders: 10 },
  { name: "Min", inquiries: 9, orders: 5 },
];

export function AnalyticsChart() {
  // Hanya agar menghindari SSR hydration mismatch untuk animasi awal jika diperlukan
  const data = useMemo(() => MOCK_DATA, []);

  return (
    <div className="flex h-[300px] w-full flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffc4d5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ffc4d5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9a9e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff9a9e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 20px -8px rgba(0,0,0,0.1)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="inquiries"
            stroke="#ffc4d5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInquiries)"
            name="Inquiry WA"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#ff9a9e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
            name="Estimasi Order"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}