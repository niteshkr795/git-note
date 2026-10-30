'use client';

import React from 'react';
import { useResources } from '@/context/ResourceContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useResources();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-[#991b1b] shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-[#1d3b64] shrink-0 mt-0.5" />,
        };

        const borderMap = {
          success: 'border-[#bbf7d0] bg-white',
          error: 'border-[#fecaca] bg-white',
          warning: 'border-[#fde68a] bg-white',
          info: 'border-[#cfdbe8] bg-white',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-md border shadow-md transition-all ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#18181b]">{toast.title}</h4>
              <p className="text-xs text-[#52525b] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#71717a] hover:text-[#18181b] p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
