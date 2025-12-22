import React, { useState, useEffect } from "react";
import {
  Settings,
  Droplet,
  Wind,
  Zap,
  RefreshCw,
  Terminal,
  Sliders,
  Play,
  Pause,
  Rewind,
  Undo,
  Redo,
  Waves,
  Eye,
  Shuffle,
  ChevronDown,
  ChevronRight,
  Layers,
  ChevronLeft,
  X,
  Activity,
  Move,
  Hash,
  CloudRain,
  Download,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { ShaderConfig, GradientType } from "../types";
import { hexToRgb, getFragmentShader } from "../utils/shaderUtils";
import { exportToGIF } from "../services/gifService";
import { exportToVideo } from "../services/videoService";

interface ControlsProps {
  config: ShaderConfig;
  onChange: (newConfig: ShaderConfig) => void;
  onReset: () => void;
  onExport: () => void;
  isPaused: boolean;
  togglePause: () => void;
  onResetTime: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canvasRef: HTMLCanvasElement | null;
  onManualTimeChange: (time: number | undefined) => void;
}

const PRESET_PALETTES = [
  ["#4f46e5", "#9333ea", "#db2777"], // Default (Indigo/Purple/Pink)
  ["#00f260", "#0575e6", "#8e44ad"], // Cyber (Green/Blue/Purple)
  ["#ff9966", "#ff5e62", "#7b4397"], // Sunset (Orange/Red/Purple)
  ["#2193b0", "#6dd5ed", "#1f4037"], // Ocean (Blue/Light Blue/Dark Green)
  ["#f12711", "#f5af19", "#93291e"], // Fire (Red/Orange/Dark Red)
  ["#11998e", "#38ef7d", "#00b09b"], // Forest (Teal/Green/Aqua)
  ["#8E2DE2", "#4A00E0", "#b20a2c"], // Royal (Purple/Dark Blue/Red)
  ["#FF0099", "#493240", "#FFD700"], // Glamour (Pink/Dark/Gold)
];

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (c: number) => {
    const hex = Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

const Controls: React.FC<ControlsProps> = ({
  config,
  onChange,
  onReset,
  onExport,
  isPaused,
  togglePause,
  onResetTime,
  undo,
  redo,
  canUndo,
  canRedo,
  canvasRef,
  onManualTimeChange,
}) => {
  const [showChannels, setShowChannels] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [gifWidth, setGifWidth] = useState(512);
  const [gifHeight, setGifHeight] = useState(512);
  const [gifDuration, setGifDuration] = useState(3);
  const [gifQuality, setGifQuality] = useState(5); // 1 is best, 20 is worst
  const [gifFPS, setGifFPS] = useState(30);
  const [gifLoopType, setGifLoopType] = useState<"normal" | "pingpong">(
    "normal"
  );
  const [showGifSettings, setShowGifSettings] = useState(false);
  const [showPostProcessing, setShowPostProcessing] = useState(false);
  const [exportFormat, setExportFormat] = useState<"gif" | "video">("gif");

  useEffect(() => {
    // Initialize visibility based on screen width
    const checkWidth = () => {
      if (window.innerWidth >= 768) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    checkWidth();
  }, []);

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...config.colors];
    newColors[index] = value;
    onChange({ ...config, colors: newColors });
  };

  const handleDownloadGIF = async () => {
    if (!canvasRef) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const blob = await exportToGIF(canvasRef, {
        width: gifWidth,
        height: gifHeight,
        duration: gifDuration,
        fps: gifFPS,
        quality: gifQuality,
        loopType: gifLoopType,
        onProgress: (p) => setExportProgress(p),
        onFrame: async (time) => {
          onManualTimeChange(time);
          // Wait for two frames to ensure the state update AND the render have completed
          await new Promise((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(resolve);
            });
          });
        },
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shader-studio-${Date.now()}.gif`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("GIF Export failed:", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      onManualTimeChange(undefined); // Return to automatic time
    }
  };

  const handleDownloadVideo = async () => {
    if (!canvasRef) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const blob = await exportToVideo(canvasRef, {
        width: gifWidth,
        height: gifHeight,
        duration: gifDuration,
        fps: gifFPS,
        loopType: gifLoopType,
        onProgress: (p) => setExportProgress(p),
        onFrame: async (time) => {
          onManualTimeChange(time);
          await new Promise((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(resolve);
            });
          });
        },
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shader-studio-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Video Export failed:", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      onManualTimeChange(undefined);
    }
  };

  const handleDownloadImage = () => {
    if (!canvasRef) return;

    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = gifWidth;
    tempCanvas.height = gifHeight;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    // Draw the current frame
    ctx.drawImage(canvasRef, 0, 0, gifWidth, gifHeight);

    // Trigger download
    const url = tempCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `shader-studio-${Date.now()}.png`;
    a.click();
  };

  const handleRandomizeColors = () => {
    const randomColor = () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    const newColors = [randomColor(), randomColor(), randomColor()];
    onChange({ ...config, colors: newColors });
  };

  const applyPalette = (colors: string[]) => {
    onChange({ ...config, colors });
  };

  const handleSliderChange = (key: keyof ShaderConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const handleTypeChange = (type: GradientType) => {
    const newShader = getFragmentShader(type);
    onChange({
      ...config,
      gradientType: type,
      fragmentShader: newShader,
    });
  };

  const handleChannelChange = (
    colorIndex: number,
    channel: 0 | 1 | 2,
    value: number
  ) => {
    const rgb = hexToRgb(config.colors[colorIndex]);
    rgb[channel] = value;
    const newHex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    handleColorChange(colorIndex, newHex);
  };

  return (
    <>
      {/* Floating Toggle Button (Visible when closed) */}
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed top-4 left-4 z-20 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white shadow-lg transition-all duration-300 hover:bg-white/10 group ${
          isVisible
            ? "-translate-x-24 opacity-0 pointer-events-none"
            : "translate-x-0 opacity-100"
        }`}
        aria-label="Open Controls"
      >
        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* Main Panel */}
      <div
        className={`controls fixed top-0 left-0 h-full w-full sm:w-80 max-w-[100vw] p-4 sm:p-6 flex flex-col z-30 transition-transform duration-300 ease-out pointer-events-none ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Glassmorphism Container */}
        <div className="pointer-events-auto flex-1 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto custom-scrollbar relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                <Settings className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Shader Studio
                </h1>
                <p className="text-xs text-gray-400 font-medium">
                  Fine-tune visuals
                </p>
              </div>
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Close Controls"
            >
              {window.innerWidth < 640 ? (
                <X className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="space-y-6">
            {/* Pattern Type */}
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

            {/* Animation Controls */}
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
                  <span className="text-xs text-gray-400">Speed</span>
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
                  <span className="text-xs text-gray-400">Rotation</span>
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
                  onChange={(e) =>
                    handleSliderChange("rotation", parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </div>

              {/* Zoom Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Zoom</span>
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
                  onChange={(e) =>
                    handleSliderChange("zoom", parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </div>

              {/* Time Offset Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Time Offset</span>
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
                  onChange={(e) =>
                    handleSliderChange("timeOffset", parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Droplet className="w-3 h-3" /> Palette
                </label>
                <button
                  onClick={handleRandomizeColors}
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
                      onChange={(e) => handleColorChange(i, e.target.value)}
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
                            <span className="text-[10px] w-3 font-bold text-red-500">
                              R
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={r}
                              onChange={(e) =>
                                handleChannelChange(
                                  i,
                                  0,
                                  parseFloat(e.target.value)
                                )
                              }
                              className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
                            />
                            <span className="text-[10px] w-6 font-mono text-right text-gray-500">
                              {r.toFixed(2)}
                            </span>
                          </div>
                          {/* G */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] w-3 font-bold text-green-500">
                              G
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={g}
                              onChange={(e) =>
                                handleChannelChange(
                                  i,
                                  1,
                                  parseFloat(e.target.value)
                                )
                              }
                              className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
                            />
                            <span className="text-[10px] w-6 font-mono text-right text-gray-500">
                              {g.toFixed(2)}
                            </span>
                          </div>
                          {/* B */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] w-3 font-bold text-blue-500">
                              B
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={b}
                              onChange={(e) =>
                                handleChannelChange(
                                  i,
                                  2,
                                  parseFloat(e.target.value)
                                )
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
            </div>

            {/* Geometry Sliders */}
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

            {/* Noise Details Sliders */}
            {(config.gradientType === GradientType.NOISE ||
              config.gradientType === GradientType.FRACTAL) && (
              <div className="space-y-6 pt-6 border-t border-white/10">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Waves className="w-3 h-3" /> Noise Detail
                </label>

                {/* Scale */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Scale</span>
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
                    onChange={(e) =>
                      handleSliderChange(
                        "noiseScale",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                  />
                </div>

                {/* Octaves */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Octaves</span>
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
                    onChange={(e) =>
                      handleSliderChange(
                        "noiseOctaves",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                  />
                </div>

                {/* Persistence */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Persistence</span>
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
                    onChange={(e) =>
                      handleSliderChange(
                        "noisePersistence",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Effects */}
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
                    handleSliderChange(
                      "blurStrength",
                      parseFloat(e.target.value)
                    )
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
                        handleSliderChange(
                          "particleSize",
                          parseFloat(e.target.value)
                        )
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
                        handleSliderChange(
                          "particleSpeed",
                          parseFloat(e.target.value)
                        )
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
                        handleSliderChange(
                          "particleCount",
                          parseInt(e.target.value)
                        )
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
                </div>
              )}
            </div>

            {/* Distortion Section */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <Activity className="w-3 h-3" /> Warp & Distortion
              </label>

              {/* Distortion */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Distortion</span>
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
                  onChange={(e) =>
                    handleSliderChange("distortion", parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </div>

              {/* Warp */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Warp</span>
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
                  onChange={(e) =>
                    handleSliderChange("warp", parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </div>
            </div>

            {/* Color Correction Sliders */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <Sliders className="w-3 h-3" /> Corrections
              </label>

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

            {/* Post-Processing Section */}
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
                        handleSliderChange(
                          "vignette",
                          parseFloat(e.target.value)
                        )
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
                      <span className="text-xs text-gray-400">
                        Bloom Threshold
                      </span>
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
                        handleSliderChange(
                          "bloomThreshold",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-200 hover:accent-yellow-100 transition-all"
                    />
                  </div>

                  {/* Quantization */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        Quantization
                      </span>
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
                        handleSliderChange(
                          "quantization",
                          parseFloat(e.target.value)
                        )
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
                        handleSliderChange(
                          "scanlines",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={onExport}
              className="w-full h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/5"
            >
              <Terminal className="w-4 h-4" /> Edit GLSL
            </button>

            {/* GIF Export Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => setShowGifSettings(!showGifSettings)}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <Settings
                    className={`w-3 h-3 transition-transform duration-300 ${
                      showGifSettings ? "rotate-90" : ""
                    }`}
                  />
                  Export Settings
                </button>
                {showGifSettings && (
                  <span className="text-[10px] font-mono text-gray-600">
                    {gifWidth}x{gifHeight}
                  </span>
                )}
              </div>

              {showGifSettings && (
                <div className="space-y-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                      Format
                    </label>
                    <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5">
                      <button
                        onClick={() => setExportFormat("gif")}
                        className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all ${
                          exportFormat === "gif"
                            ? "bg-indigo-500 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        GIF
                      </button>
                      <button
                        onClick={() => setExportFormat("video")}
                        className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all ${
                          exportFormat === "video"
                            ? "bg-indigo-500 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Video (WebM)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                        Width
                      </label>
                      <input
                        type="number"
                        value={gifWidth}
                        onChange={(e) =>
                          setGifWidth(
                            Math.max(
                              128,
                              Math.min(2048, parseInt(e.target.value) || 128)
                            )
                          )
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                        Height
                      </label>
                      <input
                        type="number"
                        value={gifHeight}
                        onChange={(e) =>
                          setGifHeight(
                            Math.max(
                              128,
                              Math.min(2048, parseInt(e.target.value) || 128)
                            )
                          )
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {exportFormat === "gif" && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                          Quality
                        </label>
                        <select
                          value={gifQuality}
                          onChange={(e) =>
                            setGifQuality(parseInt(e.target.value))
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                        >
                          <option value="1">High (Slow)</option>
                          <option value="5">Medium</option>
                          <option value="10">Standard</option>
                          <option value="20">Low (Fast)</option>
                        </select>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                        FPS
                      </label>
                      <select
                        value={gifFPS}
                        onChange={(e) => setGifFPS(parseInt(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      >
                        <option value="15">15 FPS</option>
                        <option value="30">30 FPS</option>
                        <option value="60">60 FPS</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                      Duration
                    </label>
                    <select
                      value={gifDuration}
                      onChange={(e) => setGifDuration(parseInt(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    >
                      <option value="1">1 Second</option>
                      <option value="2">2 Seconds</option>
                      <option value="3">3 Seconds</option>
                      <option value="5">5 Seconds</option>
                      <option value="10">10 Seconds</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                      Loop Type
                    </label>
                    <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 gap-1">
                      <button
                        onClick={() => setGifLoopType("normal")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                          gifLoopType === "normal"
                            ? "bg-indigo-500 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => setGifLoopType("pingpong")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                          gifLoopType === "pingpong"
                            ? "bg-indigo-500 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        Seamless
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleDownloadImage}
                  disabled={!canvasRef}
                  className="h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/5 disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" /> PNG
                </button>

                <button
                  onClick={
                    exportFormat === "gif"
                      ? handleDownloadGIF
                      : handleDownloadVideo
                  }
                  disabled={isExporting}
                  className="w-full h-10 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Rendering... {Math.round(exportProgress * 100)}%
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      Download {exportFormat === "gif" ? "GIF" : "Video"}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>
              <button
                onClick={onReset}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5"
                title="Reset to Default"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-4 text-[10px] text-gray-600 text-center font-mono">
          v1.4.0 • WebGL 2.0
        </div>
      </div>
    </>
  );
};

export default Controls;
