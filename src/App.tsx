import React, { useState, useEffect, useMemo } from 'react';
import { Complex } from './math/complex';
import { FourierCoefficient, computeDFT } from './math/dft';
import { PRESETS, PresetItem } from './cv/presets';
import { Header } from './components/Header';
import { EpicycleCanvas } from './components/EpicycleCanvas';
import { ThreeDSurfaceCanvas } from './components/ThreeDSurfaceCanvas';
import { EquationViewer } from './components/EquationViewer';
import { ImageUploader } from './components/ImageUploader';
import { PresetGallery } from './components/PresetGallery';
import { DrawingPad } from './components/DrawingPad';
import { MathAnalysisModal } from './components/MathAnalysisModal';
import { Cpu, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Application State
  const [points, setPoints] = useState<Complex[]>(() => PRESETS[0].generatePoints());
  const [imageTitle, setImageTitle] = useState<string>(PRESETS[0].name);
  const [activePresetId, setActivePresetId] = useState<string | null>(PRESETS[0].id);

  // Canvas Settings
  const [harmonicLimit, setHarmonicLimit] = useState<number>(100);
  const [speed, setSpeed] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Modals
  const [isDrawingPadOpen, setIsDrawingPadOpen] = useState<boolean>(false);
  const [isMathAnalysisOpen, setIsMathAnalysisOpen] = useState<boolean>(false);

  // Compute Fourier Coefficients whenever points update
  const coefficients: FourierCoefficient[] = useMemo(() => {
    if (points.length === 0) return [];
    return computeDFT(points);
  }, [points]);

  // Adjust harmonicLimit dynamically when coefficients length changes
  useEffect(() => {
    if (coefficients.length > 0) {
      setHarmonicLimit(Math.min(coefficients.length, 120));
    }
  }, [coefficients]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: PresetItem) => {
    const pts = preset.generatePoints();
    setPoints(pts);
    setImageTitle(preset.name);
    setActivePresetId(preset.id);
  };

  // Handle Custom Upload / Vision Pipeline Output
  const handleVisionOutput = (result: {
    points: Complex[];
    title: string;
    edgePreview: string | null;
  }) => {
    if (result.points.length > 0) {
      setPoints(result.points);
      setImageTitle(result.title);
      setActivePresetId(null);
    }
  };

  // Handle Freehand Drawing Sketch
  const handleCompleteDrawing = (drawnPoints: Complex[]) => {
    setPoints(drawnPoints);
    setImageTitle('Hand-Drawn Sketch');
    setActivePresetId(null);
    setIsDrawingPadOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* 1. Global Navigation Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalPoints={points.length}
        totalHarmonics={coefficients.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex flex-col gap-6 flex-1">
        {/* Minimalist Editorial Banner */}
        <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                Inverse Graphics
              </span>
              <span className="text-xs font-mono text-neutral-400">
                2D Discrete Fourier Decomposition
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight font-mono uppercase">
              Image to Mathematical Equations & Epicycles
            </h2>
            <p className="text-xs text-neutral-400 font-mono max-w-2xl">
              Extracts continuous 2D boundary contours from any uploaded image or sketch, computes the complex Fourier series, and renders rotating planetary epicycles alongside closed-form parametric equations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMathAnalysisOpen(true)}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-750 px-3.5 py-2 rounded text-xs font-mono font-medium transition-all"
            >
              <Cpu size={14} /> Spectrometry
            </button>
            <button
              onClick={() => setIsDrawingPadOpen(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black px-3.5 py-2 rounded text-xs font-mono font-bold transition-all"
            >
              <Sparkles size={14} /> Draw Sketch
            </button>
          </div>
        </div>

        {/* 2. Curated Benchmark Gallery */}
        <PresetGallery
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
        />

        {/* 3. Core Interactive Split: Left = Canvas (2D/3D), Right = Vision Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[580px]">
          {/* Main Visualizer Stage (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col h-[520px] sm:h-[580px]">
            {viewMode === '2d' ? (
              <EpicycleCanvas
                coefficients={coefficients}
                originalPoints={points}
                harmonicLimit={harmonicLimit}
                onHarmonicLimitChange={setHarmonicLimit}
                speed={speed}
                onSpeedChange={setSpeed}
              />
            ) : (
              <ThreeDSurfaceCanvas
                coefficients={coefficients}
                harmonicLimit={harmonicLimit}
              />
            )}
          </div>

          {/* Right Pipeline & Image Ingestion (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ImageUploader
              onProcessComplete={handleVisionOutput}
              onOpenDrawingPad={() => setIsDrawingPadOpen(true)}
            />
          </div>
        </div>

        {/* 4. Full Mathematical Equations Engine & Export Center */}
        <div className="w-full">
          <EquationViewer
            coefficients={coefficients}
            imageTitle={imageTitle}
          />
        </div>
      </main>

      {/* 5. Modals */}
      {isDrawingPadOpen && (
        <DrawingPad
          onCompleteDrawing={handleCompleteDrawing}
          onCancel={() => setIsDrawingPadOpen(false)}
        />
      )}

      {isMathAnalysisOpen && (
        <MathAnalysisModal
          isOpen={isMathAnalysisOpen}
          onClose={() => setIsMathAnalysisOpen(false)}
          coefficients={coefficients}
          points={points}
          title={imageTitle}
        />
      )}

      {/* 6. Footer */}
      <footer className="border-t border-neutral-900 bg-black py-6 px-4 lg:px-8 mt-12 text-neutral-400 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">EpiGraph</span>
            <span>—</span>
            <span>Inverse Mathematical Image-to-Equation Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Discrete Fourier Transform (DFT)</span>
            <span>•</span>
            <span>Desmos & LaTeX Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
