import React from "react";
import { Sliders } from "lucide-react";
import { ShaderConfig } from "../../types";

interface CorrectionControlsProps {
  config: ShaderConfig;
  handleSliderChange: (key: keyof ShaderConfig, value: number) => void;
}

const CorrectionControls: React.FC<CorrectionControlsProps> = ({
  config,
  handleSliderChange,
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Sliders className="w-3 h-3" /> Corrections
      </label>

      {/* Bloom */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Bloom Intensity</span>
          <span className="text-xs font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
            {config.bloomIntensity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="2.0"
          step="0.01"
          value={config.bloomIntensity}
          onChange={(e) =>
            handleSliderChange("bloomIntensity", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 transition-all"
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Bloom Radius</span>
          <span className="text-xs font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
            {config.bloomRadius.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.01"
          value={config.bloomRadius}
          onChange={(e) =>
            handleSliderChange("bloomRadius", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 transition-all"
        />
      </div>

      {/* Hue */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Hue Shift</span>
          <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
            {(config.hue / Math.PI).toFixed(2)}π
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.PI * 2}
          step="0.1"
          value={config.hue}
          onChange={(e) =>
            handleSliderChange("hue", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
        />
      </div>

      {/* Saturation */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Saturation</span>
          <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
            {config.saturation.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={config.saturation}
          onChange={(e) =>
            handleSliderChange("saturation", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
        />
      </div>

      {/* Brightness */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Brightness</span>
          <span className="text-xs font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
            {config.brightness.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={config.brightness}
          onChange={(e) =>
            handleSliderChange("brightness", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
        />
      </div>

      {/* Contrast */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Contrast</span>
          <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
            {config.contrast.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={config.contrast}
          onChange={(e) =>
            handleSliderChange("contrast", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
        />
      </div>

      {/* Exposure */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Exposure</span>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
            {config.exposure.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.05"
          value={config.exposure}
          onChange={(e) =>
            handleSliderChange("exposure", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
        />
      </div>

      {/* Sharpness */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Sharpness</span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            {config.sharpness.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={config.sharpness}
          onChange={(e) =>
            handleSliderChange("sharpness", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
        />
      </div>
    </div>
  );
};

export default CorrectionControls;
