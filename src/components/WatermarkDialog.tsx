import React from 'react';

type WatermarkDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  onTextChange: (text: string) => void;
};

export const WatermarkDialog: React.FC<WatermarkDialogProps> = ({ isOpen, onClose, text, onTextChange }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Configurar Marca de Agua</h3>
        <p className="text-sm text-slate-400 mb-2">Escribe el texto que aparecerá en la imagen.</p>
        <input 
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full p-2 rounded bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Cancelar</button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg">Guardar</button>
        </div>
      </div>
    </div>
  );
};