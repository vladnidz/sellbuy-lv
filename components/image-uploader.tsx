"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, ArrowLeft, ArrowRight, Star, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number; // default 5MB
  allowedTypes?: string[];
  disabled?: boolean;
  error?: string;
  onError?: (error: string) => void;
}

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUploader({
  files,
  onChange,
  maxFiles = 10,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  disabled = false,
  error: externalError,
  onError,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate object URLs for previews and clean them up
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const setError = (msg: string | null) => {
    setInternalError(msg);
    if (msg && onError) {
      onError(msg);
    }
  };

  const validateFiles = (newFiles: File[]): File[] => {
    const validFiles: File[] = [];
    let errMessage: string | null = null;

    if (files.length + newFiles.length > maxFiles) {
      errMessage = `Maksimālais atļautais attēlu skaits ir ${maxFiles}`;
      setError(errMessage);
      return [];
    }

    for (const file of newFiles) {
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        errMessage = `Fails "${file.name}" nav atbalstītā formātā (JPG, PNG, WEBP, GIF, AVIF)`;
        break;
      }
      if (file.size > maxSizeBytes) {
        const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
        errMessage = `Fails "${file.name}" pārsniedz maksimālo izmēru ${maxMB}MB`;
        break;
      }
      validFiles.push(file);
    }

    if (errMessage) {
      setError(errMessage);
      return [];
    }

    setError(null);
    return validFiles;
  };

  const handleAddFiles = (incomingFiles: FileList | File[]) => {
    if (disabled) return;
    const fileArray = Array.from(incomingFiles);
    const valid = validateFiles(fileArray);
    if (valid.length > 0) {
      onChange([...files, ...valid]);
    }
  };

  const handleDragOverDropzone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeaveDropzone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDropDropzone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
    // Reset file input value so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    if (disabled) return;
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setError(null);
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
    setError(null);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (disabled || toIndex < 0 || toIndex >= files.length || fromIndex === toIndex) return;
    const updated = [...files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    moveFile(index, 0);
  };

  // Thumbnail drag and drop reordering
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleItemDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveFile(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const displayError = externalError || internalError;

  return (
    <div className="space-y-4">
      {/* Dropzone area */}
      <div
        onDragOver={handleDragOverDropzone}
        onDragLeave={handleDragLeaveDropzone}
        onDrop={handleDropDropzone}
        onClick={() => !disabled && files.length < maxFiles && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
            : "border-slate-700 hover:border-slate-500 bg-slate-900/50"
        } ${disabled || files.length >= maxFiles ? "opacity-60 cursor-not-allowed" : ""}`}
        role="region"
        aria-label="Attēlu augšupielādes zona"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(",")}
          multiple
          onChange={handleFileInputChange}
          disabled={disabled || files.length >= maxFiles}
          className="hidden"
          data-testid="image-uploader-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
            <Upload className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-200">
              {files.length >= maxFiles
                ? `Sasniegts maksimālais attēlu skaits (${maxFiles})`
                : "Ievelciet attēlus šeit vai spiediet, lai izvēlētos"}
            </p>
            <p className="text-xs text-slate-400">
              Atbalstīti JPG, PNG, WEBP, GIF līdz {(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB katrs
              ({files.length}/{maxFiles} attēli)
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {displayError && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Previews / Thumbnail Grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Pārvelciet kartītes, lai mainītu secību. Pirmais attēls ir galvenais.
            </span>
            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Dzēst visus ({files.length})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {files.map((file, index) => {
              const isCover = index === 0;
              const isBeingDragged = draggedIndex === index;
              const isBeingDraggedOver = dragOverIndex === index;

              return (
                <div
                  key={`${file.name}-${index}`}
                  draggable={!disabled}
                  onDragStart={(e) => handleItemDragStart(e, index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDrop={(e) => handleItemDrop(e, index)}
                  className={`group relative rounded-lg overflow-hidden border bg-slate-900 transition-all duration-150 ${
                    isCover ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-slate-800"
                  } ${isBeingDragged ? "opacity-40 scale-95" : ""} ${
                    isBeingDraggedOver ? "border-indigo-400 scale-[1.02]" : ""
                  }`}
                  data-testid={`image-preview-item-${index}`}
                >
                  {/* Thumbnail Image */}
                  <div className="aspect-square relative overflow-hidden bg-slate-950">
                    {previewUrls[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}

                    {/* Cover badge */}
                    {isCover && (
                      <Badge className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 shadow-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Galvenais
                      </Badge>
                    )}

                    {/* Delete overlay button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      disabled={disabled}
                      aria-label={`Dzēst attēlu ${file.name}`}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-red-600 transition-colors shadow-md opacity-90 group-hover:opacity-100 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail control footer */}
                  <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[80px]" title={file.name}>
                      {file.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => setAsCover(index)}
                          disabled={disabled}
                          title="Padarīt par galveno"
                          className="p-0.5 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => moveFile(index, index - 1)}
                        disabled={disabled || index === 0}
                        title="Pārvietot pa kreisi"
                        className="p-0.5 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(index, index + 1)}
                        disabled={disabled || index === files.length - 1}
                        title="Pārvietot pa labi"
                        className="p-0.5 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
