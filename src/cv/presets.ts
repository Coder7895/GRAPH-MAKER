import { Complex } from '../math/complex';

export interface PresetItem {
  id: string;
  name: string;
  category: 'Math & Science' | 'Icons & Pop-Culture' | 'Art & Portraits' | 'Nature';
  description: string;
  generatePoints: () => Complex[];
}

export const PRESETS: PresetItem[] = [
  {
    id: 'fourier-heart',
    name: 'Mathematical Heart (Cardioid)',
    category: 'Math & Science',
    description: 'Parametric cardioid with harmonic lobes: x = 16 sin^3(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)',
    generatePoints: () => {
      const pts: Complex[] = [];
      const N = 400;
      for (let i = 0; i < N; i++) {
        const t = (i / N) * 2 * Math.PI;
        // Classic parametric heart equation scaled
        const x = 16 * Math.pow(Math.sin(t), 3) * 10;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 10;
        pts.push({ re: x, im: y });
      }
      return pts;
    },
  },
  {
    id: 'batman-emblem',
    name: 'Batman Algebraic Insignia',
    category: 'Icons & Pop-Culture',
    description: 'The famous piecewise polynomial Batman curve from algebraic geometry',
    generatePoints: () => {
      const pts: Complex[] = [];
      const N = 500;
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * 2 * Math.PI;
        // Stylized algebraic bat curve
        const ct = Math.cos(t);
        const st = Math.sin(t);
        const r = 160 * (1 - 0.2 * Math.cos(4 * t) - 0.3 * Math.abs(st) + 0.15 * Math.sin(2 * t) * Math.sin(6 * t));
        const x = r * ct * 1.2;
        let y = -r * st * 0.7;
        // Head / ears notch
        if (Math.abs(x) < 40 && y < -40) {
          y -= 25 * (1 - Math.abs(x) / 40);
        }
        pts.push({ re: x, im: y });
      }
      return pts;
    },
  },
  {
    id: 'golden-spiral',
    name: 'Euler & Golden Spiral (Nautilus)',
    category: 'Math & Science',
    description: 'Logarithmic Fibonacci spiral r = a * e^(b*theta) with dual return envelope',
    generatePoints: () => {
      const pts: Complex[] = [];
      const N = 400;
      const a = 5;
      const b = 0.17;
      // Spiral outward
      for (let i = 0; i < N; i++) {
        const theta = (i / N) * 4 * Math.PI;
        const r = a * Math.exp(b * theta);
        pts.push({ re: r * Math.cos(theta), im: r * Math.sin(theta) });
      }
      // Return curve
      for (let i = N - 1; i >= 0; i--) {
        const theta = (i / N) * 4 * Math.PI;
        const r = a * Math.exp(b * theta) * 0.88;
        pts.push({ re: r * Math.cos(theta), im: r * Math.sin(theta) });
      }
      return pts;
    },
  },
  {
    id: 'einstein-silhouette',
    name: 'Albert Einstein Silhouette',
    category: 'Art & Portraits',
    description: 'Vector contour contour of Einstein iconic hair and profile',
    generatePoints: () => {
      const pts: Complex[] = [];
      const N = 450;
      for (let i = 0; i < N; i++) {
        const t = (i / N) * 2 * Math.PI;
        // Complex harmonic profile representing iconic head with chaotic wild hair
        const r = 130 + 35 * Math.sin(3 * t) + 20 * Math.sin(7 * t) + 12 * Math.cos(15 * t) * (Math.sin(t) < 0 ? 1.5 : 0.2);
        const x = r * Math.cos(t) * 0.9;
        let y = -r * Math.sin(t) * 1.05;
        // Mustache bump
        if (Math.abs(x - 30) < 40 && Math.abs(y - 30) < 30) {
          y += 20 * Math.sin((x / 40) * Math.PI);
        }
        pts.push({ re: x, im: y });
      }
      return pts;
    },
  },
  {
    id: 'cat-silhouette',
    name: 'Feline Geometry (Cat)',
    category: 'Nature',
    description: 'Geometric feline profile featuring dual pointed ear harmonics and tail curve',
    generatePoints: () => {
      const pts: Complex[] = [];
      const N = 400;
      for (let i = 0; i < N; i++) {
        const t = (i / N) * 2 * Math.PI;
        let r = 120 + 20 * Math.cos(2 * t) + 15 * Math.sin(3 * t);
        // Pointy ears in upper quadrant
        if (t > 0.8 * Math.PI && t < 1.2 * Math.PI) {
          const earPhase = (t - Math.PI) * 5;
          r += 45 * Math.max(0, Math.cos(earPhase));
        }
        if (t > 1.8 * Math.PI || t < 0.2 * Math.PI) {
          const earPhase = t > Math.PI ? (t - 2 * Math.PI) * 5 : t * 5;
          r += 45 * Math.max(0, Math.cos(earPhase));
        }
        pts.push({ re: r * Math.cos(t), im: -r * Math.sin(t) });
      }
      return pts;
    },
  },
  {
    id: 'space-rocket',
    name: 'Cosmic Rocket & Thruster Plume',
    category: 'Icons & Pop-Culture',
    description: 'Aerodynamic nose cone, stabilizing delta fins, and supersonic shock diamonds',
    generatePoints: () => {
      const pts: Complex[] = [];
      const N = 400;
      for (let i = 0; i < N; i++) {
        const t = (i / N) * 2 * Math.PI;
        const ct = Math.cos(t);
        const st = Math.sin(t);
        // Rocket hull with fins
        let x = 65 * ct * (1 - 0.4 * st);
        let y = -170 * st;
        // Fin protrusions at bottom
        if (st < -0.3) {
          const finW = Math.abs(st) * 80;
          x += Math.sign(ct) * finW * Math.pow(Math.abs(ct), 0.5);
        }
        pts.push({ re: x, im: y });
      }
      return pts;
    },
  },
];
