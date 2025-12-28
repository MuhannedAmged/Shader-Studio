import React from "react";
import { Activity, ChevronDown, ChevronRight } from "lucide-react";
import { ShaderConfig } from "../../types";

interface PostProcessingControlsProps {
  config: ShaderConfig;
  showPostProcessing: boolean;
  setShowPostProcessing: (show: boolean) => void;
  handleSliderChange: (key: keyof ShaderConfig, value: number) => void;
}

const PostProcessingControls: React.FC<PostProcessingControlsProps> = ({
  config,
  showPostProcessing,
  setShowPostProcessing,
  handleSliderChange,
}) => {
  return (
    <div className="space-y-4 pt-6 border-t border-white/10">
      <button
        onClick={() => setShowPostProcessing(!showPostProcessing)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3" /> Post-Processing
        </div>
        {showPostProcessing ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {showPostProcessing && (
        <div className="space-y-6 pt-2 animate-fade-in">
          {/* Vignette */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Vignette</span>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                {config.vignette.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.vignette}
              onChange={(e) =>
                handleSliderChange("vignette", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
            />
          </div>

          {/* Chromatic Aberration */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                Chromatic Aberration
              </span>
              <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                {config.chromaticAberration.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.chromaticAberration}
              onChange={(e) =>
                handleSliderChange(
                  "chromaticAberration",
                  parseFloat(e.target.value)
                )
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
            />
          </div>

          {/* Glow */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Glow</span>
              <span className="text-xs font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                {config.glow.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={config.glow}
              onChange={(e) =>
                handleSliderChange("glow", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
            />
          </div>

          {/* Bloom Threshold */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Bloom Threshold</span>
              <span className="text-xs font-mono text-yellow-200 bg-yellow-500/10 px-2 py-0.5 rounded">
                {config.bloomThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.bloomThreshold}
              onChange={(e) =>
                handleSliderChange("bloomThreshold", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-200 hover:accent-yellow-100 transition-all"
            />
          </div>

          {/* Quantization */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Quantization</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {config.quantization.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.quantization}
              onChange={(e) =>
                handleSliderChange("quantization", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
            />
          </div>

          {/* Scanlines */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Scanlines</span>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                {config.scanlines.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.scanlines}
              onChange={(e) =>
                handleSliderChange("scanlines", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
          </div>

          {/* Gamma */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Gamma</span>
              <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                {config.gamma.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={config.gamma}
              onChange={(e) =>
                handleSliderChange("gamma", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
            />
          </div>

          {/* Emboss */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Emboss</span>
              <span className="text-xs font-mono text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded">
                {config.emboss.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.emboss}
              onChange={(e) =>
                handleSliderChange("emboss", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gray-500 hover:accent-gray-400 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostProcessingControls;
