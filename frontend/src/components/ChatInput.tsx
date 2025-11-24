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

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Circle or expanded input */}
      {!isHovered ? (
        <div className="w-14 h-14 bg-blue-500 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110" />
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-full shadow-lg px-6 py-3 min-w-[400px]">
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
  );
};