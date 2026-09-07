import { useState, useMemo } from 'react';
import type { TrackerEvent } from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventsTableProps {
  events: TrackerEvent[];
  categoryColors: Record<TrackerEvent['category'], string>;
}

type SortField = 'timestamp' | 'hostDomain' | 'category' | 'blocked';
type SortOrder = 'asc' | 'desc';

export function EventsTable({ events, categoryColors }: EventsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.trim().toLowerCase();
    return events.filter(
      (e) =>
        e.hostDomain.toLowerCase().includes(query) ||
        e.trackerUrl.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'hostDomain':
          comparison = a.hostDomain.localeCompare(b.hostDomain);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'blocked':
          comparison = Number(a.blocked) - Number(b.blocked);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredEvents, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedEvents.length / pageSize) || 1;
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedEvents = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return sortedEvents.slice(start, start + pageSize);
  }, [sortedEvents, effectivePage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'timestamp' ? 'desc' : 'asc'); // default desc for timestamp
    }
    setCurrentPage(1); // reset to first page on sort
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to first page on search
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1 text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <Card className="flex flex-col shadow-sm">
      <CardHeader className="border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base font-bold whitespace-nowrap">Recent Tracker Events</CardTitle>
        <div className="relative w-full sm:max-w-xs">
          <Input
            type="text"
            placeholder="Search domains or URLs..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('timestamp')}
                aria-sort={sortField === 'timestamp' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Timestamp {renderSortIndicator('timestamp')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('hostDomain')}
                aria-sort={sortField === 'hostDomain' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Host Domain {renderSortIndicator('hostDomain')}
              </TableHead>
              <TableHead>Tracker URL</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('category')}
                aria-sort={sortField === 'category' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Category {renderSortIndicator('category')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('blocked')}
                aria-sort={sortField === 'blocked' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Action {renderSortIndicator('blocked')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No tracker events recorded yet. Browse the web and Ghost Tracker will capture them here.
                </TableCell>
              </TableRow>
            ) : paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No events matched your search query.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event, i) => (
                <TableRow key={event.id ?? i}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{event.hostDomain}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground" title={event.trackerUrl}>
                    {event.trackerUrl}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className="text-white hover:bg-opacity-80" 
                      style={{ backgroundColor: categoryColors[event.category] || categoryColors.unknown }}
                    >
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.blocked ? (
                      <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Blocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Allowed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {sortedEvents.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing <span className="font-medium text-foreground">{Math.min((effectivePage - 1) * pageSize + 1, sortedEvents.length)}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(effectivePage * pageSize, sortedEvents.length)}</span> of{' '}
              <span className="font-medium text-foreground">{sortedEvents.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, Math.min(p, totalPages) - 1))}
                disabled={effectivePage === 1}
              >
                Previous
              </Button>
              <span className="px-2">
                Page {effectivePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))}
                disabled={effectivePage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
