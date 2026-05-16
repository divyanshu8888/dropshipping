import React, { useState, useRef, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';

interface Column {
  field: string;
  headerName: string;
  width?: number;
  renderCell?: (params: any) => React.ReactNode;
}

interface DataGridProps {
  rows: any[];
  columns: Column[];
  title: string;
  onRowClick?: (row: any) => void;
  bulkActions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'warning';
  }>;
  onBulkAction?: (action: string, selectedRows: any[]) => void;
  onRowAction?: (action: string, row: any) => void;
  filters?: Array<{
    field: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  onFilterChange?: (filters: Record<string, string>) => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  onExport?: () => void;
}

export default function DataGrid({
  rows,
  columns,
  title,
  onRowClick,
  bulkActions = [],
  onBulkAction,
  onRowAction,
  filters = [],
  onFilterChange,
  searchable = false,
  onSearch,
  onExport
}: DataGridProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const handleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map(row => row.id)));
    }
  };

  const handleSelectRow = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkAction = (action: string) => {
    const selectedRowData = rows.filter(row => selectedRows.has(row.id));
    onBulkAction?.(action, selectedRowData);
    setSelectedRows(new Set());
  };

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...activeFilters, [field]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };
    if (openActionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openActionMenu]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const filteredRows = rows.filter(row => {
    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = columns.some(col => {
        const value = String(row[col.field] || '').toLowerCase();
        return value.includes(searchLower);
      }) || String(row.id || '').includes(searchLower);
      if (!matchesSearch) return false;
    }
    // Apply filters
    return Object.entries(activeFilters).every(([field, value]) => {
      if (!value) return true;
      return String(row[field]).toLowerCase().includes(value.toLowerCase());
    });
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-card">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {title && <h3 className="text-lg font-semibold text-text-base">{title}</h3>}
            <span className="text-sm text-white/60">({filteredRows.length} items)</span>
          </div>
          <div className="flex items-center space-x-2">
            {filters.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition ${
                  showFilters 
                    ? 'bg-brand-b/20 text-brand-b border border-brand-b/30' 
                    : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
            {onExport && (
              <button 
                onClick={onExport}
                className="p-2 rounded-lg bg-white/10 text-white/70 border border-white/10 hover:bg-white/15 transition"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {searchable && (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-b/50 focus:border-brand-b/30"
            />
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.field}>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg bg-white/10 text-text-base focus:outline-none focus:ring-2 focus:ring-brand-b/50 focus:border-brand-b/30"
                >
                  <option value="">All</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedRows.size > 0 && bulkActions.length > 0 && (
        <div className="p-3 border-b border-white/10 bg-brand-b/10">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-brand-b">
              {selectedRows.size} selected
            </span>
            <div className="flex space-x-2">
              {bulkActions.map(action => (
                <button
                  key={action.action}
                  onClick={() => handleBulkAction(action.action)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    action.variant === 'destructive'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30 hover:bg-rose-500/30'
                      : action.variant === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30'
                  }`}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === rows.length && rows.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-white/20 bg-white/10 text-brand-b focus:ring-brand-b/50 focus:ring-2"
                />
              </th>
              {columns.map(column => (
                <th
                  key={column.field}
                  className="px-4 py-3 text-left text-sm font-semibold text-white/90"
                  style={{ width: column.width }}
                >
                  {column.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredRows.map(row => (
              <tr
                key={row.id}
                className={`transition ${onRowClick ? 'cursor-pointer hover:bg-white/5' : 'hover:bg-white/5'}`}
                onClick={() => onRowClick?.(row)}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-white/20 bg-white/10 text-brand-b focus:ring-brand-b/50 focus:ring-2"
                  />
                </td>
                {columns.map(column => (
                  <td key={column.field} className="px-4 py-3 text-sm text-text-base">
                    {column.renderCell ? column.renderCell(row) : row[column.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && (
        <div className="text-center py-12 text-white/50">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm">No {title.toLowerCase()} found</p>
        </div>
      )}
    </div>
  );
}
