import React from "react";
import { Layers } from "lucide-react";
import { GradientType, ShaderConfig } from "../../types";

interface PatternTypeProps {
  config: ShaderConfig;
  handleTypeChange: (type: GradientType) => Promise<void> | void;
}

const PatternType: React.FC<PatternTypeProps> = ({
  config,
  handleTypeChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Layers className="w-3 h-3" /> Type
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {Object.values(GradientType).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`h-8 text-[8px] font-bold rounded-lg border transition-all truncate px-1 ${
              config.gradientType === type
                ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200"
            }`}
            title={type}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatternType;
