// src/features/auth/api/auth.api.types.ts

// Data Transfer Objects (DTOs) used for REST API communication. These types mirror the backend models exactly.
export interface UserDto {
  userId: string;
  userName: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  ok: boolean;
  user?: UserDto;
  token?: string;
  error?: string;
}
