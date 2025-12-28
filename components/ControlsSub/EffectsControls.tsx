import React from "react";
import { Eye } from "lucide-react";
import { ShaderConfig, ParticleType } from "../../types";

interface EffectsControlsProps {
  config: ShaderConfig;
  onChange: (newConfig: ShaderConfig) => void;
  handleSliderChange: (key: keyof ShaderConfig, value: number) => void;
}

const EffectsControls: React.FC<EffectsControlsProps> = ({
  config,
  onChange,
  handleSliderChange,
}) => {
  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Eye className="w-3 h-3" /> Effects
      </label>

      {/* Blur */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Blur</span>
          <span className="text-xs font-mono text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded">
            {config.blurStrength.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="2.0"
          step="0.05"
          value={config.blurStrength}
          onChange={(e) =>
            handleSliderChange("blurStrength", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-300 transition-all"
        />
      </div>

      {/* Grain */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Grain</span>
          <span className="text-xs font-mono text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded">
            {config.grain.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.01"
          value={config.grain}
          onChange={(e) =>
            handleSliderChange("grain", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-300 transition-all"
        />
      </div>

      {/* Pixelation */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Pixelation</span>
          <span className="text-xs font-mono text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded">
            {config.pixelation.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.01"
          value={config.pixelation}
          onChange={(e) =>
            handleSliderChange("pixelation", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-300 transition-all"
        />
      </div>

      {/* Particles Toggle */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-gray-400">Show Particles</span>
        <button
          onClick={() =>
            onChange({
              ...config,
              showParticles: !config.showParticles,
            })
          }
          className={`w-10 h-5 rounded-full transition-colors relative ${
            config.showParticles ? "bg-indigo-500" : "bg-gray-700"
          }`}
        >
          <div
            className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${
              config.showParticles ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {config.showParticles && (
        <div className="space-y-4 pl-2 border-l border-white/5 animate-fade-in">
          {/* Particle Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">Size</span>
              <span className="text-[10px] font-mono text-gray-400">
                {config.particleSize.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={config.particleSize}
              onChange={(e) =>
                handleSliderChange("particleSize", parseFloat(e.target.value))
              }
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Particle Speed */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">Speed</span>
              <span className="text-[10px] font-mono text-gray-400">
                {config.particleSpeed.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="5.0"
              step="0.1"
              value={config.particleSpeed}
              onChange={(e) =>
                handleSliderChange("particleSpeed", parseFloat(e.target.value))
              }
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Particle Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">Count</span>
              <span className="text-[10px] font-mono text-gray-400">
                {config.particleCount}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={config.particleCount}
              onChange={(e) =>
                handleSliderChange("particleCount", parseInt(e.target.value))
              }
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Particle Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500">Opacity</span>
              <span className="text-[10px] font-mono text-gray-400">
                {config.particleOpacity.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.01"
              value={config.particleOpacity}
              onChange={(e) =>
                handleSliderChange(
                  "particleOpacity",
                  parseFloat(e.target.value)
                )
              }
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Particle Type */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">
              Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(ParticleType).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ ...config, particleType: type })}
                  className={`h-7 text-[8px] font-bold rounded-md border transition-all ${
                    config.particleType === type
                      ? "bg-indigo-500 text-white border-indigo-400"
                      : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Particle Colors */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">
              Colors
            </label>
            <div className="flex gap-2">
              <div className="flex-1 h-8 rounded-lg relative overflow-hidden border border-white/10">
                <input
                  type="color"
                  value={config.particleColor1}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      particleColor1: e.target.value,
                    })
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: config.particleColor1 }}
                />
              </div>
              <div className="flex-1 h-8 rounded-lg relative overflow-hidden border border-white/10">
                <input
                  type="color"
                  value={config.particleColor2}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      particleColor2: e.target.value,
                    })
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: config.particleColor2 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EffectsControls;
