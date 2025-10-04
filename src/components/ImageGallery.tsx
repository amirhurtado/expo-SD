"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ImageCard } from './ImageCard';

type ProcessedImage = {
  id: number;
  created_at: string;
  original_url: string;
  processed_url: string;
};

export function ImageGallery({ refreshKey }: { refreshKey: number }) {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      // Pedimos más imágenes para llenar el espacio vertical
      const { data, error } = await supabase
        .from('processed_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20); // Aumentamos el límite

      if (error) {
        console.error("Error fetching images:", error);
      } else {
        setImages(data);
      }
      setLoading(false);
    };

    fetchImages();
  }, [refreshKey]);

  const handleImageDeleted = (deletedId: number) => {
    setImages(currentImages => currentImages.filter(image => image.id !== deletedId));
  };

  return (
    <div className="w-full mx-auto">
      <h2 className="text-xl font-bold text-white text-center mb-6 sticky top-0  backdrop-blur-sm py-2 z-10">
        Galería Reciente
      </h2>
      
      {loading ? (
        <p className="text-center text-slate-400">Cargando...</p>
      ) : images.length === 0 ? (
        <div className="text-center p-4">
          <p className="text-sm text-slate-400">No hay imágenes.</p>
        </div>
      ) : (
        // ¡CAMBIO CLAVE! Reemplazamos 'grid' por 'flex flex-col' para una lista vertical
        <div className="flex flex-col gap-4">
          {images.map((image) => (
            <ImageCard 
              key={image.id} 
              image={image} 
              onDelete={handleImageDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}