import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * TOKEN MANAGER - Gerenciamento de Access Token + Refresh Token
 * 
 * Implementa:
 * - Access Token: 15 minutos (curta duração)
 * - Refresh Token: 7 dias em HTTP-only cookie
 * - Token Blacklist para logout
 * - Verificação de tokens
 */

let JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_BLACKLIST = new Set<string>();

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken extends JwtPayload {
  authenticated: boolean;
  type: 'access' | 'refresh';
}

/**
 * Gera par de tokens (access + refresh)
 * Access Token: 15 minutos
 * Refresh Token: 7 dias
 */
export function generateTokenPair(): TokenPair {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET não configurado corretamente');
  }

  const accessToken = jwt.sign(
    { authenticated: true, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { authenticated: true, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Verifica e decodifica access token
 */
export function verifyAccessToken(token: string): DecodedToken {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
  }

  const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
  
  // Validar que é access token
  if (decoded.type !== 'access') {
    throw new Error('Token inválido: não é um access token');
  }

  return decoded;
}

/**
 * Verifica refresh token e gera novo access token
 */
export function refreshAccessToken(refreshToken: string): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
  }

  // Verificar se token está na blacklist
  if (TOKEN_BLACKLIST.has(refreshToken)) {
    throw new Error('Token foi revogado (logout)');
  }

  const decoded = jwt.verify(refreshToken, JWT_SECRET) as DecodedToken;

  // Validar que é refresh token
  if (decoded.type !== 'refresh') {
    throw new Error('Token inválido: não é um refresh token');
  }

  // Gerar novo access token
  const newAccessToken = jwt.sign(
    { authenticated: true, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  return newAccessToken;
}

/**
 * Coloca token na blacklist (logout)
 * Em produção, usar banco de dados para persistência
 */
export function blacklistToken(token: string): void {
  TOKEN_BLACKLIST.add(token);
  
  // Limpar tokens expirados da blacklist a cada logout
  // (evitar memory leak com muitos tokens)
  if (TOKEN_BLACKLIST.size > 10000) {
    console.warn('[TokenManager] Blacklist excedeu 10000 tokens, limpando...');
    TOKEN_BLACKLIST.clear();
  }
}

/**
 * Verificar se token está na blacklist
 */
export function isTokenBlacklisted(token: string): boolean {
  return TOKEN_BLACKLIST.has(token);
}

/**
 * Limpar blacklist (útil para testes)
 */
export function clearBlacklist(): void {
  TOKEN_BLACKLIST.clear();
}

/**
 * Atualizar JWT_SECRET (chamado em verificações)
 */
export function updateJWTSecret(secret: string): void {
  JWT_SECRET = secret;
}
