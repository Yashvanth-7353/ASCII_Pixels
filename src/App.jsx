// src/App.jsx
import { useState } from 'react';
import { useAsciiCamera } from './useAsciiCamera';
import './App.css'; 

export default function App() {
  const [cols, setCols] = useState(160); 
  const [rows, setRows] = useState(75);
  const [brightness, setBrightness] = useState(10);
  const [contrast, setContrast] = useState(1.4);
  
  // NEW: Dynamic Aesthetic Controls
  const [charSpacing, setCharSpacing] = useState(0); // 0em is the optimal default
  const [colorHue, setColorHue] = useState(120);     // 120 is classic Matrix Green

  const { videoRef, canvasRef, asciiText, error, isActive, startCamera, stopCamera } =
    useAsciiCamera({ cols, rows, brightness, contrast });

  // Calculate dynamic colors based on the Hue slider
  const themeColor = `hsl(${colorHue}, 100%, 60%)`;
  const themeGlow = `hsla(${colorHue}, 100%, 50%, 0.3)`;

  return (
    <div className="app-container">
      <header className="header">
        <h1 style={{ textShadow: `0 0 15px ${themeGlow}` }}>ASCII VISIONS</h1>
        <p className="subtitle">High-Fidelity Terminal Optics</p>
      </header>

      {/* Main Controls */}
      <div className="control-panel" style={{ borderColor: themeGlow, boxShadow: `inset 0 0 20px ${themeGlow}` }}>
        <button 
          className={`btn btn-primary ${isActive ? 'active' : ''}`} 
          onClick={isActive ? stopCamera : startCamera}
          style={{ 
            color: isActive ? '#ff4444' : themeColor, 
            borderColor: isActive ? '#ff4444' : themeColor,
            textShadow: isActive ? '0 0 5px rgba(255,68,68,0.5)' : `0 0 5px ${themeGlow}`
          }}
        >
          {isActive ? '⏹ TERMINATE FEED' : '▶ INITIATE CAMERA'}
        </button>

        {/* Resolution Sliders */}
        <div className="sliders-container">
          <label className="slider-label">
            <span>COLS: {cols}</span>
            <input type="range" min="80" max="300" value={cols}
              onChange={e => setCols(Number(e.target.value))} />
          </label>
          <label className="slider-label">
            <span>ROWS: {rows}</span>
            <input type="range" min="40" max="140" value={rows}
              onChange={e => setRows(Number(e.target.value))} />
          </label>
        </div>

        {/* Calibration Sliders */}
        <div className="sliders-container">
          <label className="slider-label">
            <span>BRIGHT: {brightness}</span>
            <input type="range" min="-100" max="100" value={brightness}
              onChange={e => setBrightness(Number(e.target.value))} />
          </label>
          <label className="slider-label">
            <span>CONTRAST: {contrast.toFixed(1)}x</span>
            <input type="range" min="0.5" max="3.0" step="0.1" value={contrast}
              onChange={e => setContrast(Number(e.target.value))} />
          </label>
        </div>

        {/* NEW: Spacing & Color Sliders */}
        <div className="sliders-container">
          <label className="slider-label">
            <span>SPACING: {charSpacing.toFixed(2)}em</span>
            <input type="range" min="-0.1" max="0.5" step="0.01" value={charSpacing}
              onChange={e => setCharSpacing(Number(e.target.value))} />
          </label>
          <label className="slider-label">
            <span style={{ color: themeColor }}>HUE: {colorHue}°</span>
            <input type="range" min="0" max="360" value={colorHue}
              onChange={e => setColorHue(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && <div className="error-box">{error}</div>}

      {/* Terminal Output */}
      <div className="terminal-container" style={{ borderColor: themeGlow }}>
        {asciiText ? (
          <pre 
            className="ascii-output"
            style={{ 
              letterSpacing: `${charSpacing}em`,
              color: themeColor,
              textShadow: `0 0 4px ${themeGlow}`
            }}
          >
            {asciiText}
          </pre>
        ) : (
          <div className="placeholder" style={{ color: themeColor }}>
            <span className="blink">_</span> AWAITING VIDEO INPUT...
          </div>
        )}
      </div>
    </div>
  );
}