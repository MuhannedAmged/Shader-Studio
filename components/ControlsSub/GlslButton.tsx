import React from "react";
import { Terminal } from "lucide-react";

interface GlslButtonProps {
  onExport: () => void;
}

const GlslButton: React.FC<GlslButtonProps> = ({ onExport }) => {
  return (
    <button
      onClick={onExport}
      className="w-full h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/5"
    >
      <Terminal className="w-4 h-4" /> Edit GLSL
    </button>
  );
};

export default GlslButton;
