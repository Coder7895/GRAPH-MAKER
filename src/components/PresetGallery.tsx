import React from 'react';
import { PRESETS, PresetItem } from '../cv/presets';
import { BookmarkCheck } from 'lucide-react';

interface PresetGalleryProps {
  activePresetId: string | null;
  onSelectPreset: (preset: PresetItem) => void;
}

export const PresetGallery: React.FC<PresetGalleryProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <div className="w-full bg-neutral-950 rounded-xl border border-neutral-850 p-4 sm:p-5 flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkCheck size={16} className="text-white" />
          <h2 className="text-xs font-bold text-white tracking-wider font-mono uppercase">
            Curated Mathematical Presets
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          6 Benchmarks
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-black border-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              <div>
                <span
                  className={`text-[9px] font-mono block mb-1 uppercase tracking-wider ${
                    isSelected ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  {preset.category}
                </span>
                <h4
                  className={`text-xs font-bold font-mono leading-tight mb-1 ${
                    isSelected ? 'text-black' : 'text-white'
                  }`}
                >
                  {preset.name}
                </h4>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-semibold ${
                    isSelected ? 'text-black' : 'text-neutral-400'
                  }`}
                >
                  {isSelected ? '● Active' : 'Load →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
