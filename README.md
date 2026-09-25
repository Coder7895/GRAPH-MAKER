<div align="center">

# 🌌 EpiGraph AI
### Universal Inverse Mathematical Image-to-Equation & Parametric Graphing Engine
**Turn Any Picture, Portrait, or Sketch into Pure Closed-Form Mathematical Formulas & Epicycles**

[![Hackathon Flagship](https://img.shields.io/badge/Hackathon-Grand%20Prize%20Ready-00f0ff?style=for-the-badge&logo=target)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Manifold-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Desmos Ready](https://img.shields.io/badge/Desmos-1--Click%20Export-00c853?style=for-the-badge)](https://www.desmos.com/calculator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

```
      ▲              ┌──────────────────────────────────────┐
   Im │              │  EpiGraph AI Inverse Graphics Engine │
      │   .---.      └──────────────────────────────────────┘
      │  /     \          [Image / Sketch / SVG / Bitmap]
      │ |   *   |                        │
──────┼─┼───┼───┼───────►                ▼
      │  \     /      [Sobel Edge Tracing & Euler Path Unification]
      │   '---'                          │
      │                                  ▼
      ▼                       [Complex 2D DFT Matrix]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   [Rotating Epicycle Gears]                       [Closed-Form Parametric Math]
  γ(t) = Σ c_n exp(i · n · ω · t)                   X(t) = a₀ + Σ Aₙ cos(nωt + φₙ)
                                                   Y(t) = b₀ + Σ Bₙ sin(nωt + ψₙ)
```

</div>

---

## 💡 The Vision & The "Why"

Most computer vision software operates on raw raster pixels or static vector paths (SVG). But in mathematics and physics, any closed continuous curve $\Gamma$ in the two-dimensional Euclidean plane $\mathbb{R}^2$ can be represented as an **exact, infinite or truncated trigonometric Fourier series** or a **piecewise algebraic polynomial system**.

Until now, creating parametric mathematical formulas for arbitrary drawings required hours of manual labor in graphing calculators like Desmos or complex symbolic solvers.

**EpiGraph AI** solves the inverse graphics problem in real time:
1. **Drop any image** (portraits, logos, signatures, sketches, biology diagrams).
2. The browser-accelerated Computer Vision pipeline extracts 2D boundary contours and establishes an Eulerian continuous path.
3. The **Discrete Fourier Transform (DFT)** engine decomposes the path into orthogonal rotational harmonics $\mathbf{c}_n \in \mathbb{C}$.
4. Watch **planetary epicycle gears** spin and trace the image with a laser pen in real time, or orbit around it as a **3D parametric topological manifold**.
5. Instantly generate and copy **exact closed-form equations** for **Desmos**, **LaTeX**, **Python (NumPy/Matplotlib)**, and **GeoGebra**!

---

## ✨ Flagship Capabilities

### 🌀 1. Real-Time Rotating Epicycle Gears (2D Visualizer)
* Visualizes the complex vectors $\mathbf{c}_n e^{i n \omega t}$ as mechanical rotating circles linked head-to-tail.
* Toggle circle circumferences, rotating radius arrows, Cartesian coordinate grid, and original bitmap ghost contour.
* Live speed regulator ($0.5\times$ to $4\times$), time scrubber $t \in [0, 2\pi]$, and harmonic resolution slider ($1 \dots N$).

### 📐 2. Automatic Equation Generation Engine
* **KaTeX-Rendered LaTeX**: Produces clean mathematical systems ready for academic papers and Overleaf:
  $$\begin{cases} x(t) = c_0^{(x)} + \sum_{k=1}^{K} r_k \cos\left( \omega_k t + \phi_k \right) \\ y(t) = c_0^{(y)} + \sum_{k=1}^{K} r_k \sin\left( \omega_k t + \phi_k \right) \end{cases}, \quad t \in [0, 2\pi]$$
* **Desmos One-Click Copy**: Generates formatted $X(t)$ and $Y(t)$ expressions and the parametric point $(X(t), -Y(t))$ ready to paste straight into [desmos.com/calculator](https://www.desmos.com/calculator).
* **Executable Python Script**: Generates a self-contained `.py` script using `numpy` and `matplotlib` with dark-mode styling and high-resolution rendering.
* **GeoGebra Script**: Exports the complete `Curve(...)` command for GeoGebra Suite.

### 🪐 3. 3D Topological Manifold Projection (Three.js WebGL)
* Extrudes the 2D parametric curve into a 3D topological manifold ribbon modulated by high-frequency spectral harmonics:
  $$z(t) = A_1 \sin(4t) + A_2 \cos(8t)$$
* Complete orbital controls (click and drag to rotate, zoom, inspect lighting and reflective shaders).
* Floor grid projection and floating harmonic particle cloud.

### 🎧 4. Bio-Acoustic Frequency Sonification
* Transforms the Fourier coefficients into polyphonic acoustic waveforms using the **Web Audio API**.
* Maps harmonic frequencies and amplitudes to harmonic overtone synthesizers and dynamic lowpass filters—**listen to what your picture sounds like!**

### 🖼️ 5. In-Browser Computer Vision Pipeline
* **Sobel Edge Detection & Otsu Binarization**: Runs client-side on canvas with zero external server dependencies.
* **Euler Path Unification**: Connects disjoint contours using minimal spanning return paths so multi-stroke pictures form a continuous Fourier curve without stray lines.
* **Ramer-Douglas-Peucker (RDP) Algorithm**: Intelligent geometric curve simplification preserving high-frequency topological vertices while eliminating sensor noise.
* Real-time adjustment of binarization threshold, point resolution ($200 - 1600$ points), and light/dark inversion.

### ✏️ 6. In-App Drawing Pad & Curated Benchmarks
* **Live Drawing Canvas**: Scribble any doodle, signature, or geometry and click "Synthesize Equations" to graph it instantly.
* **6 Built-in Presets**:
  - *Mathematical Heart (Cardioid)*
  - *Batman Piecewise Algebraic Curve*
  - *Euler & Fibonacci Golden Spiral (Nautilus)*
  - *Albert Einstein Silhouette*
  - *Feline Contour (Cat)*
  - *Cosmic Rocket & Thruster Plume*

### 🔬 7. Topological Spectrometry Report
* Computes real-world topological and information-theoretic metrics:
  - **Spectral Shannon Entropy**: $H = -\sum p_k \log_2(p_k)$
  - **Arc Perimeter / Euclidean Contour Length**
  - **Bilateral Symmetry Score**
  - **Centroid Coordinates $(\bar{x}, \bar{y})$**
  - **Harmonic Energy Concentration**

---

## 🧮 Mathematical Foundations

### 1. Complex Fourier Series for 2D Continuous Curves
Let $\gamma(s): [0, L] \to \mathbb{C}$ be a closed continuous curve in the complex plane, parameterized by arc length $s$ such that $\gamma(s) = x(s) + i y(s)$.

Re-parameterizing with angle $t = \frac{2\pi s}{L} \in [0, 2\pi)$, the curve admits a complex Fourier series expansion:
$$\gamma(t) = \sum_{n=-\infty}^{\infty} c_n e^{i n t}$$

where the complex Fourier coefficients $c_n \in \mathbb{C}$ are given by the contour integral:
$$c_n = \frac{1}{2\pi} \int_{0}^{2\pi} \gamma(t) e^{-i n t} \, dt$$

### 2. Discrete Fourier Transform (DFT) Discretization
For a polygonal path sampled at $N$ discrete vertices $\{z_k = x_k + i y_k\}_{k=0}^{N-1}$, the coefficients are computed via the discrete transform:
$$c_n = \frac{1}{N} \sum_{k=0}^{N-1} z_k \left[ \cos\left( \frac{2\pi n k}{N} \right) - i \sin\left( \frac{2\pi n k}{N} \right) \right]$$

Each complex coefficient is converted to polar coordinates:
$$c_n = r_n e^{i \phi_n}, \quad \text{where} \quad r_n = |c_n| = \sqrt{\text{Re}(c_n)^2 + \text{Im}(c_n)^2}, \quad \phi_n = \text{atan2}(\text{Im}(c_n), \text{Re}(c_n))$$

### 3. Epicycle Parametric Trajectory
Sorting the coefficients by descending radius $r_n$ produces a hierarchy of planetary gears where macroscopic geometry is traced by low frequencies, and fine details are drawn by higher harmonics:
$$\begin{aligned}
x(t) &= \sum_{k=1}^{K} r_k \cos(n_k t + \phi_k) \\
y(t) &= \sum_{k=1}^{K} r_k \sin(n_k t + \phi_k)
\end{aligned}$$

---




## 📂 Project Architecture

```
epigraph-ai/
├── src/
│   ├── audio/
│   │   └── sonifier.ts             # Web Audio API harmonic frequency synthesizer
│   ├── components/
│   │   ├── DrawingPad.tsx          # Freehand sketch canvas for direct input
│   │   ├── EpicycleCanvas.tsx      # 2D Canvas rendering rotating Fourier gears
│   │   ├── EquationViewer.tsx      # KaTeX LaTeX, Desmos, Python, GeoGebra export
│   │   ├── Header.tsx              # Top navigation, mode switch, telemetry
│   │   ├── ImageUploader.tsx       # Drag & drop, Sobel thresholding, edge preview
│   │   ├── MathAnalysisModal.tsx   # Topological metrics & spectral entropy modal
│   │   ├── PresetGallery.tsx       # Curated benchmark presets
│   │   └── ThreeDSurfaceCanvas.tsx # Three.js 3D WebGL parametric manifold
│   ├── cv/
│   │   ├── imageProcessor.ts       # Sobel edge filter, RDP simplification, Euler tour
│   │   └── presets.ts              # Mathematical and iconic benchmark definitions
│   ├── math/
│   │   ├── bezier.ts               # Cubic Bezier curve fitting & polynomial conversion
│   │   ├── complex.ts              # Complex number primitive (re, im, magnitude, phase)
│   │   ├── dft.ts                  # 2D Discrete Fourier Transform & epicycle evaluator
│   │   └── latexExporter.ts        # LaTeX, Desmos, Python, and GeoGebra formula formatters
│   ├── App.tsx                     # Core state coordinator & layout
│   ├── index.css                   # Tailwind CSS & KaTeX dark styling
│   └── main.tsx                    # React DOM entry point
├── index.html                      # HTML template with fonts and KaTeX CDN
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite bundler configuration
└── README.md                       # Comprehensive documentation & pitch guide
```

---

## 📄 License
This project is open-source and released under the [MIT License](LICENSE).

---

<div align="center">
  <b>Built with passion for pure mathematics, computer vision, and hackathon excellence.</b>
</div>
