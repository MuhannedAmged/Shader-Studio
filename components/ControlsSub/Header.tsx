import React from "react";
import { Settings, X, ChevronLeft } from "lucide-react";

interface HeaderProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isVisible, setIsVisible }) => {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
          <Settings className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Shader Studio
          </h1>
          <p className="text-xs text-gray-400 font-medium">Fine-tune visuals</p>
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        aria-label="Close Controls"
      >
        {window.innerWidth < 640 ? (
          <X className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default Header;
