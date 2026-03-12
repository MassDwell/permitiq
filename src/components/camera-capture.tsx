'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  onFileSelected: (file: File) => void;
}

export function CameraCapture({ onFileSelected }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    e.target.value = '';
  };

  return (
    <div className="md:hidden">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="w-full gap-2 border-[rgba(255,255,255,0.15)] hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors"
      >
        <Camera className="h-4 w-4" />
        Scan Document
      </Button>
    </div>
  );
}
