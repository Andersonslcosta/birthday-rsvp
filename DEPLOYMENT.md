# 🎂 Birthday RSVP - Confirmação de Presença em Evento

Uma aplicação web moderna para gerenciar confirmações de presença em eventos de festa/aniversário. Desenvolvida com React, TypeScript, Vite, Express.js e SQLite.

## ✨ Características

- ✅ Formulário responsivo para confirmação de presença
- ✅ Captura de nomes e idades dos participantes/acompanhantes
- ✅ Painel administrativo protegido por senha
- ✅ Visualização de estatísticas em tempo real
- ✅ Exportação de dados para CSV
- ✅ Backend com validação robusta de dados
- ✅ Banco de dados SQLite persistente
- ✅ Design moderno com Tailwind CSS e animações
- ✅ Suporte para deployment com Docker
- ✅ API REST documentada

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilos
- **Radix UI** para componentes acessíveis
- **React Router** para navegação
- **Sonner** para notificações

### Backend
- **Node.js** com Express.js
- **TypeScript**
- **SQLite3** para persistência de dados
- **JWT** para autenticação admin
- **CORS** para aceitar requisições do frontend

## 📋 Requisitos

- Node.js >= 18.0.0
- npm ou pnpm
- Docker (opcional, para deployment)

## 🚀 Iniciando o Projeto

### 1. Instalação Local

Clone ou extraia o projeto:

```bash
cd birthdaypage
```

Instale as dependências do frontend:

```bash
npm install
```

Instale as dependências do backend:

```bash
cd server
npm install
cd ..
```

### 2. Configuração de Variáveis de Ambiente

Frontend (`.env.development`):
```env
VITE_API_URL=http://localhost:5000
```

Backend (`server/.env`):
```env
NODE_ENV=development
PORT=5000
DATABASE_PATH=./data/birthday.db
ADMIN_PASSWORD=SuaSenhaForte123!
JWT_SECRET=seu-secret-jwt-super-seguro
CORS_ORIGIN=http://localhost:5174,http://localhost:5173
```

### 3. Execução em Desenvolvimento

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Acesse:
- Frontend: http://localhost:5174 (ou 5173)
- Admin: http://localhost:5174/admin
- API Health: http://localhost:5000/health

## 📁 Estrutura do Projeto

```
birthdaypage/
├── src/                          # Frontend
│   ├── app/
│   │   ├── components/
│   │   │   ├── InvitePage.tsx   # Formulário de confirmação
│   │   │   ├── AdminPanel.tsx   # Painel administrativo
│   │   │   └── ui/              # Componentes UI reutilizáveis
│   │   ├── utils/
│   │   │   └── api.ts           # Cliente API
│   │   └── App.tsx              # Roteamento
│   ├── main.tsx
│   └── styles/
├── server/                       # Backend
│   ├── src/
│   │   ├── index.ts             # Entry point do servidor
│   │   ├── database.ts          # Operações com banco de dados
│   │   ├── routes.ts            # Rotas da API
│   │   └── auth.ts              # Middleware de autenticação
│   ├── data/                    # Banco de dados SQLite
│   └── package.json
├── package.json
├── vite.config.ts
├── Dockerfile                   # Para containerização
├── docker-compose.yml          # Orquestração de containers
└── README.md
```

## 🔌 API Endpoints

### Públicos

#### POST `/api/rsvp`
Salvar confirmação de presença.

Request:
```json
{
  "responsibleName": "João Silva",
  "confirmation": "sim",
  "participants": [
    {"name": "João Silva", "age": 35},
    {"name": "Maria Silva", "age": 32},
    {"name": "Pedro Silva", "age": 5}
  ],
  "totalPeople": 3
}
```

Response (201):
```json
{
  "success": true,
  "message": "Confirmação salva com sucesso",
  "data": {
    "id": "1708365600000",
    "responsibleName": "João Silva",
    "confirmation": "sim",
    "totalPeople": 3,
    "participants": [...],
    "timestamp": "2024-02-18T...",
    "createdAt": "2024-02-18T...",
    "updatedAt": "2024-02-18T..."
  }
}
```

#### POST `/api/admin/login`
Fazer login administrativo.

Request:
```json
{
  "password": "SuaSenhaForte123!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Protegidos (Requer Bearer Token)

#### GET `/api/rsvp`
Listar todas as confirmações.

Headers: `Authorization: Bearer {token}`

Response (200):
```json
{
  "success": true,
  "data": [...]
}
```

#### GET `/api/statistics`
Obter estatísticas de confirmações.

Headers: `Authorization: Bearer {token}`

Response (200):
```json
{
  "success": true,
  "data": {
    "totalGuests": 45,
    "confirmed": 30,
    "declined": 15,
    "totalConfirmed": 85,
    "adults": 65,
    "children": 20
  }
}
```

#### GET `/api/admin/export`
Exportar dados em CSV.

Headers: `Authorization: Bearer {token}`

Response: Arquivo CSV

#### DELETE `/api/admin/rsvp`
Deletar todos os dados.

Headers: `Authorization: Bearer {token}`

Response (200):
```json
{
  "success": true,
  "message": "Todos os dados foram deletados"
}
```

## 🏷️ Campos do Formulário

| Campo | Tipo | Obrigatório | Notas |
|-------|------|------------|-------|
| Nome Responsável | Text | Sim | Mínimo 2 caracteres |
| Confirmação | Radio (sim/não) | Sim | - |
| Participantes | Array | Sim (se sim) | Incluindo responsável |
| Nome Participante | Text | Sim | - |
| Idade Participante | Number | Sim | 0-120 anos |

## 🔒 Segurança

- Validação de dados no backend
- Proteção CORS configurável
- JWT para autenticação admin
- Senha administrativo via variável de ambiente
- SQL injection prevention usando prepared statements

## 📦 Build e Deployment

### Build Local

```bash
# Frontend
npm run build

# Backend
cd server
npm run build
cd ..
```

Arquivos gerados:
- Frontend: `dist/`
- Backend: `server/dist/`

### Deployment com Docker

1. Build da imagem:
```bash
docker build -t birthday-rsvp .
```

2. Executar container:
```bash
docker run -p 5000:5000 \
  -e ADMIN_PASSWORD='sua-senha' \
  -e JWT_SECRET='seu-jwt-secret' \
  -v ./data:/app/data \
  birthday-rsvp
```

3. Ou usar Docker Compose:
```bash
docker-compose up -d
```

### Cloud Deployment

#### Render.com (Recomendado)
1. Conecte seu repositório Git
2. Escolha ambiente Node.js
3. Configure variáveis de ambiente
4. Deploy automático

#### Heroku (Descontinuado)
Considere alternativas como Render, Railway, ou Fly.io

#### AWS/DigitalOcean
Use Docker ou configure máquina virtual direto com Node.js

## 🧪 Testes

```bash
# Verificar erros de TypeScript
npm run type-check

# Frontend development
npm run dev

# Backend development
cd server
npm run dev

# Build completo
npm run build
cd server && npm run build
```

## 📊 Dados do Banco de Dados

SQLite armazena:
- RSVPs (confirmações)
- Admin logs (histórico de ações)

Localização: `server/data/birthday.db`

Para reset:
```bash
rm server/data/birthday.db
```

Database será recriado automaticamente na próxima execução.

## 🎯 Fluxo de Uso

1. **Visitante acessa**: `https://seu-dominio.com`
2. **Preenche formulário** com seus dados
3. **Confirma presença** ou declina
4. **Recebe confirmação** via toast notification
5. **Admin acessa**: `/admin`
6. **Faz login** com senha
7. **Visualiza estatísticas e lista completa**
8. **Exporta dados** como CSV

## 🐛 Troubleshooting

### Porta já em uso

Terminal:
```bash
# Windows
netstat -ano | findstr ":5000"
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Banco de dados corrompido
```bash
rm server/data/birthday.db
npm restart
```

### CORS errors
Verifique `CORS_ORIGIN` no `server/.env`

### TypeScript errors
```bash
cd server
npm run build
```

## 📝 Licença

MIT

## 👨‍💻 Suporte

Para reportar bugs ou solicitar features, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para celebrações especiais**
