// components/ImageUploader.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type TransformationOptions = {
  grayscale: boolean;
  watermark: boolean;
};

export default function ImageUploader() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<string>("Sube una imagen (PNG, JPG)");
  const [options, setOptions] = useState<TransformationOptions>({
    grayscale: false,
    watermark: false,
  });

  // --- ¡NUEVA LÓGICA! ---
  // Estado para controlar la visibilidad del dialogante
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // Estado para guardar el texto de la marca de agua
  const [watermarkText, setWatermarkText] = useState<string>("Mi App @ 2025");
  // --- FIN DE LA NUEVA LÓGICA ---

  const handleOptionChange = (option: keyof TransformationOptions) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setMessage("Error: Solo se permiten archivos PNG o JPG.");
        return;
      }
      setSelectedFile(file);
      setMessage(`Archivo seleccionado: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Por favor, selecciona un archivo primero.");
      return;
    }
    setUploading(true);
    setMessage("1. Subiendo imagen original...");
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);
    const fileName = `public/${Date.now()}-${selectedFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, selectedFile);
    if (uploadError) {
      setMessage(`Error al subir: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);
    setOriginalImageUrl(publicUrl);
    setMessage("2. Aplicando transformaciones...");
    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ¡CAMBIO CLAVE! Enviamos también el texto de la marca de agua
        body: JSON.stringify({
          publicUrl: publicUrl,
          options: options,
          watermarkText: watermarkText,
        }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error inesperado del servidor." }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      const result = await response.json();
      setProcessedImageUrl(result.processedUrl);
      setMessage("¡Procesamiento completado!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`Error de procesamiento: ${err.message}`);
      } else {
        setMessage("Error de procesamiento: error desconocido");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (processedImageUrl) {
      window.open(processedImageUrl, "_blank");
    }
  };

  return (
    <div className="w-full max-w-4xl bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-slate-800/50 transition-all"
        >
          <div className="flex flex-col items-center justify-center text-center p-4">
            <svg
              className="w-10 h-10 mb-3 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-slate-200">
                Haz clic para subir
              </span>{" "}
              o arrastra
            </p>
            <p className="text-slate-400 text-sm h-10 mt-2 break-words">
              {message}
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
        </label>

        <div className="flex flex-col justify-between">
          <div>
            <p className="font-semibold text-lg mb-4 text-white">
              1. Elige los efectos (Pipeline):
            </p>
            <div className="space-y-3 mb-4">
              <label className="flex items-center w-full p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800/50 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={options.grayscale}
                  onChange={() => handleOptionChange("grayscale")}
                  className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500/50"
                />
                <span className="ml-3 text-sm font-medium text-slate-200">
                  Blanco y Negro
                </span>
              </label>

              {/* --- ¡NUEVA LÓGICA! --- Contenedor para el checkbox y el botón de configurar */}
              <div className="flex items-center w-full p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800/50 transition-all">
                <input
                  id="watermark-checkbox"
                  type="checkbox"
                  checked={options.watermark}
                  onChange={() => handleOptionChange("watermark")}
                  className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500/50"
                />
                <label
                  htmlFor="watermark-checkbox"
                  className="ml-3 text-sm font-medium text-slate-200  cursor-pointer"
                >
                  Añadir Marca de Agua
                </label>
                {/* El botón solo aparece si el checkbox está marcado */}
                {options.watermark && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDialogOpen(true);
                    }}
                    className="text-xs text-pink-500 hover:text-pink-400 underline font-semibold ml-auto"
                  >
                    Configurar
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
          >
            {uploading ? "Procesando..." : "2. ✨ Aplicar Magia"}
          </button>
        </div>
      </div>

      <div className="border-t border-slate-700 my-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Imagen Original
          </h3>
          <div className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center p-2 border border-slate-800">
            {originalImageUrl ? (
              <img
                src={originalImageUrl}
                alt="Original"
                className="max-w-full max-h-full rounded-lg object-contain"
              />
            ) : (
              <p className="text-slate-500">
                Aquí aparecerá tu imagen original
              </p>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h3 className="text-xl font-semibold text-white">
              Imagen Procesada
            </h3>
            <button
              onClick={handleDownload}
              disabled={!processedImageUrl}
              className="disabled:opacity-20 disabled:cursor-not-allowed text-pink-500 hover:text-pink-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
          <div className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center p-2 border border-slate-800">
            {processedImageUrl ? (
              <img
                src={processedImageUrl}
                alt="Procesada"
                className="max-w-full max-h-full rounded-lg object-contain"
              />
            ) : uploading && originalImageUrl ? (
              <div className="text-center">
                <p className="text-slate-400">Procesando...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mt-2"></div>
              </div>
            ) : (
              <p className="text-slate-500">
                Aquí aparecerá tu imagen procesada
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- ¡NUEVO DIALOGANTE! --- Aparece condicionalmente */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-4">
              Configurar Marca de Agua
            </h3>
            <p className="text-sm text-slate-400 mb-2">
              Escribe el texto que aparecerá en la imagen.
            </p>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
