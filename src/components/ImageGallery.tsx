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
      const { data, error } = await supabase
        .from('processed_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

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
      {/* La única línea que cambia es esta: */}
      <h2 className="text-xl font-bold rounded-lg text-white text-center mb-6 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2 z-10">
        Galería Reciente
      </h2>
      
      {loading ? (
        <p className="text-center text-slate-400">Cargando...</p>
      ) : images.length === 0 ? (
        <div className="text-center bg-slate-900/50 border border-slate-800 rounded-lg p-8">
          <p className="text-slate-400">No hay imágenes recientes.</p>
          <p className="text-sm text-slate-500">¡Sube una imagen para empezar la galería!</p>
        </div>
      ) : (
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