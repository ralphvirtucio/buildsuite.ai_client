'use client';

import { FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentCard } from './DocumentCard';
import type { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  onDownload: (doc: Document) => void;
  isDeleting?: string | null; // Document ID being deleted
}

export function DocumentList({ documents, onDelete, onDownload, isDeleting }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No documents yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload documents to enhance Kairo&apos;s knowledge and get better responses
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onDelete={() => onDelete(doc.id)}
            onDownload={() => onDownload(doc)}
            isDeleting={isDeleting === doc.id}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
