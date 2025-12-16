import type { Request } from "express";

// User extracted from a verified token
export type RequestUser = {
  userId: string;     // Cognito sub
  username?: string;
};

// Express Request + authenticated user
export type RequestWithUser = Request & {
  user: RequestUser;
};
