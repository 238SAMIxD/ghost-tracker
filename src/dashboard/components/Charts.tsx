import { useMemo } from 'react';
import type { TrackerEvent } from '@/db';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface ChartsProps {
  events: TrackerEvent[];
  categoryColors: Record<TrackerEvent['category'], string>;
}

export function Charts({ events, categoryColors }: ChartsProps) {
  // Aggregate data for Pie Chart (Category Distribution)
  const pieData = useMemo(() => {
    const counts = events
      .filter((e) => e.blocked)
      .reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  // Aggregate data for Bar Chart (Top Tracker Domains)
  const barData = useMemo(() => {
    const counts = events
      .filter((e) => e.blocked)
      .reduce(
      (acc, e) => {
        acc[e.hostDomain] = (acc[e.hostDomain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [events]);

  if (events.filter((e) => e.blocked).length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 h-64 border-dashed">
        <span className="text-4xl mb-3">📈</span>
        <p className="font-medium">Not enough data to visualize yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Pie Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">
          Tracker Categories
        </h2>
        <div className="flex-1 h-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={categoryColors[entry.name as TrackerEvent['category']] || categoryColors.unknown}
                    stroke="rgba(0,0,0,0.1)"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value: number, name: string) => [value, name.toUpperCase()]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Domains Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">
          Top Targeted Domains
        </h2>
        <div className="flex-1 h-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                width={100}
              />
              <RechartsTooltip
                cursor={{ fill: '#334155', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
                formatter={(value: number) => [value, 'Trackers']}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
