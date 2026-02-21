import express from 'express';
// carregar variáveis de ambiente PRIMEIRO antes de usar process.env
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env - procurar em cwd e depois em ../
dotenv.config();
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Then import other modules that depend on env vars
// @ts-ignore - cors module with type issues
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initDatabase, logAdminAction } from './database.js';
import routes from './routes.js';
import { validateJWTSecret } from './auth.js';

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const MAX_REQUEST_SIZE = process.env.MAX_REQUEST_SIZE || '10kb';

// Middleware de validação de Content-Type
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
});

// Middleware de limite geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => NODE_ENV === 'development',
});

// Rate limiter específico para login (muito mais restritivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => NODE_ENV === 'development',
  keyGenerator: (req) => req.ip || 'unknown',
});

// Middleware
app.use(express.json({ limit: MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ limit: MAX_REQUEST_SIZE, extended: true }));

app.use(
  cors({
    origin: CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Aplicar rate limiting geral
app.use(generalLimiter);

// Aplicar rate limiting específico para login antes de registrar rotas
app.use('/api/admin/login', loginLimiter);

// Rotas
app.use(routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);

    logAdminAction('error', err.message).catch(console.error);

    // Não expor detalhes de erro em produção
    const errorMessage =
      NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message;

    const statusCode = err.status || 500;
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
);

// Inicializar servidor
async function startServer() {
  try {
    // Validar configurações obrigatórias
    validateJWTSecret();
    console.log('✓ JWT_SECRET configured');

    // Inicializar banco de dados
    await initDatabase();
    console.log('✓ Database initialized');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🎂 Birthday RSVP Server               ║
╠════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}
║  Environment: ${NODE_ENV}
║  CORS Origin: ${CORS_ORIGIN}
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
