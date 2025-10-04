import { useState, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Definimos los tipos aquí para que puedan ser usados por el hook y los componentes
export type TransformationOptions = {
  grayscale: boolean;
  watermark: boolean;
};

// Este es nuestro nuevo hook personalizado
export function useImageProcessor() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Sube una imagen (PNG, JPG)");
  const [options, setOptions] = useState<TransformationOptions>({
    grayscale: false,
    watermark: false,
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>("Mi App @ 2025");

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

    try {
      // Sube a Supabase
      const fileName = `public/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, selectedFile);

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
      setOriginalImageUrl(publicUrl);
      setMessage("2. Aplicando transformaciones...");

      // Llama a la API para procesar
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl, options, watermarkText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error inesperado del servidor." }));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const result = await response.json();
      setProcessedImageUrl(result.processedUrl);
      setMessage("¡Procesamiento completado!");

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido.";
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

  // El hook devuelve los estados y las funciones que la UI necesitará
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
      handleOptionChange,
      handleFileChange,
      handleUpload,
      handleDownload,
      setIsDialogOpen,
      setWatermarkText,
    },
  };
}