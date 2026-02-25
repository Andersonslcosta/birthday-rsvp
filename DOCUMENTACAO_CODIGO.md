# 📚 Guia de Documentação do Código

## 🎯 Objetivo

Este documento explica a **arquitetura do projeto**, a **conexão entre arquivos** e **padrões de código** utilizados. Serve como referência para entender como o sistema funciona e manter boas práticas.

---

## 📁 Estrutura do Projeto

```
birthdaypage/
├── server/                      # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts            # Inicialização do servidor Express
│   │   ├── auth.ts             # Autenticação JWT
│   │   ├── database.ts         # Operações SQLite e tokens
│   │   ├── email.ts            # Integração Resend (envio de emails)
│   │   └── routes.ts           # Endpoints da API
│   ├── data/
│   │   └── birthday.db         # Banco de dados SQLite
│   └── dist/                   # Código compilado (npm run build)
│
├── src/                         # Frontend (React + TypeScript)
│   ├── app/
│   │   ├── App.tsx             # Roteamento principal
│   │   ├── components/
│   │   │   ├── AdminPanel.tsx  # Dashboard admin com login
│   │   │   ├── InvitePage.tsx  # Formulário de RSVP
│   │   │   ├── ForgotPassword.tsx    # Reset de senha (parte 1)
│   │   │   ├── ResetPassword.tsx     # Reset de senha (parte 2)
│   │   │   └── ui/             # Componentes genéricos (Shadcn)
│   │   └── utils/
│   │       ├── api.ts          # Chamadas HTTP para backend
│   │       └── storage.ts      # localStorage para JWT
│   └── main.tsx                # Entrada React
│
└── package.json                # Dependências do projeto
```

---

## 🔄 Fluxo de Dados: Conexão Entre Arquivos

### 1. **Autenticação (Login)**

```
InvitePage.tsx (Frontend)
    ↓
api.ts → adminLogin()
    ↓
routes.ts → POST /api/admin/login
    ↓
auth.ts → verifyPassword() + generateToken()
    ↓
JWT Token retornado → localStorage (storage.ts)
```

**Arquivos envolvidos:**
- `src/app/components/AdminPanel.tsx` - UI de login
- `src/app/utils/api.ts` - Função `adminLogin(password)`
- `server/src/auth.ts` - Validação e geração JWT
- `server/src/routes.ts` - Endpoint POST `/api/admin/login`
- `src/app/utils/storage.ts` - Persistência do token

---

### 2. **Recuperação de Senha**

```
ResetPassword.tsx (Frontend)
    ↓
api.ts → requestPasswordReset() / resetPassword()
    ↓
routes.ts → POST /api/admin/forgot-password
              GET /api/admin/validate-reset-token
              POST /api/admin/reset-password
    ↓
email.ts → sendPasswordResetEmail() [Resend API]
    ↓
database.ts → createResetToken() / validateResetToken()
```

**Arquivos envolvidos:**
- `src/app/components/ForgotPassword.tsx` - Solicitação de reset
- `src/app/components/ResetPassword.tsx` - Formulário de nova senha
- `src/app/utils/api.ts` - Funções de comunicação
- `server/src/routes.ts` - 3 endpoints de reset
- `server/src/email.ts` - HTML + envio via Resend
- `server/src/database.ts` - Gerenciamento de tokens (30min expiração)

---

### 3. **Buscar/Atualizar RSVPs**

```
AdminPanel.tsx (Frontend)
    ↓
api.ts → getGuests() / getStatistics() / deleteRSVP()
    ↓
routes.ts → GET /api/admin/rsvp
             DELETE /api/admin/rsvp/:id
    ↓
database.ts → getRSVPs() / deleteRSVPById()
    ↓
birthday.db (SQLite)
```

---

## 🛠️ Componentes Principais

### Backend

#### `server/src/index.ts`
**Função:** Inicialização do servidor Express
**O que faz:**
- Carrega `.env` com variáveis de configuração
- Configura CORS para Vercel/localhost
- Inicia banco de dados SQLite
- Registra rotas de API
- Escuta na porta 5000

**Dependências:**
- `database.ts` - Inicialização do banco
- `routes.ts` - Endpoints da API
- `auth.ts` - Validação JWT

---

#### `server/src/auth.ts`
**Função:** Autenticação e geração de tokens JWT
**O que faz:**
- Gera JWT com 24h expiração
- Valida JWT em requisições
- Verifica senha do admin
- Middleware de proteção

**Variáveis de ambiente necessárias:**
- `JWT_SECRET` - Chave para assinar tokens
- `ADMIN_PASSWORD` - Senha do painel admin

---

#### `server/src/database.ts`
**Função:** Operações com SQLite
**O que faz:**
- Cria/atualiza tabelas (rsvps, password_reset_tokens)
- Salva respostas RSVP
- Gerencia tokens de reset (cria, valida, marca como usado)
- Limpa tokens expirados

**Tabelas principais:**
```sql
-- RSVPs do evento
CREATE TABLE rsvps (
  id UNIQUE PRIMARY KEY,
  name TEXT NOT NULL,
  attending TEXT NOT NULL,
  totalParticipants INTEGER,
  adultsCount INTEGER,
  childrenCount INTEGER,
  participants TEXT,
  timestamp INTEGER
)

-- Tokens para reset de senha (expira em 30 min)
CREATE TABLE password_reset_tokens (
  id INTEGER PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  used BOOLEAN DEFAULT 0,
  createdAt INTEGER
)
```

---

#### `server/src/email.ts`
**Função:** Integração com Resend para envio de emails
**O que faz:**
- Conecta à API do Resend
- Envia email HTML de reset de senha
- Inclui link válido por 30 minutos

**Variáveis de ambiente necessárias:**
- `RESEND_API_KEY` - Chave da API Resend
- `EMAIL_FROM` - Email remetente (onboarding@resend.dev em teste)
- `FRONTEND_URL` - URL para incluir no link de reset

**Segurança (LGPD):**
- Não expõe dados sensíveis em logs
- Email template é HTML estruturado
- Link com token único e expiração

---

#### `server/src/routes.ts`
**Função:** Definição de todos os endpoints da API
**O que faz:**
- 10+ endpoints para login, RSVP, admin, recuperação
- Validação de entrada
- Autenticação JWT em rotas protegidas
- Tratamento de erros

**Endpoints principais:**
```
POST   /api/admin/login                    - Autenticação
GET    /api/admin/rsvp                     - Lista RSVPs
POST   /api/rsvp                           - Criar RSVP
DELETE /api/admin/rsvp/:id                 - Deletar RSVP
POST   /api/admin/forgot-password          - Solicitação de reset
GET    /api/admin/validate-reset-token/:token
POST   /api/admin/reset-password           - Atualizar senha
```

---

### Frontend

#### `src/app/App.tsx`
**Função:** Roteamento principal da aplicação
**O que faz:**
- Define rotas públicas (/, /admin/forgot-password)
- Define rotas privadas (/admin protegida por JWT)
- Integra React Router

---

#### `src/app/components/InvitePage.tsx`
**Função:** Página principal de RSVP
**O que faz:**
- Formulário de confirmação presença
- Adicionar acompanhantes
- Validação em tempo real
- Envio para banco de dados

---

#### `src/app/components/AdminPanel.tsx`
**Função:** Dashboard administrativo
**O que faz:**
- Login JWT
- Lista de confirmações
- Estatísticas
- Exportação CSV
- Deleção de RSVPs

**Fluxo de login:**
1. Usuário digita senha
2. `api.ts`→ POST `/api/admin/login`
3. Backend valida em `auth.ts`
4. Token retornado
5. Salvo em `localStorage` via `storage.ts`
6. Requisições subsequentes incluem token em header `Authorization`

---

#### `src/app/components/ForgotPassword.tsx` + `ResetPassword.tsx`
**Função:** Sistema de recuperação de senha
**Fluxo:**
1. Usuário clica "Esqueci minha senha" (AdminPanel.tsx)
2. Digita email → POST `/api/admin/forgot-password`
3. Backend envia email com link de reset (email.ts)
4. Usuário clica link com token na URL
5. ResetPassword.tsx valida token → GET `/api/admin/validate-reset-token/:token`
6. Usuário criar nova senha forte (8+ chars, maiúscula, minúscula, número, especial)
7. POST `/api/admin/reset-password` com token + nova senha
8. Token marcado como usado (database.ts)
9. Redireciona para login

**Segurança (LGPD/SOX):**
- Token válido por 30 minutos apenas
- Email não revelado (proteção contra enumeração de usuários)
- Senha não é armazenada em variável de ambiente (segurança)
- Requer reiniciar servidor após reset para carregar nova senha do .env

---

#### `src/app/utils/api.ts`
**Função:** Camada de comunicação com backend
**O que faz:**
- Centraliza todas as chamadas HTTP
- Gerencia headers (Authorization com JWT)
- Logging de requisições
- Tratamento de erros padronizado

**Padrão de função:**
```typescript
// GET com autenticação
export async function getGuests(token: string) {
  return fetchAPI('/api/admin/rsvp', { }, token);
}

// POST com dados
export async function adminLogin(password: string) {
  return fetchAPI('/api/admin/login', { 
    method: 'POST',
    body: JSON.stringify({ password })
  });
}
```

---

#### `src/app/utils/storage.ts`
**Função:** Gerenciar localStorage para persistência de JWT
**O que faz:**
- Salva token ao fazer login
- Recupera token ao recarregar página
- Remove token ao logout

---

## 🔐 Segurança e Conformidade

### LGPD (Lei Geral de Proteção de Dados)

✅ **Implementado:**
- Emails de reset não revelam se conta existe (proteção contra enumeração)
- Tokens com expiração (30 min)
- Logs não incluem senhas
- Dados sensíveis em variáveis de ambiente (não no git)

⚠️ **Considerar:**
- Adicionar política de privacidade
- Consentimento explícito para armazenar email

### SOX (Sarbanes-Oxley)

✅ **Implementado:**
- Auditoria de ações admin (função `logAdminAction`)
- JWT com expiração de 24h
- Validação de entrada em todas as rotas
- CORS restritivo em produção

---

## 🚀 Deployment

### Vercel (Frontend)
- Executado automaticamente via GitHub
- Arquivo `vercel.json` configura routing
- Variável `VITE_API_URL` aponta para Railway

### Railway (Backend)
- Node.js app
- **Variáveis de ambiente necessárias:**
  ```
  JWT_SECRET
  ADMIN_PASSWORD
  ADMIN_EMAIL
  RESEND_API_KEY
  EMAIL_FROM
  FRONTEND_URL
  NODE_ENV=production
  ```
- Redeploy automático ao fazer push

---

## 📝 Padrões de Código Utilizados

### Tratamento de Erros
Todos os endpoints retornam JSON estruturado:
```typescript
// Sucesso (2xx)
{ success: true, data: {...} }

// Erro (4xx-5xx)
{ success: false, error: "Mensagem descritiva" }
```

### Autenticação
Padrão JWT em header:
```
Authorization: Bearer <token>
```

### Validação
- Email: regex simples
- Senha: 5+ checks (tamanho, maiúscula, minúscula, número, especial)
- Nome: caracteres alfanuméricos + espaço

---

## 🔗 Dependências Principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| `express` | ^4.20 | Framework backend |
| `sqlite3` | ^5.1 | Banco de dados |
| `jsonwebtoken` | ^9.1 | Autenticação JWT |
| `resend` | ^3.0 | Envio de emails |
| `react` | ^18.3 | Framework frontend |
| `typescript` | ^5.6 | Tipagem estática |
| `vite` | ^6.3 | Build tool |
| `tailwindcss` | ^3.4 | Estilos CSS |

---

## 🧪 Testando Localmente

### 1. Iniciar Backend
```bash
cd server
npm run build  # Compilar TypeScript
npm start      # Inicia servidor (porta 5000)
```

### 2. Iniciar Frontend
```bash
npm run dev    # Inicia Vite (porta 5173)
```

### 3. Testar Fluxos

**Login:**
- Acesse http://localhost:5173/admin
- Senha: Configurada em `server/.env` variável `ADMIN_PASSWORD`

**RSVP:**
- Acesse http://localhost:5173
- Preencha formulário

**Recuperação de Senha:**
- Clique "Esqueci minha senha"
- Digite: `anderson.aslc@hotmail.com` (email configurado)
- Verifique o email recebido (modo teste - localmente não há email)

---

## 📚 Documentação Adicional

- **[RAILWAY_CONFIG.md](RAILWAY_CONFIG.md)** - Variáveis de ambiente Railway
- **[RECUPERACAO_SENHA.md](RECUPERACAO_SENHA.md)** - Sistema de reset detalhado
- **[QUICKSTART.md](QUICKSTART.md)** - Início rápido
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Comandos úteis

---

## ❓ FAQ

**P: Por que o JWT expira em 24h?**
R: Segurança. Force fazer login novamente periodicamente. Pode ajustar em `auth.ts`.

**P: Como adicionar novo campo na tabela RSVP?**
R: Editar `database.ts` → função `initDatabase()` → adicionar coluna → rodar migrations.

**P: Posso usar MySQL em vez de SQLite?**
R: Sim, precisaria instalar `mysql2` e adaptar funções em `database.ts`.

**P: Como desativar o reset de senha?**
R: Remover rotas em `routes.ts` e componentes `ForgotPassword.tsx` + `ResetPassword.tsx`.

---

## 📞 Suporte

- Errros de build: Verificar `npm install` e versão Node.js
- Senha não funciona: Verificar `server/.env` ADMIN_PASSWORD
- Email não chega: Verificar RESEND_API_KEY e ADMIN_EMAIL no Railway
