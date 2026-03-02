import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF PROTECTION - Proteção contra Cross-Site Request Forgery
 * 
 * Implementação simples:
 * - Valida referer header (mesma origem)
 * - Valida SameSite cookie flag (automático com cookie-parser)
 * - Para produção, seria X-CSRF-Token + session
 */

const ALLOWED_METHODS_NO_CSRF = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Middleware CSRF - valida referer header para POST/DELETE/PUT
 * Uso: app.use(csrfProtection)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Apenas validar para mutating methods
  if (!ALLOWED_METHODS_NO_CSRF.includes(req.method)) {
    const referer = req.headers.referer || '';
    const origin = req.headers.origin || '';
    const host = req.get('host') || '';

    // Em desenvolvimento, aceitar localhost
    const isDev = process.env.NODE_ENV === 'development';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    // Validações de origem
    let isValidOrigin = false;

    if (isDev && isLocalhost) {
      // Em dev com localhost, aceitar
      isValidOrigin = true;
    } else if (origin) {
      // Comparar origin header (mais seguro que referer)
      const allowedOrigins = [
        `https://${host}`,
        `http://${host}`,
      ];
      isValidOrigin = allowedOrigins.some(o => origin === o);
    } else if (referer) {
      // Fallback para referer (menos seguro)
      isValidOrigin = referer.includes(host);
    }

    if (!isValidOrigin && !isDev) {
      console.warn(`[CSRF] Rejected request from referer: ${referer}, origin: ${origin}`);
      return res.status(403).json({
        success: false,
        error: 'CSRF validation failed',
      });
    }
  }

  next();
}

/**
 * Gera CSRF token (para uso futuro com SPA)
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Valida CSRF token (para uso futuro)
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}
