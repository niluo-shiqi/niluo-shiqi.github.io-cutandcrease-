import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';

interface UploadSectionProps {
  onImageUpload: (imageUrl: string) => void;
}

export function UploadSection({ onImageUpload }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-2xl border-2 border-dashed rounded-2xl p-16
          transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`
            p-6 rounded-full transition-colors
            ${isDragging ? 'bg-blue-100' : 'bg-white'}
          `}>
            <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Your Design
            </h3>
            <p className="text-gray-600">
              Drag and drop your drawing here, or click to browse
            </p>
          </div>

          <Button size="lg" variant="outline" className="mt-4">
            <ImageIcon className="w-5 h-5 mr-2" />
            Choose File
          </Button>

          <p className="text-sm text-gray-500">
            Supports: JPG, PNG, SVG (Max 10MB)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
