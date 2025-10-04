"use client";

import { useState } from 'react';
import ImageUploader from "@/components/ImageUploader";
import { ImageGallery } from "@/components/ImageGallery";

export default function HomePage() {
  const [galleryKey, setGalleryKey] = useState(0);

  const handleUploadSuccess = () => {
    setGalleryKey(prevKey => prevKey + 1);
  };

  return (
    // Contenedor principal ahora usa flex-row para crear las columnas
    <main className="flex flex-row w-full min-h-screen bg-background">
      
      {/* --- Columna Izquierda (80%) --- */}
      <div className="w-4/5 flex flex-col items-center justify-center p-8">
        <div className="w-full text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Procesador de Imágenes Serverless
          </h1>
          <p className="text-lg text-gray-300">
            Sube una imagen y observa la magia de la computación en la nube.
          </p>
        </div>
        <ImageUploader onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* --- Columna Derecha (20%) --- */}
      <div className="w-1/5 border-l border-slate-700 h-screen overflow-y-auto p-4">
        <ImageGallery refreshKey={galleryKey} />
      </div>

    </main>
  );
}