'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import type { ChatMessage, ChatConversation, ChatEscalationStatus } from '@/types';

/**
 * Chatbot Component - STORY-082: AI chatbot vraag stellen
 * 
 * Features:
 * - Chat bubble interface
 * - Typing indicator
 * - Follow-up suggestions
 * - Escalation to board (STORY-123)
 */

interface ChatbotProps {
  vveId: string;
  onClose?: () => void;
}

// Message bubble component
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isSystem
            ? 'bg-yellow-100 text-yellow-800 text-sm italic'
            : isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        
        {/* Document references */}
        {message.document_references.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Gerelateerde documenten:</p>
            {message.document_references.map((doc) => (
              <a
                key={doc.document_id}
                href={doc.path || '#'}
                className="text-sm text-blue-600 hover:underline block"
              >
                📄 {doc.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-100 rounded-2xl px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Follow-up suggestions
function FollowUpSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-sm bg-white border border-blue-200 text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

export default function Chatbot({ vveId, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [escalationStatus, setEscalationStatus] = useState<ChatEscalationStatus>('none');
  const [showEscalationDialog, setShowEscalationDialog] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `temp-${crypto.randomUUID()}`,
      role: 'user',
      content: inputValue.trim(),
      created_at: new Date().toISOString(),
      document_references: [],
      follow_up_suggestions: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Dynamic import to avoid SSR issues
      const { api } = await import('@/lib/api');

      if (!conversationId) {
        // Create new conversation
        const conversation = await api.createChatConversation(vveId, userMessage.content);
        setConversationId(conversation.id);
        setMessages(conversation.messages);
        setEscalationStatus(conversation.escalation_status);
      } else {
        // Add to existing conversation
        const response = await api.addChatMessage(vveId, conversationId, userMessage.content);
        setMessages((prev) => [...prev, response]);
      }
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: `temp-error-${crypto.randomUUID()}`,
        role: 'system',
        content: 'Er is een fout opgetreden. Probeer het later opnieuw.',
        created_at: new Date().toISOString(),
        document_references: [],
        follow_up_suggestions: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFollowUpSelect = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleEscalate = async () => {
    if (!conversationId || !escalationReason.trim()) return;

    setIsLoading(true);
    try {
      const { api } = await import('@/lib/api');
      const response = await api.escalateChatConversation(vveId, conversationId, escalationReason.trim());
      setEscalationStatus(response.escalation_status);
      setShowEscalationDialog(false);
      setEscalationReason('');

      // Add system message about escalation
      const systemMessage: ChatMessage = {
        id: `temp-system-${crypto.randomUUID()}`,
        role: 'system',
        content: 'Uw vraag is doorgestuurd naar het bestuur. U ontvangt een reactie via e-mail.',
        created_at: new Date().toISOString(),
        document_references: [],
        follow_up_suggestions: [],
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: `temp-error-${crypto.randomUUID()}`,
        role: 'system',
        content: 'Er is een fout opgetreden bij het escaleren. Probeer het later opnieuw.',
        created_at: new Date().toISOString(),
        document_references: [],
        follow_up_suggestions: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get last assistant message for follow-up suggestions
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <div>
            <h3 className="font-medium">VVE Assistent</h3>
            <p className="text-xs text-blue-100">Stel uw vraag</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded"
            aria-label="Sluiten"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <span className="text-4xl mb-2 block">🤖</span>
            <p className="font-medium">Welkom bij de VVE Assistent</p>
            <p className="text-sm mt-1">
              Stel uw vraag over contributie, onderhoud, vergaderingen of andere VVE-zaken.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Follow-up suggestions */}
        {!isLoading && lastAssistantMessage?.follow_up_suggestions && (
          <FollowUpSuggestions
            suggestions={lastAssistantMessage.follow_up_suggestions}
            onSelect={handleFollowUpSelect}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Escalation dialog */}
      {showEscalationDialog && (
        <div className="p-4 border-t bg-yellow-50">
          <p className="text-sm text-gray-700 mb-2">
            Beschrijf kort waarom u uw vraag wilt doorsturen naar het bestuur:
          </p>
          <textarea
            value={escalationReason}
            onChange={(e) => setEscalationReason(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
            rows={2}
            placeholder="Reden voor escalatie..."
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleEscalate}
              isLoading={isLoading}
              disabled={!escalationReason.trim()}
            >
              Versturen
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEscalationDialog(false)}
            >
              Annuleren
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Typ uw vraag..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isLoading}
          />
          <Button
            variant="primary"
            onClick={handleSendMessage}
            isLoading={isLoading}
            disabled={!inputValue.trim()}
            aria-label="Versturen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>

        {/* Escalation button */}
        {conversationId && escalationStatus === 'none' && !showEscalationDialog && (
          <button
            onClick={() => setShowEscalationDialog(true)}
            className="mt-2 text-sm text-gray-500 hover:text-blue-600"
          >
            💡 Antwoord niet gevonden? Vraag doorsturen naar bestuur
          </button>
        )}

        {escalationStatus === 'escalated' && (
          <p className="mt-2 text-sm text-green-600">
            ✓ Uw vraag is doorgestuurd naar het bestuur
          </p>
        )}
      </div>
    </div>
  );
}
