'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RevenueLineChartProps {
  data: { month: string; exerciceEnCours: number; exercicePrecedent: number }[];
  year: number;
}

export function RevenueLineChart({ data, year }: RevenueLineChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(v) => `${v} €`} />
          <Tooltip
            formatter={(value: number) => [`${Number(value).toFixed(2)} €`, '']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            labelFormatter={(label) => label}
          />
          <Legend
            formatter={(value) => (value === 'exerciceEnCours' ? `Exercice ${year}` : `Exercice ${year - 1}`)}
          />
          <Line
            type="monotone"
            dataKey="exerciceEnCours"
            name="exerciceEnCours"
            stroke="#9333ea"
            strokeWidth={2}
            dot={{ fill: '#9333ea', r: 3 }}
            fill="#9333ea"
          />
          <Line
            type="monotone"
            dataKey="exercicePrecedent"
            name="exercicePrecedent"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#94a3b8', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
