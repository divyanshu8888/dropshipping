import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  read?: boolean;
  messageType?: string;
}

interface ChatSystemProps {
  conversationId: string;
  userId: string;
  isAdmin?: boolean;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ conversationId, userId, isAdmin = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    if (!conversationId || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        projectId: conversationId,
        userId,
      });
      const response = await fetch(`/api/clients/messages?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load messages');
      }

      setMessages(Array.isArray(payload.messages) ? payload.messages : []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setModerationWarning(error instanceof Error ? error.message : 'Failed to load messages.');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    loadMessages();
    const interval = window.setInterval(loadMessages, 30000);
    return () => window.clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkModeration = (text: string): { shouldWarn: boolean; warning: string | null } => {
    const patterns = {
      pricing: new RegExp(/(\$|€|£|₹|AUD|USD|EUR)\s*\d+|\b(per\s*(hour|hr|day|week|month)|rate|quote|price|discount|invoice|payment)\b|\b\d{2,}(\.\d{1,2})?\s*(k|per\s*hour|\/hr|\/month)\b/i),
      contact: new RegExp(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}|\b(whatsapp|telegram|discord|wechat|signal|meet|zoom|skype)\b/i),
      urls: new RegExp(/https?:\/\/|www\./)
    };

    if (patterns.pricing.test(text)) {
      return { shouldWarn: true, warning: 'Please keep pricing discussions out of chat. Use the project payment tools instead.' };
    }
    if (patterns.contact.test(text)) {
      return { shouldWarn: true, warning: 'Please avoid sharing contact information. Use Unitiv messaging.' };
    }
    if (patterns.urls.test(text)) {
      return { shouldWarn: true, warning: 'Please avoid sharing external links. Upload files through the platform instead.' };
    }

    return { shouldWarn: false, warning: null };
  };

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isSending) return;

    const moderationCheck = checkModeration(trimmed);
    if (moderationCheck.shouldWarn) {
      setModerationWarning(moderationCheck.warning);
      window.setTimeout(() => setModerationWarning(null), 5000);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/clients/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: conversationId,
          senderId: userId,
          content: trimmed,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to send message');
      }

      setNewMessage('');
      setModerationWarning(null);
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setModerationWarning(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
      window.setTimeout(() => setModerationWarning(null), 5000);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f17] shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Project discussion</h3>
          <p className="text-sm text-white/55">
            {messages.length} message{messages.length !== 1 ? 's' : ''}{isAdmin ? ' - admin view' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <h4 className="text-sm font-semibold text-white">No messages yet</h4>
              <p className="mt-1 text-sm text-white/55">Start the project conversation here.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender === 'client' || message.sender === userId;

            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-2xl px-4 py-3 text-sm shadow-lg lg:max-w-md ${
                    isMine
                      ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                      : 'border border-white/10 bg-white/[0.06] text-white/88'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                    {message.sender}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className="mt-2 text-[11px] opacity-60">
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {moderationWarning && (
        <div className="mx-4 mb-3 rounded-xl border border-red-400/25 bg-red-500/12 px-4 py-3 text-sm text-red-100">
          {moderationWarning}
        </div>
      )}

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <textarea
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message. Keep contact details and payments inside Unitiv."
            className="min-h-[3rem] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            rows={2}
            disabled={isSending}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/45">
          Use project milestones and payment tools for quotes, invoices, and delivery approvals.
        </p>
      </div>
    </div>
  );
};

export default ChatSystem;
