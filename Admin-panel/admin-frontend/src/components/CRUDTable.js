import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PageLoader from './PageLoader';

const CRUDTable = ({
  data,
  columns,
  loading,
  error,
  pagination,
  onPageChange,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  showAddButton = true,
  showActions = true,
  searchPlaceholder = 'Search...',
  addButtonText = 'Add New',
  title,
  headerRightContent = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  const handlePageChange = (page) => {
    onPageChange(page);
  };

  return (
    <div className="epg-card overflow-hidden">
      {/* Header */}
      <div className="epg-card-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h2>
          <div className="flex items-center gap-2">
            {headerRightContent}
            {showAddButton && (
              <button
                onClick={onAdd}
                className="epg-btn-primary sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                {addButtonText}
              </button>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="epg-input block pl-10" placeholder={searchPlaceholder} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <PageLoader message="Loading..." />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-red-600">Error: {error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-500">No data found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50/90">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 sm:px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}
                {showActions && (
                  <th className="px-4 sm:px-6 py-3 text-right text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item._id} className="transition-colors hover:bg-amber-50/40">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(item)}
                        className="mr-2 rounded-lg p-2 text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-slate-50/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-slate-600">
              Showing {((pagination.current - 1) * 10) + 1} to{' '}
              {Math.min(pagination.current * 10, pagination.count)} of{' '}
              {pagination.count} results
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="rounded-lg border border-gray-300 bg-white p-2 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                Page {pagination.current} of {pagination.total}
              </span>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current >= pagination.total}
                className="rounded-lg border border-gray-300 bg-white p-2 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRUDTable;
