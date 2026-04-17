// src/App.jsx
import { useState } from 'react';
import { useAsciiCamera } from './useAsciiCamera';
import './App.css'; 

export default function App() {
  const [cols, setCols] = useState(160); 
  const [rows, setRows] = useState(75);
  const [colorMode, setColorMode] = useState('green');
  const [brightness, setBrightness] = useState(10); // Default slight boost
  const [contrast, setContrast] = useState(1.4);    // Default punchy contrast

  const { videoRef, canvasRef, asciiText, error, isActive, startCamera, stopCamera } =
    useAsciiCamera({ cols, rows, brightness, contrast });

  const toggleColor = () => {
    setColorMode(prev => (prev === 'green' ? 'white' : 'green'));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>ASCII VISIONS</h1>
        <p className="subtitle">High-Fidelity Terminal Optics</p>
      </header>

      {/* Main Controls */}
      <div className="control-panel">
        <button 
          className={`btn btn-primary ${isActive ? 'active' : ''}`} 
          onClick={isActive ? stopCamera : startCamera}
        >
          {isActive ? '⏹ TERMINATE FEED' : '▶ INITIATE CAMERA'}
        </button>

        <button className="btn btn-secondary" onClick={toggleColor}>
          ◧ THEME: {colorMode === 'green' ? 'MATRIX' : 'GHOST'}
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
      </div>

      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && <div className="error-box">{error}</div>}

      <div className={`terminal-container ${colorMode}`}>
        {asciiText ? (
          <pre className="ascii-output">
            {asciiText}
          </pre>
        ) : (
          <div className="placeholder">
            <span className="blink">_</span> AWAITING VIDEO INPUT...
          </div>
        )}
      </div>
    </div>
  );
}