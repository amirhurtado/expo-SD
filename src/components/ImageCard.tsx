import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Definimos el tipo de la imagen que recibiremos como prop
type ProcessedImage = {
  id: number;
  original_url: string;
  processed_url: string;
};

type ImageCardProps = {
  image: ProcessedImage;
  onDelete: (id: number) => void; // Función para notificar al padre que se borró
};

export function ImageCard({ image, onDelete }: ImageCardProps) {
  // --- ¡NUEVA LÓGICA! ---
  // Estado para saber si estamos mostrando la imagen original o la procesada
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para alternar la vista de la imagen
  const toggleView = () => {
    setIsShowingOriginal(prev => !prev);
  };

  // Función para borrar la imagen de Storage y de la Base de Datos
  const handleDelete = async () => {
    // Pedimos confirmación al usuario
    const isConfirmed = window.confirm("¿Estás seguro de que quieres borrar esta imagen? Esta acción no se puede deshacer.");
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      // 1. Extraer el nombre del archivo de la URL original para borrarlo de Storage
      const filePath = image.original_url.split('/public/images/')[1];
      
      // 2. Borrar el archivo de Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([filePath]);
      
      if (storageError) throw new Error(`Error en Storage: ${storageError.message}`);

      // 3. Borrar el registro de la base de datos
      const { error: dbError } = await supabase
        .from('processed_images')
        .delete()
        .eq('id', image.id);
      
      if (dbError) throw new Error(`Error en DB: ${dbError.message}`);

      // 4. Notificar al componente padre (`ImageGallery`) para que elimine la tarjeta de la UI
      onDelete(image.id);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al borrar.";
      console.error(errorMessage);
      alert(errorMessage); // Muestra el error al usuario
      setIsDeleting(false);
    }
  };
  
  // Determinamos qué URL mostrar
  const imageUrlToShow = isShowingOriginal ? image.original_url : image.processed_url;

  return (
    <div className="group relative overflow-hidden rounded-lg aspect-square">
      {isDeleting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      )}
      <img 
        src={imageUrlToShow} 
        alt={isShowingOriginal ? "Imagen original" : "Imagen procesada"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in"
      />
      {/* Overlay que aparece al pasar el ratón */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-2">
        <button onClick={toggleView} className="text-xs text-white cursor-pointer px-3 py-1 rounded-sm hover:bg-pink-600 transition-colors">
          {isShowingOriginal ? 'Ver Procesada' : 'Ver Original'}
        </button>
        <button onClick={handleDelete} className="cursor-pointer text-xs text-red-400 hover:text-white hover:bg-red-600/80 px-3 py-1 rounded-sm transition-colors">
          Borrar
        </button>
      </div>
    </div>
  );
}