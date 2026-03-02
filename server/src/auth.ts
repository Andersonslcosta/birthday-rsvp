import express, { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isTokenBlacklisted, updateJWTSecret } from './tokenManager.js';

/**
 * AUTENTICAÇÃO JWT
 * 
 * Responsável por:
 * - Validar JWT_SECRET na inicialização
 * - Validar access tokens (Bearer token no header)
 * - Middleware de proteção de rotas
 * 
 * Conecta com:
 * - tokenManager.ts (gerencia access + refresh tokens)
 * - routes.ts (usa authMiddleware em rotas protegidas)
 * - index.ts (valida JWT_SECRET ao iniciar)
 */

export interface AuthRequest extends Request {
  admin?: { authenticated: boolean };
}

/**
 * Valida JWT_SECRET vinculado ao .env
 * Executado em index.ts durante inicialização
 */
export function validateJWTSecret(): void {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  console.log(`[Auth] JWT_SECRET length: ${JWT_SECRET?.length || 0} chars`);
  console.log(`[Auth] JWT_SECRET value: ${JWT_SECRET?.substring(0, 10)}...`);
  
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error(`[Auth] JWT_SECRET validation failed: ${!JWT_SECRET ? 'not set' : `length ${JWT_SECRET.length} < 32`}`);
    throw new Error('JWT_SECRET must be set in environment variables and at least 32 characters');
  }
  
  // Atualizar JWT_SECRET no tokenManager
  updateJWTSecret(JWT_SECRET);
  
  console.log('[Auth] JWT_SECRET validated successfully');
}

/**
 * Middleware Express para proteger rotas
 * Verifica se requisição tem access token válido
 * Uso: router.get('/api/admin/rsvp', authMiddleware, handler)
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sem autorização' });
  }

  const token = authHeader.substring(7);

  try {
    // Verificar se token está na blacklist
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ error: 'Token foi revogado (logout)' });
    }

    // Verificar e decodificar access token
    const decoded = verifyAccessToken(token);
    req.admin = { authenticated: decoded.authenticated };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
