// src/features/auth/api/auth.service.ts


import {
  LoginRequestDto,
  RegisterRequestDto,
  LoginResponseDto,
  UserDto,
} from './auth.api.types';
import { IAuthService, AuthResult, User } from '../model/auth.types';

/**
 * Maps API DTOs to internal app-level models.
 */
function mapUserDto(dto?: UserDto): User | undefined {
  if (!dto) return undefined;
  return { id: dto.userId, name: dto.userName };
}

function mapAuthResponseDto(dto: LoginResponseDto): AuthResult {
  return {
    ok: dto.ok,
    user: mapUserDto(dto.user),
    token: dto.token,
    refreshToken: dto.refreshToken,
    error: dto.error,
  };
}

/**
 * ✅ RESTful AuthService implementation for the app.
 * Uses your local .NET API on port 5005
 */
const API_BASE_URL = 'http://192.168.1.51:5005/api'; // 👈 כתובת ה-IP של המחשב שלך

export const authService: IAuthService = {
  async login(username, password) {
    const body: LoginRequestDto = { username, password };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        return { ok: false, error: errorText || 'Login failed' };
      }

      const data: LoginResponseDto = await res.json();
      return mapAuthResponseDto(data);
    } catch (err: any) {
      console.error('Network error:', err);
      return { ok: false, error: 'Network request failed. Check your API connection.' };
    }
  },

  async register(username, password) {
    const body: RegisterRequestDto = { username, password };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        return { ok: false, error: errorText || 'Registration failed' };
      }

      const data: LoginResponseDto = await res.json();
      return mapAuthResponseDto(data);
    } catch (err: any) {
      console.error('Network error:', err);
      return { ok: false, error: 'Network request failed. Check your API connection.' };
    }
  },
};
