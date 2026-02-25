# 🔒 Segurança - Gestão de Senhas e Credenciais

## ⚠️ Princípios Fundamentais

Este documento estabelece as boas práticas de segurança para proteger dados sensíveis em conformidade com LGPD e SOX.

---

## ❌ O QUE NUNCA FAZER

1. **Expo senhas em arquivos commitados no Git**
   ```bash
   # ❌ ERRADO
   ADMIN_PASSWORD=MinhaSenh123!
   API_KEY=sk_test_abc123xyz
   ```

2. **Comitar arquivos .env**
   ```bash
   # ❌ Arquivo .env NO git
   git add .env
   ```

3. **Compartilhar credenciais em chat/email**
   ```
   ❌ "A senha é senhaErrada123!"
   ❌ Enviar PDF com credenciais
   ```

4. **Usar senhas padrão/fracas**
   ```
   ❌ admin/admin
   ❌ 123456
   ❌ password
   ```

5. **Logar dados sensíveis**
   ```typescript
   // ❌ ERRADO
   console.log('Password:', password);
   console.log('Token:', apiKey);
   ```

---

## ✅ O QUE FAZER

### 1. Arquivo `.env` (Desenvolvimento Local)

**Criar:**
```bash
cp server/.env.example server/.env
```

**Editar com seus valores:**
```env
NODE_ENV=development
ADMIN_PASSWORD=SuaSenhaUnicaForte123!   # Mínimo 8 chars
JWT_SECRET=gereedorAlfanumericoAleatório  # Use gerador
RESEND_API_KEY=re_seu_token_aqui       # De https://resend.com
```

**Nunca comitar:**
```bash
# Já no .gitignore
.env          ✅ Ignorado
.env.local    ✅ Ignorado
.env.*        ✅ Ignorado
```

### 2. Railway (Produção)

**Variáveis de Ambiente no Dashboard:**

1. Acesse https://railway.app/
2. Selecione projeto → Serviço → Variables
3. Adicione cada variável:

```
JWT_SECRET              → Gere aleatoriamente (min 32 chars)
ADMIN_PASSWORD          → Senha forte única
ADMIN_EMAIL             → Email verificado
RESEND_API_KEY          → De https://resend.com
EMAIL_FROM              → onboarding@resend.dev (teste)
FRONTEND_URL            → https://seu-dominio.vercel.app
NODE_ENV                → production
```

⚠️ **Nunca compartilhe essas variáveis em texto plano**

### 3. Vercel (Frontend)

**Environment Variables:**

1. Acesse Project Settings → Environment Variables
2. Adicione sob "Production":

```
VITE_API_URL            → https://seu-api-railway.app
```

---

## 🔐 Geração de Senhas Fortes

### Requisitos
- ✅ Mínimo **8 caracteres**
- ✅ **Maiúscula** (A-Z)
- ✅ **Minúscula** (a-z)
- ✅ **Número** (0-9)
- ✅ **Caractere especial** (!@#$%^&*)

### Ferramentas Online
- https://bitwarden.com/password-generator/ (Recomendado)
- https://www.gnerated.com/
- Command line: `openssl rand -base64 32`

### Exemplo de Senha Forte
```
✅ Pequeno@Principe2026
✅ Festa#Aniversario123
✅ P@rtidos!2026Com
```

---

## 🗝️ Geração de JWT_SECRET

```bash
# No terminal (macOS/Linux)
openssl rand -hex 32

# Resultado exemplo:
# a7f2e9c1b4d8f3a6e9b2c5f8d1a4e7b0c3f6a9d2e5f8b1c4d7e0a3f6b9c2d5
```

**Rails (Node):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📧 Resend API Key

1. Crie conta em https://resend.com (grátis - 100 emails/dia)
2. Vá em **API Keys** → **Copy Key**
3. Cole em variável de ambiente `RESEND_API_KEY`
4. **Nunca compartilhe essa chave**

**Formato:** `re_xxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔄 Rotação de Senhas

### Desenvolvimento (Local)
```
Periodicidade: A cada 3 meses
Ação: Atualizar server/.env
```

### Produção (Railway)
```
Periodicidade: A cada 6 meses
Ação: 
1. Gerar nova senha
2. Copiar ADMIN_PASSWORD na variável
3. Deploy automático recria senha
4. Usar nova senha no login
```

---

## 🚨 Se Credenciais Forem Expostas

### 1. Mudar IMEDIATAMENTE
```bash
# Local
vim server/.env           # Nova senha em ADMIN_PASSWORD

# Railway  
Dashboard → Variables → ADMIN_PASSWORD → Novo valor

# Resend
Se API Key exposta:
- Revoke em https://resend.com/api-keys
- Gerar nova chave
```

### 2. Verificar Git History
```bash
# Ver se foi commitada
git log --all -- server/.env

# Se foi, fazer rebase (cuidado - apenas se privado)
git filter-branch --tree-filter 'rm -f server/.env' HEAD
```

### 3. Informar Time
- Se repo é público: ativar GitHub Alerts
- Se privado: aviso ao time

---

## ✅ Checklist de Segurança

- [ ] .env não está no git (`git status`)
- [ ] `.env` está em `.gitignore`
- [ ] Senhas têm 8+ caracteres
- [ ] Senhas contêm maiúscula, minúscula, número, especial
- [ ] JWT_SECRET tem 32+ caracteres aleatórios
- [ ] Código não loga `password`, `token`, `apiKey`
- [ ] Railway tem todas as variáveis preenchidas
- [ ] Vercel tem VITE_API_URL configurado
- [ ] Ninguém tem acesso ao .env local
- [ ] Histórico de git não contém senhas

---

## 📚 Referências Externas

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [LGPD - Lei Geral Proteção Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [SOX Compliance](https://www.sarbanes-oxley.org/)

---

## 🆘 Suporte

Dúvidas sobre segurança? Consulte este arquivo ou levante issue privada no GitHub.
