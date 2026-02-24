# 🎂 RSVP de Aniversário

Aplicação web para confirmar presença em eventos com painel administrativo e exportação de dados. Frontend em React e backend em Node/Express com banco SQLite.

## ✨ Recursos

- Formulário responsivo de confirmação de presença
- Painel administrativo com estatísticas
- Exportação de dados em CSV
- Banco de dados SQLite (arquivo local)

## 🧩 Tecnologias

- **Frontend:** React • TypeScript • Vite • Tailwind CSS
- **Backend:** Node.js • Express • SQLite • JWT • CORS

## ▶️ Execução local

### Pré-requisitos
- Node.js 18+
- npm

### Instalação

```bash
npm install
cd server
npm install
```

### Configuração

Crie o arquivo `server/.env` com valores próprios. **Nunca** publique esse arquivo.

Exemplo seguro:

```bash
NODE_ENV=development
PORT=5000
DATABASE_PATH=./data/birthday.db
ADMIN_PASSWORD=<defina_uma_senha_forte>
JWT_SECRET=<defina_um_segredo_aleatorio_com_no_minimo_32_caracteres>
```

### Rodar

```bash
# Terminal 1
npm run dev

# Terminal 2
cd server
npm run dev
```

Abra `http://localhost:5173`.

## 🔒 Segurança

- Não existe credencial dentro do repositório.
- O arquivo `.env` fica fora do controle de versão.
- Não compartilhe senhas, tokens ou URLs privadas em documentação pública.
- Use HTTPS em produção e defina variáveis de ambiente na plataforma de deploy.

## 📦 Build

```bash
# Frontend
npm run build

# Backend
cd server
npm run build
npm start
```

## 🗂️ Estrutura

```
src/                 # Frontend
server/              # Backend
server/data/         # Banco SQLite
```

## 📄 Licença

MIT
