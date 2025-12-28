import React from "react";
import { Undo, Redo, RefreshCw } from "lucide-react";

interface HistoryControlsProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onReset: () => void;
}

const HistoryControls: React.FC<HistoryControlsProps> = ({
  undo,
  redo,
  canUndo,
  canRedo,
  onReset,
}) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>
      <button
        onClick={onReset}
        className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5"
        title="Reset to Default"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
};

export default HistoryControls;
