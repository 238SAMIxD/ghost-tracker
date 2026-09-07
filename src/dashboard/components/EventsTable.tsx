import { useState, useMemo } from 'react';
import type { TrackerEvent } from '@/db';

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
    return <span className="ml-1 text-indigo-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">

      <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="m-0 text-base font-bold text-slate-100 whitespace-nowrap">Recent Tracker Events</h2>
        
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search domains or URLs..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-slate-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-xxs uppercase tracking-wider select-none">
              <th className="p-0 font-medium" aria-sort={sortField === 'timestamp' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  type="button"
                  className="w-full h-full text-left px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors group focus:outline-none focus:bg-slate-800"
                  onClick={() => handleSort('timestamp')}
                >
                  Timestamp {renderSortIndicator('timestamp')}
                </button>
              </th>
              <th className="p-0 font-medium" aria-sort={sortField === 'hostDomain' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  type="button"
                  className="w-full h-full text-left px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors group focus:outline-none focus:bg-slate-800"
                  onClick={() => handleSort('hostDomain')}
                >
                  Host Domain {renderSortIndicator('hostDomain')}
                </button>
              </th>
              <th className="px-6 py-4 font-medium">Tracker URL</th>
              <th className="p-0 font-medium" aria-sort={sortField === 'category' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  type="button"
                  className="w-full h-full text-left px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors group focus:outline-none focus:bg-slate-800"
                  onClick={() => handleSort('category')}
                >
                  Category {renderSortIndicator('category')}
                </button>
              </th>
              <th className="p-0 font-medium" aria-sort={sortField === 'blocked' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button
                  type="button"
                  className="w-full h-full text-left px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors group focus:outline-none focus:bg-slate-800"
                  onClick={() => handleSort('blocked')}
                >
                  Action {renderSortIndicator('blocked')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No tracker events recorded yet. Browse the web and Ghost Tracker will capture them here.
                </td>
              </tr>
            ) : paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No events matched your search query.
                </td>
              </tr>
            ) : (
              paginatedEvents.map((event, i) => (
                <tr key={event.id ?? i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-slate-300">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-200">{event.hostDomain}</td>
                  <td className="px-6 py-3 max-w-table-col truncate text-slate-400" title={event.trackerUrl}>
                    {event.trackerUrl}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="inline-flex px-2 py-0.5 rounded text-micro font-bold uppercase tracking-wide text-white"
                      style={{ backgroundColor: categoryColors[event.category] || categoryColors.unknown }}
                    >
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {event.blocked ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Blocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Allowed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {sortedEvents.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
          <div>
            Showing <span className="font-medium text-slate-200">{Math.min((effectivePage - 1) * pageSize + 1, sortedEvents.length)}</span> to{' '}
            <span className="font-medium text-slate-200">{Math.min(effectivePage * pageSize, sortedEvents.length)}</span> of{' '}
            <span className="font-medium text-slate-200">{sortedEvents.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, Math.min(p, totalPages) - 1))}
              disabled={effectivePage === 1}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-2">
              Page {effectivePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))}
              disabled={effectivePage === totalPages}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
