# 🔐 SECRETS CONFIGURATION - Copie e Cole no Replit

## Como Usar Este Arquivo

1. Abra seu Replit: https://git-import--andersonslcosta.replit.app/
2. Clique no ícone de **cadeado 🔒** na barra lateral
3. Para **cada linha abaixo**, clique em "Add new secret"
4. Copie exatamente o nome (esquerda) e valor (direita)

---

## ⚠️ IMPORTANTE - CUSTOMIZE ESTES VALORES:

### 1. Gerar seu JWT_SECRET (64 caracteres aleatórios)

**Abra o Console do Browser (F12) e execute:**

```javascript
Array.from(crypto.getRandomValues(new Uint8Array(32)))
  .map(x => x.toString(16).padStart(2, '0'))
  .join('')
```

Copie o resultado completo e cole abaixo.

---

### 2. Gerar sua Senha Forte

Use uma senha com:
- Mínimo 12 caracteres
- Letras maiúsculas: A-Z
- Letras minúsculas: a-z
- Números: 0-9
- Símbolos: !@#$%^&*

**Exemplo:** `MyEvent2026@Birthday!` ou `ConvidoBolo2025#`

---

## 📋 SECRETS PARA COPIAR

Clique em "Add new secret" para cada um:

```
Nome: NODE_ENV
Valor: production

Nome: PORT
Valor: 5000

Nome: DATABASE_PATH
Valor: ./data/birthday.db

Nome: ADMIN_PASSWORD
Valor: [SUA_SENHA_FORTE_AQUI]

Nome: JWT_SECRET
Valor: [SEU_JWT_SECRET_64_CHARS_AQUI]

Nome: CORS_ORIGIN
Valor: https://git-import--andersonslcosta.replit.app

Nome: MAX_REQUEST_SIZE
Valor: 10kb

Nome: RATE_LIMIT_WINDOW
Valor: 15m

Nome: RATE_LIMIT_MAX_REQUESTS
Valor: 5
```

---

## 🔄 Passo a Passo Completo no Replit

### 1. Obter sua URL Exata

1. Abra https://git-import--andersonslcosta.replit.app/
2. Copie a URL completa da barra do navegador
3. Use em `CORS_ORIGIN`

### 2. Gerar Valores Seguros

**JWT_SECRET (executar no console do browser F12):**
```javascript
Array.from(crypto.getRandomValues(new Uint8Array(32)))
  .map(x => x.toString(16).padStart(2, '0'))
  .join('')
```

**ADMIN_PASSWORD:** Use uma senha forte que SÓ VOCÊ conhece

### 3. Adicionar os Secrets

1. Clique no ícone 🔒
2. "Add new secret"
3. Nome: `NODE_ENV`
4. Valor: `production`
5. Clique checkmark ✔️
6. **Repita para todos os 10 secrets**

### 4. Atualizar Código do GitHub

No Console do Replit:
```bash
cd /home/runner/birthday-rsvp
git pull origin main
npm install
cd server && npm install && npm run build && cd ..
npm start
```

### 5. Testar

- Acesse https://git-import--andersonslcosta.replit.app/
- Tente fazer um RSVP
- Vá para `/admin`
- Teste login e export CSV

---

## ✨ Seu JWT_SECRET Gerado

**Após executar no console, copiar EXATAMENTE este valor completo:**

```
[Cole aqui o resultado do comando JavaScript acima]
```

---

## ✨ Sua Senha do Admin

**Escolha UMA e use em todos os logins admin:**

```
[Cole sua senha forte aqui]
```

---

## 📍 Sua URL Replit Exata

**Use NO secret CORS_ORIGIN:**

```
https://git-import--andersonslcosta.replit.app
```

---

## ✅ Verificação Final

Após adicionar todos os secrets:

1. Clique "Run" no Replit
2. Aguarde mensagem: "Secret added"
3. Reload na página do navegador
4. Teste login com sua senha
5. Teste export CSV

---

## 🆘 Dúvidas?

**"Esqueci qual é meu JWT_SECRET?"**
- Execute novamente no console do browser
- Ele não precisa ser o mesmo sempre

**"Preciso mudar a senha?"**
1. Editar o secret `ADMIN_PASSWORD`
2. Reiniciar aplicação
3. Use a nova senha

**"Não consigo fazer login"**
- Verificar se `ADMIN_PASSWORD` está exatamente correto
- Reiniciar a aplicação
- Limpar cache do browser (Ctrl+Shift+Del)

---

**Pronto para publicar ao vivo? ✅**
