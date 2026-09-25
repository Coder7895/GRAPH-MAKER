import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { FourierCoefficient } from '../math/dft';
import {
  generateFourierLatex,
  generateDesmosExpressions,
  generatePythonScript,
  generateGeoGebraScript,
} from '../math/latexExporter';
import { Copy, Check, ExternalLink, Download, FileCode, Sparkles } from 'lucide-react';

interface EquationViewerProps {
  coefficients: FourierCoefficient[];
  imageTitle?: string;
}

export const EquationViewer: React.FC<EquationViewerProps> = ({
  coefficients,
  imageTitle = 'Uploaded Image',
}) => {
  const [activeTab, setActiveTab] = useState<'latex' | 'desmos' | 'python' | 'geogebra' | 'spectrum'>('latex');
  const [copied, setCopied] = useState<string | null>(null);
  const [equationTermsLimit, setEquationTermsLimit] = useState<number>(12);

  // LaTeX container refs
  const katexOverviewRef = useRef<HTMLDivElement>(null);
  const katexExpandedRef = useRef<HTMLDivElement>(null);

  // Generate mathematical export packages
  const latexData = generateFourierLatex(coefficients, equationTermsLimit);
  const desmosData = generateDesmosExpressions(coefficients, 30);
  const pythonScript = generatePythonScript(coefficients, imageTitle, 60);
  const geoGebraScript = generateGeoGebraScript(coefficients, 25);

  // Render KaTeX equations
  useEffect(() => {
    if (katexOverviewRef.current) {
      try {
        katex.render(latexData.overviewLatex, katexOverviewRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (katexExpandedRef.current) {
      try {
        katex.render(latexData.expandedLatex, katexExpandedRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, [latexData.overviewLatex, latexData.expandedLatex, activeTab]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-neutral-950 rounded-xl border border-neutral-850 shadow-xl overflow-hidden flex flex-col">
      {/* Top Header & Tabs */}
      <div className="p-4 bg-black border-b border-neutral-850 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
            <Sparkles size={14} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              Mathematical Equations Engine
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              Closed-Form Parametric Representation
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
          {(
            [
              ['latex', 'LaTeX Formula'],
              ['desmos', 'Desmos Format'],
              ['python', 'Python (NumPy)'],
              ['geogebra', 'GeoGebra'],
              ['spectrum', 'Harmonic Spectrum'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === key
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-5 flex-1 min-h-[320px] overflow-y-auto">
        {/* 1. LaTeX Tab */}
        {activeTab === 'latex' && (
          <div className="space-y-5">
            {/* General Formula Card */}
            <div className="p-4 rounded-lg bg-black border border-neutral-850">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-white uppercase tracking-wider font-semibold">
                  Continuous Complex Fourier Formulation
                </span>
                <button
                  onClick={() => copyToClipboard(latexData.overviewLatex, 'latex-overview')}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors font-mono"
                >
                  {copied === 'latex-overview' ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                  <span>{copied === 'latex-overview' ? 'Copied' : 'Copy LaTeX'}</span>
                </button>
              </div>
              <div ref={katexOverviewRef} className="py-2 overflow-x-auto text-white" />
            </div>

            {/* Numerical Expansion Card */}
            <div className="p-4 rounded-lg bg-black border border-neutral-850">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white uppercase tracking-wider font-semibold">
                    Harmonic Series Expansion
                  </span>
                  <div className="flex items-center gap-1 ml-4 text-xs font-mono text-neutral-400">
                    <span>Terms:</span>
                    {[6, 12, 20].map((t) => (
                      <button
                        key={t}
                        onClick={() => setEquationTermsLimit(t)}
                        className={`px-1.5 py-0.5 rounded ${
                          equationTermsLimit === t ? 'bg-white text-black font-bold' : 'hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(latexData.expandedLatex, 'latex-expanded')}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors font-mono"
                >
                  {copied === 'latex-expanded' ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                  <span>{copied === 'latex-expanded' ? 'Copied' : 'Copy System'}</span>
                </button>
              </div>

              <div ref={katexExpandedRef} className="py-2 overflow-x-auto text-white font-mono" />
            </div>

            {/* Raw LaTeX Code Box */}
            <div className="relative">
              <pre className="p-4 rounded-lg bg-black text-xs font-mono text-neutral-300 border border-neutral-850 overflow-x-auto">
                {latexData.expandedLatex}
              </pre>
              <button
                onClick={() =>
                  downloadFile(
                    `\\documentclass{article}\n\\usepackage{amsmath}\n\\begin{document}\n\\[\n${latexData.expandedLatex}\n\\]\n\\end{document}`,
                    'equations.tex',
                    'text/plain'
                  )
                }
                className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-mono bg-neutral-900 hover:bg-neutral-800 text-white px-2.5 py-1 rounded transition-colors border border-neutral-700"
              >
                <Download size={13} />
                Download .tex
              </button>
            </div>
          </div>
        )}

        {/* 2. Desmos Format Tab */}
        {activeTab === 'desmos' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between">
              <p className="text-xs text-neutral-300 font-mono">
                Paste these expressions into <span className="font-bold underline text-white">desmos.com/calculator</span> to plot this image in pure mathematical curves.
              </p>
              <a
                href="https://www.desmos.com/calculator"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-white font-mono bg-black px-2.5 py-1 rounded border border-neutral-700 ml-2"
              >
                Open Desmos <ExternalLink size={12} />
              </a>
            </div>

            {/* X(t) Function */}
            <div className="p-3.5 rounded-lg bg-black border border-neutral-850">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-white font-semibold">1. X(t) Fourier Series</span>
                <button
                  onClick={() => copyToClipboard(desmosData.xFunction, 'desmos-x')}
                  className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  {copied === 'desmos-x' ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                  Copy X(t)
                </button>
              </div>
              <p className="text-xs font-mono text-neutral-300 break-all select-all bg-neutral-950 p-2.5 rounded border border-neutral-850">
                {desmosData.xFunction.slice(0, 300)}...
              </p>
            </div>

            {/* Y(t) Function */}
            <div className="p-3.5 rounded-lg bg-black border border-neutral-850">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-white font-semibold">2. Y(t) Fourier Series</span>
                <button
                  onClick={() => copyToClipboard(desmosData.yFunction, 'desmos-y')}
                  className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  {copied === 'desmos-y' ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                  Copy Y(t)
                </button>
              </div>
              <p className="text-xs font-mono text-neutral-300 break-all select-all bg-neutral-950 p-2.5 rounded border border-neutral-850">
                {desmosData.yFunction.slice(0, 300)}...
              </p>
            </div>

            {/* Parametric Expression */}
            <div className="p-3.5 rounded-lg bg-black border border-neutral-850">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-white font-semibold">3. Parametric Coordinate</span>
                <button
                  onClick={() => copyToClipboard('(X(t), -Y(t))', 'desmos-xy')}
                  className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  {copied === 'desmos-xy' ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                  Copy (X(t), -Y(t))
                </button>
              </div>
              <p className="text-xs font-mono text-neutral-300 bg-neutral-950 p-2.5 rounded border border-neutral-850">
                (X(t), -Y(t)) with 0 &le; t &le; 2&pi;
              </p>
            </div>

            <button
              onClick={() => {
                const fullDesmos = `${desmosData.xFunction}\n${desmosData.yFunction}\n(X(t), -Y(t))`;
                copyToClipboard(fullDesmos, 'desmos-all');
              }}
              className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold rounded-lg shadow transition-all flex items-center justify-center gap-2"
            >
              {copied === 'desmos-all' ? <Check size={15} /> : <Copy size={15} />}
              {copied === 'desmos-all' ? 'All Expressions Copied to Clipboard!' : 'Copy All 3 Desmos Equations'}
            </button>
          </div>
        )}

        {/* 3. Python NumPy Tab */}
        {activeTab === 'python' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white flex items-center gap-1.5">
                <FileCode size={14} /> Standalone Python Plotter Script
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(pythonScript, 'python')}
                  className="flex items-center gap-1 text-xs font-mono text-white bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded border border-neutral-700 transition-colors"
                >
                  {copied === 'python' ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                  {copied === 'python' ? 'Copied' : 'Copy Script'}
                </button>
                <button
                  onClick={() => downloadFile(pythonScript, 'plot_fourier_graph.py', 'text/x-python')}
                  className="flex items-center gap-1 text-xs font-mono text-black bg-white hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold transition-colors"
                >
                  <Download size={13} />
                  Download .py
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-lg bg-black text-xs font-mono text-neutral-300 border border-neutral-850 max-h-[380px] overflow-y-auto overflow-x-auto leading-relaxed">
              {pythonScript}
            </pre>
          </div>
        )}

        {/* 4. GeoGebra Tab */}
        {activeTab === 'geogebra' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-lg bg-black border border-neutral-850">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-white font-semibold">
                  GeoGebra Curve Command
                </span>
                <button
                  onClick={() => copyToClipboard(geoGebraScript, 'geogebra')}
                  className="flex items-center gap-1 text-xs font-mono text-neutral-400 hover:text-white"
                >
                  {copied === 'geogebra' ? <Check size={13} className="text-white" /> : <Copy size={13} />}
                  Copy Command
                </button>
              </div>
              <p className="text-xs font-mono text-neutral-300 break-all select-all bg-neutral-950 p-3 rounded border border-neutral-850">
                {geoGebraScript}
              </p>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              Open GeoGebra Calculator Suite, click the input bar at the bottom, and paste this command.
            </p>
          </div>
        )}

        {/* 5. Harmonic Spectrum Table Tab */}
        {activeTab === 'spectrum' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white font-semibold">
                Dominant Fourier Spectral Modes
              </span>
              <button
                onClick={() =>
                  downloadFile(JSON.stringify(coefficients, null, 2), 'fourier_coefficients.json', 'application/json')
                }
                className="flex items-center gap-1 text-xs font-mono text-white bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1 rounded border border-neutral-700"
              >
                <Download size={12} />
                Export JSON
              </button>
            </div>

            <div className="overflow-x-auto border border-neutral-850 rounded-lg bg-black">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Frequency (n)</th>
                    <th className="py-2.5 px-3">Amplitude (r_n)</th>
                    <th className="py-2.5 px-3">Phase (rad)</th>
                    <th className="py-2.5 px-3">Energy %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-300">
                  {latexData.table.map((row) => (
                    <tr key={row.rank} className="hover:bg-neutral-900/50">
                      <td className="py-2 px-3 text-white font-bold">#{row.rank}</td>
                      <td className="py-2 px-3 text-white">{row.freq}</td>
                      <td className="py-2 px-3 text-neutral-200 font-medium">{row.amplitude}</td>
                      <td className="py-2 px-3 text-neutral-400">{row.phase}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{row.energyPct}%</span>
                          <div className="w-16 h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full"
                              style={{ width: `${Math.min(100, row.energyPct * 3)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
