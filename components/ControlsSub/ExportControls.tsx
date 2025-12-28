import React from "react";
import { Settings, Loader2, Download } from "lucide-react";

interface ExportControlsProps {
  canvasRef: HTMLCanvasElement | null;
  isExporting: boolean;
  exportProgress: number;
  gifWidth: number;
  setGifWidth: (width: number) => void;
  gifHeight: number;
  setGifHeight: (height: number) => void;
  gifDuration: number;
  setGifDuration: (duration: number) => void;
  gifQuality: number;
  setGifQuality: (quality: number) => void;
  gifFPS: number;
  setGifFPS: (fps: number) => void;
  gifLoopType: "normal" | "pingpong";
  setGifLoopType: (type: "normal" | "pingpong") => void;
  showGifSettings: boolean;
  setShowGifSettings: (show: boolean) => void;
  exportFormat: "gif" | "video" | "image";
  setExportFormat: (format: "gif" | "video" | "image") => void;
  imageFormat: "png" | "jpg";
  setImageFormat: (format: "png" | "jpg") => void;
  imageQuality: number;
  setImageQuality: (quality: number) => void;
  handleDownloadGIF: () => void;
  handleDownloadVideo: () => void;
  handleDownloadImage: () => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  canvasRef,
  isExporting,
  exportProgress,
  gifWidth,
  setGifWidth,
  gifHeight,
  setGifHeight,
  gifDuration,
  setGifDuration,
  gifQuality,
  setGifQuality,
  gifFPS,
  setGifFPS,
  gifLoopType,
  setGifLoopType,
  showGifSettings,
  setShowGifSettings,
  exportFormat,
  setExportFormat,
  imageFormat,
  setImageFormat,
  imageQuality,
  setImageQuality,
  handleDownloadGIF,
  handleDownloadVideo,
  handleDownloadImage,
}) => {
  return (
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
                Video
              </button>
              <button
                onClick={() => setExportFormat("image")}
                className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all ${
                  exportFormat === "image"
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Image
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

          {/* Image Settings */}
          {exportFormat === "image" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                  Format Type
                </label>
                <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setImageFormat("png")}
                    className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all ${
                      imageFormat === "png"
                        ? "bg-indigo-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setImageFormat("jpg")}
                    className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-all ${
                      imageFormat === "jpg"
                        ? "bg-indigo-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    JPG
                  </button>
                </div>
              </div>

              {imageFormat === "jpg" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold">
                      Quality
                    </label>
                    <span className="text-[9px] font-mono text-indigo-300">
                      {Math.round(imageQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={imageQuality}
                    onChange={(e) =>
                      setImageQuality(parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {/* Video/GIF Settings */}
          {exportFormat !== "image" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {exportFormat === "gif" && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold ml-1">
                      Quality
                    </label>
                    <select
                      value={gifQuality}
                      onChange={(e) => setGifQuality(parseInt(e.target.value))}
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
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => {
            if (exportFormat === "image") {
              handleDownloadImage();
            } else if (exportFormat === "gif") {
              handleDownloadGIF();
            } else {
              handleDownloadVideo();
            }
          }}
          disabled={isExporting || !canvasRef}
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
              Download{" "}
              {exportFormat === "image"
                ? imageFormat.toUpperCase()
                : exportFormat === "gif"
                ? "GIF"
                : "Video"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportControls;
