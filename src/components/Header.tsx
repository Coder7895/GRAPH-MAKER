import React from 'react';
import { Eye, Box, Github, Activity } from 'lucide-react';

interface HeaderProps {
  viewMode: '2d' | '3d';
  onViewModeChange: (mode: '2d' | '3d') => void;
  totalPoints: number;
  totalHarmonics: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  totalPoints,
  totalHarmonics,
}) => {
  return (
    <header className="w-full bg-black/95 backdrop-blur-md border-b border-neutral-850 sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Minimalist Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="6" />
              <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 4" />
              <circle cx="74" cy="50" r="6" fill="currentColor" />
              <line x1="50" y1="50" x2="74" y2="50" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-mono uppercase">
                EpiGraph
              </h1>
              <span className="bg-neutral-900 text-neutral-300 border border-neutral-700 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                DFT Engine
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
              Inverse Image-to-Equation & Parametric Graphing
            </p>
          </div>
        </div>

        {/* View Mode 2D / 3D Switcher */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => onViewModeChange('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              viewMode === '2d'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye size={13} /> 2D Epicycles
          </button>

          <button
            onClick={() => onViewModeChange('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              viewMode === '3d'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Box size={13} /> 3D Manifold
          </button>
        </div>

        {/* Right Stats & Link */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Activity size={12} className="text-neutral-400" />
            <span className="text-neutral-400">Pts:</span>
            <span className="text-white font-semibold">{totalPoints}</span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400">Modes:</span>
            <span className="text-white font-semibold">{totalHarmonics}</span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
          >
            <Github size={13} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
