import { Sparkles, Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  variant?: 'default' | 'horizontal' | 'icon-only';
}

export default function Logo({ size = 'md', showIcon = true, variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: { text: 'text-base', aiText: 'text-lg', icon: 'w-4 h-4', aiIcon: 'w-3 h-3' },
    md: { text: 'text-xl', aiText: 'text-2xl', icon: 'w-6 h-6', aiIcon: 'w-4 h-4' },
    lg: { text: 'text-2xl', aiText: 'text-3xl', icon: 'w-7 h-7', aiIcon: 'w-5 h-5' },
    xl: { text: 'text-3xl', aiText: 'text-4xl', icon: 'w-9 h-9', aiIcon: 'w-6 h-6' },
  };

  const currentSize = sizeClasses[size];

  if (variant === 'icon-only') {
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-md opacity-70"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
            <Sparkles className={`${currentSize.icon} text-white`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-70"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-1.5">
            <Sparkles className={`${currentSize.icon} text-white`} />
          </div>
        </div>
      )}
      <div className={`font-bold ${currentSize.text} flex items-center gap-1`}>
        <span className="text-white">ProMatch</span>
        <div className="relative inline-flex items-center">
          {/* AI Badge with prominent styling */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-md blur-sm"></div>
            <div className={`relative bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 px-2 py-0.5 rounded-md ${currentSize.aiText} font-extrabold text-white shadow-lg flex items-center gap-0.5`}>
              <Zap className={`${currentSize.aiIcon} fill-white`} />
              <span>AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}