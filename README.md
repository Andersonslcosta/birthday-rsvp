# 🎂 Sistema de Confirmação de Presença

Aplicação web full-stack para gerenciar confirmações de presença em eventos. Interface moderna e responsiva com painel administrativo protegido, sistema de autenticação JWT e exportação de dados.

## ✨ Recursos

### Para Convidados
- ✅ Formulário intuitivo de confirmação de presença
- 👨‍👩‍👧‍👦 Cadastro de múltiplos participantes
- 📱 Interface 100% responsiva (mobile-first)
- 🎨 Design visual atraente com animações suaves

### Para Administradores
- 🔐 Painel protegido por senha e JWT
- 📊 Estatísticas em tempo real (confirmados, recusas, adultos, crianças)
- 📥 Exportação de lista de convidados em CSV
- 🗑️ Exclusão individual de confirmações
- 👥 Visualização detalhada de todos os participantes

## 🏗️ Arquitetura

### Stack Tecnológica

**Frontend**
- React 18 com TypeScript
- Vite 6 (build tool ultra-rápido)
- Tailwind CSS 4 (estilização utilitária)
- React Router (navegação SPA)
- Motion (animações)
- Lucide Icons

**Backend**
- Node.js com Express 4
- SQLite3 (banco de dados serverless)
- JWT (autenticação stateless)
- bcryptjs (hash de senhas)
- CORS (controle de origem)
- Rate Limiting (proteção contra ataques)

**Deployment**
- Frontend: Vercel (CDN global)
- Backend: Railway (containers)
- CI/CD: Deploy automático via GitHub

## 📂 Estrutura do Projeto

```
birthdaypage/
├── src/                          # 📱 Frontend (React)
│   ├── main.tsx                 # Entry point
│   ├── app/
│   │   ├── App.tsx              # Configuração de rotas
│   │   ├── components/
│   │   │   ├── InvitePage.tsx   # Formulário de confirmação
│   │   │   ├── AdminPanel.tsx   # Painel administrativo
│   │   │   ├── figma/           # Componentes Figma
│   │   │   └── ui/              # Componentes UI reutilizáveis
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── table.tsx
│   │   │       └── ...          # 30+ componentes
│   │   └── utils/
│   │       ├── api.ts           # Cliente HTTP + normalização
│   │       └── storage.ts       # LocalStorage helpers
│   ├── assets/                  # Imagens e recursos
│   └── styles/                  # CSS global
│       ├── index.css
│       ├── tailwind.css
│       ├── fonts.css
│       └── theme.css
│
├── server/                       # 🖥️ Backend (Node/Express)
│   ├── src/
│   │   ├── index.ts             # Server setup + middleware
│   │   ├── routes.ts            # Definição de rotas da API
│   │   ├── database.ts          # Operações do banco SQLite
│   │   └── auth.ts              # JWT + middleware de autenticação
│   ├── data/
│   │   └── birthday.db          # Banco SQLite (criado automaticamente)
│   ├── dist/                    # Código transpilado (TypeScript → JS)
│   ├── .env                     # Variáveis de ambiente (não versionado)
│   ├── .env.example             # Template de configuração
│   ├── package.json
│   └── tsconfig.json
│
├── guidelines/                   # 📄 Documentação
│   └── Guidelines.md
├── index.html                    # HTML raiz
├── package.json                  # Dependências do frontend
├── vite.config.ts               # Configuração Vite (proxy, alias)
├── postcss.config.mjs           # PostCSS config
├── vercel.json                  # Deploy Vercel (SPA rewrites)
├── test-admin.ps1               # Script de teste do painel admin
└── README.md
```

## 🔌 API Endpoints

### Públicos (sem autenticação)
```
POST   /api/rsvp              # Salvar confirmação de presença
GET    /health                # Health check do servidor
```

### Protegidos (requerem JWT)
```
POST   /api/admin/login       # Login administrativo
GET    /api/guests            # Listar todas as confirmações
GET    /api/statistics        # Obter estatísticas
GET    /api/export/csv        # Exportar confirmações em CSV
DELETE /api/rsvp/:id           # Excluir uma confirmação
DELETE /api/admin/clear-data  # Limpar todos os dados
```

### Rate Limiting
- Requisições gerais: **100 por 15 minutos**
- Login administrativo: **5 tentativas por 15 minutos**

## ▶️ Execução Local

### Pré-requisitos
- Node.js 18+ e npm 9+
- Git

### 1. Clone e Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd birthdaypage

# Instale dependências do frontend
npm install

# Instale dependências do backend
cd server
npm install
cd ..
```

### 2. Configuração Backend

Crie o arquivo `server/.env` baseado no exemplo:

```bash
cp server/.env.example server/.env
```

Edite `server/.env` com suas configurações:

```env
NODE_ENV=development
PORT=5000
DATABASE_PATH=./data/birthday.db

# ⚠️ DEFINA UMA SENHA FORTE (mínimo 8 caracteres)
ADMIN_PASSWORD=<sua_senha_forte_aqui>

# ⚠️ GERE COM: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<string_aleatoria_com_64_caracteres_hexadecimais>

# Opcional (valores padrão)
CORS_ORIGIN=http://localhost:5173
MAX_REQUEST_SIZE=10kb
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

**Gerando JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Executar em Desenvolvimento

```bash
# Terminal 1: Frontend (porta 5173)
npm run dev

# Terminal 2: Backend (porta 5000)
cd server
npm run dev
```

Acesse:
- **Frontend**: http://localhost:5173
- **Admin**: http://localhost:5173/admin
- **API**: http://localhost:5000/health

### 4. Testar Painel Admin

Execute o script de teste:
```bash
.\test-admin.ps1
```

Isso valida:
- ✅ Backend respondendo
- ✅ Login funcionando
- ✅ Proxy do Vite configurado
- ✅ Frontend acessível

## 🚀 Deploy em Produção

### Frontend (Vercel)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente:
   ```
   VITE_API_URL=https://seu-backend.railway.app
   ```
3. Deploy automático a cada push na branch `main`

**Arquivo de configuração**: `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend (Railway)

1. Crie um novo projeto no Railway
2. Conecte o repositório e configure root directory: `server`
3. Defina as variáveis de ambiente:
   ```
   NODE_ENV=production
   PORT=5000
   ADMIN_PASSWORD=<senha_forte_aqui>
   JWT_SECRET=<gerado_com_crypto_randomBytes>
   DATABASE_PATH=./data/birthday.db
   ```
4. Deploy automático via GitHub

**Build Command**: `npm run build`  
**Start Command**: `npm start`

## 🔒 Segurança

### Implementado
- ✅ Senhas com hash bcrypt (custo 10)
- ✅ Tokens JWT com expiração de 24h
- ✅ Rate limiting em endpoints sensíveis
- ✅ CORS configurado para domínios específicos
- ✅ Validação de Content-Type
- ✅ Proteção contra timing attacks no login
- ✅ Sanitização de entrada de dados
- ✅ Variáveis sensíveis em `.env` (fora do git)

### Boas Práticas
- 🔐 **Nunca** commite o arquivo `.env`
- 🔑 Use senhas fortes (mínimo 12 caracteres)
- 🔄 Regenere JWT_SECRET em cada ambiente
- 🌐 Configure HTTPS em produção
- 📝 Monitore logs de tentativas de login
- 🚫 Não exponha stack traces em produção

## 📦 Build e Deploy

### Build Frontend
```bash
npm run build
# Gera: dist/ com HTML/CSS/JS otimizados
```

### Build Backend
```bash
cd server
npm run build
# Gera: dist/ com código TypeScript transpilado
npm start
# Executa: node dist/index.js
```

## 🗃️ Banco de Dados

### Schema SQLite

```sql
-- Tabela principal de confirmações
CREATE TABLE rsvps (
  id TEXT PRIMARY KEY,              -- UUID v4
  responsibleName TEXT NOT NULL,     -- Nome do responsável
  confirmation TEXT NOT NULL,        -- 'sim' ou 'nao'
  totalPeople INTEGER NOT NULL,      -- Total de participantes
  participants TEXT NOT NULL,        -- JSON array
  timestamp TEXT NOT NULL,           -- ISO 8601
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Tabela de logs administrativos (opcional)
CREATE TABLE admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TEXT NOT NULL
);
```

**Localização**: `server/data/birthday.db`  
**Backup**: Copie este arquivo para fazer backup dos dados

## 🎨 Customização

### Cores e Tema
Edite `src/styles/theme.css` para ajustar:
- Cores primárias/secundárias
- Fontes tipográficas
- Espaçamentos
- Bordas e sombras

### Informações do Evento
Edite `src/app/components/InvitePage.tsx`:
- Data e horário
- Local do evento
- Texto do convite
- Limite de idade para crianças

## 🧪 Testes

### Teste Manual - Script PowerShell
```bash
.\test-admin.ps1
```

### Teste de Endpoints (curl)
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"sua_senha"}'

# Listar convidados (substitua TOKEN)
curl http://localhost:5000/api/guests \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Monitoramento

### Logs do Servidor
```bash
cd server
npm run dev  # Logs em tempo real
```

### Verificar Banco de Dados
```bash
sqlite3 server/data/birthday.db
sqlite> SELECT COUNT(*) FROM rsvps;
sqlite> SELECT * FROM rsvps ORDER BY timestamp DESC LIMIT 5;
sqlite> .quit
```

## 🐛 Troubleshooting

### Erro: "CORS policy blocked"
- Verifique `CORS_ORIGIN` no `.env`
- Certifique-se que o backend está rodando

### Erro: "JWT must be 32 characters"
- Gere um novo JWT_SECRET com 64 caracteres hex
- Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Erro: "Database locked"
- Feche outras conexões ao banco SQLite
- Reinicie o servidor backend

### Caracteres estranhos (João → JoÃ£o)
- Sistema inclui normalização automática de mojibake UTF-8

## 📝 Licença

MIT License - Sinta-se livre para usar e modificar este projeto.
