import React, { useState, useCallback, useRef } from 'react';
import { FileText, UploadCloud, X } from './icons';

interface PdfUploaderProps {
  onPdfUpload: (file: File | null) => void;
  isParsing: boolean;
}

const isValidTemplateFile = (file: File): boolean => {
    return file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt');
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onPdfUpload, isParsing }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isValidTemplateFile(file)) {
      setFileName(file.name);
      onPdfUpload(file);
    } else {
      setFileName(null);
      onPdfUpload(null);
      // Optional: Show an error message for invalid file type
    }
  }, [onPdfUpload]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    onPdfUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onPdfUpload]);
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
     if (file && isValidTemplateFile(file)) {
      setFileName(file.name);
      onPdfUpload(file);
    } else {
      setFileName(null);
      onPdfUpload(null);
    }
  }, [onPdfUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div 
      className="relative bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-indigo-500 hover:bg-gray-700/50"
      onClick={triggerFileInput}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="text/plain, text/markdown, .md, .txt"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload text template"
      />
      {fileName ? (
        <div className="flex items-center space-x-4">
          <FileText className="h-10 w-10 text-indigo-400" />
          <div className="text-left">
            <p className="font-semibold text-gray-200 truncate max-w-xs">{fileName}</p>
            {isParsing ? (
              <p className="text-sm text-yellow-400">Loading template...</p>
            ) : (
              <p className="text-sm text-green-400">Template loaded successfully</p>
            )}
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-1.5 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600"
            aria-label="Remove template file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500 pointer-events-none">
          <UploadCloud className="h-10 w-10 mb-3" />
          <span className="font-semibold text-gray-200">Upload Audit Template</span>
          <span className="text-sm mt-1">Click or drag & drop a Text or Markdown file here</span>
        </div>
      )}
    </div>
  );
};