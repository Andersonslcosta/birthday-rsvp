import express, { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * AUTENTICAÇÃO JWT
 * 
 * Responsável por:
 * - Validar JWT_SECRET na inicialização
 * - Gerar tokens JWT com expiração de 24h
 * - Validar tokens em requisições protegidas
 * - Middleware de proteção de rotas
 * 
 * Conecta com:
 * - routes.ts (usa authMiddleware em rotas protegidas)
 * - index.ts (valida JWT_SECRET ao iniciar)
 */

// JWT_SECRET será validado quando as rotas forem carregadas
let JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  admin?: { authenticated: boolean };
}

/**
 * Valida JWT_SECRET vinculado ao .env
 * Executado em index.ts durante inicialização
 */
export function validateJWTSecret(): void {
  // Carregar novamente em caso de não estar setado
  JWT_SECRET = process.env.JWT_SECRET;
  
  console.log(`[Auth] JWT_SECRET length: ${JWT_SECRET?.length || 0} chars`);
  console.log(`[Auth] JWT_SECRET value: ${JWT_SECRET?.substring(0, 10)}...`);
  
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error(`[Auth] JWT_SECRET validation failed: ${!JWT_SECRET ? 'not set' : `length ${JWT_SECRET.length} < 32`}`);
    throw new Error('JWT_SECRET must be set in environment variables and at least 32 characters');
  }
  console.log('[Auth] JWT_SECRET validated successfully');
}

/**
 * Middleware Express para proteger rotas
 * Verifica se requisição tem token JWT válido
 * Uso: router.get('/api/admin/rsvp', authMiddleware, handler)
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sem autorização' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload & { authenticated: boolean };
    req.admin = { authenticated: decoded.authenticated };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * Gera novo JWT com expiração de 24h
 * Usado em POST /api/admin/login após validar senha
 * Retorna para frontend armazenar em localStorage (storage.ts)
 */
export function generateToken(): string {
  return jwt.sign({ authenticated: true }, JWT_SECRET!, { expiresIn: '24h' });
}
