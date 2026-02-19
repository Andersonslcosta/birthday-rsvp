#!/usr/bin/env pwsh
# Birthday RSVP - Git Setup for GitHub
# Inicializa repositório local e prepara para GitHub

param(
    [string]$GithubUsername,
    [string]$RepoName = "birthday-rsvp"
)

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Git Setup for GitHub                              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$workspacePath = "c:\Users\ander\Downloads\Curso Python\Birthday\birthdaypage"
Set-Location $workspacePath

# ====== 1. VERIFICAR GIT ======
Write-Host "1️⃣  Verificando Git..." -ForegroundColor Yellow
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Host "✓ $gitVersion`n" -ForegroundColor Green
} else {
    Write-Host "❌ Git não instalado. Instale em https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# ====== 2. VERIFICAR .GITIGNORE ======
Write-Host "2️⃣  Verificando .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore encontrado`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore não encontrado - será criado" -ForegroundColor Yellow
    Write-Host "`n"
}

# ====== 3. INICIALIZAR GIT ======
Write-Host "3️⃣  Inicializando repositório Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✓ Repositório Git já existe" -ForegroundColor Green
} else {
    git init
    Write-Host "✓ Repositório criado`n" -ForegroundColor Green
}

# ====== 4. CONFIGURAR GIT ======
Write-Host "4️⃣  Configurando Git..." -ForegroundColor Yellow

# Verificar email e nome
$gitEmail = git config user.email
$gitName = git config user.name

if (-not $gitEmail) {
    Write-Host "📌 Configure seu email no Git:" -ForegroundColor Cyan
    $email = Read-Host "  Email"
    git config user.email $email
}

if (-not $gitName) {
    Write-Host "📌 Configure seu nome no Git:" -ForegroundColor Cyan
    $name = Read-Host "  Nome"
    git config user.name $name
}

Write-Host "✓ Git configurado`n" -ForegroundColor Green

# ====== 5. ADICIONAR ARQUIVOS ======
Write-Host "5️⃣  Adicionando arquivos..." -ForegroundColor Yellow
Write-Host "  Arquivos que serão ignorados:" -ForegroundColor Gray
Write-Host "  - node_modules/" -ForegroundColor Gray
Write-Host "  - .env e .env.* " -ForegroundColor Gray
Write-Host "  - *.db (base de dados)" -ForegroundColor Gray
Write-Host "  - dist/ e build/" -ForegroundColor Gray
Write-Host ""

git add .
$statusOutput = git status
Write-Host $statusOutput | Select-Object -First 20  # Mostra resumo
Write-Host "✓ Arquivos adicionados ao staging`n" -ForegroundColor Green

# ====== 6. COMMIT INICIAL ======
Write-Host "6️⃣  Criando commit inicial..." -ForegroundColor Yellow
git commit -m "Initial commit: Full-stack birthday RSVP application with React + Express"
Write-Host "✓ Commit criado`n" -ForegroundColor Green

# ====== 7. INFORMAR PRÓXIMOS PASSOS ======
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Próximos Passos para GitHub                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📌 PASSO 1: Criar repositório no GitHub" -ForegroundColor Yellow
Write-Host "  1. Acesse https://github.com/new" -ForegroundColor Gray
Write-Host "  2. Nome do repositório: $RepoName" -ForegroundColor Gray
Write-Host "  3. Descrição: Birthday event RSVP with admin dashboard" -ForegroundColor Gray
Write-Host "  4. IMPORTANTE: NÃO inicialize com README, .gitignore ou LICENSE" -ForegroundColor Red
Write-Host "  5. Clique em 'Create repository'" -ForegroundColor Gray
Write-Host ""

Write-Host "📌 PASSO 2: Conectar repositório remoto (após criar no GitHub)" -ForegroundColor Yellow
Write-Host "  Copie e execute:" -ForegroundColor Gray
Write-Host ""
Write-Host "  git branch -M main" -ForegroundColor Cyan
Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/$RepoName.git" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "  (Substitua YOUR_USERNAME pelo seu usuário do GitHub)" -ForegroundColor Gray
Write-Host ""

Write-Host "📌 PASSO 3: Configurar GitHub Secrets (para Deploy)" -ForegroundColor Yellow
Write-Host "  1. Vá em Settings → Secrets and variables → Actions" -ForegroundColor Gray
Write-Host "  2. Crie novo secret: RENDER_API_KEY" -ForegroundColor Gray
Write-Host "     (Encontre em https://dashboard.render.com/api-keys)" -ForegroundColor Gray
Write-Host "  3. Crie novo secret: JWT_SECRET" -ForegroundColor Gray
Write-Host "     (Use um valor seguro aleatório)" -ForegroundColor Gray
Write-Host "  4. Crie novo secret: ADMIN_PASSWORD" -ForegroundColor Gray
Write-Host "     (Use sua senha segura)" -ForegroundColor Gray
Write-Host ""

Write-Host "📌 PASSO 4: Verificar status" -ForegroundColor Yellow
if ($GithubUsername) {
    Write-Host "  git remote -v" -ForegroundColor Cyan
    Write-Host "  (Deve mostrar: origin https://github.com/$GithubUsername/$RepoName.git)" -ForegroundColor Gray
} else {
    Write-Host "  git remote -v" -ForegroundColor Cyan
    Write-Host "  (Deve mostrar a URL do seu repositório)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "✅ Repositório Git está pronto!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor Cyan
Write-Host "  ✓ Git inicializado" -ForegroundColor Gray
Write-Host "  ✓ .gitignore configurado" -ForegroundColor Gray
Write-Host "  ✓ Primeiro commit criado" -ForegroundColor Gray
Write-Host "  ⏳ Aguardando: criar repo no GitHub e fazer push" -ForegroundColor Gray
Write-Host ""
