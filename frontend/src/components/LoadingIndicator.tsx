/**
 * Loading indicator with rotating messages and animated dots.
 * Shows contextual messages while AI processes the request.
 */
import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Analizez întrebarea ta',
  'Caut în documentele legislative',
  'Identific secțiunile relevante',
  'Extrag informațiile necesare',
  'Verific sursele',
  'Formulez răspunsul',
  'Adaug referințele',
];

const MESSAGE_DURATION = 2500; // 2.5 seconds per message
const DOT_INTERVAL = 400; // 400ms between dots

export const LoadingIndicator = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  // Rotate through messages
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      setDotCount(0); // Reset dots on message change
    }, MESSAGE_DURATION);

    return () => clearInterval(messageTimer);
  }, []);

  // Animate dots (0 -> 1 -> 2 -> 3 -> 0 -> ...)
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, DOT_INTERVAL);

    return () => clearInterval(dotTimer);
  }, []);

  const currentMessage = LOADING_MESSAGES[messageIndex];
  const dots = '.'.repeat(dotCount);

  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-gray-500 italic text-base">
        {currentMessage}
        <span className="inline-block w-6 text-left">{dots}</span>
      </p>
    </div>
  );
};