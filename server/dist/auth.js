import jwt from 'jsonwebtoken';
// JWT_SECRET será validado quando as rotas forem carregadas
let JWT_SECRET = process.env.JWT_SECRET;
export function validateJWTSecret() {
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
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Sem autorização' });
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = { authenticated: decoded.authenticated };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}
export function generateToken() {
    return jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '24h' });
}
//# sourceMappingURL=auth.js.map