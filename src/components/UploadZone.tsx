import React from 'react';

type UploadZoneProps = {
  message: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const UploadZone: React.FC<UploadZoneProps> = ({ message, onFileChange }) => (
  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-slate-800/50 transition-all">
    <div className="flex flex-col items-center justify-center text-center p-4">
      <svg className="w-10 h-10 mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
      <p className="text-sm text-slate-400"><span className="font-semibold text-slate-200">Haz clic para subir</span> o arrastra</p>
      <p className="text-slate-400 text-sm h-10 mt-2 break-words">{message}</p>
    </div>
    <input id="file-upload" type="file" className="hidden" onChange={onFileChange} accept="image/png, image/jpeg" />
  </label>
);