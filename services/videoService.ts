export interface VideoExportOptions {
  width: number;
  height: number;
  duration: number; // in seconds
  fps: number;
  loopType?: "normal" | "pingpong";
  onProgress?: (progress: number) => void;
  onFrame?: (time: number) => Promise<void>;
}

export const exportToVideo = async (
  canvas: HTMLCanvasElement,
  options: VideoExportOptions
): Promise<Blob> => {
  const { duration, fps, onProgress, onFrame, loopType = "normal" } = options;

  const stream = canvas.captureStream(0); // 0 fps, we'll manually request frames
  const [track] = stream.getVideoTracks();

  // @ts-ignore - 'requestFrame' is not yet in standard types but supported in Chrome/Firefox for canvas streams
  const hasRequestFrame = typeof track.requestFrame === "function";

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 25000000, // High bitrate for quality
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise(async (resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    mediaRecorder.start();

    const totalTargetFrames = Math.round(duration * fps);
    const isPingPong = loopType === "pingpong";

    // For ping-pong, we record exactly totalTargetFrames
    const framesToRecord = totalTargetFrames;
    const forwardFrames = isPingPong
      ? Math.ceil(totalTargetFrames / 2) + 1
      : totalTargetFrames;
    const frameInterval = 1000 / fps;

    try {
      let startTime = performance.now();

      for (let i = 0; i < framesToRecord; i++) {
        let time;

        if (isPingPong) {
          const peakTime = duration / 2;
          if (i < forwardFrames) {
            time = (i / (forwardFrames - 1)) * peakTime;
          } else {
            const backwardIndex = i - (forwardFrames - 1);
            const t = backwardIndex / (framesToRecord - forwardFrames + 1);
            time = peakTime * (1 - t);
          }
        } else {
          time = (i / totalTargetFrames) * duration;
        }

        if (onFrame) {
          await onFrame(time);
        }

        // Force a frame capture
        if (hasRequestFrame) {
          // @ts-ignore
          track.requestFrame();
        }

        // Precise wait for MediaRecorder duration.
        // MediaRecorder records real-world time, so we MUST wait real-world time.
        const targetWaitTime = (i + 1) * frameInterval;
        const elapsed = performance.now() - startTime;
        const remaining = targetWaitTime - elapsed;

        if (remaining > 0) {
          await new Promise((r) => setTimeout(r, remaining));
        }

        if (onProgress) {
          onProgress(i / framesToRecord);
        }
      }

      mediaRecorder.stop();
    } catch (err) {
      mediaRecorder.stop();
      reject(err);
    }
  });
};
