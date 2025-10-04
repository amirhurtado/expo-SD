"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ImageCard } from './ImageCard'; // Importamos el nuevo componente

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
        .limit(8);

      if (error) {
        console.error("Error fetching images:", error);
      } else {
        setImages(data);
      }
      setLoading(false);
    };

    fetchImages();
  }, [refreshKey]);

  // --- ¡NUEVA LÓGICA! ---
  // Función que se pasará a cada ImageCard para actualizar la UI al borrar
  const handleImageDeleted = (deletedId: number) => {
    setImages(currentImages => currentImages.filter(image => image.id !== deletedId));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Galería de Imágenes Recientes</h2>
      
      {loading ? (
        <p className="text-center text-slate-400">Cargando galería...</p>
      ) : images.length === 0 ? (
        // --- ¡NUEVA LÓGICA! --- Mensaje para cuando no hay imágenes
        <div className="text-center bg-slate-900/50 border border-slate-800 rounded-lg p-8">
          <p className="text-slate-400">No hay imágenes recientes.</p>
          <p className="text-sm text-slate-500">¡Sube una imagen para empezar la galería!</p>
        </div>
      ) : (
        // --- ¡NUEVA LÓGICA! --- Mapeamos y renderizamos el componente ImageCard
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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