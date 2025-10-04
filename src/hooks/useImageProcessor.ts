// hooks/useImageProcessor.ts
import { useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

// Tipo para los filtros de color
export type ColorOptions = "none" | "grayscale" | "sepia";

export type TransformationOptions = {
  color: ColorOptions;
  watermark: boolean;
};

export function useImageProcessor(onUploadSuccess?: () => void) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Sube una imagen (PNG, JPG)");

  // ✅ Nuevo estado de opciones con color y watermark
  const [options, setOptions] = useState<TransformationOptions>({
    color: "none",
    watermark: false,
  });

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>("Mi App @ 2025");

  // ✅ Manejar cambios en el filtro de color
  const handleColorChange = (color: ColorOptions) => {
    setOptions((prev) => ({ ...prev, color }));
  };

  // ✅ Alternar watermark
  const handleWatermarkToggle = () => {
    setOptions((prev) => ({ ...prev, watermark: !prev.watermark }));
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

    try {
      // Subida a Supabase
      const fileName = `public/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, selectedFile);

      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName);

      setOriginalImageUrl(publicUrl);
      setMessage("2. Aplicando transformaciones...");

      // Llamada a la API
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl, options, watermarkText }),
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
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error desconocido.";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (processedImageUrl) {
      window.open(processedImageUrl, "_blank");
    }
  };

  return {
    states: {
      uploading,
      selectedFile,
      originalImageUrl,
      processedImageUrl,
      message,
      options,
      isDialogOpen,
      watermarkText,
    },
    actions: {
      handleColorChange, // nuevo
      handleWatermarkToggle, // nuevo
      handleFileChange,
      handleUpload,
      handleDownload,
      setIsDialogOpen,
      setWatermarkText,
    },
  };
}
