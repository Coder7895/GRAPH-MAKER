import { Complex } from '../math/complex';

export interface ImageProcessingOptions {
  threshold: number; // 0 to 255
  invert: boolean;
  blurRadius: number; // 0 to 5
  maxPoints: number; // 300 to 2000
  simplifyTolerance: number; // 0.5 to 5.0
  scaleSize: number; // maximum dimension to process (e.g. 500px)
}

export const DEFAULT_CV_OPTIONS: ImageProcessingOptions = {
  threshold: 128,
  invert: false,
  blurRadius: 1,
  maxPoints: 800,
  simplifyTolerance: 1.2,
  scaleSize: 450,
};

/**
 * Loads an image from File or URL into an HTMLImageElement
 */
export function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Extracts 2D complex points representing the contours of the image
 */
export function extractContoursFromImage(
  img: HTMLImageElement,
  options: Partial<ImageProcessingOptions> = {}
): {
  points: Complex[];
  width: number;
  height: number;
  edgeImageData: ImageData | null;
  numOriginalContours: number;
} {
  const opts = { ...DEFAULT_CV_OPTIONS, ...options };

  // Calculate scaled dimensions preserving aspect ratio
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  const maxDim = opts.scaleSize;

  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  // Draw onto offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Convert to grayscale and apply threshold
  const binary = new Uint8Array(w * h);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3] / 255;

    // Luminance
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (a < 0.5) lum = 255; // transparent treated as background

    const pixelIdx = i / 4;
    let isForeground = lum < opts.threshold;
    if (opts.invert) isForeground = !isForeground;

    binary[pixelIdx] = isForeground ? 1 : 0;
  }

  // Sobel Edge Detection
  const edges = new Uint8Array(w * h);
  const edgeImgData = ctx.createImageData(w, h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      // Horizontal gradient
      const gx =
        -binary[(y - 1) * w + (x - 1)] +
        binary[(y - 1) * w + (x + 1)] -
        2 * binary[y * w + (x - 1)] +
        2 * binary[y * w + (x + 1)] -
        binary[(y + 1) * w + (x - 1)] +
        binary[(y + 1) * w + (x + 1)];

      // Vertical gradient
      const gy =
        -binary[(y - 1) * w + (x - 1)] -
        2 * binary[(y - 1) * w + x] -
        binary[(y - 1) * w + (x + 1)] +
        binary[(y + 1) * w + (x - 1)] +
        2 * binary[(y + 1) * w + x] +
        binary[(y + 1) * w + (x + 1)];

      const mag = Math.abs(gx) + Math.abs(gy);
      const isEdge = mag > 0 ? 1 : 0;
      edges[y * w + x] = isEdge;

      const idx = (y * w + x) * 4;
      if (isEdge) {
        edgeImgData.data[idx] = 255;
        edgeImgData.data[idx + 1] = 255;
        edgeImgData.data[idx + 2] = 255;
        edgeImgData.data[idx + 3] = 255;
      } else {
        edgeImgData.data[idx] = 0;
        edgeImgData.data[idx + 1] = 0;
        edgeImgData.data[idx + 2] = 0;
        edgeImgData.data[idx + 3] = 255;
      }
    }
  }

  // Extract ordered contour paths via Moore-Neighbor Tracing / Radial Search
  const visited = new Uint8Array(w * h);
  const rawPaths: Complex[][] = [];

  const neighbors = [
    [-1, 0], [-1, 1], [0, 1], [1, 1],
    [1, 0], [1, -1], [0, -1], [-1, -1]
  ];

  for (let y = 1; y < h - 1; y += 2) {
    for (let x = 1; x < w - 1; x += 2) {
      const idx = y * w + x;
      if (edges[idx] && !visited[idx]) {
        // Start tracing a contour loop
        const path: Complex[] = [];
        let cx = x;
        let cy = y;
        let stepCount = 0;

        while (stepCount < 1000) {
          path.push({ re: cx, im: cy });
          visited[cy * w + cx] = 1;

          let foundNext = false;
          for (const [dx, dy] of neighbors) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (edges[nidx] && !visited[nidx]) {
                cx = nx;
                cy = ny;
                foundNext = true;
                break;
              }
            }
          }

          if (!foundNext) break;
          stepCount++;
        }

        // Only keep significant paths
        if (path.length > 5) {
          rawPaths.push(path);
        }
      }
    }
  }

  // Sort paths by length (largest structural paths first)
  rawPaths.sort((a, b) => b.length - a.length);

  // If no paths found (e.g. solid white or empty), create fallback circle
  if (rawPaths.length === 0) {
    const fallback: Complex[] = [];
    for (let i = 0; i < 100; i++) {
      const th = (i / 100) * 2 * Math.PI;
      fallback.push({
        re: w / 2 + 80 * Math.cos(th),
        im: h / 2 + 80 * Math.sin(th),
      });
    }
    rawPaths.push(fallback);
  }

  // Connect multiple paths into a single continuous Euler tour with return bridges
  const unifiedPath: Complex[] = [];
  const maxPathsToInclude = Math.min(rawPaths.length, 35);

  for (let i = 0; i < maxPathsToInclude; i++) {
    const path = rawPaths[i];
    // Add forward path
    for (const pt of path) {
      unifiedPath.push(pt);
    }
    // Add reverse return path so contour closes without creating stray line
    for (let j = path.length - 1; j >= 0; j--) {
      unifiedPath.push(path[j]);
    }
  }

  // Simplify using Ramer-Douglas-Peucker
  const simplified = rdpSimplify(unifiedPath, opts.simplifyTolerance);

  // Resample points to target count opts.maxPoints
  const resampled = resamplePath(simplified, opts.maxPoints);

  // Center and normalize coordinates so (0,0) is center of image, and fit in ~[-200, 200]
  const centerX = w / 2;
  const centerY = h / 2;
  const scale = 360 / Math.max(w, h);

  const centeredPoints: Complex[] = resampled.map((p) => ({
    re: (p.re - centerX) * scale,
    im: (p.im - centerY) * scale,
  }));

  return {
    points: centeredPoints,
    width: w,
    height: h,
    edgeImageData: edgeImgData,
    numOriginalContours: rawPaths.length,
  };
}

/**
 * Ramer-Douglas-Peucker algorithm for path simplification
 */
function rdpSimplify(points: Complex[], epsilon: number): Complex[] {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const recResults1 = rdpSimplify(points.slice(0, index + 1), epsilon);
    const recResults2 = rdpSimplify(points.slice(index), epsilon);
    return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
  } else {
    return [points[0], points[end]];
  }
}

function perpendicularDistance(p: Complex, lineStart: Complex, lineEnd: Complex): number {
  const dx = lineEnd.re - lineStart.re;
  const dy = lineEnd.im - lineStart.im;

  if (dx === 0 && dy === 0) {
    return Math.hypot(p.re - lineStart.re, p.im - lineStart.im);
  }

  const num = Math.abs(dy * p.re - dx * p.im + lineEnd.re * lineStart.im - lineEnd.im * lineStart.re);
  const den = Math.hypot(dx, dy);
  return num / den;
}

/**
 * Resamples a polyline path into exactly N uniformly spaced points
 */
function resamplePath(points: Complex[], targetCount: number): Complex[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array(targetCount).fill(points[0]);

  // Compute cumulative lengths
  const cumLengths: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dist = Math.hypot(points[i].re - points[i - 1].re, points[i].im - points[i - 1].im);
    cumLengths.push(cumLengths[i - 1] + dist);
  }

  const totalLength = cumLengths[cumLengths.length - 1];
  if (totalLength === 0) return Array(targetCount).fill(points[0]);

  const step = totalLength / targetCount;
  const resampled: Complex[] = [];

  let curIdx = 0;
  for (let i = 0; i < targetCount; i++) {
    const targetDist = i * step;

    while (curIdx < cumLengths.length - 1 && cumLengths[curIdx + 1] < targetDist) {
      curIdx++;
    }

    const segStartDist = cumLengths[curIdx];
    const segEndDist = cumLengths[curIdx + 1] || segStartDist;
    const segLen = segEndDist - segStartDist;

    if (segLen === 0) {
      resampled.push(points[curIdx]);
    } else {
      const t = (targetDist - segStartDist) / segLen;
      const pA = points[curIdx];
      const pB = points[Math.min(curIdx + 1, points.length - 1)];
      resampled.push({
        re: pA.re + t * (pB.re - pA.re),
        im: pA.im + t * (pB.im - pA.im),
      });
    }
  }

  return resampled;
}
