import React from "react";
import { TransformationOptions, ColorOptions } from "@/hooks/useImageProcessor";

type OptionsPanelProps = {
  options: TransformationOptions;
  onColorChange: (color: ColorOptions) => void;
  onWatermarkToggle: () => void;
  onUpload: () => void;
  onConfigureWatermark: () => void;
  isUploading: boolean;
  isFileSelected: boolean;
};

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  options,
  onColorChange,
  onWatermarkToggle,
  onUpload,
  onConfigureWatermark,
  isUploading,
  isFileSelected,
}) => (
  <div className="flex flex-col justify-between">
    <div>
      <p className="font-semibold text-lg mb-4 text-white">
        1. Elige los efectos (Pipeline):
      </p>

      {/* --- CATEGORÍA DE COLOR --- */}
      <div className="mb-4">
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          Filtro de Color:
        </label>
        <div className="flex bg-slate-800/80 rounded-lg p-1 space-x-1">
          {[
            { value: "none", label: "Ninguno" },
            { value: "grayscale", label: "B & N" },
            { value: "sepia", label: "Sepia" },
            { value: "cartoonify", label: "Caricatura" }, // 🎉 nuevo filtro
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onColorChange(value as ColorOptions)}
              className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                options.color === value
                  ? "bg-pink-600 text-white"
                  : "hover:bg-slate-700/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* --- CATEGORÍA MARCA DE AGUA --- */}
      <label className="flex items-center w-full p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800/50 transition-all cursor-pointer">
        <input
          id="watermark-checkbox"
          type="checkbox"
          checked={options.watermark}
          onChange={onWatermarkToggle}
          className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500/50"
        />
        <span className="ml-3 text-sm font-medium text-slate-200 flex-grow">
          Añadir Marca de Agua
        </span>
        {options.watermark && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfigureWatermark();
            }}
            className="text-xs text-pink-500 hover:text-pink-400 underline font-semibold ml-auto"
          >
            Configurar
          </button>
        )}
      </label>
    </div>

    {/* --- BOTÓN DE PROCESAR --- */}
    <button
      onClick={onUpload}
      disabled={!isFileSelected || isUploading}
      className="w-full mt-4 bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
    >
      {isUploading ? "Procesando..." : "2. ✨ Aplicar Magia"}
    </button>
  </div>
);
