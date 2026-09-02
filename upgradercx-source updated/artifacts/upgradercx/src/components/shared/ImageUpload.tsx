import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  maxSizeMb?: number;
  accept?: string;
  className?: string;
  placeholder?: string;
}

/**
 * Drag-and-drop image upload with preview.
 * Produces a File object ready for multipart/form-data submission to Laravel.
 *
 * Laravel controller usage:
 *   $request->file('image')->store('products', 'public');
 *
 * Frontend submission pattern:
 *   const formData = new FormData();
 *   formData.append('image', file);
 *   await client.post('/products/{id}/image', formData, {
 *     headers: { 'Content-Type': 'multipart/form-data' },
 *   });
 */
export function ImageUpload({
  value,
  onChange,
  maxSizeMb = 5,
  accept = 'image/jpeg,image/png,image/webp',
  className,
  placeholder = 'Drop image here or click to upload',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMb}MB limit.`);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file, url);
  }, [maxSizeMb, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {preview ? (
        <div className="relative group rounded-lg border overflow-hidden bg-muted/30">
          <img src={preview} alt="Upload preview" className="w-full h-48 object-contain" />
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="destructive" size="sm" onClick={handleRemove} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors',
            dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            {dragging ? <Upload className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground">{placeholder}</p>
          <p className="text-[10px] text-muted-foreground/60">JPEG, PNG, WebP · Max {maxSizeMb}MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
