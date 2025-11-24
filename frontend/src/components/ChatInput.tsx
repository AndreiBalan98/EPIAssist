/**
 * Chat input - blue circle that expands on hover.
 */
import { useState } from 'react';

export const ChatInput = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Message:', message);
      setMessage('');
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`transition-all duration-300 ease-out ${
          isExpanded 
            ? 'w-[400px] h-12 bg-white' 
            : 'w-14 h-14 bg-blue-500'
        } rounded-full shadow-lg cursor-pointer flex items-center`}
      >
        {isExpanded && (
          <form onSubmit={handleSubmit} className="w-full px-6">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question..."
              className="w-full outline-none text-gray-700 placeholder-gray-400"
              autoFocus
            />
          </form>
        )}
      </div>
    </div>
  );
};