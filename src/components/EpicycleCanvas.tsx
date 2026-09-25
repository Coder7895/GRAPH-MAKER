import React, { useRef, useEffect, useState } from 'react';
import { Complex } from '../math/complex';
import { FourierCoefficient, evaluateEpicycles } from '../math/dft';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { sonifier } from '../audio/sonifier';

interface EpicycleCanvasProps {
  coefficients: FourierCoefficient[];
  originalPoints: Complex[];
  harmonicLimit: number;
  onHarmonicLimitChange: (limit: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const EpicycleCanvas: React.FC<EpicycleCanvasProps> = ({
  coefficients,
  originalPoints,
  harmonicLimit,
  onHarmonicLimitChange,
  speed,
  onSpeedChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation and view state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [time, setTime] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggles
  const [showCircles, setShowCircles] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);

  // Stored path traced so far
  const pathRef = useRef<Complex[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(performance.now());

  // Reset path when coefficients change
  useEffect(() => {
    pathRef.current = [];
    setTime(0);
  }, [coefficients]);

  // Handle Audio Sonification toggle
  const toggleAudio = () => {
    if (isAudioActive) {
      sonifier.stop();
      setIsAudioActive(false);
    } else {
      sonifier.start(coefficients);
      setIsAudioActive(true);
    }
  };

  useEffect(() => {
    return () => {
      sonifier.stop();
    };
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = time;

    const render = (now: number) => {
      const dt = (now - prevTimeRef.current) / 1000;
      prevTimeRef.current = now;

      // Update time if playing
      if (isPlaying && coefficients.length > 0) {
        const delta = (2 * Math.PI / 10) * speed * dt;
        localTime = (localTime + delta) % (2 * Math.PI);
        setTime(localTime);
      }

      // Handle Canvas Sizing
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Pure solid black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Apply Pan and Zoom centered
      ctx.save();
      const originX = width / 2 + pan.x;
      const originY = height / 2 + pan.y;
      ctx.translate(originX, originY);
      ctx.scale(zoom, zoom);

      // 1. Cartesian Grid
      if (showAxes) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1 / zoom;
        const gridSize = 40;
        const ext = 1200;

        ctx.beginPath();
        for (let x = -ext; x <= ext; x += gridSize) {
          ctx.moveTo(x, -ext);
          ctx.lineTo(x, ext);
        }
        for (let y = -ext; y <= ext; y += gridSize) {
          ctx.moveTo(-ext, y);
          ctx.lineTo(ext, y);
        }
        ctx.stroke();

        // Main Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.2 / zoom;
        ctx.beginPath();
        ctx.moveTo(-ext, 0);
        ctx.lineTo(ext, 0);
        ctx.moveTo(0, -ext);
        ctx.lineTo(0, ext);
        ctx.stroke();

        // Origin indicator
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5 / zoom, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 2. Draw Original Reference Contour (Ghost)
      if (showOriginal && originalPoints.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.0 / zoom;
        ctx.setLineDash([3 / zoom, 3 / zoom]);
        ctx.beginPath();
        ctx.moveTo(originalPoints[0].re, originalPoints[0].im);
        for (let i = 1; i < originalPoints.length; i++) {
          ctx.lineTo(originalPoints[i].re, originalPoints[i].im);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Evaluate epicycles at current time
      if (coefficients.length > 0) {
        const { pen, epicycles } = evaluateEpicycles(coefficients, localTime, harmonicLimit, 0, 0);

        // Append to traced path
        if (isPlaying) {
          pathRef.current.push(pen);
          if (pathRef.current.length > 1800) {
            pathRef.current.shift();
          }
        }

        // Draw Epicycle Circles & Radii
        if (showCircles) {
          for (let i = 0; i < epicycles.length; i++) {
            const { x, y, radius, angle } = epicycles[i];
            if (radius * zoom < 0.8) continue;

            // Circular orbit
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = i === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1 / zoom;
            ctx.stroke();

            // Radius Vector Line
            if (showVectors && radius * zoom > 3) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
              ctx.strokeStyle = i === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)';
              ctx.lineWidth = 1.0 / zoom;
              ctx.stroke();
            }
          }
        }

        // 4. Draw Full Traced Contour (Pure White Line with Subtle Blur)
        if (pathRef.current.length > 1) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffffff';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.0 / zoom;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(pathRef.current[0].re, pathRef.current[0].im);
          for (let i = 1; i < pathRef.current.length; i++) {
            ctx.lineTo(pathRef.current[i].re, pathRef.current[i].im);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // 5. Tracing Pen Head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pen.re, pen.im, 3.5 / zoom, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.arc(pen.re, pen.im, 6.5 / zoom, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.restore();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    coefficients,
    originalPoints,
    isPlaying,
    speed,
    harmonicLimit,
    zoom,
    pan,
    showCircles,
    showAxes,
    showOriginal,
    showVectors,
  ]);

  // Pan and Zoom Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((z) => Math.max(0.1, Math.min(10, z * factor)));
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    pathRef.current = [];
    setTime(0);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black rounded-xl overflow-hidden border border-neutral-850 shadow-2xl">
      {/* Top Overlay Badge / Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-black/90 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded flex items-center gap-2 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span className="text-xs font-mono font-medium text-neutral-300">
            MODES: <span className="text-white font-bold">{Math.min(harmonicLimit, coefficients.length)}</span> / {coefficients.length}
          </span>
        </div>

        <div className="bg-black/90 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded flex items-center gap-2 shadow-lg">
          <span className="text-xs font-mono font-medium text-neutral-300">
            t: <span className="text-white font-bold">{((time / (2 * Math.PI)) * 100).toFixed(1)}%</span>
          </span>
        </div>

        <div className="bg-black/90 backdrop-blur-md border border-neutral-850 px-3 py-1.5 rounded text-xs font-mono text-neutral-400">
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Top Right Quick Toggles */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/90 backdrop-blur-md p-1 rounded-lg border border-neutral-850 shadow-lg">
        <button
          onClick={() => setShowCircles(!showCircles)}
          title="Toggle Epicycles / Gear Circles"
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            showCircles ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Gears
        </button>

        <button
          onClick={() => setShowVectors(!showVectors)}
          title="Toggle Rotating Vectors"
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            showVectors ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Vectors
        </button>

        <button
          onClick={() => setShowAxes(!showAxes)}
          title="Toggle Cartesian Grid & Axes"
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            showAxes ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Grid
        </button>

        <button
          onClick={() => setShowOriginal(!showOriginal)}
          title="Toggle Reference Contour"
          className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
            showOriginal ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Ghost
        </button>

        <div className="w-px h-4 bg-neutral-800 mx-1"></div>

        <button
          onClick={toggleAudio}
          title={isAudioActive ? "Mute Fourier Acoustic Sonification" : "Sonify Mathematical Frequencies (Play Sound)"}
          className={`p-1.5 rounded transition-all ${
            isAudioActive
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          {isAudioActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        <button
          onClick={resetView}
          title="Reset View & Origin"
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-colors"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Main Interactive Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="p-4 bg-black/95 backdrop-blur-lg border-t border-neutral-850 flex flex-wrap items-center justify-between gap-4 z-10">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
          </button>

          <button
            onClick={() => {
              pathRef.current = [];
              setTime(0);
            }}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors border border-neutral-800"
            title="Clear and Replay Trace"
          >
            <RotateCcw size={16} />
          </button>

          {/* Time Scrubber */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">t:</span>
            <input
              type="range"
              min={0}
              max={2 * Math.PI}
              step={0.01}
              value={time}
              onChange={(e) => setTime(parseFloat(e.target.value))}
              className="w-28 sm:w-44 cursor-pointer"
            />
          </div>
        </div>

        {/* Harmonics Resolution Slider */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Active Modes:</span>
              <span className="text-white font-semibold">{harmonicLimit}</span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.max(1, coefficients.length)}
              value={harmonicLimit}
              onChange={(e) => onHarmonicLimitChange(parseInt(e.target.value))}
              className="w-32 sm:w-48 cursor-pointer"
            />
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-neutral-400 mr-1">Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 text-xs font-mono rounded transition-all ${
                speed === s
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
