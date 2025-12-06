import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 2200 },
  { month: 'Feb', revenue: 2450 },
  { month: 'Mar', revenue: 2680 },
  { month: 'Apr', revenue: 2890 },
  { month: 'May', revenue: 3100 },
  { month: 'Jun', revenue: 2950 },
  { month: 'Jul', revenue: 3250 },
  { month: 'Aug', revenue: 3400 },
  { month: 'Sep', revenue: 3150 },
  { month: 'Oct', revenue: 3500 },
  { month: 'Nov', revenue: 3750 },
  { month: 'Dec', revenue: 2847 }
];

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="month" 
          stroke="rgba(255,255,255,0.3)"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.3)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
          formatter={(value: any) => [`$${value}`, 'Revenue']}
        />
        <Bar dataKey="revenue" fill="var(--blue-electric)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
