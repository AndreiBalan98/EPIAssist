/**
 * Header - Mobile/tablet only header bar.
 * Contains hamburger menu (left), title (center), TOC button (right).
 * Hidden on desktop (lg breakpoint and above).
 */

interface HeaderProps {
  onMenuClick: () => void;
  onTocClick: () => void;
  showTocButton: boolean;
}

export const Header = ({ onMenuClick, onTocClick, showTocButton }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-100 z-30 lg:hidden">
      <div className="flex items-center justify-between h-full px-4">
        {/* Hamburger menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title - centered */}
        <h1 className="text-base font-medium tracking-wide text-gray-800">
          <span className="font-semibold">EPI</span>
          <span className="font-normal italic text-gray-600">Assist</span>
        </h1>

        {/* TOC button */}
        {showTocButton ? (
          <button
            onClick={onTocClick}
            className="p-2 -mr-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors"
            aria-label="Open table of contents"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        ) : (
          // Placeholder for alignment when no TOC
          <div className="w-9" />
        )}
      </div>
    </header>
  );
};