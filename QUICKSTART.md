# ⚡ Quick Start - Birthday RSVP

## 🚀 Iniciar em 5 Minutos

### 1️⃣ Instalação
```bash
cd birthdaypage

# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 2️⃣ Configuração
Arquivo `server/.env` já vem pré-configurado. Se precisar alterar senha:
```bash
ADMIN_PASSWORD=sua-nova-senha
```

### 3️⃣ Executar Development

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4️⃣ Acessar
- Frontend: http://localhost:5174 (ou 5173)
- Admin: http://localhost:5174/admin
  - Senha: `pequenopríncipe2025`

---

## 📱 Funcionalidades Principais

### Página de Confirmação
✅ Responsável preenche seu nome
✅ Escolhe "Sim" ou "Não"
✅ Se "Sim", adiciona acompanhantes com nomes e idades
✅ Submete e recebe confirmação

### Painel Admin
🔐 Login protegido por senha
📊 Estatísticas em tempo real
📋 Lista completa de confirmações
📥 Exportar para CSV
🗑️ Limpar dados

---

## 🗄️ Banco de Dados

Localizado em: `server/data/birthday.db`

Estrutura:
- `rsvps` - Confirmações de presença
- `admin_logs` - Histórico de ações admin

---

## 🔧 Comandos Úteis

```bash
# Frontend
npm run build          # Build production
npm run dev            # Dev com hot reload

# Backend
cd server
npm run build          # Compilar TypeScript
npm start              # Executar
npm run dev            # Dev com ts-node

# Test
npm run test           # Testes simples
./test-api.sh          # Testar API (Unix/Linux)
```

---

## 🐛 Erros Comuns

### ❌ "Port 5000 already in use"
```bash
# Kill processo na porta
# Windows: netstat -ano | findstr :5000 && taskkill /PID <PID> /F
# Mac/Linux: lsof -i :5000 && kill -9 <PID>
```

### ❌ "Cannot find module 'cors'"
```bash
cd server && npm install cors
```

### ❌ TypeScript errors
```bash
cd server
npm run build  # Mostra erros
```

### ❌ Banco de dados corrupto
```bash
rm server/data/birthday.db
# Será recriado automaticamente
```

---

## 📦 Deploy Rápido

### Docker (Recomendado)
```bash
docker build -t birthday-rsvp .
docker-compose up -d
```

### Render.com (Mais Fácil)
Ver arquivo `DEPLOYMENT_GUIDE.md`

---

## 🔐 Segurança

**Em Produção:**
1. Mude `ADMIN_PASSWORD` em `server/.env`
2. Gere novo `JWT_SECRET`
3. Configure `CORS_ORIGIN` com seu domínio
4. Use HTTPS

---

## 📊 Estrutura de Dados

### Request para Confirmar Presença
```json
{
  "responsibleName": "João Silva",
  "confirmation": "sim",
  "participants": [
    {"name": "João Silva", "age": 35},
    {"name": "Maria Silva", "age": 5}
  ],
  "totalPeople": 2
}
```

### Response Admin

```json
{
  "totalGuests": 45,
  "confirmed": 30,
  "declined": 15,
  "totalConfirmed": 85,
  "adults": 65,
  "children": 20
}
```

---

## 💡 Dicas

- 🔄 Frontend capta automaticamente nome do responsável
- 👶 Maiores de 18 anos = adultos, menores = crianças
- 📥 Use "Exportar CSV" para planilha Excel
- ⚠️ "Limpar dados" não tem volta!
- 🔗 Compartilhe só o link `/` (Invite Page)
- 🔒 `/admin` é privado com senha

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| Frontend não carrega | Verifique `npm run dev` rodando |
| API não responde | Verifique `npm start` em `server/` |
| Dados desaparecem | Banco SQLite pode ter resetado |
| Senha errada | Verifique `server/.env` |
| CORS error | Confira `CORS_ORIGIN` no backend |

---

**Tudo pronto? Acesse http://localhost:5174 e comece! 🎉**
