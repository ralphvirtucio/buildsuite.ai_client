export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export type DocumentFileType = 'pdf' | 'docx' | 'txt';

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_type: DocumentFileType;
  file_size: number; // bytes
  status: DocumentStatus;
  uploaded_by: string | null; // UUID - references users.id
  uploaded_at: string; // ISO datetime
  processed_at?: string | null;
  storage_url?: string;
  metadata?: {
    page_count?: number;
    mime_type?: string;
    extraction_status?: 'pending' | 'completed' | 'failed';
  };
}

export interface DocumentUploadRequest {
  file: File;
  user_id: string;
  session_id?: string;
}

export interface DocumentUploadResponse {
  document: Document;
  message?: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  detail?: string;
}
