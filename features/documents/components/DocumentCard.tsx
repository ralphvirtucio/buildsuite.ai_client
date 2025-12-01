'use client';

import { FileText, Download, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { Document, DocumentFileType } from '../types';

interface DocumentCardProps {
  document: Document;
  onDelete: () => void;
  onDownload: () => void;
  isDeleting?: boolean;
}

const FILE_TYPE_ICONS: Record<DocumentFileType, string> = {
  pdf: '📄',
  docx: '📝',
  txt: '📃',
};

const STATUS_CONFIG = {
  uploading: { icon: Clock, label: 'Uploading...', color: 'text-blue-500' },
  processing: { icon: Clock, label: 'Processing...', color: 'text-yellow-500' },
  ready: { icon: CheckCircle, label: 'Ready', color: 'text-green-500' },
  failed: { icon: AlertCircle, label: 'Failed', color: 'text-red-500' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function DocumentCard({
  document,
  onDelete,
  onDownload,
  isDeleting
}: DocumentCardProps) {
  const statusConfig = STATUS_CONFIG[document.status];
  const StatusIcon = statusConfig.icon;
  const fileIcon = FILE_TYPE_ICONS[document.file_type];

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isDeleting && "opacity-50 pointer-events-none"
    )}>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start gap-3">
          {/* File Icon */}
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">
            {fileIcon}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate mb-1" title={document.original_filename}>
              {document.original_filename}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="uppercase">{document.file_type}</span>
              <span>•</span>
              <span>{formatFileSize(document.file_size)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(document.uploaded_at)}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={cn(
          "flex items-center gap-1.5 mt-3 text-xs font-medium",
          statusConfig.color
        )}>
          <StatusIcon className="h-3.5 w-3.5" />
          <span>{statusConfig.label}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onDownload}
          disabled={document.status !== 'ready' || isDeleting}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-medium text-foreground">"{document.original_filename}"</span>?
                This action cannot be undone and the document will be permanently removed from the knowledge base.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
