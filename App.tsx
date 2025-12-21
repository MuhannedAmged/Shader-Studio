import React, { useState, useCallback, useEffect } from "react";
import ShaderCanvas from "./components/ShaderCanvas";
import Controls from "./components/Controls";
import AIPanel from "./components/AIPanel";
import CodeEditor from "./components/CodeModal";
import { ShaderConfig, GeneratorStatus, GradientType } from "./types";
import { DEFAULT_FRAGMENT_SHADER } from "./utils/shaderUtils";
import { generateShaderCode } from "./services/geminiService";
import { useHistoryState } from "./hooks/useHistoryState";

const DEFAULT_CONFIG: ShaderConfig = {
  fragmentShader: DEFAULT_FRAGMENT_SHADER,
  colors: ["#4f46e5", "#9333ea", "#db2777"], // Indigo, Purple, Pink
  speed: 0.2,
  density: 1.5,
  strength: 0.5,
  hue: 0.0,
  saturation: 1.0,
  brightness: 1.0,
  noiseScale: 1.0,
  noiseOctaves: 2,
  noisePersistence: 0.5,
  blurStrength: 0.0,
  distortion: 1.0,
  warp: 1.0,
  grain: 0.0,
  pixelation: 0.0,
  contrast: 1.0,
  exposure: 0.0,
  sharpness: 0.0,
  vignette: 0.0,
  chromaticAberration: 0.0,
  glow: 0.0,
  bloomThreshold: 0.5,
  quantization: 0.0,
  scanlines: 0.0,
  showParticles: true,
  particleSize: 1.0,
  particleSpeed: 1.0,
  particleCount: 2000,
  particleOpacity: 0.5,
  rotation: 0.0,
  zoom: 1.0,
  timeOffset: 0.0,
  gradientType: GradientType.NOISE,
};

const App: React.FC = () => {
  // Use custom history hook instead of useState
  const {
    state: config,
    setState: setConfig,
    resetState: resetConfig,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistoryState<ShaderConfig>(DEFAULT_CONFIG);

  const [status, setStatus] = useState<GeneratorStatus>(GeneratorStatus.IDLE);
  const [showEditor, setShowEditor] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  // Animation Control States
  const [isPaused, setIsPaused] = useState(false);
  const [resetTimeSignal, setResetTimeSignal] = useState(0);
  const [manualTime, setManualTime] = useState<number | undefined>(undefined);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (or Cmd on Mac)
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleGenerate = useCallback(
    async (prompt: string) => {
      setStatus(GeneratorStatus.GENERATING);
      try {
        const result = await generateShaderCode(prompt);
        setConfig((prev) => ({
          ...prev,
          fragmentShader: result.fragmentShader,
        }));
        setStatus(GeneratorStatus.SUCCESS);
      } catch (e) {
        console.error(e);
        setStatus(GeneratorStatus.ERROR);
      } finally {
        // Reset status after a delay so the user sees the result state
        setTimeout(() => setStatus(GeneratorStatus.IDLE), 3000);
      }
    },
    [setConfig]
  );

  const handleReset = () => {
    // We use setConfig here instead of resetConfig to treat "Reset" as an undoable action
    setConfig(DEFAULT_CONFIG);
    setIsPaused(false);
    setResetTimeSignal((prev) => prev + 1);
  };

  const handleCodeChange = (newCode: string) => {
    setConfig((prev) => ({
      ...prev,
      fragmentShader: newCode,
    }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* Background Shader */}
      <ShaderCanvas
        config={config}
        isPaused={isPaused}
        resetTimeSignal={resetTimeSignal}
        manualTime={manualTime}
        onCanvasReady={setCanvasRef}
      />

      {/* Main UI Components */}
      <Controls
        config={config}
        onChange={setConfig}
        onReset={handleReset}
        onExport={() => setShowEditor(true)}
        isPaused={isPaused}
        togglePause={() => setIsPaused((prev) => !prev)}
        onResetTime={() => setResetTimeSignal((prev) => prev + 1)}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        canvasRef={canvasRef}
        onManualTimeChange={setManualTime}
      />

      {/* <AIPanel onGenerate={handleGenerate} status={status} /> */}

      <CodeEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        code={config.fragmentShader}
        onChange={handleCodeChange}
      />

      {/* Overlay Status Toast */}
      {status === GeneratorStatus.SUCCESS && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-200 text-xs font-medium rounded-full animate-slide-down pointer-events-none z-50">
          Shader generated successfully
        </div>
      )}
      {status === GeneratorStatus.ERROR && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 text-xs font-medium rounded-full animate-slide-down pointer-events-none z-50">
          Failed to generate shader
        </div>
      )}
    </div>
  );
};

export default App;
