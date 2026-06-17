import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '10d';

export interface TokenPayload {
  adminId: string;
}

export interface RefreshTokenPayload {
  adminId: string;
  tokenVersion: number;
}

export function generateAccessToken(adminId: string): string {
  return jwt.sign({ adminId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY as any });
}

export function generateRefreshToken(adminId: string, tokenVersion: number): string {
  return jwt.sign({ adminId, tokenVersion }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY as any });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}
