"use client";

import { useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

/**
 * El componente ImageUploader gestiona la lógica y la UI para la carga de imágenes.
 * Permite al usuario seleccionar un archivo, lo sube a Supabase Storage y muestra
 * tanto la imagen original como la (futura) imagen procesada.
 */
export default function ImageUploader() {
  // --- Estados del Componente ---
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<string>("Sube una imagen (PNG, JPG)");

  /**
   * Se ejecuta cuando el usuario selecciona un archivo desde el input.
   * Valida el tipo de archivo y actualiza el estado.
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setMessage("Error: Solo se permiten archivos PNG o JPG.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setMessage(`Archivo seleccionado: ${file.name}`);
    }
  };

  /**
   * Gestiona el proceso de subida del archivo a Supabase Storage.
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Por favor, selecciona un archivo primero.");
      return;
    }

    setUploading(true);
    setMessage("Subiendo imagen original...");
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);

    // Usamos tu idea de organizar en una carpeta 'public'
    const fileName = `public/${Date.now()}-${selectedFile.name}`;

    // 1. Subir la imagen original
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, selectedFile);

    if (uploadError) {
      setMessage(`Error al subir la imagen: ${uploadError.message}`);
      console.error(uploadError);
      setUploading(false);
      return;
    }

    // Obtener la URL pública de la imagen original
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    setOriginalImageUrl(publicUrl);
    setMessage("¡Imagen subida! Iniciando procesamiento...");

    // 2. LLAMAR A NUESTRA FUNCIÓN SERVERLESS
    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ¡CAMBIO AQUÍ! Enviamos la URL pública directamente
        body: JSON.stringify({ publicUrl: publicUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Si hay un error, intentamos leer el texto del error que manda el servidor
        const errorData = await response
          .json()
          .catch(() => ({
            error: "El servidor respondió con un error inesperado.",
          }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      // 3. Mostrar la imagen procesada
      setProcessedImageUrl(result.processedUrl);
      setMessage("¡Procesamiento completado!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`Error de procesamiento: ${err.message}`);
        console.error(err);
      } else {
        setMessage("Error de procesamiento desconocido");
        console.error(err);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
      {/* --- Sección de Carga --- */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full sm:w-1/2 h-48 border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
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
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold">Haz clic para subir</span> o
              arrastra
            </p>
            <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
        </label>
        <div className="flex flex-col justify-center w-full sm:w-1/2 text-center sm:text-left">
          <p className="text-gray-300 mb-4 break-words">{message}</p>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
          >
            {uploading ? "Subiendo..." : "Procesar Imagen"}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-600 my-6"></div>

      {/* --- Sección de Resultados --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Imagen Original
          </h3>
          <div className="w-full h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
            {originalImageUrl ? (
              <img
                src={originalImageUrl}
                alt="Original"
                className="max-w-full max-h-full rounded-lg object-contain"
              />
            ) : (
              <p className="text-gray-500">Aquí aparecerá tu imagen original</p>
            )}
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Imagen Procesada
          </h3>
          <div className="w-full h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
            {processedImageUrl ? (
              <img
                src={processedImageUrl}
                alt="Procesada"
                className="max-w-full max-h-full rounded-lg object-contain"
              />
            ) : uploading && originalImageUrl ? (
              <div className="text-center">
                <p className="text-gray-400">Procesando...</p>
                {/* Opcional: un spinner de carga */}
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mt-2"></div>
              </div>
            ) : (
              <p className="text-gray-500">
                Aquí aparecerá tu imagen procesada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
