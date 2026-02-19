# 🚀 Guia de Deploy - Birthday RSVP

Este guia mostra como fazer deploy da aplicação em diferentes plataformas.

## Opção 1: Render.com (Recomendado - Mais Fácil)

### Pré-requisitos
- Conta no GitHub com o repositório
- Conta no Render.com

### Passos

1. **Prepare seu repositório Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/birthdaypage.git
   git push -u origin main
   ```

2. **Crie um Web Service no Render**
   - Acesse render.com
   - Clique em "New +" → "Web Service"
   - Selecione seu repositório
   - Configure:
     - **Name**: birthday-rsvp
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build && cd server && npm run build`
     - **Start Command**: `cd server && node dist/index.js`
     - **Region**: Escolha a mais próxima

3. **Configure Variáveis de Ambiente**
   Em "Environment":
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_PATH=./data/birthday.db
   ADMIN_PASSWORD=sua-senha-super-segura
   JWT_SECRET=gere-uma-chave-segura-aqui
   CORS_ORIGIN=https://seu-dominio.onrender.com
   ```

4. **Configure Persistent Disk para Banco de Dados**
   - No painel do Render:
   - Acesse a seção "Disk"
   - Crie um novo disk:
     - Mount Path: `/app/data`
     - Size: 1GB (suficiente)

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde a construção (3-5 minutos)
   - Seu app estará em: `https://birthday-rsvp.onrender.com`

6. **Teste**
   ```bash
   curl https://birthday-rsvp.onrender.com/health
   ```

### Dicas Render
- Grátis com limitações (pode hibernar)
- Plano pago: $7/mês por serviço
- Suporta hot deploy (redeploy automático ao fazer push)

---

## Opção 2: Railway.app

### Pré-requisitos
- Conta no GitHub
- Conta no Railway.app

### Passos

1. **Conecte seu repositório**
   - Acesse railway.app
   - Clique "New Project" → "Deploy from GitHub"
   - Selecione seu repositório

2. **Configure Variáveis**
   - Acesse "Variables"
   - Adicione:
     ```
     NODE_ENV=production
     ADMIN_PASSWORD=sua-senha
     JWT_SECRET=sua-chave-secreta
     PORT=5000
     ```

3. **Configure Build & Start**
   - Acesse "Settings"
   - Start Command: `cd server && npm run build && node dist/index.js`

4. **Deploy**
   - Clique "Deploy"
   - Railway fará o deploy automático

### URL da Aplicação
```
https://<seu-railway-url>.railway.app
```

---

## Opção 3: AWS EC2 (Mais Controle)

### Pré-requisitos
- Conta AWS
- Par de chaves SSH

### Passos

1. **Crie uma instância EC2**
   - AMI: Ubuntu 22.04 LTS free-tier
   - Tipo: t2.micro
   - Security Group: libere portas 22, 80, 443, 5000

2. **Conecte via SSH**
   ```bash
   ssh -i sua-chave.pem ubuntu@seu-ip-ec2
   ```

3. **Instale Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs npm
   ```

4. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/birthdaypage.git
   cd birthdaypage
   npm install
   cd server && npm install && npm run build
   cd ..
   ```

5. **Instale PM2 (para manter app rodando)**
   ```bash
   sudo npm install -g pm2
   ```

6. **Crie .env**
   ```bash
   cp server/.env.example server/.env
   # Edite com suas variáveis
   ```

7. **Inicie com PM2**
   ```bash
   cd server
   pm2 start "node dist/index.js" --name "birthday-rsvp"
   pm2 startup
   pm2 save
   ```

8. **Configure Nginx como reverse proxy**
   ```bash
   sudo apt-get install -y nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Adicione:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo systemctl restart nginx
   ```

9. **Configure SSL com Certbot**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

---

## Opção 4: Docker + Docker Compose (Local ou Servidor)

### Pré-requisitos
- Docker instalado
- Docker Compose instalado

### Passo 1: Build
```bash
docker build -t birthday-rsvp:latest .
```

### Passo 2: Execute
```bash
docker-compose up -d
```

### Passo 3: Verifique
```bash
docker-compose logs -f app
```

### Arquivo .env para docker-compose
```bash
# .env
ADMIN_PASSWORD=sua-senha-segura
JWT_SECRET=seu-jwt-secret-super-seguro
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.com
```

---

## Opção 5: DigitalOcean App Platform

### Pré-requisitos
- Repositório GitHub conectado
- Conta DigitalOcean

### Passos

1. **Acesse App Platform**
   - Create an App → Connect your repository

2. **Configure**
   - Source: GitHub
   - Repository: seu-repo
   - Branch: main

3. **Build configuration**
   Adicione na sua raiz um arquivo `app.yaml`:
   ```yaml
   name: birthday-rsvp
   services:
   - name: api
     github:
       repo: seu-usuario/birthdaypage
       branch: main
     build_command: npm install && npm run build && cd server && npm run build
     run_command: cd server && npm start
     envs:
     - key: NODE_ENV
       value: production
     - key: ADMIN_PASSWORD
       scope: RUN_AND_BUILD_TIME
       value: ${ADMIN_PASSWORD}
     - key: JWT_SECRET
       scope: RUN_AND_BUILD_TIME
       value: ${JWT_SECRET}
   ```

4. **Deploy**
   - Clique "Launch App"
   - DigitalOcean fará o build e deploy

---

## Opção 6: Vercel + Backend Separado

**Nota**: Vercel é otimizado para frontend. Para backend, use outra plataforma.

### Frontend no Vercel
1. `npm run build` localmente
2. Push para GitHub
3. Conecte no Vercel
4. Configure `VITE_API_URL` para sua API

### Backend no Render/Railway
Siga as instruções das opções 1 ou 2 acima.

---

## Configuração de Domínio

### Após Deploy

1. **Obtenha a URL da aplicação**
   - Render: `https://birthday-rsvp.onrender.com`
   - Railway: `https://railway-url.railway.app`
   - AWS/DigitalOcean: seu IP ou domínio

2. **Configure seu domínio (GoDaddy, Namecheap, etc)**
   - Acesse seu registrador
   - Vá para DNS settings
   - Adicione registro A apontando para o IP/URL
   - Ou configure CNAME para a URL da plataforma

3. **Atualize variáveis de ambiente**
   ```
   CORS_ORIGIN=https://seu-dominio.com
   ```

---

## Monitoramento e Manutenção

### Logs
```bash
# Render
render logs birthday-rsvp

# Railway
railway logs

# AWS EC2
pm2 logs birthday-rsvp

# Docker
docker-compose logs -f app
```

### Backup do Banco de Dados
```bash
# Download do Render
curl -O https://seu-render-url/data/birthday.db

# Download do Railway
railway download birthday.db from /app/data

# EC2
scp -i chave.pem ubuntu@ip:/path/to/birthday.db ./backup.db
```

### Atualizar Aplicação
```bash
# Git push para redeploy automático (Render/Railway)
git push origin main

# EC2 manual
cd birthdaypage
git pull
npm install
cd server && npm run build && pm2 restart birthday-rsvp
```

---

## Troubleshooting Deploy

### "Application crash"
```bash
# Verifique logs
# Verifique variáveis de ambiente
# Verifique versão Node.js
```

### "Database errors"
```bash
# Render: garanta Persistent Disk
# Railway: configure um volume
# AWS: garanta /data tem permissões de escrita
```

### "CORS errors"
```bash
# Atualize CORS_ORIGIN no backend
# Certifique-se que é HTTPS em produção
```

### "High memory/CPU"
```bash
# Upgradee o plano
# Otimize consultas ao banco
# Implemente caching
```

---

## Custos Estimados (USD/mês)

| Plataforma | Tier | Custo |
|-----------|------|-------|
| Render | Starter | $7 |
| Railway | Pay-as-you-go | $5-15 |
| AWS EC2 | Free-tier | $0-15 |
| DigitalOcean | Basic | $6 |
| Vercel | Hobby | $0 |

---

## Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados persistente (se applicable)
- [ ] CORS configurado corretamente
- [ ] Senha admin alterada
- [ ] JWT secret alterado
- [ ] Backups configurados
- [ ] HTTPS habilitado
- [ ] Domínio apontando corretamente
- [ ] Monitoramento ativo
- [ ] Testes de funcionalidade completos

---

**Parabéns! Sua aplicação está no ar! 🎉**
