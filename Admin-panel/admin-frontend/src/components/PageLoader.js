import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = ({ message = 'Loading...', fullScreen = false, className = '' }) => {
  const containerClass = fullScreen
    ? 'min-h-screen'
    : 'min-h-[220px]';

  return (
    <div className={`flex items-center justify-center ${containerClass} ${className}`}>
      <div className="epg-card flex min-w-[220px] flex-col items-center gap-3 px-8 py-7">
        <div className="rounded-2xl bg-amber-50 p-3.5">
          <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        </div>
        <p className="text-sm font-semibold text-slate-600">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
