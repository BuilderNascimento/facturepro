'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyChartProps {
  data: { month: string; receita: number }[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(v) => `${v} €`} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} €`, 'Revenus']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="receita" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Revenus" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
