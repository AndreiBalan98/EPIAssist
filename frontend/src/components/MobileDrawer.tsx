/**
 * MobileDrawer - Reusable drawer component for mobile/tablet.
 * Slides from left or right with overlay backdrop.
 * Tap outside to close.
 */
import { useEffect } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  children: React.ReactNode;
  title?: string;
}

export const MobileDrawer = ({ 
  isOpen, 
  onClose, 
  side, 
  children,
  title 
}: MobileDrawerProps) => {
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const slideClass = side === 'left' 
    ? `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 ${slideClass} h-full w-72 max-w-[80vw] bg-white shadow-xl z-50 
          transform transition-transform duration-300 ease-out lg:hidden`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full pb-20">
          {children}
        </div>
      </div>
    </>
  );
};