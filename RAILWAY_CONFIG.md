# Configuração Railway - Recuperação de Senha

## ⚠️ Variáveis de Ambiente Necessárias

Para ativar o sistema de recuperação de senha em produção, você precisa adicionar as seguintes variáveis de ambiente no Railway:

### 1. Acessar Railway Dashboard
1. Acesse https://railway.app/
2. Selecione seu projeto: `birthday-rsvp-production`
3. Clique no serviço do backend
4. Vá em **Variables** (aba lateral)

### 2. Adicionar Variáveis

Clique em **+ New Variable** e adicione cada uma:

```env
# Email do administrador (deve ser o email verificado no Resend)
ADMIN_EMAIL=seu-email-verificado@exemplo.com

# Chave da API Resend (obtida em https://resend.com/api-keys)
# ⚠️ Mantenha esta chave em segredo - não compartilhe!
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email remetente (use onboarding@resend.dev apenas para teste)
# Para produção, use um domínio próprio verificado
EMAIL_FROM=onboarding@resend.dev

# URL do frontend em produção (Vercel)
FRONTEND_URL=https://seu-dominio-vercel.vercel.app
```

#### ⚠️ Instruções de Segurança:

1. **ADMIN_EMAIL**: Use o email que foi verificado na sua conta Resend
2. **RESEND_API_KEY**: Obtenha em https://resend.com/api-keys (não compartilhe!)
3. **EMAIL_FROM**: 
   - Desenvolvimento: use `onboarding@resend.dev` (emails de teste)
   - Produção: configure um domínio próprio no Resend
4. **FRONTEND_URL**: Use a URL do seu Vercel (não localhost)

### 3. Deploy Automático

Após adicionar as variáveis:
1. Railway fará redeploy automático
2. Aguarde 2-3 minutos
3. Teste o link "Esqueci minha senha" em produção

### 4. Verificar Logs

Se houver problemas:
1. Clique em **Deployments**
2. Selecione o deploy mais recente
3. Verifique os logs para erros

### 5. Testar Recuperação

1. Acesse https://birthday-rsvp-five.vercel.app/admin
2. Clique em "Esqueci minha senha"
3. Digite: anderson.aslc@hotmail.com
4. Verifique o email

## ⚡ Resend - Modo Teste

**Importante**: No plano gratuito do Resend, emails são enviados apenas para o email verificado da conta (anderson.aslc@hotmail.com).

Para enviar emails para outros endereços:
1. Adicione um domínio próprio no Resend
2. Ou faça upgrade para o plano pago

## 🔒 Notas de Segurança

- **RESEND_API_KEY**: Mantenha em segredo, não compartilhe
- **ADMIN_PASSWORD**: Atualize também com a nova senha se fizer reset
- Os tokens de reset expiram em 30 minutos
- Não é necessário reiniciar o Railway, ele faz automaticamente

## 📚 Documentação

- Resend: https://resend.com/docs
- Railway Variables: https://docs.railway.app/develop/variables
