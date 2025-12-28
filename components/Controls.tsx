import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { ShaderConfig, GradientType } from "../types";
import { getFragmentShader } from "../utils/shaderLoader";
import { hexToRgb } from "../utils/shaderUtils";
import { exportToGIF } from "../services/gifService";
import { exportToVideo } from "../services/videoService";

// Sub-components
import Header from "./ControlsSub/Header";
import PatternType from "./ControlsSub/PatternType";
import AnimationControls from "./ControlsSub/AnimationControls";
import PaletteControls from "./ControlsSub/PaletteControls";
import GeometryControls from "./ControlsSub/GeometryControls";
import NoiseControls from "./ControlsSub/NoiseControls";
import EffectsControls from "./ControlsSub/EffectsControls";
import DistortionControls from "./ControlsSub/DistortionControls";
import CorrectionControls from "./ControlsSub/CorrectionControls";
import PostProcessingControls from "./ControlsSub/PostProcessingControls";
import ExportControls from "./ControlsSub/ExportControls";
import GlslButton from "./ControlsSub/GlslButton";
import HistoryControls from "./ControlsSub/HistoryControls";

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
  const [exportFormat, setExportFormat] = useState<"gif" | "video" | "image">(
    "gif"
  );
  const [imageFormat, setImageFormat] = useState<"png" | "jpg">("png");
  const [imageQuality, setImageQuality] = useState(0.9);

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
          // Small wait to ensure state and render are processed.
          // In the background, document.hidden might throttle this,
          // so we use the smallest possible delay.
          await new Promise((resolve) => {
            if (document.hidden) {
              setTimeout(resolve, 1);
            } else {
              requestAnimationFrame(resolve);
            }
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
            if (document.hidden) {
              setTimeout(resolve, 1);
            } else {
              requestAnimationFrame(resolve);
            }
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

    // Trigger download with custom format and quality
    const mimeType = imageFormat === "png" ? "image/png" : "image/jpeg";
    const url = tempCanvas.toDataURL(mimeType, imageQuality);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shader-studio-${Date.now()}.${imageFormat}`;
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

  const handleTypeChange = async (type: GradientType) => {
    const newShader = await getFragmentShader(type);
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
      <aside
        aria-label="Shader Controls"
        aria-hidden={!isVisible}
        className={`controls fixed top-0 left-0 h-full w-full sm:w-80 max-w-[100vw] p-4 sm:p-6 flex flex-col z-30 transition-transform duration-300 ease-out pointer-events-none ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Glassmorphism Container */}
        <div className="pointer-events-auto flex-1 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto custom-scrollbar relative">
          <Header isVisible={isVisible} setIsVisible={setIsVisible} />

          <div className="space-y-6">
            <PatternType config={config} handleTypeChange={handleTypeChange} />

            <AnimationControls
              config={config}
              isPaused={isPaused}
              togglePause={togglePause}
              onResetTime={onResetTime}
              handleSliderChange={handleSliderChange}
            />

            <PaletteControls
              config={config}
              handleColorChange={handleColorChange}
              handleRandomizeColors={handleRandomizeColors}
              applyPalette={applyPalette}
              showChannels={showChannels}
              setShowChannels={setShowChannels}
              handleChannelChange={handleChannelChange}
              PRESET_PALETTES={PRESET_PALETTES}
            />

            <GeometryControls
              config={config}
              handleSliderChange={handleSliderChange}
            />
            <NoiseControls
              config={config}
              handleSliderChange={handleSliderChange}
            />

            <EffectsControls
              config={config}
              onChange={onChange}
              handleSliderChange={handleSliderChange}
            />

            <DistortionControls
              config={config}
              handleSliderChange={handleSliderChange}
            />
            <CorrectionControls
              config={config}
              handleSliderChange={handleSliderChange}
            />

            <PostProcessingControls
              config={config}
              showPostProcessing={showPostProcessing}
              setShowPostProcessing={setShowPostProcessing}
              handleSliderChange={handleSliderChange}
            />
          </div>

          {/* Action Buttons & Export */}
          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-6">
            <GlslButton onExport={onExport} />

            <ExportControls
              canvasRef={canvasRef}
              isExporting={isExporting}
              exportProgress={exportProgress}
              gifWidth={gifWidth}
              setGifWidth={setGifWidth}
              gifHeight={gifHeight}
              setGifHeight={setGifHeight}
              gifDuration={gifDuration}
              setGifDuration={setGifDuration}
              gifQuality={gifQuality}
              setGifQuality={setGifQuality}
              gifFPS={gifFPS}
              setGifFPS={setGifFPS}
              gifLoopType={gifLoopType}
              setGifLoopType={setGifLoopType}
              showGifSettings={showGifSettings}
              setShowGifSettings={setShowGifSettings}
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
              imageFormat={imageFormat}
              setImageFormat={setImageFormat}
              imageQuality={imageQuality}
              setImageQuality={setImageQuality}
              handleDownloadGIF={handleDownloadGIF}
              handleDownloadVideo={handleDownloadVideo}
              handleDownloadImage={handleDownloadImage}
            />

            <HistoryControls
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onReset={onReset}
            />
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-4 text-[10px] text-gray-600 text-center font-mono">
          v1.5.0
        </div>
      </aside>
    </>
  );
};

export default Controls;
