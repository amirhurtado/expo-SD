import React from 'react';

type ResultsDisplayProps = {
  originalUrl: string | null;
  processedUrl: string | null;
  onDownload: () => void;
  isUploading: boolean;
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ originalUrl, processedUrl, onDownload, isUploading }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-4 text-white">Imagen Original</h3>
      <div className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center p-2 border border-slate-800">
        {originalUrl ? <img src={originalUrl} alt="Original" className="max-w-full max-h-full rounded-lg object-contain" /> : <p className="text-slate-500">Aquí aparecerá tu imagen original</p>}
      </div>
    </div>
    <div className="text-center">
      <div className="flex justify-center items-center gap-4 mb-4">
          <h3 className="text-xl font-semibold text-white">Imagen Procesada</h3>
          <button onClick={onDownload} disabled={!processedUrl} className="disabled:opacity-20 disabled:cursor-not-allowed text-pink-500 hover:text-pink-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
      </div>
      <div className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center p-2 border border-slate-800">
        {processedUrl ? <img src={processedUrl} alt="Procesada" className="max-w-full max-h-full rounded-lg object-contain" /> : isUploading && originalUrl ? <div className="text-center"><p className="text-slate-400">Procesando...</p><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mt-2"></div></div> : <p className="text-slate-500">Aquí aparecerá tu imagen procesada</p>}
      </div>
    </div>
  </div>
);