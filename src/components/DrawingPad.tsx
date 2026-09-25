import React, { useRef, useState, useEffect } from 'react';
import { Complex } from '../math/complex';
import { PenTool, Check, Trash2 } from 'lucide-react';

interface DrawingPadProps {
  onCompleteDrawing: (points: Complex[]) => void;
  onCancel: () => void;
}

export const DrawingPad: React.FC<DrawingPadProps> = ({ onCompleteDrawing, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [points, setPoints] = useState<Complex[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle monochrome grid
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getPos(e);
    if (!pos) return;
    setPoints([pos]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.re, pos.im);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    if (!pos) return;

    setPoints((prev) => [...prev, pos]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(pos.re, pos.im);
      ctx.stroke();
    }
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Complex | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      re: clientX - rect.left,
      im: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
  };

  const handleFinish = () => {
    if (points.length < 5) return;

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 500;
    const h = canvas ? canvas.height : 500;

    const centered: Complex[] = points.map((p) => ({
      re: p.re - w / 2,
      im: p.im - h / 2,
    }));

    onCompleteDrawing(centered);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 max-w-lg w-full shadow-2xl flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <PenTool size={16} className="text-white" />
            <h3 className="text-xs font-bold text-white tracking-wider font-mono uppercase">
              Draw Sketch
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {points.length} points
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 mb-3 text-left w-full font-mono">
          Draw any shape with your mouse or stylus to synthesize Fourier equations.
        </p>

        <div className="border border-neutral-800 rounded-lg overflow-hidden shadow-inner cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={440}
            height={380}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            className="block"
          />
        </div>

        <div className="flex items-center justify-between w-full mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-300 transition-colors border border-neutral-800"
            >
              <Trash2 size={13} /> Clear
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          <button
            onClick={handleFinish}
            disabled={points.length < 5}
            className="flex items-center gap-2 px-4 py-2 rounded bg-white hover:bg-neutral-200 disabled:opacity-30 text-black font-mono text-xs font-bold transition-all shadow"
          >
            <Check size={14} /> Synthesize Equations
          </button>
        </div>
      </div>
    </div>
  );
};
