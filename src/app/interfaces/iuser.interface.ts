export interface User {
  user_id: number;
  name: string;
  email: string;
  userName: string;
  password_hash: string;
  created_at: Date;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserRegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface UserAuthenticatedResponse {
  id: number;
  name: string;
  email: string;
  token: string;
}
