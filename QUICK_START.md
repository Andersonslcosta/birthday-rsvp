# 🚀 QUICK START - Publicar em 5 Minutos

## Seu Replit Atual
https://git-import--andersonslcosta.replit.app/

---

## 📋 Checklist Rápido (Faça na Ordem)

### ✅ Passo 1: Atualizar Código (2 min)

Abra https://git-import--andersonslcosta.replit.app/

Clique em **"Shell"** na parte inferior

Copie e execute:
```bash
cd /home/runner/birthday-rsvp
git pull origin main
npm install
cd server && npm install && npm run build && cd ..
```

---

### ✅ Passo 2: Configurar Variáveis (2 min)

Clique no ícone **🔒 Secrets** na barra esquerda

**Adicione 10 secrets (clique "Add new secret" cada vez):**

| # | Nome | Valor |
|---|------|-------|
| 1 | `NODE_ENV` | `production` |
| 2 | `PORT` | `5000` |
| 3 | `DATABASE_PATH` | `./data/birthday.db` |
| 4 | `ADMIN_PASSWORD` | **Sua senha forte** |
| 5 | `JWT_SECRET` | **Veja abaixo ⬇️** |
| 6 | `CORS_ORIGIN` | `https://git-import--andersonslcosta.replit.app` |
| 7 | `MAX_REQUEST_SIZE` | `10kb` |
| 8 | `RATE_LIMIT_WINDOW` | `15m` |
| 9 | `RATE_LIMIT_MAX_REQUESTS` | `5` |

---

### 🔑 Como Gerar JWT_SECRET

1. Abra seu navegador (F12)
2. Vá até **Console**
3. **Cole e execute:**
```javascript
Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('')
```
4. **Copie o resultado** (64 caracteres aleatórios)
5. **Cole em `JWT_SECRET`** no Replit Secrets

---

### 🔐 Como Criar Sua Senha Forte

**Combine:**
- Maiúsculas: A-Z
- Minúsculas: a-z
- Números: 0-9
- Símbolos: !@#$%^&*

**Exemplos OK:**
- `MyBirthday2026#`
- `EventPass@2026!`
- `Aniversario123!`
- `Pequeno2026@Prince`

**Cole em `ADMIN_PASSWORD`**

---

### ✅ Passo 3: Reiniciar Aplicação (1 min)

Clique no botão **"▶️ Run"** no topo

Espere aparecer:
```
listening on port 5000
```

---

## 🎯 Pronto! Teste Agora

### 1️⃣ Acessar o Formulário
https://git-import--andersonslcosta.replit.app/

Teste preencher um RSVP

### 2️⃣ Acessar Admin
https://git-import--andersonslcosta.replit.app/#/admin

Clique em **"Fazer Login"**
- Use sua **ADMIN_PASSWORD**

### 3️⃣ Testar Export CSV
- Clique em **"Exportar para CSV"**
- Arquivo deve baixar

### 4️⃣ Pronto! 🎉

---

## 🔧 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Erro ao fazer login" | Verificar `ADMIN_PASSWORD` exato |
| "CORS error" | Verificar `CORS_ORIGIN` é exatamente sua URL |
| "CSV não baixa" | Reiniciar aplicação (botão Run) |
| "Página branca" | Limpar cache (Ctrl+Shift+Del) e reload |
| "Senha incorreta" | Clicar em coração ❤️ embaixo da senha |

---

## 📞 URLs Importantes

| Tipo | URL |
|------|-----|
| **Formulário** | https://git-import--andersonslcosta.replit.app/ |
| **Admin** | https://git-import--andersonslcosta.replit.app/#/admin |
| **API** | https://git-import--andersonslcosta.replit.app/api |
| **Health** | https://git-import--andersonslcosta.replit.app/api/health |

---

## ✨ Dicas Extras

**Quer mudar a senha depois?**
- Edit o secret `ADMIN_PASSWORD`
- Click "Run" novamente

**Database automático?**
- ✅ Cria sozinho em `server/data/birthday.db`
- Persiste entre restarts

**CSV com dados reais?**
- Preencha vários RSVPs primeiro
- Depois exporte

---

## 🎉 Pronto para Compartilhar!

Copie e compartilhe esta URL com seus convidados:

```
https://git-import--andersonslcosta.replit.app/
```

---

**Tempo total: ~5 minutos ⏱️**

**Dúvidas?** Ver:
- `REPLIT_UPDATE.md` - Guia detalhado
- `REPLIT_SECRETS.md` - Configuração específica
- `README.md` - Documentação geral
