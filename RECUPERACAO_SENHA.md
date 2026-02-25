# Configuração do Sistema de Recuperação de Senha

Este sistema usa **Resend** para enviar emails de recuperação de senha.

## Passos para Configurar

### 1. Criar conta no Resend (GRÁTIS)

1. Acesse [resend.com](https://resend.com)
2. Clique em "Sign Up" e crie sua conta (pode usar GitHub)
3. Confirme seu email

### 2. Obter API Key

1. No dashboard do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "Birthday RSVP")
4. Copie a chave que começa com `re_...`

### 3. Configurar Email

#### Opção A: Email de Teste (desenvolvimento)
- Use `onboarding@resend.dev` como remetente
- Emails só são enviados para o email da conta Resend
- 100% grátis

#### Opção B: Domínio Próprio (produção)
1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `seusite.com`)
4. Adicione os registros DNS fornecidos
5. Aguarde verificação (~5 min)
6. Use emails como `noreply@seusite.com`

### 4. Configurar Variáveis de Ambiente

#### Desenvolvimento Local (`server/.env`):
```env
ADMIN_EMAIL=seu-email-real@gmail.com
RESEND_API_KEY=re_sua_chave_aqui
EMAIL_FROM=onboarding@resend.dev
FRONTEND_URL=http://localhost:5173
```

#### Produção (Railway):
1. Acesse seu projeto no [Railway](https://railway.app)
2. Vá em **Variables**
3. Adicione:
   - `ADMIN_EMAIL` = seu-email-real@gmail.com
   - `RESEND_API_KEY` = re_sua_chave_aqui
   - `EMAIL_FROM` = onboarding@resend.dev (ou seu domínio)
   - `FRONTEND_URL` = https://birthday-rsvp-five.vercel.app
4. O servidor reinicia automaticamente

## Como Usar

### Usuário esqueceu a senha:

1. Na tela de login, clique em **"Esqueci minha senha"**
2. Digite o email cadastrado (ADMIN_EMAIL)
3. Clique em "Enviar Email de Recuperação"
4. Verifique o email (também spam/lixo)
5. Clique no link ou copie o código
6. Digite a nova senha (mínimo 8 caracteres)
7. Confirme a nova senha
8. Clique em "Redefinir Senha"

### Importante:
- O link expira em **30 minutos**
- Após redefinir, você precisa **atualizar a variável `ADMIN_PASSWORD`** no Railway com a nova senha
- A senha é mostrada na tela após redefinição - anote!

## Custos

- **100 emails/dia GRÁTIS** no Resend
- Para seu caso (admin), isso é mais que suficiente
- Sem necessidade de cartão de crédito

## Troubleshooting

### Email não chegou:
- Verifique spam/lixo
- Confirme que ADMIN_EMAIL está correto
- Verifique se RESEND_API_KEY é válida
- Veja logs do servidor: `npm start` (backend)

### Token inválido/expirado:
- Link expira em 30 minutos
- Solicite novo email de recuperação
- Verifique se clicou no link mais recente

### Erro ao enviar email:
- Verifique RESEND_API_KEY
- Confirme que EMAIL_FROM é válido
- Se usar domínio próprio, verifique DNS

## Limites Grátis

- ✅ 100 emails/dia
- ✅ 1 domínio verificado
- ✅ Suporte a anexos
- ✅ Templates HTML

Para mais: [resend.com/pricing](https://resend.com/pricing)
