/**
 * Chat input - blue circle that expands on hover with AI response display.
 */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '@services/api';
import axios from 'axios';

export const ChatInput = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    // Clear any pending collapse timer
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    // Start collapse timer (1.5s delay)
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const aiResponse = await api.sendChatMessage(message.trim());
      setResponse(aiResponse);
      setMessage('');
    } catch (err) {
      console.error('Chat error:', err);
      
      // Better error messages
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error
          const statusCode = err.response.status;
          const detail = err.response.data?.detail || 'Unknown error';
          setError(`Server error (${statusCode}): ${detail}`);
        } else if (err.request) {
          // Request made but no response
          setError('No response from server. Is the backend running?');
        } else {
          // Error in request setup
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
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Response display */}
      {response && (
        <div className="mb-4 max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
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
              onChange={(e) => setMessage(e.target.value)}
              placeholder={loading ? "Thinking..." : "Ask a question..."}
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