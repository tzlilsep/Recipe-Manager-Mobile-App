/**
 * Data Transfer Objects (DTOs) used for REST API communication.
 * These types mirror the backend models exactly (snake_case if needed).
 */
export interface UserDto {
  userId: string;
  userName: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  ok: boolean;
  user?: UserDto;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export type RegisterResponseDto = LoginResponseDto;
