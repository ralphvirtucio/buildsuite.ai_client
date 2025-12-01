'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { useSession } from '@/features/auth/hooks';
import { DocumentUploader } from './components/DocumentUploader';
import { DocumentList } from './components/DocumentList';
import { useDocuments, useDeleteDocument, downloadDocument } from './api';
import { Bot, Loader2 } from 'lucide-react';

export default function Documents() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const userId = session?.buildsuite_user_id ?? 'dev-user';
  const sessionId = session?.sessionId;

  const { data: documentsData, isLoading: documentsLoading } = useDocuments(
    userId,
    !!session?.valid
  );
  const deleteMutation = useDeleteDocument();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate({ id, user_id: userId });
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Document Knowledge Base</h1>
              <p className="text-xs text-muted-foreground">
                Upload documents to enhance Kairo's understanding
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6">
          {/* Upload Section */}
          <DocumentUploader userId={userId} sessionId={sessionId} />

          {/* Documents List */}
          <div className="flex-1 overflow-hidden">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                Your Documents {documentsData?.total ? `(${documentsData.total})` : ''}
              </h2>
            </div>

            {documentsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DocumentList
                documents={documentsData?.documents ?? []}
                onDelete={handleDelete}
                onDownload={downloadDocument}
                isDeleting={deleteMutation.isPending ? deleteMutation.variables?.id : null}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
