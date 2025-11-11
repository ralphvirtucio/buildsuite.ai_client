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
}

export interface SessionError {
  detail: string;
}
