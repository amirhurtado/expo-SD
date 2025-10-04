"use client";

import { useImageProcessor } from '@/hooks/useImageProcessor';
import { UploadZone } from './UploadZone';
import { OptionsPanel } from './OptionsPanel';
import { ResultsDisplay } from './ResultsDisplay';
import { WatermarkDialog } from './WatermarkDialog';

export default function ImageUploader({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const { states, actions } = useImageProcessor(onUploadSuccess);

  return (
    <div className="w-full max-w-4xl bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <UploadZone 
          message={states.message} 
          onFileChange={actions.handleFileChange} 
        />
        <OptionsPanel
          options={states.options}
          // --- ¡ESTOS SON LOS CAMBIOS IMPORTANTES! ---
          onColorChange={actions.handleColorChange} // Usamos la nueva función para color
          onWatermarkToggle={actions.handleWatermarkToggle} // Usamos la nueva función para el toggle
          // --- FIN DE LOS CAMBIOS ---
          onUpload={actions.handleUpload}
          onConfigureWatermark={() => actions.setIsDialogOpen(true)}
          isUploading={states.uploading}
          isFileSelected={!!states.selectedFile}
        />
      </div>

      <div className="border-t border-slate-700 my-6"></div>

      <ResultsDisplay
        originalUrl={states.originalImageUrl}
        processedUrl={states.processedImageUrl}
        onDownload={actions.handleDownload}
        isUploading={states.uploading}
      />

      <WatermarkDialog
        isOpen={states.isDialogOpen}
        onClose={() => actions.setIsDialogOpen(false)}
        text={states.watermarkText}
        onTextChange={actions.setWatermarkText}
      />
    </div>
  );
}