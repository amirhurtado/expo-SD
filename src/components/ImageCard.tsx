import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Tipos (sin cambios)
type ProcessedImage = {
  id: number;
  original_url: string;
  processed_url: string;
};
type ImageCardProps = {
  image: ProcessedImage;
  onDelete: (id: number) => void;
};

export function ImageCard({ image, onDelete }: ImageCardProps) {
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // --- ¡NUEVO ESTADO! ---
  // Para controlar la visibilidad del dialogante de confirmación.
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const toggleView = () => {
    setIsShowingOriginal(prev => !prev);
  };

  const handleOpen = () => {
    window.open(isShowingOriginal ? image.original_url : image.processed_url, '_blank');
  };

  // --- LÓGICA DE BORRADO MODIFICADA ---
  // 1. Esta función ahora solo abre el dialogante.
  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  // 2. Esta nueva función contiene la lógica de borrado y se llama desde el dialogante.
  const confirmDelete = async () => {
    setIsConfirmOpen(false); // Cierra el dialogante
    setIsDeleting(true); // Muestra el spinner de carga

    try {
      const filePath = image.original_url.split('/public/images/')[1];
      
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([filePath]);
      if (storageError) throw new Error(`Error en Storage: ${storageError.message}`);

      const { error: dbError } = await supabase
        .from('processed_images')
        .delete()
        .eq('id', image.id);
      if (dbError) throw new Error(`Error en DB: ${dbError.message}`);

      onDelete(image.id);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al borrar.";
      console.error(errorMessage);
      alert(errorMessage);
      setIsDeleting(false);
    }
  };
  
  const imageUrlToShow = isShowingOriginal ? image.original_url : image.processed_url;

  return (
    <div className="group relative overflow-hidden rounded-lg aspect-square bg-slate-900">
      {isDeleting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      )}
      <img 
        src={imageUrlToShow} 
        alt={isShowingOriginal ? "Imagen original" : "Imagen procesada"}
        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-in"
      />
      
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-2">
        <button onClick={toggleView} className="text-xs text-white bg-slate-800/80 px-3 py-1 rounded-full hover:bg-pink-600 transition-colors">
          {isShowingOriginal ? 'Ver Procesada' : 'Ver Original'}
        </button>
        <button onClick={handleOpen} className="text-xs text-white bg-slate-800/80 px-3 py-1 rounded-full hover:bg-sky-600 transition-colors">
          Abrir
        </button>
        {/* El botón de borrar ahora llama a la función que abre el dialogante */}
        <button onClick={handleDeleteClick} className="text-xs text-red-400 hover:text-white hover:bg-red-600/80 px-3 py-1 rounded-full transition-colors">
          Borrar
        </button>
      </div>

      {/* --- ¡NUEVO DIALOGANTE DE CONFIRMACIÓN! --- */}
      {isConfirmOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-sm text-slate-400 mb-6">
              ¿Estás seguro? La imagen se borrará permanentemente de la base de datos y del almacenamiento.
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                Sí, Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}