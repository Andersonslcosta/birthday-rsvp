/**
 * TOKEN STORAGE - Gerenciamento seguro de tokens no frontend
 * 
 * Armazena:
 * - Access Token: sessionStorage (limpar ao fechar aba)
 * - Informações de expiração: sessionStorage
 * - Refresh Token: em HTTP-only cookie (gerenciado pelo servidor)
 */

const ACCESS_TOKEN_KEY = 'birthday_access_token';
const TOKEN_EXPIRY_KEY = 'birthday_token_expiry';

/**
 * Salvar access token
 * Refresh token vem em HTTP-only cookie via servidor
 */
export function saveAccessToken(token: string, expiresIn: number): void {
  // Guardar em sessionStorage (limpar ao fechar aba)
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  
  // Guardar tempo de expiração
  const expiryTime = Date.now() + expiresIn * 1000; // expiresIn em segundos
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  
  console.log('[TokenStorage] Access token salvo (expira em', expiresIn, 's)');
}

/**
 * Recuperar access token
 */
export function getAccessToken(): string | null {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  
  // Validar se token não expirou
  if (token && expiry) {
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() > expiryTime) {
      console.warn('[TokenStorage] Access token expirou');
      clearTokens();
      return null;
    }
  }
  
  return token;
}

/**
 * Verificar se token existe e é válido
 */
export function hasValidToken(): boolean {
  return getAccessToken() !== null;
}

/**
 * Limpar tokens (logout)
 * Refresh token será deletado no servidor (blacklist)
 */
export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  console.log('[TokenStorage] Tokens limpos');
}

/**
 * Obter tempo até expiração (em milissegundos)
 */
export function getTimeUntilExpiry(): number {
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return 0;
  
  const expiryTime = parseInt(expiry, 10);
  return Math.max(0, expiryTime - Date.now());
}

/**
 * Verificar se token vai expirar em breve (< 1 min)
 */
export function shouldRefreshToken(): boolean {
  const timeLeft = getTimeUntilExpiry();
  return timeLeft < 60000; // Menos de 1 minuto
}
