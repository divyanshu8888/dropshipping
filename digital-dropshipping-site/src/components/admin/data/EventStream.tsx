import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Filter, Pin, User } from 'lucide-react';

interface EventItem {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  user_id?: string;
  title: string;
  description: string;
  metadata: any;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived' | 'deleted';
  assigned_to?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface EventStreamProps {
  events: EventItem[];
  onEventClick?: (event: EventItem) => void;
  onAssign?: (eventId: string, assignee: string) => void;
  onPin?: (eventId: string) => void;
  filters?: Array<{
    field: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  onFilterChange?: (filters: Record<string, string>) => void;
}

export default function EventStream({
  events,
  onEventClick,
  onAssign,
  onPin,
  filters = [],
  onFilterChange
}: EventStreamProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'user_registered': return '👤';
      case 'order_placed': return '🛒';
      case 'project_created': return '📋';
      case 'service_created': return '🔧';
      case 'review_posted': return '⭐';
      case 'dispute_opened': return '⚖️';
      case 'kyc_submitted': return '📋';
      case 'kyc_approved': return '✅';
      case 'payment_processed': return '💰';
      case 'payment_failed': return '❌';
      case 'freelancer_approved': return '✅';
      case 'order_completed': return '✅';
      case 'message_flagged': return '🚩';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const filteredEvents = events.filter(event => {
    return Object.entries(activeFilters).every(([field, value]) => {
      if (!value) return true;
      const eventValue = event[field as keyof EventItem];
      if (eventValue === null || eventValue === undefined) return false;
      return String(eventValue).toLowerCase().includes(value.toLowerCase());
    });
  });

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && !isPaused && streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [events, autoScroll, isPaused]);

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...activeFilters, [field]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleAssign = async (eventId: string) => {
    const assignee = prompt('Assign to (admin email):');
    if (assignee) {
      try {
        const response = await fetch('/api/admin/manage-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'assign', eventId, assignedTo: assignee })
        });
        
        if (response.ok) {
          onAssign?.(eventId, assignee);
        } else {
          console.error('Failed to assign event');
        }
      } catch (error) {
        console.error('Error assigning event:', error);
      }
    }
  };

  const handlePin = async (eventId: string) => {
    try {
      const response = await fetch('/api/admin/manage-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', eventId })
      });
      
      if (response.ok) {
        onPin?.(eventId);
      } else {
        console.error('Failed to pin event');
      }
    } catch (error) {
      console.error('Error pinning event:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📡 Live Event Stream</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-lg ${isPaused ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-lg ${autoScroll ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <span className="text-xs">Auto</span>
          </button>
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
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

      {/* Event Stream */}
      <div
        ref={streamRef}
        className="h-96 overflow-y-auto space-y-2 border rounded-lg p-4 bg-gray-50"
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className={`border-l-4 ${getPriorityColor(event.priority)} rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getEventIcon(event.event_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                      {event.metadata?.user_name && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {event.metadata.user_name}
                        </span>
                      )}
                      {event.metadata?.amount && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ${event.metadata.amount}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.priority === 'high' ? 'bg-red-100 text-red-800' :
                        event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {event.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.status === 'active' ? 'bg-green-100 text-green-800' :
                        event.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {event.is_pinned ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePin(event.id);
                      }}
                      className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                    >
                      📌
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePin(event.id);
                      }}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssign(event.id);
                    }}
                    className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No events found</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {filteredEvents.length} events
          {isPaused && <span className="ml-2 text-red-500">• Paused</span>}
        </span>
        <span>
          {autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
        </span>
      </div>
    </div>
  );
}
