import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FourierCoefficient } from '../math/dft';

interface ThreeDSurfaceCanvasProps {
  coefficients: FourierCoefficient[];
  harmonicLimit: number;
}

export const ThreeDSurfaceCanvas: React.FC<ThreeDSurfaceCanvasProps> = ({
  coefficients,
  harmonicLimit,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.0016);

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
    camera.position.set(0, -320, 260);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Pure White Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 2.0, 900);
    pointLight1.position.set(150, 150, 200);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1.2, 900);
    pointLight2.position.set(-150, -150, 150);
    scene.add(pointLight2);

    // 3. Minimalist Monochrome Grid Floor
    const gridHelper = new THREE.GridHelper(600, 30, 0xffffff, 0x1f1f1f);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -80;
    scene.add(gridHelper);

    // 4. Generate 3D Extruded Ribbon Curve from Fourier Parametrics
    const curvePoints: THREE.Vector3[] = [];
    const N = 600;
    const activeCoefs = coefficients.slice(0, Math.min(harmonicLimit, coefficients.length));

    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 2 * Math.PI;
      let x = 0;
      let y = 0;

      for (const c of activeCoefs) {
        const angle = c.freq * t + c.phase;
        x += c.amp * Math.cos(angle);
        y += c.amp * Math.sin(angle);
      }

      // Height modulation z(t) based on high frequencies
      const z = Math.sin(t * 4) * 35 + Math.cos(t * 8) * 15;
      curvePoints.push(new THREE.Vector3(x, -y, z));
    }

    const curve3D = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve3D, 400, 3.2, 12, true);

    // Clean Pure White / Silver Mesh
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x111111,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });

    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);

    // 5. White Particle Cloud
    const particleCount = 350;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 500;
      particlePositions[i + 1] = (Math.random() - 0.5) * 500;
      particlePositions[i + 2] = (Math.random() - 0.5) * 200;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.0,
      transparent: true,
      opacity: 0.35,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 6. Interactive Orbit & Animation
    let isUserInteracting = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isUserInteracting = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isUserInteracting) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      tubeMesh.rotation.z += dx * 0.008;
      tubeMesh.rotation.x += dy * 0.008;
      gridHelper.rotation.z += dx * 0.008;
    };

    const onMouseUp = () => {
      isUserInteracting = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      if (!isUserInteracting) {
        tubeMesh.rotation.z = elapsed * 0.25;
        gridHelper.rotation.z = elapsed * 0.25;
      }
      particles.rotation.z = elapsed * 0.04;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
      tubeGeometry.dispose();
      tubeMaterial.dispose();
    };
  }, [coefficients, harmonicLimit]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-neutral-850 bg-black shadow-2xl">
      <div className="absolute top-4 left-4 z-10 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded border border-neutral-800 text-xs font-mono text-neutral-300">
        3D PARAMETRIC MANIFOLD z = f(x, y, t)
      </div>
      <div className="absolute bottom-4 left-4 z-10 text-[11px] font-mono text-neutral-400 bg-black/90 px-2.5 py-1 rounded border border-neutral-850">
        Click and drag to orbit
      </div>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
