import React, { useState } from "react";
import { Droplet, Shuffle, ChevronDown, ChevronRight } from "lucide-react";
import { ShaderConfig } from "../../types";
import { hexToRgb } from "../../utils/shaderUtils";

const PRESET_PALETTES = [
  ["#4f46e5", "#9333ea", "#db2777"], // Default
  ["#00f260", "#0575e6", "#8e44ad"], // Cyber
  ["#ff9966", "#ff5e62", "#7b4397"], // Sunset
  ["#2193b0", "#6dd5ed", "#1f4037"], // Ocean
  ["#f12711", "#f5af19", "#93291e"], // Fire
  ["#11998e", "#38ef7d", "#00b09b"], // Forest
  ["#8E2DE2", "#4A00E0", "#b20a2c"], // Royal
  ["#FF0099", "#493240", "#FFD700"], // Glamour
];

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (c: number) => {
    const hex = Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

interface ColorControlsProps {
  config: ShaderConfig;
  onColorChange: (index: number, value: string) => void;
  onRandomizeColors: () => void;
  applyPalette: (colors: string[]) => void;
}

const ColorControls: React.FC<ColorControlsProps> = ({
  config,
  onColorChange,
  onRandomizeColors,
  applyPalette,
}) => {
  const [showChannels, setShowChannels] = useState(false);

  const handleChannelChange = (
    colorIndex: number,
    channel: 0 | 1 | 2,
    value: number
  ) => {
    const rgb = hexToRgb(config.colors[colorIndex]);
    rgb[channel] = value;
    const newHex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    onColorChange(colorIndex, newHex);
  };

  return (
    <section className="space-y-4 border-t border-white/10 pt-6">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Droplet className="w-3 h-3" /> Palette
        </label>
        <button
          onClick={onRandomizeColors}
          className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Shuffle className="w-3 h-3" /> Randomize
        </button>
      </div>

      {/* Main Color Pickers */}
      <div className="flex justify-between gap-2">
        {config.colors.map((color, i) => (
          <div key={i} className="flex-1 group relative">
            <input
              type="color"
              value={color}
              aria-label={`Color ${i + 1}`}
              onChange={(e) => onColorChange(i, e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div
              className="w-full h-12 rounded-xl border border-white/10 shadow-lg transition-transform group-hover:scale-105 group-active:scale-95"
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>

      {/* Preset Palettes */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        {PRESET_PALETTES.map((palette, idx) => (
          <button
            key={idx}
            onClick={() => applyPalette(palette)}
            className="h-8 rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition-colors flex w-full"
            title={`Apply Palette ${idx + 1}`}
            aria-label={`Apply preset palette ${idx + 1}`}
          >
            {palette.map((c, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </button>
        ))}
      </div>

      {/* RGB Channel Mixer */}
      <div className="pt-2">
        <button
          onClick={() => setShowChannels(!showChannels)}
          aria-expanded={showChannels}
          className="w-full flex items-center justify-between text-xs font-medium text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg"
        >
          <span>RGB Channels</span>
          {showChannels ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>

        {showChannels && (
          <div className="mt-3 space-y-4 pl-1 animate-fade-in">
            {config.colors.map((color, i) => {
              const [r, g, b] = hexToRgb(color);
              return (
                <div key={i} className="space-y-2">
                  <div className="text-[10px] text-gray-500 font-mono uppercase">
                    Color {i + 1}
                  </div>
                  {/* R */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] w-3 font-bold text-red-500"
                      id={`label-r-${i}`}
                    >
                      R
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={r}
                      aria-labelledby={`label-r-${i}`}
                      onChange={(e) =>
                        handleChannelChange(i, 0, parseFloat(e.target.value))
                      }
                      className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
                    />
                    <span className="text-[10px] w-6 font-mono text-right text-gray-500">
                      {r.toFixed(2)}
                    </span>
                  </div>
                  {/* G */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] w-3 font-bold text-green-500"
                      id={`label-g-${i}`}
                    >
                      G
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={g}
                      aria-labelledby={`label-g-${i}`}
                      onChange={(e) =>
                        handleChannelChange(i, 1, parseFloat(e.target.value))
                      }
                      className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
                    />
                    <span className="text-[10px] w-6 font-mono text-right text-gray-500">
                      {g.toFixed(2)}
                    </span>
                  </div>
                  {/* B */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] w-3 font-bold text-blue-500"
                      id={`label-b-${i}`}
                    >
                      B
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={b}
                      aria-labelledby={`label-b-${i}`}
                      onChange={(e) =>
                        handleChannelChange(i, 2, parseFloat(e.target.value))
                      }
                      className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                    />
                    <span className="text-[10px] w-6 font-mono text-right text-gray-500">
                      {b.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ColorControls;
