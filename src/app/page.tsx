"use client"; // Necesitamos que esta página sea un Client Component para manejar el estado

import { useState } from 'react';
import ImageUploader from "@/components/ImageUploader";
import { ImageGallery } from "@/components/ImageGallery";

export default function HomePage() {
  // Este estado actuará como una "señal" para refrescar la galería.
  const [galleryKey, setGalleryKey] = useState(0);

  // Esta función se la pasaremos al ImageUploader.
  // Cuando una subida sea exitosa, la llamaremos para cambiar la señal.
  const handleUploadSuccess = () => {
    setGalleryKey(prevKey => prevKey + 1);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
        Procesador de Imágenes Serverless
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Sube una imagen y observa la magia de la computación en la nube.
      </p>
      
      <ImageUploader onUploadSuccess={handleUploadSuccess} />
      
      <ImageGallery refreshKey={galleryKey} />
    </main>
  );
}