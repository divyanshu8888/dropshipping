import React, { useState, useEffect } from 'react';
import { X, Save, History, FileText, User, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

interface EntityDrawerProps {
  open: boolean;
  onClose: () => void;
  entity: any;
  entityType: 'user' | 'order' | 'project' | 'service' | 'dispute' | 'kyc';
}

interface TabData {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function EntityDrawer({ open, onClose, entity, entityType }: EntityDrawerProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [entityDetails, setEntityDetails] = useState<any>(null);

  const tabs: TabData[] = [
    { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'edit', label: 'Edit', icon: <Save className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (entity) {
      setEntityDetails(entity);
      setFormData(entity);
      loadEntityData();
    } else {
      setEntityDetails(null);
      setFormData({});
    }
  }, [entity, entityType]);

  const loadEntityData = async () => {
    if (!entity?.id) return;

    try {
      // Load details, notes, and history for this entity
      const [detailsResponse, notesResponse, historyResponse] = await Promise.all([
        fetch(`/api/admin/entity-details?entityId=${entity.id}&entityType=${entityType}`),
        fetch(`/api/admin/entity-notes?entityId=${entity.id}&entityType=${entityType}`),
        fetch(`/api/admin/entity-history?entityId=${entity.id}&entityType=${entityType}`)
      ]);

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        if (detailsData?.entity) {
          setEntityDetails(detailsData.entity);
          setFormData(detailsData.entity);
        }
      }

      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.notes || '');
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }
    } catch (error) {
      console.error('Error loading entity data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/update-entity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId: entity.id,
          data: formData
        })
      });

      if (response.ok) {
        setIsEditing(false);
        // Show success toast
        showToast('Changes saved successfully', 'success');
        // Reload data
        loadEntityData();
      } else {
        throw new Error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Failed to save changes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string, params: any = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          entityType,
          entityId: entity.id,
          params
        })
      });

      if (response.ok) {
        showToast(`${action} completed successfully`, 'success');
        loadEntityData();
      } else {
        throw new Error(`Failed to ${action}`);
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
      showToast(`Failed to ${action}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation - you can replace with your preferred toast library
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'user': return <User className="w-6 h-6" />;
      case 'order': return <ShoppingCart className="w-6 h-6" />;
      case 'project': return <Package className="w-6 h-6" />;
      case 'service': return <Package className="w-6 h-6" />;
      case 'dispute': return <AlertTriangle className="w-6 h-6" />;
      case 'kyc': return <User className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const renderSummary = () => {
    const details = entityDetails ?? entity ?? {};

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Entity Details</h3>
          {Object.keys(details).length === 0 ? (
            <p className="text-sm text-gray-500">No details available for this entity.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(details).map(([key, value]) => (
                <div key={key}>
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <p className="text-sm text-gray-900">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {entityType === 'kyc' && (
              <>
                <button
                  onClick={() => handleQuickAction('approve')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Approve KYC
                </button>
                <button
                  onClick={() => handleQuickAction('reject')}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Reject KYC
                </button>
              </>
            )}
            {entityType === 'order' && (
              <>
                <button
                  onClick={() => handleQuickAction('refund')}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                >
                  Issue Refund
                </button>
                <button
                  onClick={() => handleQuickAction('hold')}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Hold Order
                </button>
              </>
            )}
            {entityType === 'user' && (
              <>
                <button
                  onClick={() => handleQuickAction('suspend')}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Suspend User
                </button>
                <button
                  onClick={() => handleQuickAction('verify')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Verify User
                </button>
              </>
            )}
            {entityType !== 'kyc' && entityType !== 'order' && entityType !== 'user' && (
              <p className="text-sm text-gray-700">No quick actions available for this entity type.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEdit = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit {entityType}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(formData || {}).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <input
              type="text"
              value={String(value)}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Audit History</h3>
      <div className="space-y-2">
        {history.length > 0 ? (
          history.map((entry, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{entry.action}</span>
                <span className="text-sm text-gray-500">{entry.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
              <p className="text-xs text-gray-500">By: {entry.actor}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No history available</p>
        )}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notes</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this entity..."
        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={async () => {
          try {
            await fetch(`/api/admin/save-notes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entityType,
                entityId: entity.id,
                notes
              })
            });
            showToast('Notes saved', 'success');
          } catch (error) {
            showToast('Failed to save notes', 'error');
          }
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Notes
      </button>
    </div>
  );

  if (!open) return null;

  const entityTypeLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const entityIdValue = entityDetails?.id ?? entity?.id;
  const entityIdLabel =
    entityIdValue !== undefined && entityIdValue !== null ? String(entityIdValue).slice(0, 8) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl text-gray-900">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              {getEntityIcon()}
              <h2 className="text-lg font-semibold">
                {entityTypeLabel}
                {entityIdLabel ? ` #${entityIdLabel}` : ''}
              </h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'edit' && renderEdit()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'notes' && renderNotes()}
          </div>
        </div>
      </div>
    </div>
  );
}
