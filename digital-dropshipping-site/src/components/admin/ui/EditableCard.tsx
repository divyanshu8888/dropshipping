import React, { useState } from 'react';
import { Edit2, Save, X, MoreHorizontal } from 'lucide-react';

interface EditableCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: number;
  onClick?: () => void;
  onEdit?: (newValue: string | number) => void;
  editable?: boolean;
  fastActions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }>;
  onFastAction?: (action: string, params?: any) => void;
}

export default function EditableCard({
  title,
  value,
  icon,
  color,
  change,
  onClick,
  onEdit,
  editable = false,
  fastActions = [],
  onFastAction
}: EditableCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [showMenu, setShowMenu] = useState(false);

  const handleSave = () => {
    if (onEdit) {
      onEdit(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="relative bg-bg-surface rounded-2xl shadow-card border border-white/5 p-6 transform hover:-translate-y-1 transition-all cursor-pointer group">
      <div className="absolute inset-0 rounded-2xl bg-metal-sheen pointer-events-none"></div>
      <div className="absolute -top-px left-6 right-6 h-px bg-specular-line opacity-30"></div>
      
      {/* Fast Actions Menu */}
      {fastActions.length > 0 && (
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-white/70" />
          </button>
          
          {showMenu && (
            <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border z-10 min-w-48">
              {fastActions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFastAction?.(action.action, {});
                    setShowMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    action.variant === 'destructive' ? 'text-red-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {action.icon && <span>{action.icon}</span>}
                    <span>{action.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative flex items-center justify-between" onClick={onClick}>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-text-base focus:outline-none focus:ring-2 focus:ring-white/50"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-text-base">{value}</div>
              <div className="text-text-soft font-medium">{title}</div>
              {change !== undefined && (
                <div className={`text-sm font-semibold ${change > 0 ? 'text-accent-cyan' : change < 0 ? 'text-red-400' : 'text-text-mute'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}% vs last period
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {editable && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="w-4 h-4 text-white/70" />
            </button>
          )}
          <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-3xl shadow-metallic group-hover:animate-metallic-glow`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
