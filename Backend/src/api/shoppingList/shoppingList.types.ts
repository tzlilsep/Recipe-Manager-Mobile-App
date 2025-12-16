import type { Request } from 'express';

export type AuthedUser = { userId: string; username: string };

export type AuthedRequest = Request & { user: AuthedUser };
