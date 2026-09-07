import { useMemo } from 'react';
import type { TrackerEvent } from '@/db';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

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
      .map(([name, value]) => ({ name, value, fill: categoryColors[name as TrackerEvent['category']] || categoryColors.unknown }))
      .sort((a, b) => b.value - a.value);
  }, [events, categoryColors]);

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

  const pieChartConfig = {
    analytics: { label: "Analytics", color: categoryColors.analytics },
    ads: { label: "Ads", color: categoryColors.ads },
    social: { label: "Social", color: categoryColors.social },
    telemetry: { label: "Telemetry", color: categoryColors.telemetry },
    unknown: { label: "Unknown", color: categoryColors.unknown },
    value: { label: "Trackers" }
  } satisfies ChartConfig;

  const barChartConfig = {
    value: { label: "Trackers", color: "var(--primary)" }
  } satisfies ChartConfig;

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
        <CardContent className="flex-1 w-full pb-0">
          <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[250px]">
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
                    fill={entry.fill}
                    stroke="rgba(0,0,0,0.1)"
                  />
                ))}
              </Pie>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            Top Targeted Domains
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 w-full pb-0">
          <ChartContainer config={barChartConfig} className="max-h-[250px] w-full">
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
              <ChartTooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
