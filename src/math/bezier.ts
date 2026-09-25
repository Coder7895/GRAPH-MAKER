import { Complex } from './complex';

export interface BezierCurve {
  p0: Complex;
  p1: Complex;
  p2: Complex;
  p3: Complex;
}

export interface PolynomialCoefficients {
  // x(t) = a_x * t^3 + b_x * t^2 + c_x * t + d_x
  ax: number;
  bx: number;
  cx: number;
  dx: number;
  // y(t) = a_y * t^3 + b_y * t^2 + c_y * t + d_y
  ay: number;
  by: number;
  cy: number;
  dy: number;
}

/**
 * Fits cubic Bezier curves to a series of points using Schneider's algorithm approximation
 */
export function fitBezierCurves(points: Complex[], tolerance: number = 2.0): BezierCurve[] {
  if (points.length < 2) return [];
  if (points.length === 2) {
    return [
      {
        p0: points[0],
        p1: { re: (2 * points[0].re + points[1].re) / 3, im: (2 * points[0].im + points[1].im) / 3 },
        p2: { re: (points[0].re + 2 * points[1].re) / 3, im: (points[0].im + 2 * points[1].im) / 3 },
        p3: points[1],
      },
    ];
  }

  // Segment points into chunks of 4-8 points for smooth cubic curve fitting
  const curves: BezierCurve[] = [];
  const step = Math.max(3, Math.floor(points.length / Math.min(25, Math.ceil(points.length / 4))));

  for (let i = 0; i < points.length - 1; i += step) {
    const p0 = points[i];
    const p3 = points[Math.min(i + step, points.length - 1)];

    // Heuristic control points using tangent directions
    const mid1 = points[Math.min(i + Math.floor(step / 3), points.length - 1)];
    const mid2 = points[Math.min(i + Math.floor((2 * step) / 3), points.length - 1)];

    const p1: Complex = {
      re: p0.re + (mid1.re - p0.re) * 1.2,
      im: p0.im + (mid1.im - p0.im) * 1.2,
    };
    const p2: Complex = {
      re: p3.re + (mid2.re - p3.re) * 1.2,
      im: p3.im + (mid2.im - p3.im) * 1.2,
    };

    curves.push({ p0, p1, p2, p3 });
  }

  return curves;
}

/**
 * Converts a cubic Bezier curve to standard polynomial form:
 * x(t) = a_x t^3 + b_x t^2 + c_x t + d_x
 * y(t) = a_y t^3 + b_y t^2 + c_y t + d_y
 * for t in [0, 1]
 */
export function bezierToPolynomial(b: BezierCurve): PolynomialCoefficients {
  // P(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
  // Expanding:
  // t^3: -P0 + 3P1 - 3P2 + P3
  // t^2: 3P0 - 6P1 + 3P2
  // t^1: -3P0 + 3P1
  // t^0: P0

  const ax = -b.p0.re + 3 * b.p1.re - 3 * b.p2.re + b.p3.re;
  const bx = 3 * b.p0.re - 6 * b.p1.re + 3 * b.p2.re;
  const cx = -3 * b.p0.re + 3 * b.p1.re;
  const dx = b.p0.re;

  const ay = -b.p0.im + 3 * b.p1.im - 3 * b.p2.im + b.p3.im;
  const by = 3 * b.p0.im - 6 * b.p1.im + 3 * b.p2.im;
  const cy = -3 * b.p0.im + 3 * b.p1.im;
  const dy = b.p0.im;

  return { ax, bx, cx, dx, ay, by, cy, dy };
}
