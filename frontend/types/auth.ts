export interface AuthUser {
  id: number;
  name: string;
  email: string | null;
  avatar: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  reset_token: string;
}
