import GIF from "gif.js";

export interface GIFExportOptions {
  width: number;
  height: number;
  duration: number; // in seconds
  fps: number;
  quality?: number;
  loopType?: "normal" | "pingpong";
  onProgress?: (progress: number) => void;
  onFrame?: (time: number) => Promise<void>;
}

export const exportToGIF = async (
  canvas: HTMLCanvasElement,
  options: GIFExportOptions
): Promise<Blob> => {
  const {
    width,
    height,
    duration,
    fps,
    quality = 5,
    onProgress,
    onFrame,
    loopType = "normal",
  } = options;
  const frameDelay = 1000 / fps;

  // Precise frame calculation for perfect loops
  const totalTargetFrames = Math.ceil(duration * fps);
  const totalCaptureFrames =
    loopType === "pingpong"
      ? Math.ceil(totalTargetFrames / 2) + 1
      : totalTargetFrames;

  // The duration we actually capture (half for pingpong)
  const effectiveDuration =
    loopType === "pingpong" ? (totalCaptureFrames - 1) / fps : duration;

  const gif = new GIF({
    workers: 4,
    quality: quality,
    width: width,
    height: height,
    workerScript: "/gif.worker.js",
    dither: "FloydSteinberg",
  });

  if (onProgress) {
    gif.on("progress", (p: number) => onProgress(p));
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) throw new Error("Could not get 2D context");

  return new Promise(async (resolve, reject) => {
    const capturedFrames: ImageData[] = [];

    try {
      // Phase 1: Capture frames
      for (let i = 0; i < totalCaptureFrames; i++) {
        // Calculate exact time for this frame
        const time =
          totalCaptureFrames > 1
            ? (i / (totalCaptureFrames - 1)) * effectiveDuration
            : 0;

        if (onFrame) {
          await onFrame(time);
        }

        ctx.drawImage(canvas, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        if (loopType === "pingpong") {
          capturedFrames.push(imageData);
        }

        gif.addFrame(imageData, { delay: frameDelay });

        if (onProgress) {
          // Progress for capture phase (0 to 0.5)
          onProgress((i / totalCaptureFrames) * 0.5);
        }
      }

      // Phase 2: Add reverse frames for pingpong
      if (loopType === "pingpong" && capturedFrames.length > 2) {
        // We exclude the first and last frames to avoid duplicates at the loop points
        for (let i = capturedFrames.length - 2; i > 0; i--) {
          gif.addFrame(capturedFrames[i], { delay: frameDelay });
        }
      }

      gif.on("finished", (blob: Blob) => {
        resolve(blob);
      });

      gif.render();
    } catch (err) {
      reject(err);
    }
  });
};
