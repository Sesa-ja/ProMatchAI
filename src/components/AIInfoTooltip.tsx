import { useState } from 'react';
import { Info } from 'lucide-react';

interface AIInfoTooltipProps {
  content: string;
}

export default function AIInfoTooltip({ content }: AIInfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-purple-600 hover:text-purple-700 transition-colors"
        aria-label="AI Information"
      >
        <Info className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-purple-900 text-white text-xs rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="relative">
            {content}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
