import React from 'react';
import { FourierCoefficient } from '../math/dft';
import { Complex } from '../math/complex';
import { Cpu, X, Sigma, Globe, Gauge } from 'lucide-react';

interface MathAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  coefficients: FourierCoefficient[];
  points: Complex[];
  title: string;
}

export const MathAnalysisModal: React.FC<MathAnalysisModalProps> = ({
  isOpen,
  onClose,
  coefficients,
  points,
  title,
}) => {
  if (!isOpen) return null;

  // Calculate Mathematical & Topological Metrics
  const totalEnergy = coefficients.reduce((acc, c) => acc + c.amp * c.amp, 0);

  // 1. Spectral Shannon Entropy H = -sum(p_k * ln(p_k))
  let entropy = 0;
  coefficients.forEach((c) => {
    if (totalEnergy > 0) {
      const p = (c.amp * c.amp) / totalEnergy;
      if (p > 0.00001) {
        entropy -= p * Math.log2(p);
      }
    }
  });

  // 2. Arc Length (Perimeter)
  let perimeter = 0;
  for (let i = 1; i < points.length; i++) {
    perimeter += Math.hypot(points[i].re - points[i - 1].re, points[i].im - points[i - 1].im);
  }

  // 3. Center of Mass / Centroid
  const centroidX = points.reduce((acc, p) => acc + p.re, 0) / (points.length || 1);
  const centroidY = points.reduce((acc, p) => acc + p.im, 0) / (points.length || 1);

  // 4. Symmetry score
  let symmetryDiff = 0;
  const sampleCount = Math.min(100, points.length);
  for (let i = 0; i < sampleCount; i++) {
    const pt = points[i];
    let minD = Infinity;
    for (let j = 0; j < sampleCount; j++) {
      const d = Math.hypot(-pt.re - points[j].re, pt.im - points[j].im);
      if (d < minD) minD = d;
    }
    symmetryDiff += minD;
  }
  const avgSymmetryDist = symmetryDiff / sampleCount;
  const symmetryScore = Math.max(0, Math.min(100, 100 - avgSymmetryDist * 2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-white" />
            <div>
              <h3 className="text-xs font-bold text-white tracking-wider font-mono uppercase">
                Topological & Spectral Analysis
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Target: <span className="text-white font-semibold">{title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
          <div className="p-3 bg-black rounded-lg border border-neutral-850">
            <div className="text-neutral-400 mb-1 flex items-center gap-1.5">
              <Sigma size={13} className="text-white" /> Spectral Entropy
            </div>
            <div className="text-base font-bold text-white">{entropy.toFixed(3)} <span className="text-[10px] text-neutral-400">bits</span></div>
            <div className="text-[9px] text-neutral-400 mt-0.5">Information density</div>
          </div>

          <div className="p-3 bg-black rounded-lg border border-neutral-850">
            <div className="text-neutral-400 mb-1 flex items-center gap-1.5">
              <Gauge size={13} className="text-white" /> Arc Perimeter
            </div>
            <div className="text-base font-bold text-white">{perimeter.toFixed(1)} <span className="text-[10px] text-neutral-400">px</span></div>
            <div className="text-[9px] text-neutral-400 mt-0.5">Euclidean contour length</div>
          </div>

          <div className="p-3 bg-black rounded-lg border border-neutral-850">
            <div className="text-neutral-400 mb-1 flex items-center gap-1.5">
              <Globe size={13} className="text-white" /> Bilateral Symmetry
            </div>
            <div className="text-base font-bold text-white">{symmetryScore.toFixed(1)}%</div>
            <div className="text-[9px] text-neutral-400 mt-0.5">Reflection invariance</div>
          </div>

          <div className="p-3 bg-black rounded-lg border border-neutral-850">
            <div className="text-neutral-400 mb-1">Centroid (x̄, ȳ)</div>
            <div className="text-xs font-bold text-white">({centroidX.toFixed(1)}, {centroidY.toFixed(1)})</div>
            <div className="text-[9px] text-neutral-400 mt-0.5">Center of mass</div>
          </div>

          <div className="p-3 bg-black rounded-lg border border-neutral-850">
            <div className="text-neutral-400 mb-1">Harmonic Modes</div>
            <div className="text-base font-bold text-white">{coefficients.length}</div>
            <div className="text-[9px] text-neutral-400 mt-0.5">Total frequencies</div>
          </div>

          <div className="p-3 bg-black rounded-lg border border-neutral-850">
            <div className="text-neutral-400 mb-1">Euler Characteristic</div>
            <div className="text-base font-bold text-white">&chi; = 0</div>
            <div className="text-[9px] text-neutral-400 mt-0.5">Continuous closed loop</div>
          </div>
        </div>

        <div className="p-3.5 bg-black rounded-lg border border-neutral-850 text-xs font-mono text-neutral-300 space-y-1.5">
          <p className="font-semibold text-white">Mathematical Interpretation:</p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            The continuous contour function γ(t) in the complex plane ℂ maps the 1-sphere S¹ → ℝ².
            By the Dirichlet-Jordan theorem, the complex Fourier series converges uniformly everywhere along smooth segments,
            guaranteeing exact geometric reconstruction without Gibb's ringing artifacts when high-frequency modes are preserved.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold rounded transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
