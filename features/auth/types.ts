// Session data types from backend
export interface SessionData {
  valid: boolean;
  companyName: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  timezone?: string;
  locationId: string;
  createdAt: string;
  // Backend-issued session identifier (from httpOnly cookie)
  sessionId?: string;
  // Supabase users.id for this session (FK from user_sessions.metadata.buildsuite_user_id)
  buildsuite_user_id?: string | null;
}

export interface SessionError {
  detail: string;
}
