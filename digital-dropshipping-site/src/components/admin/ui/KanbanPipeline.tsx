import React, { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  budget?: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color: string;
}

interface KanbanPipelineProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromStatus: string, toStatus: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (status: string) => void;
}

export default function KanbanPipeline({
  columns,
  onCardMove,
  onCardClick,
  onAddCard
}: KanbanPipelineProps) {
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, card: KanbanCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(status);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    if (draggedCard && draggedCard.status !== targetStatus) {
      onCardMove?.(draggedCard.id, draggedCard.status, targetStatus);
    }
    
    setDraggedCard(null);
    setDraggedOver(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🔄 Project Pipeline</h2>
        <div className="text-sm text-gray-500">
          Drag cards between columns to update status
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 rounded-lg border-2 transition-colors ${
              draggedOver === column.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`p-4 rounded-t-lg ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{column.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    {column.cards.length}
                  </span>
                  {onAddCard && (
                    <button
                      onClick={() => onAddCard(column.id)}
                      className="p-1 bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="p-4 space-y-3 min-h-96">
              {column.cards.map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  onClick={() => onCardClick?.(card)}
                  className={`bg-white border-l-4 ${getPriorityColor(card.priority)} rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{card.title}</h4>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {card.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      {card.assignee && (
                        <span className="bg-gray-100 px-2 py-1 rounded">{card.assignee}</span>
                      )}
                      {card.budget && (
                        <span className="text-green-600 font-medium">{formatCurrency(card.budget)}</span>
                      )}
                    </div>
                    {card.dueDate && (
                      <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {column.cards.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-2xl mb-2">📭</div>
                  <p className="text-sm">No cards in this column</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
