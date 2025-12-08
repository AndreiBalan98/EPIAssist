/**
 * Chat input - blue circle that expands on hover/tap.
 * Desktop: hover to expand
 * Mobile: tap to expand, tap outside to close
 * Responsive width when expanded.
 */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '@services/api';
import { LoadingIndicator } from '@components/LoadingIndicator';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatInput = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear close timer
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Check if device supports touch
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // Handle mouse enter - open everything (desktop only)
  const handleMouseEnter = () => {
    if (isTouchDevice()) return;
    clearCloseTimer();
    setIsOpen(true);
  };

  // Handle mouse leave - close after delay (desktop only)
  const handleMouseLeave = () => {
    if (isTouchDevice()) return;
    
    // Don't close while loading
    if (loading) return;
    
    // Don't close if user is typing
    if (message.trim() !== '') return;

    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  // Handle tap on bubble (mobile)
  const handleBubbleTap = () => {
    if (!isTouchDevice()) return;
    
    if (!isOpen) {
      setIsOpen(true);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  // Handle tap outside to close (mobile)
  useEffect(() => {
    if (!isTouchDevice()) return;

    const handleTouchOutside = (e: TouchEvent) => {
      if (!isOpen) return;
      if (loading) return;
      if (message.trim() !== '') return;
      
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchOutside);
    return () => document.removeEventListener('touchstart', handleTouchOutside);
  }, [isOpen, loading, message]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setLoading(true);
    setError(null);
    clearCloseTimer();

    // Add user message to conversation
    const newConversation: Message[] = [
      ...conversation,
      { role: 'user', content: userMessage }
    ];
    setConversation(newConversation);
    setMessage('');

    try {
      const aiResponse = await api.sendChatMessage(userMessage);
      
      setConversation([
        ...newConversation,
        { role: 'assistant', content: aiResponse }
      ]);
      
    } catch (err) {
      console.error('Chat error:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const statusCode = err.response.status;
          const detail = err.response.data?.detail || 'Unknown error';
          setError(`Server error (${statusCode}): ${detail}`);
        } else if (err.request) {
          setError('No response from server. Is the backend running?');
        } else {
          setError(`Request error: ${err.message}`);
        }
      } else {
        setError('Failed to get response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  // Get last assistant message for display
  const lastAssistantMessage = conversation
    .slice()
    .reverse()
    .find(msg => msg.role === 'assistant');

  // Determine what to show in response area
  const showResponseArea = isOpen && (loading || lastAssistantMessage || error);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center
        w-[calc(100%-2rem)] sm:w-auto
        max-w-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Response / Loading / Error area - light blue background */}
      {showResponseArea && (
        <div className="mb-4 w-full bg-blue-50 rounded-lg shadow-lg p-4 sm:p-6 max-h-80 sm:max-h-96 overflow-y-auto border border-blue-100">
          {loading ? (
            <LoadingIndicator />
          ) : error ? (
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : lastAssistantMessage ? (
            <div className="prose prose-sm max-w-none prose-blue">
              <ReactMarkdown>{lastAssistantMessage.content}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      )}

      {/* Input area - expanded or collapsed */}
      <div
        onClick={handleBubbleTap}
        className={`transition-all duration-300 ease-out ${
          isOpen 
            ? 'w-full sm:w-[500px] h-12 bg-blue-50 rounded-full border border-blue-200' 
            : 'w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full'
        } shadow-lg cursor-pointer flex items-center ${
          loading ? 'opacity-70' : ''
        }`}
      >
        {isOpen ? (
          <form onSubmit={handleSubmit} className="w-full px-4 sm:px-6">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleTextChange}
              placeholder={loading ? "Se procesează..." : "Pune o întrebare..."}
              className="w-full outline-none text-gray-700 placeholder-blue-400 text-sm sm:text-base bg-transparent"
              disabled={loading}
              autoFocus={!isTouchDevice()}
            />
          </form>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};