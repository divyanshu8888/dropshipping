import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, User, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'action' | 'entity';
  action?: string;
  entityType?: string;
  entityId?: string;
}

interface CommandBarProps {
  onEntitySelect: (entityType: string, entityId: string) => void;
  onActionExecute: (action: string, params?: any) => void;
}

export default function CommandBar({ onEntitySelect, onActionExecute }: CommandBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Static command items for actions
  const staticCommands: CommandItem[] = [
    {
      id: 'approve-kyc',
      title: 'Approve Top 5 Pending KYC',
      description: 'Approve the 5 oldest pending KYC applications',
      icon: <User className="w-4 h-4" />,
      type: 'action',
      action: 'approve_kyc_batch'
    },
    {
      id: 'retry-webhooks',
      title: 'Retry Failed Webhooks',
      description: 'Retry the last 50 failed webhook deliveries',
      icon: <AlertTriangle className="w-4 h-4" />,
      type: 'action',
      action: 'retry_webhooks_batch'
    },
    {
      id: 'create-payout-hold',
      title: 'Create Payout Hold',
      description: 'Create a new payout hold for review',
      icon: <Package className="w-4 h-4" />,
      type: 'action',
      action: 'create_payout_hold'
    },
    {
      id: 'export-transactions',
      title: 'Export Transactions (CSV)',
      description: 'Export recent transactions to CSV',
      icon: <ShoppingCart className="w-4 h-4" />,
      type: 'action',
      action: 'export_transactions'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 0) {
      searchEntities();
    } else {
      setResults(staticCommands);
    }
  }, [query]);

  const searchEntities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        const entityResults: CommandItem[] = data.results.map((item: any) => ({
          id: `${item.type}_${item.id}`,
          title: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} #${item.id.slice(0, 8)}`,
          description: item.description || `${item.type} details`,
          icon: getEntityIcon(item.type),
          type: 'entity',
          entityType: item.type,
          entityId: item.id
        }));
        
        setResults([...staticCommands, ...entityResults]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults(staticCommands);
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'project': return <Package className="w-4 h-4" />;
      case 'service': return <Package className="w-4 h-4" />;
      case 'dispute': return <AlertTriangle className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const handleSelect = (item: CommandItem) => {
    if (item.type === 'action') {
      onActionExecute(item.action!, {});
    } else if (item.type === 'entity') {
      onEntitySelect(item.entityType!, item.entityId!);
    }
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => setIsOpen(false)} 
      />
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl border">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search users, orders, projects... or type a command"
              className="flex-1 outline-none text-lg"
            />
            <div className="flex items-center space-x-1 text-xs text-gray-400 ml-3">
              <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd>
              <span>navigate</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">↵</kbd>
              <span>select</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">esc</kbd>
              <span>close</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-500">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`flex items-center px-4 py-3 cursor-pointer ${
                    index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mr-3 text-gray-400">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Search className="w-6 h-6 mr-2" />
                <span>No results found</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>Press Ctrl+K to open this command palette anytime</span>
              <div className="flex items-center space-x-4">
                <span>Actions</span>
                <span>Entities</span>
                <span>Search</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
