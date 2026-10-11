import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, X, RotateCcw } from 'lucide-react';
import { EVENT_CATEGORIES } from '../../data/seedData';

export function EventFilters({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
  viewMode = 'grid',
  onViewModeChange,
}) {
  const { search, category, status, dateFilter, sortBy } = filters;

  const isFilterActive =
    search ||
    category !== 'All' ||
    status !== 'All' ||
    dateFilter !== 'all' ||
    sortBy !== 'date_asc';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
      {/* Top Bar: Search + Quick Category Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by event title, keywords, topic, or venue..."
            value={search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {isFilterActive && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onFilterChange('category', 'All')}
          className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
            category === 'All'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          All Categories
        </button>
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onFilterChange('category', cat.id)}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
              category === cat.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters Bar: Date, Status, Sort */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => onFilterChange('dateFilter', e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">Any Date</option>
              <option value="upcoming">Upcoming Only</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="past">Past / Concluded</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="open">Registration Open</option>
              <option value="full">Full / Waitlist Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="date_asc">Earliest First</option>
              <option value="date_desc">Latest First</option>
              <option value="popularity">Most Popular</option>
              <option value="capacity">Largest Capacity</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{totalResults}</span> events
        </div>
      </div>
    </div>
  );
}

export default EventFilters;
