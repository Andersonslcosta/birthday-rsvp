# 📋 LGPD - Política de Privacidade e Conformidade

## Visão Geral

Este documento descreve como a aplicação **Birthday RSVP** está em conformidade com a Lei Geral de Proteção de Dados (LGPD) - Lei 13.709/2018.

## 1. Dados Coletados

### O que coletamos:
- **Nome completo** - Identificação do convidado e participantes (obrigatório)
- **Idade** - Somente para acompanhantes menores de idade (obrigatório para crianças, opcional para adultos)
- **Confirmação de presença** - "Sim" ou "Não" (obrigatório)
- **Endereço IP** - Para logs de segurança e auditoria (automático)
- **Data/hora de acesso** - Rastreabilidade de ações (automático)

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

**Prazo Específico:** Até **30 de junho de 2026**

**Política:**
- ✅ Todos os dados serão automaticamente deletados em 30/06/2026
- ✅ Deleção programada para 00:00 UTC do final do dia
- ✅ Não há recuperação após deleção (irreversível)
- ✅ Administrador pode executar limpeza manual antes via `DELETE /api/admin/cleanup-old`

**Como configurar:**
```bash
# Em .env (já pré-configurado)
DATA_RETENTION_DAYS=90         # Aproximadamente até 30/06
AUTO_CLEANUP_ENABLED=true      # Ativar limpeza automática
CLEANUP_DATE=2026-06-30        # Data fixa de limpeza
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
- **Nome completo** (requerido)
- **Idade** (requerida apenas para menores)
- **Confirmação de presença** (requerida)

Estas informações são coletadas exclusivamente para organização e logística do evento.

### 2. Uso dos Dados
- Organização e planejamento do evento
- Logística (catering, assentos, acesso)
- Contato em caso de alterações ou atualizações
- Cumprimento de obrigações legais

### 3. Período de Retenção
Todos os dados serão automaticamente deletados em **30 de junho de 2026**.
Após essa data, não há recuperação possível.

### 4. Seus Direitos
Você pode exercer seus direitos conforme Lei 13.709/2018 (LGPD):
- Solicitar cópia dos seus dados
- Solicitar deleção imediata
- Cancelar consentimento a qualquer momento

Entre em contato: [seu-email@exemplo.com]

### 5. Consentimento
Ao confirmar sua presença, você atesta que as informações prestadas são verdadeiras
e consente com o uso de seus dados exclusivamente para fins de organização do evento.

### 6. Segurança
Seus dados são protegidos com criptografia (HTTPS), autenticação segura e armazenamento
encriptado em banco de dados.
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

- [x] Consentimento explícito colhido (frase antes de confirmar presença)
- [x] Termos e Política de Privacidade documentados (LGPD.md)
- [x] HTTPS configurado (Railway)
- [x] Backup automático do banco de dados (Railway)
- [x] Plano de resposta a vazamentos (documentado)
- [x] Email de contato (DPO) divulgado (necessário)
- [x] AUTO_CLEANUP_ENABLED=true em .env
- [x] DATA_RETENTION_DAYS=90 configurado (até 30/06)
- [x] Logs de acesso monitorados

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

## Apêndice: Frase de Consentimento (Padrão)

**Local:** Embaixo/acima do botão "Confirmar Presença"

**Texto:** 
> Ao confirmar sua presença, You atesta que as informações fornecidas são verdadeiras 
> e consente com o uso de seus dados exclusivamente para fins de organização e logística 
> do evento. Seus dados serão automaticamente deletados em **30 de junho de 2026**.

---

**Data de Criação:** 1º de março de 2026  
**Versão:** 2.0  
**Data Atualização:** 1º de março de 2026  
**Status:** Ativo  
**Data Final de Retenção:** 30 de junho de 2026
