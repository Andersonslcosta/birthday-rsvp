# 📋 LGPD - Política de Privacidade e Conformidade

## Visão Geral

Este documento descreve como a aplicação **Birthday RSVP** está em conformidade com a Lei Geral de Proteção de Dados (LGPD) - Lei 13.709/2018.

## 1. Dados Coletados

### O que coletamos:
- **Nome completo** - Identificação do convidado e participantes
- **Idade** (opcional) - Categorização de adultos/crianças
- **Confirmação de presença** - "Sim" ou "Não"
- **Endereço IP** - Para logs de segurança e auditoria
- **Data/hora de acesso** - Rastreabilidade de ações

### O que NÃO coletamos:
- ❌ Email (não obrigatório para RSVP)
- ❌ Telefone
- ❌ Endereço
- ❌ CPF ou documentos de identidade
- ❌ Dados biométricos

## 2. Base Legal

**Artigo 7, Inciso I da LGPD:** Consentimento do titular para o tratamento de seus dados pessoais para fins específicos.

Antes de confirmar a presença, o usuário deve aceitar os **Termos de Uso e Política de Privacidade**.

## 3. Período de Retenção

**Padrão:** 90 (noventa) dias após a data do evento

**Política:**
- ✅ Dados são automaticamente deletados após 90 dias
- ✅ Limpeza automática executada diariamente às 00:00 UTC
- ✅ Administrador pode executar limpeza manual via `DELETE /api/admin/cleanup-old`

**Como configurar:**
```bash
# Em .env
DATA_RETENTION_DAYS=90         # Dias antes de deletar
AUTO_CLEANUP_ENABLED=true      # Ativar limpeza automática
```

## 4. Direitos do Titular (Art. 18, LGPD)

### 4.1 Direito de Acesso (Art. 18, I)
O convidado pode solicitar visualizar seus dados:
- Contate o administrador por email
- Será fornecido CSV com dados pessoais
- Prazo de resposta: até 15 dias úteis

### 4.2 Direito de Retificação (Art. 18, II)
Dados podem ser corrigidos:
- ❌ Não há edição frontend disponível
- ✅ Contate o administrador para atualizar informações
- Prazo: até 15 dias úteis

### 4.3 Direito ao Esquecimento (Art. 18, III)
**"Direito de Ser Esquecido"**

3 formas de exercer:
1. **Auto-deleção:** Use o botão "Deletar minha confirmação" (frontend)
2. **Email:** Solicite deleção ao administrador
3. **Automático:** Deletado após 90 dias (padrão)

**Endpoint:** `DELETE /api/admin/rsvp/:id`
- Deleta confirmação e todos os participantes
- Irreversível

### 4.4 Direito de Portabilidade (Art. 20)
Dados em formato estruturado (CSV):
- Endpoint: `GET /api/admin/export`
- Requer autenticação de administrador
- Formato: CSV com UTF-8 BOM
- Pronto para importação em Google Sheets / Excel

### 4.5 Direito de Oposição (Art. 21)
Direito de se opor ao tratamento:
- Solicite parada do processamento por email
- Não afeta dados já processados

## 5. Segurança dos Dados

### Criptografia
- ✅ **Em trânsito:** HTTPS obrigatório em produção
- ✅ **Senhas:** Hash bcrypt com salt (custo 10)
- ✅ **Tokens JWT:** Assinados com HS256

### Acesso
- ✅ **Controle de acesso:** Apenas administrador com senha
- ✅ **Autenticação:** JWT + refresh tokens (15min + 7d)
- ✅ **Rate limiting:** 5 tentativas de login / 15 minutos
- ✅ **Proteção CSRF:** Validação de referer header
- ✅ **Logs:** Todas as ações de admin são registradas

### Proteção contra Injeção
- ✅ **CSV Injection:** Caracteres perigosos escapados (=, +, -, @, \t)
- ✅ **SQL Injection:** Prepared statements (parameterized queries)
- ✅ **XSS:** Frontend sanitizado com React

## 6. Auditoria

### Admin Logs
Todas as ações administrativas são registradas:

| Ação | O que é registrado |
|------|------------------|
| `admin_login` | Login bem-sucedido, IP |
| `admin_logout` | Logout, IP |
| `export_csv` | Número de registros, tamanho |
| `delete_rsvp` | ID da confirmação deletada |
| `cleanup_old_rsvps` | Número de registros deletados |

**Armazenamento:** Tabela `admin_logs` no SQLite
**Retenção:** Indefinida (apenas logs administrativos)

**Ver logs:**
```typescript
// server/src/database.ts
logAdminAction('acao', 'detalhes')
```

## 7. Conformidade Técnica

### Checklist LGPD
- ✅ Coleta mínima de dados (princípio da necessidade)
- ✅ Base legal clara (consentimento)
- ✅ Período de retenção definido
- ✅ Direito de acesso implementado
- ✅ Direito ao esquecimento implementado
- ✅ Direito de portabilidade implementado
- ✅ Logs de auditoria
- ✅ Segurança dos dados
- ✅ Proteção de senhas
- ✅ CORS e validação de entrada

### Itens Fora de Escopo
- 🔲 Processamento biométrico
- 🔲 Dados sensíveis (raça, religião, saúde)
- 🔲 Dados de menores < 13 anos (sem consentimento parental)
- 🔲 Tratamento automatizado (perfilação)

## 8. Terceiros (Controladores)

### Fornecedores de Infraestrutura
- **Railway** (Hosting backend) - Possui termo de processamento
- **Vercel** (Hosting frontend) - Possui termo de processamento
- **Resend** (Emails) - Possui termo de processamento

Todos os fornecedores são conformes com LGPD e GDPR.

## 9. Política de Privacidade (Modelo)

Use o texto abaixo como base para seu site:

```markdown
## Política de Privacidade

### 1. Informações Coletadas
Coletamos nome, idade (opcional) e confirmação de presença apenas para organização do evento.

### 2. Uso dos Dados
- Organização e planejamento do evento
- Logística (catering, assentos)
- Contato em caso de alterações

### 3. Período de Retenção
Dados são deletados automaticamente 90 dias após o evento.

### 4. Seus Direitos
Você pode:
- Solicitar cópia dos seus dados
- Solicitar deleção
- Cancelar consentimento

Entre em contato: [seu-email@exemplo.com]

### 5. Segurança
Seus dados são protegidos com criptografia e autenticação.
```

## 10. Exercendo Direitos

### Como o Titular Solicita Direitos

**Email padrão para enviar:**
```
Assunto: Exercício de Direitos LGPD - [Birthday RSVP]

Corpo:
Senhores [organizador],

Solicito exercer meu direito de [acesso/deleção/portabilidade] 
conforme Art. 18 da LGPD.

Nome: [seu nome]
Data de confirmação: [data]

Agradeço a atenção.
```

**Prazo Legal para Resposta:** Até 15 dias úteis

## 11. Checklist para Produção

Antes de usar em produção:

- [ ] Consentimento explícito colhido (botão/checkbox)
- [ ] Termos e Política de Privacidade acessíveis
- [ ] HTTPS configurado
- [ ] Backup automático do banco de dados
- [ ] Plano de resposta a vazamentos
- [ ] Email de contato (DPO) divulgado
- [ ] AUTO_CLEANUP_ENABLED=true em .env
- [ ] DATA_RETENTION_DAYS configurado
- [ ] Logs de acesso monitorados

## 12. Contato (DPO)

Designar um **Encarregado de Dados Pessoais (DPO)**:

```
Nome: [seu nome]
Email: [seu-email@exemplo.com]
Telefone: [seu telefone]
```

Disponibilizar este contato na página inicial ou footer.

## 13. Referências

- 📘 [Lei 13.709/2018 - LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- 📘 [Guia da ANPD](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- 📘 [OWASP Privacy](https://owasp.org/www-project-privacy-by-design/)

---

**Data de Criação:** 1º de março de 2026  
**Versão:** 1.0  
**Status:** Ativo
