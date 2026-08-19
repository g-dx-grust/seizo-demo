import { useEffect } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useDemo } from '../state/DemoContext';

export function Toast() {
  const { toast } = useDemo();
  if (!toast) return null;
  return (
    <div
      className="fixed bottom-9 left-1/2 -translate-x-1/2 z-50 bg-navy text-white text-[13px] font-medium pl-4 pr-5 py-3 rounded-full shadow-[0_12px_32px_rgba(15,23,42,0.35)] flex items-center gap-2"
      style={{ animation: 'toastin 0.25s ease' }}
    >
      <CheckCircle2 size={16} className="text-green shrink-0" />
      {toast}
    </div>
  );
}

export function ResetButton() {
  const { reset } = useDemo();
  return (
    <button
      onClick={reset}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 text-[11px] text-t3 bg-surface border border-line rounded-full px-3 py-1.5 shadow-sm hover:text-t2 hover:shadow"
    >
      <RotateCcw size={11} />
      デモをリセット
      <span className="text-[9px] border border-line rounded px-1 py-px text-t3">R</span>
    </button>
  );
}

export function GlobalHotkeys() {
  const { reset } = useDemo();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return;
      if (e.key === 'r' || e.key === 'R') reset();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reset]);
  return null;
}
