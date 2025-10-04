import React from 'react';
import { TransformationOptions } from '@/hooks/useImageProcessor';

type OptionsPanelProps = {
  options: TransformationOptions;
  onOptionChange: (option: keyof TransformationOptions) => void;
  onUpload: () => void;
  onConfigureWatermark: () => void;
  isUploading: boolean;
  isFileSelected: boolean;
};

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, onOptionChange, onUpload, onConfigureWatermark, isUploading, isFileSelected }) => (
  <div className="flex flex-col justify-between">
    <div>
      <p className="font-semibold text-lg mb-4 text-white">1. Elige los efectos (Pipeline):</p>
      <div className="space-y-3 mb-4">
        <label className="flex items-center w-full p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800/50 cursor-pointer transition-all">
          <input type="checkbox" checked={options.grayscale} onChange={() => onOptionChange("grayscale")} className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500/50"/>
          <span className="ml-3 text-sm font-medium text-slate-200">Blanco y Negro</span>
        </label>
        <div className="flex items-center w-full p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800/50 transition-all">
          <input id="watermark-checkbox" type="checkbox" checked={options.watermark} onChange={() => onOptionChange("watermark")} className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500/50"/>
          <label htmlFor="watermark-checkbox" className="ml-3 text-sm font-medium text-slate-200  cursor-pointer">Añadir Marca de Agua</label>
          {options.watermark && (
            <button onClick={(e) => { e.preventDefault(); onConfigureWatermark(); }} className="text-xs text-pink-500 hover:text-pink-400 underline font-semibold ml-auto">
              Configurar
            </button>
          )}
        </div>
      </div>
    </div>
    <button onClick={onUpload} disabled={!isFileSelected || isUploading} className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all">
      {isUploading ? "Procesando..." : "2. Procesar"}
    </button>
  </div>
);