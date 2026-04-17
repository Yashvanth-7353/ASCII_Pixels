// src/useAsciiCamera.js
import { useRef, useEffect, useState, useCallback } from 'react';

// Characters ordered dark → light (dense → sparse)
const ASCII_CHARS = '@#S%?*+;:,. ';

function toGrayscale(r, g, b) {
  // Luminance formula (perceptual weighting)
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function pixelsToAscii(imageData, width, height, cols, rows) {
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  const lines = [];

  for (let row = 0; row < rows; row++) {
    let line = '';
    for (let col = 0; col < cols; col++) {
      // Sample the center pixel of each cell
      const px = Math.floor(col * cellW + cellW / 2);
      const py = Math.floor(row * cellH + cellH / 2);
      const idx = (py * width + px) * 4;

      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const gray = toGrayscale(r, g, b);

      // Map 0-255 → index in ASCII_CHARS
      const charIdx = Math.floor((gray / 255) * (ASCII_CHARS.length - 1));
      line += ASCII_CHARS[charIdx];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export function useAsciiCamera({ cols = 120, rows = 60 } = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [asciiText, setAsciiText] = useState('');
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied or unavailable.');
      console.error(err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsActive(false);
    setAsciiText('');
  }, []);

  // The render loop
  useEffect(() => {
    if (!isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

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

  return { videoRef, canvasRef, asciiText, error, isActive, startCamera, stopCamera };
}