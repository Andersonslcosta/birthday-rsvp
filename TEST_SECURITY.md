# 🧪 Teste de Funcionalidades LGPD e Segurança

## ✅ Checklist de Testes

Siga os testes abaixo para verificar se todas as mudanças estão funcionando:

---

## 1️⃣ Teste de Token (15min Access + 7d Refresh)

### Objetivo
Verificar se os tokens expiram corretamente e o refresh funciona.

### Passos:

1. **Abrir DevTools** (F12) → Aba **Application/Storage**
2. **Fazer login** no painel admin
   - URL: http://localhost:5173/admin
   - Senha: a mesma configurada em `.env`

3. **Verificar tokens:**
   - **Session Storage** → chave `accessToken`
   - Deverá ter formato: `eyJhbGciOi...` (JWT)
   - Campo `expiresIn` = 900 segundos (15 minutos)

4. **Verificar Refresh Token:**
   - **Cookies** → procure `refreshToken`
   - Deverá ter flag `HttpOnly` ✅ (não visível no JavaScript)
   - Deverá ter flag `Secure` ✅ (HTTPS em produção)
   - Deverá ter flag `SameSite=Strict` ✅

5. **Testar Auto-Refresh (opcional):**
   - Aguarde 15 minutos (ou edite timestamp para simular expiração)
   - Faça uma requisição (ex: clicar em "Exportar CSV")
   - Deverá renovar token automaticamente sem relogin

**✅ Status:** Se viu tokens corretos e flags de segurança → PASSOU

---

## 2️⃣ Teste de Logout (Token Blacklist)

### Objetivo
Verificar se o logout revoga o token imediatamente.

### Passos:

1. **Fazer login**
2. **Copiar o access token** (DevTools → Session Storage)
3. **Clicar em Logout**
4. **Verificar:** Session Storage deve estar VAZIO (token limpo)
5. **Tentar reusar token antigo:**
   ```bash
   curl -H "Authorization: Bearer [TOKEN_ANTIGO]" \
     http://localhost:5000/api/rsvp
   ```
   Resultado esperado: `401 Unauthorized` ✅

**✅ Status:** Se recebeu 401 ao tentar usar token antigo → PASSOU

---

## 3️⃣ Teste de Rate Limiting (Login)

### Objetivo
Verificar proteção contra brute force.

### Passos:

1. **Tentar fazer login 5 vezes com senha errada**
2. **Na 6ª tentativa:** Deverá receber erro:
   ```json
   {
     "success": false,
     "error": "Muitas tentativas de login. Tente novamente em 15 minutos."
   }
   ```

3. **Aguardar 15 minutos** (ou resetar se estiver em desenvolvimento)
4. **Tentar novamente:** Deverá funcionar

**✅ Status:** Se recebeu erro "Muitas tentativas" → PASSOU

---

## 4️⃣ Teste de CSRF Protection

### Objetivo
Verificar proteção contra ataques cross-origin.

### Passos:

1. **De outro site, tentar fazer POST:**
   ```javascript
   // Execute em http://site-diferente.com
   fetch('http://localhost:5000/api/admin/logout', {
     method: 'POST',
     credentials: 'include'
   })
   ```

2. **Resultado esperado:** `403 Forbidden` ou erro CSRF ✅

3. **Do mesmo localhost:** deve funcionar ✅

**✅ Status:** Se requisição de outro domínio foi bloqueada → PASSOU

---

## 5️⃣ Teste de CSV Injection Prevention

### Objetivo
Verificar proteção contra fórmulas maliciosas em Excel.

### Passos:

1. **Criar confirmação com nome perigoso:**
   - Nome: `=1+1` ou `=cmd|'/c ...'`
   - Confirme presença

2. **Exportar CSV** (Painel Admin → Exportar)

3. **Abrir arquivo em Excel/Sheets**

4. **Verificar:** 
   - ❌ NÃO deve executar fórmula
   - ✅ Deverá mostrar: `'=1+1` (com apóstrofo prefixo)

5. **Verificar no CSV raw:**
   ```bash
   cat confirmacoes_aniversario_*.csv | grep "comando"
   ```
   Deverá mostrar: `'=1+1` (escapado)

**✅ Status:** Se viu apóstrofo prefixando → PASSOU

---

## 6️⃣ Teste de Admin Logging

### Objetivo
Verificar se ações administrativas são registradas.

### Passos:

1. **Entração em `.env`:**
   ```
   NODE_ENV=development
   ```

2. **Ver logs no terminal (backend):**
   ```
   [LGPD] deleted 0 old records
   [Logging] admin_login
   [Logging] admin_logout
   [Logging] export_csv
   ```

3. **Verificar banco de dados:**
   ```bash
   sqlite3 server/data/birthday.db
   SELECT * FROM admin_logs ORDER BY timestamp DESC LIMIT 5;
   ```

   Resultado esperado:
   ```
   id | action          | timestamp | details
   1  | admin_login     | ...       | IP: 127.0.0.1
   2  | export_csv      | ...       | 10 registros exportados
   3  | admin_logout    | ...       | IP: 127.0.0.1
   ```

**✅ Status:** Se viu logs em ambos os places → PASSOU

---

## 7️⃣ Teste de LGPD - Limpeza Automática

### Objetivo
Verificar se registros com > 90 dias são deletados.

### Passos:

1. **Verificar configuração em `.env`:**
   ```
   DATA_RETENTION_DAYS=90
   AUTO_CLEANUP_ENABLED=true
   ```

2. **Criar confirmação com data fake (no passado):**
   ```bash
   # Using SQLite directly:
   sqlite3 server/data/birthday.db
   INSERT INTO rsvps (id, responsibleName, confirmation, totalPeople, participantsData, timestamp) 
   VALUES ('old-test', 'Teste Antigo', 'sim', 1, '[{"name":"Teste","age":30}]', 1234567890);
   ```

3. **Fazer request manual de cleanup:**
   ```bash
   curl -H "Authorization: Bearer [TOKEN_VALIDO]" \
     http://localhost:5000/api/admin/cleanup-old
   ```

4. **Resultado esperado:**
   ```json
   {
     "success": true,
     "message": "Limpeza LGPD concluída: 1 registros deletados",
     "deletedCount": 1
   }
   ```

5. **Ver logs:**
   - Terminal: `[LGPD] Deletados 1 RSVPs com mais de 90 dias`
   - Admin logs: `cleanup_old_rsvps` com count

**✅ Status:** Se viu registro deletado → PASSOU

---

## 8️⃣ Teste de Deleção Manual (Direito ao Esquecimento)

### Objetivo
Verificar se convidado pode deletar sua pró confirmação.

### Passos:

1. **Frontend completamente novo:**
   - Abra http://localhost:5173
   - Confirme presença normalmente
   - Anote o ID da confirmação

2. **Voltar para ver lista:**
   - Painel Admin (login)
   - Visualize a confirmação
   - Clique em "Deletar"

3. **Resultado:**
   - Confirmação desaparece da lista ✅
   - Admin logs mostra: `delete_rsvp` ✅
   - Dados são irrecuperáveis ✅

**✅ Status:** Se confirmação foi deletada → PASSOU

---

## 9️⃣ Teste de Validação Zod (Input Security)

### Objetivo
Verificar se inputs inválidos são rejeitados.

### Passos:

1. **Tentar submeter RSVP com dados inválidos:**
   ```bash
   curl -X POST http://localhost:5000/api/rsvp \
     -H "Content-Type: application/json" \
     -d '{
       "responsibleName": "",
       "confirmation": "maybe",
       "participants": [],
       "totalPeople": -1
     }'
   ```

2. **Resultado esperado:** `400 Bad Request` com mensagem de erro clara

3. **Tentar com dados válidos:**
   ```bash
   curl -X POST http://localhost:5000/api/rsvp \
     -H "Content-Type: application/json" \
     -d '{
       "responsibleName": "João Silva",
       "confirmation": "sim",
       "totalPeople": 2,
       "participants": [{"name":"João Silva","age":35},{"name":"Maria","age":33,"isChild":false}]
     }'
   ```

4. **Resultado esperado:** `200 OK` com ID de confirmação

**✅ Status:** Se inválido foi rejeitado e válido foi aceito → PASSOU

---

## 🔟 Teste de Performance (Token Refresh)

### Objetivo
Verificar se renovação de token é transparente (< 100ms).

### Passos:

1. **Abrir DevTools** → Aba **Network**
2. **Filtrar:** Apenas requisições para `/api/admin/refresh`
3. **Fazer uma ação** que expire token:
   - Terminal: aguarde 15 minutos, OU
   - DevTools: edite `sessionStorage` para expirar token
   - Clique em "Exportar CSV"

4. **Ver em Network:**
   - `POST /api/admin/refresh` (automático)
   - Tempo: < 100ms ✅
   - Response: novo token com 900s (15min)

5. **Resultado:**
   - Exportação completa
   - Sem necessidade de relogin
   - Transparente para o usuário ✅

**✅ Status:** Se refresh foi automático → PASSOU

---

## 📊 Resumo Final

| # | Teste | Status | Prioridade |
|---|-------|--------|-----------|
| 1 | Token (15min + 7d) | ⏳ Pendente | 🔴 Alta |
| 2 | Logout (Blacklist) | ⏳ Pendente | 🔴 Alta |
| 3 | Rate Limiting | ⏳ Pendente | 🟡 Média |
| 4 | CSRF | ⏳ Pendente | 🟡 Média |
| 5 | CSV Injection | ⏳ Pendente | 🟡 Média |
| 6 | Admin Logging | ⏳ Pendente | 🟣 Baixa |
| 7 | LGPD Cleanup Auto | ⏳ Pendente | 🔴 Alta |
| 8 | Deleção Manual | ⏳ Pendente | 🔴 Alta |
| 9 | Validação Zod | ⏳ Pendente | 🟡 Média |
| 10 | Token Refresh Perf | ⏳ Pendente | 🟣 Baixa |

---

## 🚨 Troubleshooting

### Erro: "Token inválido" após login
- [ ] Verificar se JWT_SECRET é idêntico em dev/prod
- [ ] Verificar se refresh token cookie está sendo salvo
- [ ] Limpar sessionStorage e cookies antes de retentar

### Rate limiting não funciona
- [ ] Verificar se NODE_ENV ≠ development
- [ ] Em dev mode, rate limiting é DESATIVADO para facilitar testes
- [ ] Para testar, coloque NODE_ENV=production

### Cleanup automático não roda
- [ ] Verificar AUTO_CLEANUP_ENABLED=true
- [ ] Verificar DATA_RETENTION_DAYS está configurado
- [ ] Ver logs: `[LGPD] Auto-cleanup executed`

### CSV tem caracteres estranhos
- [ ] Abrir com UTF-8 encoding
- [ ] Se Excel insiste em ANSI: use "Dados" → "De Texto"
- [ ] Escolher delimitador `;` (ponto-e-vírgula)

---

## 📞 Suporte

Qualquer dúvida sobre testes:
- Verificar logs em tempo real: terminal do backend
- Usar DevTools do navegador (F12)
- Verificar banco: `sqlite3 server/data/birthday.db .schema`
