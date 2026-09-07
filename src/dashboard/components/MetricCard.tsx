import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="flex flex-col justify-center text-center shadow-sm">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xxs text-muted-foreground uppercase tracking-widest font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-3xl font-extrabold" style={{ color }}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
