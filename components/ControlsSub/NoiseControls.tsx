import React from "react";
import { Waves } from "lucide-react";
import { ShaderConfig, GradientType } from "../../types";

interface NoiseControlsProps {
  config: ShaderConfig;
  handleSliderChange: (key: keyof ShaderConfig, value: number) => void;
}

const NoiseControls: React.FC<NoiseControlsProps> = ({
  config,
  handleSliderChange,
}) => {
  if (
    config.gradientType !== GradientType.NOISE &&
    config.gradientType !== GradientType.FRACTAL
  ) {
    return null;
  }

  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Waves className="w-3 h-3" /> Noise Detail
      </label>

      {/* Scale */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-noise-scale">
            Scale
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
            {config.noiseScale.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={config.noiseScale}
          aria-labelledby="label-noise-scale"
          onChange={(e) =>
            handleSliderChange("noiseScale", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
        />
      </div>

      {/* Octaves */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-noise-octaves">
            Octaves
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
            {config.noiseOctaves}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="8"
          step="1"
          value={config.noiseOctaves}
          aria-labelledby="label-noise-octaves"
          onChange={(e) =>
            handleSliderChange("noiseOctaves", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
        />
      </div>

      {/* Persistence */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-noise-persistence">
            Persistence
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
            {config.noisePersistence.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={config.noisePersistence}
          aria-labelledby="label-noise-persistence"
          onChange={(e) =>
            handleSliderChange("noisePersistence", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
        />
      </div>
    </div>
  );
};

export default NoiseControls;
