import React from "react";
import { Zap } from "lucide-react";
import { ShaderConfig } from "../../types";

interface GeometryControlsProps {
  config: ShaderConfig;
  handleSliderChange: (key: keyof ShaderConfig, value: number) => void;
}

const GeometryControls: React.FC<GeometryControlsProps> = ({
  config,
  handleSliderChange,
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Zap className="w-3 h-3" /> Geometry
      </label>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Density</span>
          <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
            {config.density.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={config.density}
          onChange={(e) =>
            handleSliderChange("density", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Strength</span>
          <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
            {config.strength.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={config.strength}
          onChange={(e) =>
            handleSliderChange("strength", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
        />
      </div>
    </div>
  );
};

export default GeometryControls;
