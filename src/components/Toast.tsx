import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className="bg-theme-accent text-theme-accent-contrast px-4 py-3 shadow-2xl border border-theme-border flex items-center gap-3 text-xs font-medium tracking-wide">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>{toast}</span>
      </div>
    </div>
  );
};
