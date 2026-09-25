import { FourierCoefficient } from './dft';
import { BezierCurve, bezierToPolynomial } from './bezier';

/**
 * Formats a number to clean decimal representation
 */
function fmt(num: number, decimals: number = 3): string {
  const rounded = Number(num.toFixed(decimals));
  return rounded >= 0 ? `+ ${rounded}` : `- ${Math.abs(rounded)}`;
}

function fmtLead(num: number, decimals: number = 3): string {
  return Number(num.toFixed(decimals)).toString();
}

/**
 * Generates beautiful LaTeX mathematical equations for the Fourier series
 */
export function generateFourierLatex(
  coefficients: FourierCoefficient[],
  topK: number = 10
): {
  overviewLatex: string;
  expandedLatex: string;
  compactLatex: string;
  table: Array<{ rank: number; freq: number; amplitude: number; phase: number; energyPct: number }>;
} {
  const selected = coefficients.slice(0, Math.min(topK, coefficients.length));
  const totalEnergy = coefficients.reduce((acc, c) => acc + c.amp * c.amp, 0);

  // Overview general formula
  const overviewLatex = `\\begin{aligned}
z(t) &= \\sum_{n=-N}^{N} c_n e^{i n t} \\quad \\text{where } c_n = \\frac{1}{2\\pi} \\oint_{\\Gamma} z(s) e^{-i n s} \\, ds \\\\[6pt]
x(t) &= c_0^{(x)} + \\sum_{k=1}^{K} r_k \\cos\\left( \\omega_k t + \\phi_k \\right) \\\\[4pt]
y(t) &= c_0^{(y)} + \\sum_{k=1}^{K} r_k \\sin\\left( \\omega_k t + \\phi_k \\right)
\\end{aligned}`;

  // Find DC offset (frequency 0 or average)
  const dc = coefficients.find((c) => c.freq === 0) || coefficients[0];

  let xTerms: string[] = [];
  let yTerms: string[] = [];

  const table = selected.map((c, idx) => {
    const energyPct = totalEnergy > 0 ? (c.amp * c.amp / totalEnergy) * 100 : 0;
    const ampStr = c.amp.toFixed(2);
    const freqStr = c.freq === 0 ? '' : c.freq === 1 ? 't' : c.freq === -1 ? '-t' : `${c.freq}t`;
    const phaseStr = c.phase >= 0 ? `+ ${c.phase.toFixed(2)}` : `- ${Math.abs(c.phase).toFixed(2)}`;
    
    if (c.freq !== 0 && xTerms.length < 8) {
      const arg = freqStr ? `${freqStr} ${phaseStr}` : `${phaseStr}`;
      xTerms.push(`${ampStr} \\cos(${arg})`);
      yTerms.push(`${ampStr} \\sin(${arg})`);
    }

    return {
      rank: idx + 1,
      freq: c.freq,
      amplitude: Number(c.amp.toFixed(3)),
      phase: Number(c.phase.toFixed(3)),
      energyPct: Number(energyPct.toFixed(2)),
    };
  });

  const expandedLatex = `\\begin{cases}
x(t) = ${fmtLead(dc.re, 2)} ${xTerms.length ? '+ ' + xTerms.join(' + ') : ''} \\dots \\\\[8pt]
y(t) = ${fmtLead(dc.im, 2)} ${yTerms.length ? '+ ' + yTerms.join(' + ') : ''} \\dots
\\end{cases}`;

  const compactLatex = `\\gamma(t) = \\begin{pmatrix} x(t) \\\\ y(t) \\end{pmatrix}, \\quad t \\in [0, 2\\pi]`;

  return { overviewLatex, expandedLatex, compactLatex, table };
}

/**
 * Generates Desmos-ready parametric expressions
 * You can paste this directly into https://www.desmos.com/calculator
 */
export function generateDesmosExpressions(
  coefficients: FourierCoefficient[],
  topK: number = 25
): {
  combinedParametric: string;
  xFunction: string;
  yFunction: string;
  instructions: string;
} {
  const selected = coefficients.slice(0, Math.min(topK, coefficients.length));

  // Build x(t) string
  const xParts: string[] = [];
  const yParts: string[] = [];

  for (const c of selected) {
    const r = Number(c.amp.toFixed(3));
    if (r === 0) continue;
    const w = c.freq;
    const p = Number(c.phase.toFixed(3));
    const arg = w === 0 ? `${p}` : `${w}t ${p >= 0 ? '+' : ''}${p}`;

    xParts.push(`${r}*\\cos(${arg})`);
    yParts.push(`${r}*\\sin(${arg})`);
  }

  const xFunction = `X(t) = ${xParts.join(' + ')}`;
  const yFunction = `Y(t) = ${yParts.join(' + ')}`;
  const combinedParametric = `(X(t), Y(t))`;

  const instructions = `Paste X(t) and Y(t) into Desmos lines 1 & 2, then paste (X(t), Y(t)) with 0 <= t <= 2*pi in line 3.`;

  return { combinedParametric, xFunction, yFunction, instructions };
}

/**
 * Generates a complete, executable Python script with NumPy and Matplotlib
 */
export function generatePythonScript(
  coefficients: FourierCoefficient[],
  imageTitle: string = 'Generated Mathematical Graph',
  topK: number = 50
): string {
  const selected = coefficients.slice(0, Math.min(topK, coefficients.length));
  const coefsData = JSON.stringify(
    selected.map((c) => ({
      freq: c.freq,
      amp: Number(c.amp.toFixed(4)),
      phase: Number(c.phase.toFixed(4)),
    })),
    null,
    2
  );

  return `"""
========================================================================
EpiGraph AI - Inverse Mathematical Image-to-Equation Reconstruction
Title: ${imageTitle}
Generated Parametric Fourier Series
========================================================================
"""

import numpy as np
import matplotlib.pyplot as plt

# Harmonic Coefficients (Freq, Amplitude, Phase)
HARMONICS = ${coefsData}

def reconstruct_curve(num_points=1000):
    t = np.linspace(0, 2 * np.pi, num_points)
    x = np.zeros_like(t)
    y = np.zeros_like(t)
    
    for h in HARMONICS:
        freq = h['freq']
        amp = h['amp']
        phase = h['phase']
        
        angle = freq * t + phase
        x += amp * np.cos(angle)
        y += amp * np.sin(angle)
        
    return x, y

def plot_graph():
    x, y = reconstruct_curve(1200)
    
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(10, 10), dpi=150)
    
    # Invert Y to match image Cartesian display
    ax.plot(x, -y, color='#00f0ff', linewidth=1.8, label=f'Fourier Series ({len(HARMONICS)} Harmonics)')
    ax.set_aspect('equal')
    ax.grid(True, linestyle='--', alpha=0.3, color='#445577')
    ax.set_title('${imageTitle} - Pure Mathematical Plot', fontsize=14, color='#ffffff', pad=15)
    ax.set_xlabel('X(t) Real Domain', color='#8899aa')
    ax.set_ylabel('Y(t) Imaginary Domain', color='#8899aa')
    ax.legend(loc='upper right')
    
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    plot_graph()
`;
}

/**
 * Generates GeoGebra curve script
 */
export function generateGeoGebraScript(
  coefficients: FourierCoefficient[],
  topK: number = 20
): string {
  const selected = coefficients.slice(0, Math.min(topK, coefficients.length));

  const xParts = selected.map((c) => `${c.amp.toFixed(2)}*cos(${c.freq}*t + ${c.phase.toFixed(2)})`);
  const yParts = selected.map((c) => `${c.amp.toFixed(2)}*sin(${c.freq}*t + ${c.phase.toFixed(2)})`);

  return `Curve(${xParts.join(' + ')}, ${yParts.join(' + ')}, t, 0, 2*pi)`;
}

/**
 * Generates Bezier piecewise polynomials in LaTeX and standard math form
 */
export function generateBezierLatex(curves: BezierCurve[]): string[] {
  return curves.map((curve, i) => {
    const p = bezierToPolynomial(curve);
    return `B_{${i+1}}(t) = \\begin{cases}
x(t) = ${fmtLead(p.ax, 2)}t^3 ${fmt(p.bx, 2)}t^2 ${fmt(p.cx, 2)}t ${fmt(p.dx, 2)} \\\\[4pt]
y(t) = ${fmtLead(p.ay, 2)}t^3 ${fmt(p.by, 2)}t^2 ${fmt(p.cy, 2)}t ${fmt(p.dy, 2)}
\\end{cases}, \\quad t \\in [0, 1]`;
  });
}
