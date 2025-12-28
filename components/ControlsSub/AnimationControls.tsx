import React from "react";
import { Wind, Play, Pause, Rewind } from "lucide-react";
import { ShaderConfig } from "../../types";

interface AnimationControlsProps {
  config: ShaderConfig;
  isPaused: boolean;
  togglePause: () => void;
  onResetTime: () => void;
  handleSliderChange: (key: keyof ShaderConfig, value: number) => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  config,
  isPaused,
  togglePause,
  onResetTime,
  handleSliderChange,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <Wind className="w-3 h-3" /> Animation
      </label>

      {/* Playback Buttons */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={togglePause}
          className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-lg text-xs font-medium transition-colors border ${
            isPaused
              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
          }`}
        >
          {isPaused ? (
            <Play className="w-3 h-3" fill="currentColor" />
          ) : (
            <Pause className="w-3 h-3" fill="currentColor" />
          )}
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={onResetTime}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5 transition-colors"
          title="Reset Animation Time"
        >
          <Rewind className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-speed">
            Speed
          </span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {config.speed.toFixed(2)}
          </span>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={config.speed}
            aria-labelledby="label-speed"
            onChange={(e) =>
              handleSliderChange("speed", parseFloat(e.target.value))
            }
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all z-10"
          />
          {/* Center marker for 0 speed */}
          <div className="absolute left-1/2 w-0.5 h-3 bg-white/20 -translate-x-1/2 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Rotation Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-rotation">
            Rotation
          </span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {(config.rotation / Math.PI).toFixed(2)}π
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.PI * 2}
          step="0.01"
          value={config.rotation}
          aria-labelledby="label-rotation"
          onChange={(e) =>
            handleSliderChange("rotation", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
      </div>

      {/* Zoom Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-zoom">
            Zoom
          </span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {config.zoom.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={config.zoom}
          aria-labelledby="label-zoom"
          onChange={(e) =>
            handleSliderChange("zoom", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
      </div>

      {/* Time Offset Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400" id="label-time-offset">
            Time Offset
          </span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
            {config.timeOffset.toFixed(1)}s
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={config.timeOffset}
          aria-labelledby="label-time-offset"
          onChange={(e) =>
            handleSliderChange("timeOffset", parseFloat(e.target.value))
          }
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
      </div>
    </div>
  );
};

export default AnimationControls;
