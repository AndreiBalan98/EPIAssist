/**
 * Chat input - blue circle that expands on hover.
 * Simple prompt flow - no document context.
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const responseCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const responseAreaRef = useRef<HTMLDivElement>(null);

  // Clear any pending timers
  const clearTimers = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (responseCloseTimerRef.current) {
      clearTimeout(responseCloseTimerRef.current);
      responseCloseTimerRef.current = null;
    }
  };

  // Handle mouse enter on input area
  const handleInputMouseEnter = () => {
    clearTimers();
    setIsExpanded(true);
  };

  // Handle mouse leave on input area
  const handleInputMouseLeave = () => {
    if (message.trim() === '') {
      closeTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
    }
  };

  // Handle mouse enter on response area
  const handleResponseMouseEnter = () => {
    clearTimers();
  };

  // Handle mouse leave on response area
  const handleResponseMouseLeave = () => {
    // Don't auto-close while loading
    if (loading) return;
    
    responseCloseTimerRef.current = setTimeout(() => {
      setConversation([]);
      setError(null);
    }, 200);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    if (newValue.trim() === '' && isExpanded) {
      closeTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
    } else {
      clearTimers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setLoading(true);
    setError(null);

    // Add user message to conversation
    const newConversation: Message[] = [
      ...conversation,
      { role: 'user', content: userMessage }
    ];
    setConversation(newConversation);
    setMessage('');

    try {
      // Send message to backend - no context
      const aiResponse = await api.sendChatMessage(userMessage);
      
      // Add AI response to conversation
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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Get last assistant message for display
  const lastAssistantMessage = conversation
    .slice()
    .reverse()
    .find(msg => msg.role === 'assistant');

  // Show response area if loading or has response
  const showResponseArea = loading || lastAssistantMessage;

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
    >
      {/* Response display - shows LoadingIndicator while loading */}
      {showResponseArea && (
        <div 
          ref={responseAreaRef}
          className="mb-4 max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 max-h-96 overflow-y-auto"
          onMouseEnter={handleResponseMouseEnter}
          onMouseLeave={handleResponseMouseLeave}
        >
          {loading ? (
            <LoadingIndicator />
          ) : lastAssistantMessage ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{lastAssistantMessage.content}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 max-w-2xl w-full bg-red-50 rounded-lg shadow-lg p-4">
          <p className="text-red-600 text-sm font-medium mb-1">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div
        ref={inputAreaRef}
        onMouseEnter={handleInputMouseEnter}
        onMouseLeave={handleInputMouseLeave}
        className={`transition-all duration-300 ease-out ${
          isExpanded 
            ? 'w-[500px] h-12 bg-white' 
            : 'w-14 h-14 bg-blue-500'
        } rounded-full shadow-lg cursor-pointer flex items-center ${
          loading ? 'opacity-70' : ''
        }`}
      >
        {isExpanded ? (
          <form onSubmit={handleSubmit} className="w-full px-6">
            <input
              type="text"
              value={message}
              onChange={handleTextChange}
              placeholder={loading ? "Se procesează..." : "Pune o întrebare..."}
              className="w-full outline-none text-gray-700 placeholder-gray-400"
              disabled={loading}
              autoFocus
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