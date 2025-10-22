import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessage {
  id: string;
  sender_id: string;
  body: string;
  original_body?: string;
  status: string;
  is_system_message: boolean;
  created_at: string;
  sender_name: string;
  violations?: any[];
  redacted?: boolean;
}

interface ConversationParticipant {
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
  mute_until?: string;
  user_name: string;
  user_email?: string;
}

interface ChatSystemProps {
  conversationId: string;
  userId: string;
  isAdmin?: boolean;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ conversationId, userId, isAdmin = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [showStructuredOptions, setShowStructuredOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation data
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const { data, error } = await supabase.rpc('get_conversation_with_moderation', {
          p_conversation_id: conversationId
        });

        if (error) throw error;

        setMessages(data.messages || []);
        setParticipants(data.participants || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading conversation:', error);
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, supabase]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Reload conversation to get full message data
          const reloadConversation = async () => {
            const { data } = await supabase.rpc('get_conversation_with_moderation', {
              p_conversation_id: conversationId
            });
            if (data) {
              setMessages(data.messages || []);
            }
          };
          reloadConversation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Client-side moderation check
  const checkModeration = (text: string): { shouldWarn: boolean; warning: string | null } => {
    const patterns = {
      pricing: new RegExp(/(\$|€|£|₹|AUD|USD|EUR)\s*\d+|\b(per\s*(hour|hr|day|week|month)|rate|quote|price|discount|invoice|payment)\b|\b\d{2,}(\.\d{1,2})?\s*(k|per\s*hour|\/hr|\/month)\b/i),
      contact: new RegExp(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}|\b(whatsapp|telegram|discord|wechat|signal|meet|zoom|skype)\b/i),
      urls: new RegExp(/https?:\/\/|www\./)
    };

    if (patterns.pricing.test(text)) {
      return { shouldWarn: true, warning: 'Please keep pricing discussions out of chat. Use "Request Quote" instead.' };
    }
    if (patterns.contact.test(text)) {
      return { shouldWarn: true, warning: 'Please avoid sharing contact information. Use the platform\'s messaging system.' };
    }
    if (patterns.urls.test(text)) {
      return { shouldWarn: true, warning: 'Please avoid sharing external links. Upload files through the platform instead.' };
    }

    return { shouldWarn: false, warning: null };
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    // Client-side moderation check
    const moderationCheck = checkModeration(newMessage);
    if (moderationCheck.shouldWarn) {
      setModerationWarning(moderationCheck.warning);
      setTimeout(() => setModerationWarning(null), 5000);
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.rpc('send_message', {
        p_conversation_id: conversationId,
        p_body: newMessage.trim()
      });

      if (error) throw error;

      if (data.success) {
        setNewMessage('');
        setModerationWarning(null);
      } else {
        setModerationWarning(data.reason || 'Message blocked by moderation policy');
        setTimeout(() => setModerationWarning(null), 5000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setModerationWarning('Failed to send message. Please try again.');
      setTimeout(() => setModerationWarning(null), 5000);
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Send structured request
  const sendStructuredRequest = async (type: string, data: any) => {
    try {
      const { error } = await supabase.rpc('create_structured_request', {
        p_conversation_id: conversationId,
        p_request_type: type,
        p_data: data
      });

      if (error) throw error;
      setShowStructuredOptions(false);
    } catch (error) {
      console.error('Error sending structured request:', error);
    }
  };

  // Mute/unmute user (admin only)
  const toggleUserMute = async (targetUserId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase.rpc('toggle_user_mute', {
        p_conversation_id: conversationId,
        p_user_id: targetUserId,
        p_mute_duration_minutes: 10
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling user mute:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Discussion</h3>
          <p className="text-sm text-gray-500">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStructuredOptions(!showStructuredOptions)}
            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
          >
            Quick Actions
          </button>
        </div>
      </div>

      {/* Participants List */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {participants.map((participant) => (
            <div
              key={participant.user_id}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                participant.is_muted 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}
            >
              <div className="w-2 h-2 bg-current rounded-full"></div>
              <span>{participant.user_name}</span>
              {participant.role === 'admin_observer' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
              {isAdmin && participant.user_id !== userId && (
                <button
                  onClick={() => toggleUserMute(participant.user_id)}
                  className="ml-1 text-xs hover:underline"
                >
                  {participant.is_muted ? 'Unmute' : 'Mute'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Structured Options Modal */}
      {showStructuredOptions && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => sendStructuredRequest('quote', { type: 'project_quote' })}
                className="w-full p-3 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <div className="font-medium">Request Quote</div>
                <div className="text-sm text-gray-600">Get a formal quote for this project</div>
              </button>
              <button
                onClick={() => sendStructuredRequest('file_share', { type: 'requirements' })}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium">Share Files</div>
                <div className="text-sm text-gray-600">Upload project requirements or documents</div>
              </button>
              <button
                onClick={() => sendStructuredRequest('milestone_update', { type: 'progress' })}
                className="w-full p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <div className="font-medium">Update Milestone</div>
                <div className="text-sm text-gray-600">Share progress on current milestone</div>
              </button>
            </div>
            <button
              onClick={() => setShowStructuredOptions(false)}
              className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.is_system_message
                  ? 'bg-blue-50 text-blue-800 mx-auto'
                  : message.sender_id === userId
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {!message.is_system_message && (
                <div className="text-xs opacity-75 mb-1">
                  {message.sender_name}
                </div>
              )}
              <div className="text-sm">
                {message.body}
                {message.redacted && (
                  <div className="text-xs mt-1 opacity-75">
                    [Content was moderated]
                  </div>
                )}
              </div>
              {isAdmin && message.violations && message.violations.length > 0 && (
                <div className="text-xs mt-1 opacity-75">
                  Violations: {message.violations.map(v => v.rule_code).join(', ')}
                </div>
              )}
              <div className="text-xs mt-1 opacity-75">
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Moderation Warning */}
      {moderationWarning && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">⚠️ {moderationWarning}</div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Avoid pricing, contact info, or external links)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          💡 Use "Quick Actions" for quotes, file sharing, and milestone updates
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
