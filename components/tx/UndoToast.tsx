"use client";
import { useEffect } from "react";

export default function UndoToast({ message, onUndo, onDone }: { message: string; onUndo: () => void; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div role="status" className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-[16px] bg-ink px-4 py-2 text-sm text-white dark:bg-white dark:text-ink">
      <span>{message}</span>
      <button onClick={onUndo} aria-label="Undo delete" className="font-bold underline">Undo</button>
    </div>
  );
}
