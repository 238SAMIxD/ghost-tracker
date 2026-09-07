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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <Card className="flex flex-col items-center justify-center h-64 border-dashed text-muted-foreground">
        <CardContent className="flex flex-col items-center justify-center pt-6">
          <span className="text-4xl mb-3">📈</span>
          <p className="font-medium">Not enough data to visualize yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Tracker Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[250px]">
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
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  color: 'var(--popover-foreground)',
                }}
                itemStyle={{ color: 'var(--popover-foreground)' }}
                formatter={(value: any, name: any) => [value, String(name).toUpperCase()]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Top Targeted Domains
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                width={100}
              />
              <RechartsTooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  color: 'var(--popover-foreground)',
                }}
                formatter={(value: any) => [value, 'Trackers']}
              />
              <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
