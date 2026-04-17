// src/useAsciiCamera.js
import { useRef, useEffect, useState, useCallback } from 'react';

// The industry-standard Paul Bourke ASCII gradient (Dark to Light)
const ASCII_CHARS = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

function toGrayscale(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function pixelsToAscii(imageData, width, height, cols, rows, brightness, contrast) {
  const cellW = width / cols;
  const cellH = height / rows;
  const lines = [];

  for (let row = 0; row < rows; row++) {
    let line = '';
    for (let col = 0; col < cols; col++) {
      const startX = Math.floor(col * cellW);
      const startY = Math.floor(row * cellH);
      const endX = Math.min(Math.floor((col + 1) * cellW), width);
      const endY = Math.min(Math.floor((row + 1) * cellH), height);

      let sumGray = 0;
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          sumGray += toGrayscale(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]);
          count++;
        }
      }

      let avgGray = count > 0 ? sumGray / count : 0;
      
      // Apply Brightness & Contrast
      avgGray += brightness;
      avgGray = ((avgGray / 255 - 0.5) * contrast + 0.5) * 255;
      
      // Clamp values between 0 and 255
      avgGray = Math.max(0, Math.min(255, avgGray));

      const charIdx = Math.floor((avgGray / 255) * (ASCII_CHARS.length - 1));
      line += ASCII_CHARS[charIdx];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export function useAsciiCamera({ cols = 140, rows = 65, brightness = 0, contrast = 1.0 } = {}) {
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

  useEffect(() => {
    if (!isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function render() {
      if (!video || video.paused || video.ended) return;

      canvas.width = 640;
      canvas.height = 480;
      ctx.save();
      ctx.translate(640, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, 640, 480);
      ctx.restore();

      const imageData = ctx.getImageData(0, 0, 640, 480);
      const ascii = pixelsToAscii(imageData, 640, 480, cols, rows, brightness, contrast);
      setAsciiText(ascii);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, cols, rows, brightness, contrast]); // Added brightness/contrast to dependencies

  return { videoRef, canvasRef, asciiText, error, isActive, startCamera, stopCamera };
}