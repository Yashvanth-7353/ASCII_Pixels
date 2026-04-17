// src/useAsciiCamera.js
import { useRef, useEffect, useState, useCallback } from "react";

// 1. Expanded character set ordered from DARK to LIGHT
// This ensures shadows are empty space and highlights are dense characters
const ASCII_CHARS =
  " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

function toGrayscale(r, g, b) {
  // Luminance formula
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function pixelsToAscii(imageData, width, height, cols, rows) {
  // Use precise floating point numbers for cells
  const cellW = width / cols;
  const cellH = height / rows;
  const lines = [];

  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      // Calculate exact boundaries for this character cell
      const startX = Math.floor(col * cellW);
      const startY = Math.floor(row * cellH);
      const endX = Math.min(Math.floor((col + 1) * cellW), width);
      const endY = Math.min(Math.floor((row + 1) * cellH), height);

      let sumGray = 0;
      let count = 0;

      // 2. AREA AVERAGING: Read every pixel in the cell to retain fine details
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          const r = imageData.data[idx];
          const g = imageData.data[idx + 1];
          const b = imageData.data[idx + 2];
          sumGray += toGrayscale(r, g, b);
          count++;
        }
      }

      // Get the average brightness of the cell (0-255)
      let avgGray = count > 0 ? sumGray / count : 0;

      // Optional: Boost contrast slightly to make details pop
      const contrast = 1.2;
      avgGray = ((avgGray / 255 - 0.5) * contrast + 0.5) * 255;
      avgGray = Math.max(0, Math.min(255, avgGray));

      // Map to character
      const charIdx = Math.floor((avgGray / 255) * (ASCII_CHARS.length - 1));
      line += ASCII_CHARS[charIdx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function useAsciiCamera({ cols = 120, rows = 60 } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [asciiText, setAsciiText] = useState("");
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError("Camera access denied or unavailable.");
      console.error(err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsActive(false);
    setAsciiText("");
  }, []);

  // The render loop
  useEffect(() => {
    if (!isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function render() {
      if (!video || video.paused || video.ended) return;

      canvas.width = 640;
      canvas.height = 480;
      // Mirror horizontally so it feels like a mirror
      ctx.save();
      ctx.translate(640, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, 640, 480);
      ctx.restore();

      const imageData = ctx.getImageData(0, 0, 640, 480);
      const ascii = pixelsToAscii(imageData, 640, 480, cols, rows);
      setAsciiText(ascii);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, cols, rows]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    canvasRef,
    asciiText,
    error,
    isActive,
    startCamera,
    stopCamera,
  };
}
