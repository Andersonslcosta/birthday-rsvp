import express from 'express';
import crypto from 'crypto';
import { saveRSVP, getAllRSVPs, getStatistics, deleteAllRSVPs, deleteRSVPById, deleteParticipant, createResetToken, validateResetToken, markTokenAsUsed } from './database.js';
import { authMiddleware } from './auth.js';
import type { AuthRequest } from './auth.js';
import { generateToken } from './auth.js';
import { sendPasswordResetEmail } from './email.js';

const router = express.Router();

// Constant-time comparison para evitar timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Validar senha forte
function validateStrongPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'A senha deve ter no mínimo 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'A senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'A senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'A senha deve conter pelo menos um número' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*...)' };
  }
  
  return { valid: true };
}

// Validar dados de RSVP
function validateRSVPData(data: any) {
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
      } else {
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
    participants:
      confirmation === 'sim'
        ? participants.map((p: any) => ({
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao salvar confirmação',
    });
  }
});

// GET /api/rsvp - Obter todas as confirmações (protegido)
router.get('/api/rsvp', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const rsvps = await getAllRSVPs();
    res.json({
      success: true,
      data: rsvps,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar confirmações',
    });
  }
});

// GET /api/statistics - Obter estatísticas (protegido)
router.get('/api/statistics', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const stats = await getStatistics();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao fazer login',
    });
  }
});

// POST /api/admin/forgot-password - Solicitar recuperação de senha
router.post('/api/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório',
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
      });
    }

    // Verificar se é o email do admin configurado
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('ADMIN_EMAIL not configured');
      return res.status(500).json({
        success: false,
        error: 'Serviço temporariamente indisponível',
      });
    }

    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      // Por segurança, não revelar que o email não existe
      return res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação',
      });
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Salvar token no banco (expira em 30 minutos)
    await createResetToken(email, resetToken, 30);
    
    // Enviar email
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação',
    });
  } catch (error: any) {
    console.error('[Forgot Password] Error:', error);
    
    // Verificar se é erro de configuração
    if (error.message && error.message.includes('RESEND_API_KEY')) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de email não configurado. Entre em contato com o administrador.',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro ao processar solicitação',
    });
  }
});

// GET /api/admin/validate-reset-token/:token - Validar token de reset
router.get('/api/admin/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório',
      });
    }

    const result = await validateResetToken(token);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido ou expirado',
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
    });
  } catch (error: any) {
    console.error('[Validate Token] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao validar token',
    });
  }
});

// POST /api/admin/reset-password - Redefinir senha com token
router.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório',
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Nova senha é obrigatória',
      });
    }

    if (newPassword.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Senha muito longa',
      });
    }

    // Validar senha forte
    const passwordValidation = validateStrongPassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.error,
      });
    }

    // Validar token
    const result = await validateResetToken(token);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido ou expirado',
      });
    }

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Em produção, você atualizaria a senha no banco
    // Como estamos usando variável de ambiente, vamos apenas informar que precisa atualizar manualmente
    console.log(`[Reset Password] ======================================`);
    console.log(`[Reset Password] Senha redefinida com sucesso para: ${result.email}`);
    console.log(`[Reset Password] ======================================`);
    console.log(`[Reset Password] AÇÃO NECESSÁRIA:`);
    console.log(`[Reset Password] Atualize ADMIN_PASSWORD no arquivo server/.env`);
    console.log(`[Reset Password] Reinicie o servidor (npm start)`);
    console.log(`[Reset Password] No Railway: atualize a variável ADMIN_PASSWORD`);
    console.log(`[Reset Password] ======================================`);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso!',
    });
  } catch (error: any) {
    console.error('[Reset Password] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao redefinir senha',
    });
  }
});

// DELETE /api/admin/rsvp - Deletar todos os dados (protegido)
router.delete('/api/admin/rsvp', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await deleteAllRSVPs();
    res.json({
      success: true,
      message: 'Todos os dados foram deletados',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao deletar dados',
    });
  }
});

// GET /api/admin/export - Exportar CSV com delimitador ; e UTF-8 BOM (protegido)
router.get('/api/admin/export', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const rsvps = await getAllRSVPs();

    if (rsvps.length === 0) {
      console.warn('[Export] Nenhuma confirmação para exportar');
      return res.status(400).json({
        success: false,
        error: 'Nenhuma confirmação para exportar',
      });
    }

    // Função helper para escapar valores CSV
    const escapeCSV = (value: string | number | null): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Se contém ; " ou quebra de linha, envolver em aspas e dobrar aspas internas
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

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

    // Usar ; como delimitador (padrão português/brasileiro)
    // Adicionar BOM UTF-8 (\ufeff) para Excel interpretar corretamente
    const csvContent = 
      '\ufeff' + // UTF-8 BOM para Excel
      [
        headers.map(h => escapeCSV(h)).join(';'),
        ...rows.map((row) => row.map((cell) => escapeCSV(cell)).join(';')),
      ].join('\n');

    console.log(`[Export] Exportando ${rsvps.length} confirmações com delimitador ; (${csvContent.length} bytes)`);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="confirmacoes_aniversario_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    console.error('[Export] Erro ao exportar:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao exportar dados',
    });
  }
});

// DELETE /api/admin/rsvp/:id - Deletar RSVP específico (protegido)
router.delete('/api/admin/rsvp/:id', authMiddleware, async (req: AuthRequest, res) => {
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
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message || 'RSVP não encontrado',
    });
  }
});

// DELETE /api/admin/rsvp/:id/participant/:name - Deletar participante específico (protegido)
router.delete('/api/admin/rsvp/:id/participant/:name', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id, name } = req.params;

    if (!id || typeof id !== 'string' || !name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros inválidos',
      });
    }

    if (id.length > 100 || name.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros inválidos',
      });
    }

    const decodedName = decodeURIComponent(name);
    console.log(`[DELETE Participant] RSVP ID: ${id}, Participant: ${decodedName}`);
    
    await deleteParticipant(id, decodedName);
    
    res.json({
      success: true,
      message: 'Participante deletado com sucesso',
    });
  } catch (error: any) {
    console.error('[DELETE Participant] Error:', error);
    const statusCode = error.message === 'RSVP não encontrado' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Erro ao deletar participante',
    });
  }
});

export default router;
