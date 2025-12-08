/**
 * Chat input - blue circle that expands on hover.
 * Single isOpen state controls everything - input, response, loading.
 * Stays open while loading, closes together on mouse leave.
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

  // Clear close timer
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Handle mouse enter - open everything
  const handleMouseEnter = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  // Handle mouse leave - close after delay (unless loading or typing)
  const handleMouseLeave = () => {
    // Don't close while loading
    if (loading) return;
    
    // Don't close if user is typing
    if (message.trim() !== '') return;

    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // If user clears input and mouse is outside, start close timer
    // (handleMouseLeave will be called naturally if mouse is outside)
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setLoading(true);
    setError(null);
    clearCloseTimer(); // Ensure it stays open during loading

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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Response / Loading / Error area */}
      {showResponseArea && (
        <div className="mb-4 max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <LoadingIndicator />
          ) : error ? (
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : lastAssistantMessage ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{lastAssistantMessage.content}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      )}

      {/* Input area - expanded or collapsed */}
      <div
        className={`transition-all duration-300 ease-out ${
          isOpen 
            ? 'w-[500px] h-12 bg-white' 
            : 'w-14 h-14 bg-blue-500'
        } rounded-full shadow-lg cursor-pointer flex items-center ${
          loading ? 'opacity-70' : ''
        }`}
      >
        {isOpen ? (
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