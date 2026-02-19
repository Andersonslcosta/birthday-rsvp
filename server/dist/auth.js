import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
export function generateToken() {
    return jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '24h' });
}
//# sourceMappingURL=auth.js.map