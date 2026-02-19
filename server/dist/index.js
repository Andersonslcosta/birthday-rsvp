import express from 'express';
// carregar variáveis de ambiente antes de usar process.env
import dotenv from 'dotenv';
dotenv.config();
// @ts-ignore - cors module with type issues
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, logAdminAction } from './database.js';
import routes from './routes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin: CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
}));
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
app.use((err, req, res, next) => {
    console.error('Error:', err);
    logAdminAction('error', err.message).catch(console.error);
    res.status(500).json({
        success: false,
        error: NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
    });
});
// Inicializar servidor
async function startServer() {
    try {
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
export default app;
//# sourceMappingURL=index.js.map