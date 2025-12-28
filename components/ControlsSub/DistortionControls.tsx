import React from "react";
import { Activity } from "lucide-react";
import { ShaderConfig } from "../../types";

interface DistortionControlsProps {
  config: ShaderConfig;
  handleSliderChange: (key: keyof ShaderConfig, value: number) => void;
}

const DistortionControls: React.FC<DistortionControlsProps> = ({
  config,
  handleSliderChange,
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Activity className="w-3 h-3" /> Warp & Distortion
      </label>

      {/* Distortion */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-distortion">
            Distortion
          </span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {config.distortion.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="5.0"
          step="0.1"
          value={config.distortion}
          aria-labelledby="label-distortion"
          onChange={(e) =>
            handleSliderChange("distortion", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
      </div>

      {/* Warp */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-warp">
            Warp
          </span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {config.warp.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="5.0"
          step="0.1"
          value={config.warp}
          aria-labelledby="label-warp"
          onChange={(e) =>
            handleSliderChange("warp", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
      </div>
    </div>
  );
};

export default DistortionControls;
