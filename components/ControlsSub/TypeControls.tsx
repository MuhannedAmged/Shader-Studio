import React from "react";
import { Droplet } from "lucide-react";
import { GradientType } from "../../types";

interface TypeControlsProps {
  gradientType: GradientType;
  onTypeChange: (type: GradientType) => void;
}

const TypeControls: React.FC<TypeControlsProps> = ({
  gradientType,
  onTypeChange,
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <Droplet className="w-3 h-3 text-indigo-400" />
        <span>Pattern Type</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Object.values(GradientType).map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`h-8 text-[8px] font-bold rounded-lg border transition-all truncate px-1 ${
              gradientType === type
                ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
            }`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>
    </section>
  );
};

export default TypeControls;
