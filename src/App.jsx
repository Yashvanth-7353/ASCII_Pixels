// src/App.jsx
import { useState } from 'react';
import { useAsciiCamera } from './useAsciiCamera';

export default function App() {
  const [cols, setCols] = useState(120);
  const [rows, setRows] = useState(55);

  const { videoRef, canvasRef, asciiText, error, isActive, startCamera, stopCamera } =
    useAsciiCamera({ cols, rows });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.1em' }}>
        ASCII CAMERA
      </h1>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={isActive ? stopCamera : startCamera} style={btnStyle(isActive)}>
          {isActive ? '⏹ Stop' : '▶ Start Camera'}
        </button>

        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Cols: {cols}
          <input type="range" min="40" max="180" value={cols}
            onChange={e => setCols(Number(e.target.value))}
            disabled={isActive}
            style={{ width: '100px' }} />
        </label>

        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Rows: {rows}
          <input type="range" min="20" max="90" value={rows}
            onChange={e => setRows(Number(e.target.value))}
            disabled={isActive}
            style={{ width: '100px' }} />
        </label>
      </div>

      {/* Hidden video + canvas (used only for processing) */}
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Error */}
      {error && <p style={{ color: '#ff4444', fontSize: '14px' }}>{error}</p>}

      {/* ASCII output */}
      {asciiText ? (
        <pre style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '8px',
          lineHeight: '1.1',
          color: '#00ff41',
          letterSpacing: '0.05em',
          whiteSpace: 'pre',
          userSelect: 'none',
          background: '#0a0a0a',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #1a3a1a',
          overflow: 'hidden',
        }}>
          {asciiText}
        </pre>
      ) : (
        <div style={{
          height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px dashed #1a3a1a', borderRadius: '4px', color: '#2a6a2a', fontSize: '14px',
        }}>
          Press "Start Camera" to begin
        </div>
      )}
    </div>
  );
}

function btnStyle(isActive) {
  return {
    padding: '8px 18px',
    background: isActive ? '#1a0a0a' : '#0a1a0a',
    color: isActive ? '#ff4444' : '#00ff41',
    border: `1px solid ${isActive ? '#ff4444' : '#00ff41'}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '14px',
    letterSpacing: '0.05em',
  };
}