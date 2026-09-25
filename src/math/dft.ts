import { Complex, ComplexNum } from './complex';

export interface FourierCoefficient {
  re: number;
  im: number;
  freq: number;
  amp: number;
  phase: number;
}

export interface EpicycleState {
  x: number;
  y: number;
  radius: number;
  angle: number;
}

/**
 * Computes Discrete Fourier Transform of 2D points treated as complex numbers z = x + iy
 */
export function computeDFT(points: Complex[]): FourierCoefficient[] {
  const N = points.length;
  if (N === 0) return [];

  const coefficients: FourierCoefficient[] = [];

  for (let k = 0; k < N; k++) {
    // Map frequency k to symmetric range: [0, 1, -1, 2, -2, ...]
    const freq = k <= N / 2 ? k : k - N;

    let sum = new ComplexNum(0, 0);

    for (let n = 0; n < N; n++) {
      const phi = (2 * Math.PI * freq * n) / N;
      // e^(-i * phi) = cos(phi) - i * sin(phi)
      const exp = new ComplexNum(Math.cos(phi), -Math.sin(phi));
      sum = sum.add(new ComplexNum(points[n].re, points[n].im).multiply(exp));
    }

    sum = sum.scale(1 / N);

    coefficients.push({
      re: sum.re,
      im: sum.im,
      freq,
      amp: sum.magnitude,
      phase: sum.phase,
    });
  }

  // Sort by amplitude descending (largest epicycles draw the macroscopic shape, smaller ones draw fine details)
  return coefficients.sort((a, b) => b.amp - a.amp);
}

/**
 * Evaluates the epicycle chain at parameter time t in [0, 2*PI]
 * Returns position of the pen and the geometry of each epicycle circle
 */
export function evaluateEpicycles(
  coefficients: FourierCoefficient[],
  time: number,
  harmonicLimit: number = coefficients.length,
  originX: number = 0,
  originY: number = 0
): { pen: Complex; epicycles: EpicycleState[] } {
  let currentX = originX;
  let currentY = originY;

  const count = Math.min(harmonicLimit, coefficients.length);
  const epicycles: EpicycleState[] = [];

  for (let i = 0; i < count; i++) {
    const prevX = currentX;
    const prevY = currentY;

    const { freq, amp, phase } = coefficients[i];
    const angle = freq * time + phase;

    currentX += amp * Math.cos(angle);
    currentY += amp * Math.sin(angle);

    epicycles.push({
      x: prevX,
      y: prevY,
      radius: amp,
      angle: angle,
    });
  }

  return {
    pen: { re: currentX, im: currentY },
    epicycles,
  };
}

/**
 * Generates the full closed curve sampled at numSamples points
 */
export function reconstructCurve(
  coefficients: FourierCoefficient[],
  numSamples: number = 500,
  harmonicLimit?: number
): Complex[] {
  const curve: Complex[] = [];
  const limit = harmonicLimit ?? coefficients.length;

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 2 * Math.PI;
    const { pen } = evaluateEpicycles(coefficients, t, limit, 0, 0);
    curve.push(pen);
  }

  return curve;
}

/**
 * Calculates the Total Energy (variance) explained by the top K harmonics
 */
export function calculateEnergySpectrum(coefficients: FourierCoefficient[]): {
  totalEnergy: number;
  cumulativeEnergy: number[];
} {
  const totalEnergy = coefficients.reduce((acc, c) => acc + c.amp * c.amp, 0);
  let cum = 0;
  const cumulativeEnergy = coefficients.map((c) => {
    cum += c.amp * c.amp;
    return totalEnergy > 0 ? (cum / totalEnergy) * 100 : 100;
  });

  return { totalEnergy, cumulativeEnergy };
}
