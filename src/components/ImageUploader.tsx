import React, { useRef, useState } from 'react';
import { Upload, Sliders, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ImageProcessingOptions, DEFAULT_CV_OPTIONS, loadImage, extractContoursFromImage } from '../cv/imageProcessor';
import { Complex } from '../math/complex';

interface ImageUploaderProps {
  onProcessComplete: (result: {
    points: Complex[];
    title: string;
    edgePreview: string | null;
  }) => void;
  onOpenDrawingPad: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onProcessComplete,
  onOpenDrawingPad,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('Uploaded Image');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // CV Parameters
  const [cvOptions, setCvOptions] = useState<ImageProcessingOptions>(DEFAULT_CV_OPTIONS);
  const [edgePreviewUrl, setEdgePreviewUrl] = useState<string | null>(null);
  const [detectedContoursCount, setDetectedContoursCount] = useState<number>(0);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    try {
      setIsProcessing(true);
      const img = await loadImage(file);
      setCurrentImage(img);
      setImageTitle(file.name.replace(/\.[^/.]+$/, ''));

      runCV(img, cvOptions, file.name.replace(/\.[^/.]+$/, ''));
    } catch (err) {
      console.error(err);
      alert('Failed to process image: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const runCV = (
    img: HTMLImageElement,
    opts: ImageProcessingOptions,
    title: string = imageTitle
  ) => {
    try {
      const res = extractContoursFromImage(img, opts);
      setDetectedContoursCount(res.numOriginalContours);

      if (res.edgeImageData) {
        const c = document.createElement('canvas');
        c.width = res.width;
        c.height = res.height;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.putImageData(res.edgeImageData, 0, 0);
          const dataUrl = c.toDataURL();
          setEdgePreviewUrl(dataUrl);
          onProcessComplete({
            points: res.points,
            title,
            edgePreview: dataUrl,
          });
          return;
        }
      }

      onProcessComplete({
        points: res.points,
        title,
        edgePreview: null,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOptionChange = (key: keyof ImageProcessingOptions, value: number | boolean) => {
    const updated = { ...cvOptions, [key]: value };
    setCvOptions(updated);
    if (currentImage) {
      runCV(currentImage, updated);
    }
  };

  return (
    <div className="w-full bg-neutral-950 rounded-xl border border-neutral-850 p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-white" />
          <h2 className="text-xs font-bold text-white tracking-wider font-mono uppercase">
            Image Ingestion & Vision
          </h2>
        </div>
        <button
          onClick={onOpenDrawingPad}
          className="flex items-center gap-1.5 text-xs font-mono text-black bg-white hover:bg-neutral-200 px-3 py-1.5 rounded font-bold transition-all"
        >
          <Sparkles size={13} /> Draw Sketch
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? 'border-white bg-neutral-900'
            : 'border-neutral-800 hover:border-neutral-600 bg-black'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-2.5">
          <Upload size={18} className={isProcessing ? 'animate-bounce' : ''} />
        </div>

        <p className="text-xs font-mono text-white font-semibold mb-1 text-center">
          {currentImage ? `Loaded: ${imageTitle}` : 'Click or Drop Image Here'}
        </p>
        <p className="text-[11px] font-mono text-neutral-400 text-center">
          PNG, JPG, WebP, SVG portraits, diagrams, sketches
        </p>
      </div>

      {/* Vision & Threshold Sliders */}
      <div className="bg-black p-3.5 rounded-lg border border-neutral-850 space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-300">
          <div className="flex items-center gap-1.5">
            <Sliders size={13} className="text-white" />
            <span className="font-semibold text-white">Extraction Settings</span>
          </div>
          {detectedContoursCount > 0 && (
            <span className="text-[11px] text-neutral-400 font-mono">
              {detectedContoursCount} Contours
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
          {/* Threshold Slider */}
          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Binarization:</span>
              <span className="text-white font-semibold">{cvOptions.threshold}</span>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              value={cvOptions.threshold}
              onChange={(e) => handleOptionChange('threshold', parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Points Resolution Slider */}
          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Sample Points:</span>
              <span className="text-white font-semibold">{cvOptions.maxPoints}</span>
            </div>
            <input
              type="range"
              min={200}
              max={1600}
              step={50}
              value={cvOptions.maxPoints}
              onChange={(e) => handleOptionChange('maxPoints', parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Simplification Tolerance */}
          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>RDP Tolerance:</span>
              <span className="text-white font-semibold">{cvOptions.simplifyTolerance.toFixed(1)}px</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={4.0}
              step={0.2}
              value={cvOptions.simplifyTolerance}
              onChange={(e) => handleOptionChange('simplifyTolerance', parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Invert Light / Dark */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-neutral-400">Invert:</span>
            <button
              onClick={() => handleOptionChange('invert', !cvOptions.invert)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                cvOptions.invert
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cvOptions.invert ? 'Dark on Light' : 'Light on Dark'}
            </button>
          </div>
        </div>

        {/* Edge Preview Visualizer */}
        {edgePreviewUrl && (
          <div className="pt-2 border-t border-neutral-850 flex items-center gap-3">
            <img
              src={edgePreviewUrl}
              alt="Extracted Contour Edges"
              className="w-14 h-14 rounded object-contain bg-black border border-neutral-700"
            />
            <div className="flex-1 text-[11px] font-mono text-neutral-400 leading-snug">
              <span className="text-white font-semibold">Sobel Filter:</span> Normalized continuous closed-loop path extracted to complex coordinates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
