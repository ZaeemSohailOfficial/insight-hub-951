import { useState, useRef } from 'react';
import { FileAttachment } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image } from 'lucide-react';

interface FileUploaderProps {
  files: FileAttachment[];
  onChange: (files: FileAttachment[]) => void;
  accept?: string;
  label?: string;
}

export default function FileUploader({ files, onChange, accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg', label = 'Upload Files' }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: FileAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          dataUrl: reader.result as string,
        };
        onChange([...files, newFile]);
      };
      reader.readAsDataURL(file);
    });
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    onChange(files.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4 text-primary" />;
    return <FileText className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Click to upload files</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, PNG, JPG</p>
      </div>
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={handleFiles} />
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2 text-sm">
              {getFileIcon(f.type)}
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
