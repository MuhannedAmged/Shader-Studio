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

    // Precise frame calculation for perfect loops
    const totalTargetFrames = Math.ceil(duration * fps);

    // For pingpong, we record the forward part.
    // Note: True pingpong in video is hard because we can't just reverse frames easily like in GIF without re-encoding.
    // However, we can simulate it by recording the forward AND backward motion in real-time.
    // Unlike GIF where we just copied frames, here we must render them.

    const isPingPong = loopType === "pingpong";
    const framesToRecord = isPingPong
      ? totalTargetFrames * 2 - 2
      : totalTargetFrames;
    const effectiveDuration = duration; // Duration of one forward pass

    try {
      for (let i = 0; i < framesToRecord; i++) {
        let time;

        if (isPingPong) {
          // Calculate ping-pong time
          // 0 -> duration -> 0
          const phase = i / (framesToRecord - 1); // 0 to 1
          // Map 0..1 to 0..1..0 triangle wave
          // If we want exactly duration seconds one way:
          // The total sequence is roughly 2 * duration

          // Let's stick to the logic:
          // We want the visual state to go A -> B -> A
          // Total frames: N (forward) + N-2 (backward)

          const forwardFrames = totalTargetFrames;

          if (i < forwardFrames) {
            // Forward
            time = (i / (forwardFrames - 1)) * effectiveDuration;
          } else {
            // Backward
            const backwardIndex = i - forwardFrames;
            // We want to go from frame N-2 down to 1
            // i goes from N to 2N-3
            const t = (backwardIndex + 1) / (forwardFrames - 1); // 0 to almost 1
            time = effectiveDuration * (1 - t);
          }
        } else {
          // Normal loop: 0 -> duration
          time = (i / totalTargetFrames) * effectiveDuration;
        }

        if (onFrame) {
          await onFrame(time);
        }

        // Force a frame capture
        if (hasRequestFrame) {
          // @ts-ignore
          track.requestFrame();
        }

        // Wait a tiny bit for the canvas to be painted and captured
        // In a perfect world requestFrame handles this, but a small delay ensures stability
        await new Promise((r) => setTimeout(r, 1000 / fps));

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
