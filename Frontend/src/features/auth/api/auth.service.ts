// src/features/auth/api/auth.service.ts
import {
  LoginRequestDto,
  LoginResponseDto,
  UserDto,
} from './auth.api.types';
import { IAuthService, AuthResult, User } from '../model/auth.types';

function mapUserDto(dto?: UserDto): User | undefined {
  if (!dto) return undefined;
  return { id: dto.userId, name: dto.userName };
}

function mapAuthResponseDto(dto: LoginResponseDto): AuthResult {
  return {
    ok: dto.ok,
    user: mapUserDto(dto.user),
    token: dto.token,
    error: dto.error,
  };
}

const API_BASE_URL = 'http://192.168.1.51:5005/api';

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Network error');
  }
  return res.json();
}

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

  async signIn(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handle(res);
  },

  async signUp(email: string, password: string, name: string) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return handle(res);
  },
};
