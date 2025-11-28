/**
 * Chat input - blue circle with new behavior:
 * - Closes after 1s if input empty and mouse leaves
 * - Stays open if text written (until cleared)
 * - Response stays visible until mouse leaves it
 * - Fast close (0.2s) when leaving response area
 * - Conversation persists until refresh
 * - Reopening shows last conversation
 */
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { api, DocumentContext } from '@services/api';
import axios from 'axios';

interface ChatInputProps {
  getDocumentContext: () => DocumentContext | undefined;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatInput = ({ getDocumentContext }: ChatInputProps) => {
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
    // If input is empty, close after 1s
    // If input has text, don't close
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
    // Fast close (0.2s) when leaving response - also clears conversation
    responseCloseTimerRef.current = setTimeout(() => {
      setConversation([]); // Clear conversation to hide response
      setError(null); // Clear any errors
    }, 200);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // If user clears all text while expanded, start close timer
    if (newValue.trim() === '' && isExpanded) {
      closeTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
    } else {
      // If typing, clear any pending close timer
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
    setMessage(''); // Clear input immediately

    // Add empty assistant message that will be filled with streaming content
    const streamingConversation: Message[] = [
      ...newConversation,
      { role: 'assistant', content: '' }
    ];
    setConversation(streamingConversation);

    try {
      const context = getDocumentContext();

      if (context) {
        console.log('Sending with context:', {
          path: context.path,
          contentLength: context.content.length
        });
      }

      let streamedContent = '';

      // Use streaming API
      await api.sendChatMessageStream(
        userMessage,
        context,
        // onChunk - append each chunk to the response
        (chunk: string) => {
          streamedContent += chunk;
          setConversation([
            ...newConversation,
            { role: 'assistant', content: streamedContent }
          ]);
        },
        // onComplete
        () => {
          console.log('Stream completed');
          setLoading(false);
        },
        // onError
        (errorMsg: string) => {
          console.error('Stream error:', errorMsg);
          setError(`Stream error: ${errorMsg}`);
          setLoading(false);
        }
      );

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
      setLoading(false);
    }
  };

  // Get last assistant message for display
  const lastAssistantMessage = conversation
    .slice()
    .reverse()
    .find(msg => msg.role === 'assistant');

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lastAssistantMessage?.content]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center w-full px-4 md:px-0"
    >
      {/* Response display - shows when we have conversation */}
      {(lastAssistantMessage || loading) && (
        <div
          ref={(el) => {
            responseAreaRef.current = el;
            scrollRef.current = el;
          }}
          className="mb-4 max-w-2xl w-full bg-white rounded-lg shadow-lg p-4 md:p-6 max-h-64 md:max-h-96 overflow-y-auto"
          onMouseEnter={handleResponseMouseEnter}
          onMouseLeave={handleResponseMouseLeave}
        >
          <div className="chat-response">
            {loading && !lastAssistantMessage?.content && (
              <div className="flex gap-1 text-gray-400 text-2xl">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </div>
            )}
            {lastAssistantMessage?.content && (
              <ReactMarkdown
                remarkPlugins={[remarkBreaks, remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-3">{children}</p>,
                  h1: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                }}
              >
                {lastAssistantMessage.content}
              </ReactMarkdown>
            )}
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
        ref={inputAreaRef}
        onMouseEnter={handleInputMouseEnter}
        onMouseLeave={handleInputMouseLeave}
        className={`transition-all duration-300 ease-out ${
          isExpanded
            ? 'w-full md:w-[500px] h-12 bg-white'
            : 'w-12 h-12 md:w-14 md:h-14 bg-blue-500'
        } rounded-full shadow-lg cursor-pointer flex items-center ${
          loading ? 'opacity-70' : ''
        }`}
      >
        {isExpanded ? (
          <form onSubmit={handleSubmit} className="w-full px-4 md:px-6">
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
              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
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