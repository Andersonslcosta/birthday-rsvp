import express from 'express';
import { saveRSVP, getAllRSVPs, geStatistics, deleteAllRSVPs, deleteRSVPById } from './database.js';
import { authMiddleware } from './auth.js';
import { generateToken } from './auth.js';
const router = express.Router();
// Constant-time comparison para evitar timing attacks
function constantTimeCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
// Validar dados de RSVP
function validateRSVPData(data) {
    const { responsibleName, confirmation, participants, totalPeople } = data;
    const MAX_NAME_LENGTH = 200;
    const MAX_PARTICIPANTS = 50;
    if (!responsibleName || typeof responsibleName !== 'string') {
        throw new Error('Nome do responsável é obrigatório');
    }
    if (responsibleName.trim().length < 2) {
        throw new Error('Nome do responsável deve ter pelo menos 2 caracteres');
    }
    if (responsibleName.trim().length > MAX_NAME_LENGTH) {
        throw new Error(`Nome do responsável não pode exceder ${MAX_NAME_LENGTH} caracteres`);
    }
    if (!confirmation || !['sim', 'nao'].includes(confirmation)) {
        throw new Error('Confirmação deve ser "sim" ou "nao"');
    }
    if (confirmation === 'sim') {
        if (!Array.isArray(participants) || participants.length === 0) {
            throw new Error('Participantes é obrigatório quando confirmado');
        }
        if (participants.length > MAX_PARTICIPANTS) {
            throw new Error(`Máximo de ${MAX_PARTICIPANTS} participantes permitido`);
        }
        for (const p of participants) {
            if (!p.name || typeof p.name !== 'string') {
                throw new Error('Nome de todos os participantes é obrigatório');
            }
            if (p.name.trim().length > MAX_NAME_LENGTH) {
                throw new Error(`Nome de participante não pode exceder ${MAX_NAME_LENGTH} caracteres`);
            }
            if (typeof p.isChild !== 'boolean') {
                throw new Error('Campo isChild inválido para participante');
            }
            if (p.isChild) {
                if (typeof p.age !== 'number' || p.age < 0 || p.age > 120) {
                    throw new Error('Idade das crianças deve estar entre 0 e 120');
                }
            }
            else {
                if (p.age !== null && typeof p.age === 'number') {
                    if (p.age < 0 || p.age > 120) {
                        throw new Error('Idade dos participantes deve estar entre 0 e 120');
                    }
                }
            }
        }
        if (totalPeople !== participants.length) {
            throw new Error('Total de pessoas não corresponde ao número de participantes');
        }
    }
    return {
        responsibleName: responsibleName.trim(),
        confirmation,
        participants: confirmation === 'sim'
            ? participants.map((p) => ({
                name: p.name.trim(),
                age: p.age === null ? null : Math.floor(p.age),
                isChild: Boolean(p.isChild),
            }))
            : [],
        totalPeople: confirmation === 'sim' ? participants.length : 0,
    };
}
// POST /api/rsvp - Salvar confirmação
router.post('/api/rsvp', async (req, res) => {
    try {
        const validatedData = validateRSVPData(req.body);
        const rsvp = await saveRSVP({
            responsibleName: validatedData.responsibleName,
            confirmation: validatedData.confirmation,
            totalPeople: validatedData.totalPeople,
            participants: validatedData.participants,
            timestamp: new Date().toISOString(),
        });
        res.status(201).json({
            success: true,
            message: 'Confirmação salva com sucesso',
            data: rsvp,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Erro ao salvar confirmação',
        });
    }
});
// GET /api/rsvp - Obter todas as confirmações (protegido)
router.get('/api/rsvp', authMiddleware, async (req, res) => {
    try {
        const rsvps = await getAllRSVPs();
        res.json({
            success: true,
            data: rsvps,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar confirmações',
        });
    }
});
// GET /api/statistics - Obter estatísticas (protegido)
router.get('/api/statistics', authMiddleware, async (req, res) => {
    try {
        const stats = await geStatistics();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar estatísticas',
        });
    }
});
// POST /api/admin/login - Login administrativo
router.post('/api/admin/login', (req, res) => {
    try {
        const { password } = req.body;
        if (!password || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Credenciais inválidas',
            });
        }
        if (password.length > 200) {
            return res.status(400).json({
                success: false,
                error: 'Credenciais inválidas',
            });
        }
        const expectedPassword = process.env.ADMIN_PASSWORD;
        if (!expectedPassword) {
            console.error('ADMIN_PASSWORD not set in environment variables');
            return res.status(500).json({
                success: false,
                error: 'Erro ao processar autenticação',
            });
        }
        // Usar constant-time comparison para evitar timing attacks
        if (!constantTimeCompare(password, expectedPassword)) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas',
            });
        }
        const token = generateToken();
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao fazer login',
        });
    }
});
// DELETE /api/admin/rsvp - Deletar todos os dados (protegido)
router.delete('/api/admin/rsvp', authMiddleware, async (req, res) => {
    try {
        await deleteAllRSVPs();
        res.json({
            success: true,
            message: 'Todos os dados foram deletados',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao deletar dados',
        });
    }
});
// GET /api/admin/export - Exportar CSV (protegido)
router.get('/api/admin/export', authMiddleware, async (req, res) => {
    try {
        const rsvps = await getAllRSVPs();
        if (rsvps.length === 0) {
            console.warn('[Export] Nenhuma confirmação para exportar');
            return res.status(400).json({
                success: false,
                error: 'Nenhuma confirmação para exportar',
            });
        }
        const headers = [
            'ID',
            'Responsável',
            'Confirmação',
            'Total Pessoas',
            'Participante',
            'Tipo',
            'Idade',
            'Data/Hora',
        ];
        const rows = rsvps.flatMap((rsvp) => {
            if (rsvp.confirmation === 'nao') {
                return [
                    [
                        rsvp.id,
                        rsvp.responsibleName,
                        'Não',
                        '0',
                        '-',
                        '-',
                        '-',
                        new Date(rsvp.timestamp).toLocaleString('pt-BR'),
                    ],
                ];
            }
            return rsvp.participants.map((participant, index) => [
                index === 0 ? rsvp.id : '',
                index === 0 ? rsvp.responsibleName : '',
                index === 0 ? 'Sim' : '',
                index === 0 ? rsvp.totalPeople.toString() : '',
                participant.name,
                participant.isChild ? 'Criança' : 'Adulto',
                participant.age === null ? '-' : participant.age.toString(),
                index === 0 ? new Date(rsvp.timestamp).toLocaleString('pt-BR') : '',
            ]);
        });
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');
        console.log(`[Export] Exportando ${rsvps.length} confirmações (${csvContent.length} bytes)`);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="confirmacoes_aniversario_${Date.now()}.csv"`);
        res.setHeader('Content-Length', Buffer.byteLength(csvContent));
        res.send(csvContent);
    }
    catch (error) {
        console.error('[Export] Erro ao exportar:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao exportar dados',
        });
    }
});
// DELETE /api/admin/rsvp/:id - Deletar RSVP específico (protegido)
router.delete('/api/admin/rsvp/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
            });
        }
        if (id.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'ID inválido',
            });
        }
        await deleteRSVPById(id);
        res.json({
            success: true,
            message: 'Confirmação deletada com sucesso',
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message || 'RSVP não encontrado',
        });
    }
});
export default router;
//# sourceMappingURL=routes.js.map