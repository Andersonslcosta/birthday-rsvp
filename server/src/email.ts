import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured in environment variables');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${resetToken}`;
  
  try {
    const client = getResendClient();
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Recuperação de Senha - Painel Admin',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .code { background: #e5e7eb; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; margin: 15px 0; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎂 Recuperação de Senha</h1>
              </div>
              <div class="content">
                <p>Olá,</p>
                <p>Recebemos uma solicitação para redefinir a senha do painel administrativo.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Redefinir Senha</a>
                </div>
                
                <p>Ou copie e cole este link no seu navegador:</p>
                <div class="code">${resetUrl}</div>
                
                <p><strong>⏰ Este link expira em 30 minutos.</strong></p>
                
                <p>Se você não solicitou a recuperação de senha, ignore este email. Sua senha permanecerá inalterada.</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, por favor não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    console.log(`[Email] Password reset email sent to: ${email}`);
  } catch (error) {
    console.error('[Email] Error sending password reset email:', error);
    throw new Error('Falha ao enviar email de recuperação');
  }
}
