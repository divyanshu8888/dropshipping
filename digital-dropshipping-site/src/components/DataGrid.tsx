import React, { useState } from 'react';
import { Check, X, MoreHorizontal, Filter, Download } from 'lucide-react';

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
    variant?: 'default' | 'destructive';
  }>;
  onBulkAction?: (action: string, selectedRows: any[]) => void;
  filters?: Array<{
    field: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  onFilterChange?: (filters: Record<string, string>) => void;
}

export default function DataGrid({
  rows,
  columns,
  title,
  onRowClick,
  bulkActions = [],
  onBulkAction,
  filters = [],
  onFilterChange
}: DataGridProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

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

  const filteredRows = rows.filter(row => {
    return Object.entries(activeFilters).every(([field, value]) => {
      if (!value) return true;
      return String(row[field]).toLowerCase().includes(value.toLowerCase());
    });
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-gray-500">({filteredRows.length} items)</span>
        </div>
        <div className="flex items-center space-x-2">
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
          <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.field] || ''}
                  onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="p-3 bg-blue-50 border-b">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-blue-700">
              {selectedRows.size} selected
            </span>
            <div className="flex space-x-2">
              {bulkActions.map(action => (
                <button
                  key={action.action}
                  onClick={() => handleBulkAction(action.action)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    action.variant === 'destructive'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
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
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === rows.length && rows.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {columns.map(column => (
                <th
                  key={column.field}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                  style={{ width: column.width }}
                >
                  {column.headerName}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRows.map(row => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                {columns.map(column => (
                  <td key={column.field} className="px-4 py-3 text-sm text-gray-900">
                    {column.renderCell ? column.renderCell(row) : row[column.field]}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle row actions
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredRows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <p>No {title.toLowerCase()} found</p>
        </div>
      )}
    </div>
  );
}
