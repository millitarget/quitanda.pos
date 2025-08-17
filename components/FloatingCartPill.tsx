import React from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from './ui/button';

interface FloatingCartPillProps {
  count: number;
  total: number;
  onOpenSummary: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
}

export const FloatingCartPill: React.FC<FloatingCartPillProps> = ({
  count,
  total,
  onOpenSummary,
  onSubmit,
  submitting,
}) => {
  if (count <= 0) return null;

  return (
    <div
      className="floating-element pointer-events-auto flex items-center gap-2 rounded-full shadow-lg bg-card border px-3 py-2 w-auto max-w-[90vw]"
      style={{ right: undefined }}
    >
      <button
        onClick={onOpenSummary}
        className="flex items-center gap-2 px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-sm font-medium">{count}</span>
        <span className="text-sm font-semibold">€{total.toFixed(2)}</span>
      </button>

      {onSubmit && (
        <Button
          size="sm"
          className="rounded-full h-8 px-3 bg-green-600 hover:bg-green-700"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <span className="text-sm">A enviar…</span>
          ) : (
            <span className="flex items-center gap-1 text-sm"><Check className="h-4 w-4" /> Enviar</span>
          )}
        </Button>
      )}
    </div>
  );
};


