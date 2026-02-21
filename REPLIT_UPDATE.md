# 📦 Como Publicar no Replit (Substituição)

Seu Replit atual: https://git-import--andersonslcosta.replit.app/

## ✅ Pré-requisitos

- Você já tem um Replit com o projeto
- GitHub repository: https://github.com/Andersonslcosta/birthday-rsvp
- Acesso ao painel do Replit

---

## 🔄 Opção 1: Atualizar Replit Existente com Git Pull (Mais Fácil)

### Passo 1: Abrir Console do Replit

1. Abra seu Replit em https://git-import--andersonslcosta.replit.app/
2. Clique em "Shell" ou "Console" (aba inferior da tela)

### Passo 2: Puxar Atualizações do GitHub

No console do Replit, execute:

```bash
cd /home/runner/birthday-rsvp
git pull origin main
```

**Resultado esperado:**
```
Updating xxx...xxx
Fast-forward
 arquivo1.js
 arquivo2.tsx
 3 files changed, 50 insertions(+)
```

### Passo 3: Reinstalar Dependências (Se Houver Mudanças)

```bash
npm install
cd server
npm install
npm run build
cd ..
```

### Passo 4: Reiniciar a Aplicação

Clique no botão **"Run"** ou execute:

```bash
npm start
```

**Pronto!** Suas atualizações estão ao vivo.

---

## 🔧 Opção 2: Configurar Variáveis de Ambiente (Secrets)

Se for primeira vez ou precisa configurar passwords:

### Passo 1: Acessar Secrets

1. No Replit, clique na **engrenagem** ⚙️ (Settings)
2. Ou procure por **"Secrets"** na aba esquerda
3. Clique no **ícone de cadeado** 🔒

### Passo 2: Adicionar Variáveis

Adicione cada uma com **"Add new secret"**:

| Variável | Valor | Notas |
|----------|-------|-------|
| `NODE_ENV` | `production` | Configure para produção |
| `PORT` | `5000` | Porta (Replit mapeia automaticamente) |
| `DATABASE_PATH` | `./data/birthday.db` | Sempre assim |
| `ADMIN_PASSWORD` | **Sua senha forte** | Mín 12 caracteres, com números e símbolos |
| `JWT_SECRET` | **Seu secret (64 chars)** | Veja abaixo como gerar |
| `CORS_ORIGIN` | `https://git-import--andersonslcosta.replit.app` | **Cole sua URL do Replit** |
| `MAX_REQUEST_SIZE` | `10kb` | Deixar assim |
| `RATE_LIMIT_WINDOW` | `15m` | Deixar assim |
| `RATE_LIMIT_MAX_REQUESTS` | `5` | Deixar assim |

### Passo 3: Gerar JWT_SECRET Seguro

**No Browser Console (F12):**

```javascript
Array.from(crypto.getRandomValues(new Uint8Array(32)))
  .map(x => x.toString(16).padStart(2, '0'))
  .join('')
```

**Copie o resultado e cole em `JWT_SECRET`**

---

## 🚀 Opção 3: Fazer Deploy Completo do Zero (Se Quiser Recomeçar)

### Passo 1: Deletar o Replit Antigo

1. Vá para https://replit.com/
2. Clique com botão direito no seu projeto
3. **"Delete"**

### Passo 2: Importar Novamente do GitHub

1. Clique **"Create"** (botão azul)
2. Selecione **"Import from GitHub"**
3. Cole: `https://github.com/Andersonslcosta/birthday-rsvp`
4. Deixe o nome como está (ou mude se quiser)
5. Selecione **"Node.js"** como linguagem
6. Clique **"Create Repl"**

### Passo 3: Configurar Secrets (Como em Cima)

### Passo 4: Iniciar

Clique **"Run"** no topo

---

## 📋 Checklist Final

Antes de considerar "pronto":

- [ ] `git pull origin main` executado com sucesso
- [ ] Variáveis de ambiente (Secrets) configuradas
- [ ] `ADMIN_PASSWORD` é sua senha forte
- [ ] `JWT_SECRET` é único e com 64 caracteres
- [ ] `CORS_ORIGIN` contém sua URL do Replit exata
- [ ] Aplicação iniciou sem erros (botão "Run" ficou verde)
- [ ] Consegue acessar a URL do Replit no browser
- [ ] Formulário de RSVP carrega
- [ ] Admin login funciona
- [ ] **CSV Export funciona** ✅

---

## 🌍 URLs Após Publicar

- **Frontend (Formulário):** https://git-import--andersonslcosta.replit.app/
- **Admin Panel:** https://git-import--andersonslcosta.replit.app/#/admin
- **API Health:** https://git-import--andersonslcosta.replit.app/api/health

---

## ⚡ Troubleshooting Rápido

**"Port already in use":**
```bash
lsof -i :5000
kill -9 <PID>
npm start
```

**"Dependencies not found":**
```bash
npm install
cd server && npm install && cd ..
npm run build
```

**"CSS/JS não carrega":**
- Limpar cache do browser: `Ctrl+Shift+Del` ou `Cmd+Shift+Del`
- Fazer hard refresh: `Ctrl+F5`

**"CSV Export não funciona":**
1. Verificar console do browser (F12) → Network tab
2. Verificar se token JWT está sendo enviado
3. Restart a aplicação (`npm start`)

**"Senha não funciona":**
1. Verificar exatamente o valor em `ADMIN_PASSWORD`
2. Reiniciar a aplicação
3. Tentar login novamente

---

## 📞 Proximos Passos

1. ✅ Atualizar código do GitHub (git pull)
2. ✅ Configurar variáveis de ambiente
3. ✅ Reiniciar aplicação
4. ✅ Testar tudo funcionando
5. ✅ Compartilhar URL com convidados!

**Dúvidas?** Verifique:
- `README.md` - Documentação geral
- `REPLIT_DEPLOYMENT.md` - Guia específico Replit
- `SECURITY_AUDIT.md` - Informações de segurança

---

**Status:** 🟢 Pronto para ir ao ar!
