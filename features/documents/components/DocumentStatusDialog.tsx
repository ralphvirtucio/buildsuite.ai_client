'use client';

import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useDocumentStatus } from '../api';

interface DocumentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
  userId: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  uploading: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export function DocumentStatusDialog({
  open,
  onOpenChange,
  documentId,
  userId,
}: DocumentStatusDialogProps) {
  const { data, isLoading, isFetching } = useDocumentStatus(documentId, userId, open);

  const status = data?.status || 'processing';
  const vectorStatus = data?.vector_status || 'pending';
  const isDone = status === 'ready' || status === 'failed';

  const statusBadge = (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
        STATUS_COLOR[status] || '',
      )}
    >
      {status}
    </span>
  );
  const vectorBadge = (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
        STATUS_COLOR[vectorStatus] || '',
      )}
    >
      {vectorStatus}
    </span>
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Document Processing Status</AlertDialogTitle>
          <AlertDialogDescription>
            Track the ingestion and vectorization progress for your upload.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {isLoading || isFetching ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : status === 'failed' ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {statusBadge}
                <span className="text-xs text-muted-foreground">API ingestion</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {vectorStatus === 'failed' ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : vectorStatus === 'ready' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Vectorization</p>
              <div className="flex items-center gap-2 mt-1">
                {vectorBadge}
                <span className="text-xs text-muted-foreground">Embedding + Qdrant upsert</span>
              </div>
            </div>
          </div>

          {data?.error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {data.error}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={!isDone}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
