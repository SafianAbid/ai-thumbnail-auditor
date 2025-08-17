
import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X } from './icons';

interface ImageUploaderProps {
  label: string;
  onImageUpload: (base64: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        // Strip the prefix "data:image/jpeg;base64,"
        const base64String = dataUrl.split(',')[1];
        onImageUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    onImageUpload(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [onImageUpload]);

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  }

  return (
    <div 
        className="relative aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-indigo-500 hover:bg-gray-700/50 group"
        onClick={triggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />
      {imagePreview ? (
        <>
          <img src={imagePreview} alt={label} className="object-cover w-full h-full rounded-md" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center text-gray-500 group-hover:text-indigo-400">
          <UploadCloud className="h-8 w-8 mb-2" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
      )}
    </div>
  );
};
