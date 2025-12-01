'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUploadDocument } from '../api';
import type { DocumentFileType } from '../types';

interface DocumentUploaderProps {
  userId: string;
  sessionId?: string;
}

const ACCEPTED_FILE_TYPES: Record<DocumentFileType, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploader({ userId, sessionId }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadDocument();
  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = Object.values(ACCEPTED_FILE_TYPES);
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: PDF, DOCX, TXT`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: 10MB`;
    }

    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      uploadMutation.mutate(
        { file, user_id: userId, session_id: sessionId },
        {
          onError: (err) => {
            setError(err.message || 'Upload failed');
          },
        },
      );
    },
    [userId, sessionId, uploadMutation],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          uploadMutation.isPending && 'opacity-50 pointer-events-none',
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {uploadMutation.isPending ? (
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium">
              {uploadMutation.isPending ? 'Uploading...' : 'Drop your document here'}
            </p>
            <p className="text-sm text-muted-foreground">
              Accepted formats: PDF, DOCX, TXT (max 10MB)
            </p>
          </div>

          {/* File Input */}
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileInput}
              disabled={uploadMutation.isPending}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploadMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadMutation.isSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-200">
            Document uploaded successfully! Processing for Kairo knowledge base...
          </p>
        </div>
      )}
    </div>
  );
}
