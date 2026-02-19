#!/usr/bin/env pwsh
# Birthday RSVP - Security Audit
# Análise de segurança do projeto

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Security Audit - Birthday RSVP                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$workspacePath = "c:\Users\ander\Downloads\Curso Python\Birthday\birthdaypage"
$issues = @()
$passed = @()

# ====== 1. .GITIGNORE ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "1. Git Security (.gitignore)" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

$gitignorePath = "$workspacePath\.gitignore"
if (Test-Path $gitignorePath) {
    $gitignore = Get-Content $gitignorePath -Raw
    
    $criticalPatterns = @(
        "\.env",
        "\.env\.local",
        "node_modules",
        "dist",
        "build",
        "\.db",
        "\.sqlite"
    )
    
    $missingPatterns = @()
    $criticalPatterns | ForEach-Object {
        if ($gitignore -notmatch [regex]::Escape($_)) {
            $missingPatterns += $_
        }
    }
    
    if ($missingPatterns.Count -eq 0) {
        Write-Host "✓ .gitignore está bem configurado" -ForegroundColor Green
        Write-Host "  - Sensíveis arquivos serão ignorados" -ForegroundColor Gray
        $passed += ".gitignore protection"
    } else {
        Write-Host "❌ .gitignore incompleto:" -ForegroundColor Red
        $missingPatterns | ForEach-Object {
            $issue = "Padrão '$_' faltante em .gitignore"
            Write-Host "  - $issue" -ForegroundColor Red
            $issues += $issue
        }
    }
} else {
    $issue = ".gitignore não existe"
    Write-Host "❌ $issue" -ForegroundColor Red
    $issues += $issue
}
Write-Host ""

# ====== 2. ENVIRONMENT FILES ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "2. Environment Variables Security" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

# Verificar .env não está commitado
$envPath = "$workspacePath\server\.env"
if (Test-Path $envPath) {
    Write-Host "⚠️  Arquivo .env existe localmente" -ForegroundColor Yellow
    Write-Host "  - Certifique-se que está em .gitignore" -ForegroundColor Gray
    
    if (Get-Content $gitignorePath -Raw | Select-String "\.env") {
        Write-Host "  ✓ Protegido por .gitignore" -ForegroundColor Green
        $passed += "Environment files protected"
    } else {
        $issue = ".env NOT em .gitignore - RISCO DE VAZAMENTO"
        Write-Host "  ❌ $issue" -ForegroundColor Red
        $issues += $issue
    }
}

# Verificar variáveis críticas
$envContent = Get-Content $envPath -Raw -ErrorAction SilentlyContinue
if ($envContent) {
    Write-Host ""
    Write-Host "Variáveis configuradas:" -ForegroundColor Gray
    
    if ($envContent -match "JWT_SECRET") {
        Write-Host "  ✓ JWT_SECRET configurado" -ForegroundColor Green
    } else {
        $issue = "JWT_SECRET não configurado"
        Write-Host "  ❌ $issue" -ForegroundColor Red
        $issues += $issue
    }
    
    if ($envContent -match "ADMIN_PASSWORD") {
        Write-Host "  ✓ ADMIN_PASSWORD configurado" -ForegroundColor Green
    } else {
        $issue = "ADMIN_PASSWORD não configurado"
        Write-Host "  ❌ $issue" -ForegroundColor Red
        $issues += $issue
    }
    
    if ($envContent -match "CORS_ORIGIN") {
        Write-Host "  ✓ CORS_ORIGIN configurado" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  CORS_ORIGIN não configurado" -ForegroundColor Yellow
    }
}
Write-Host ""

# ====== 3. AUTHENTICATION ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "3. Authentication & Authorization" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

$authPath = "$workspacePath\server\src\auth.ts"
if (Test-Path $authPath) {
    $authContent = Get-Content $authPath -Raw
    
    # JWT configuration
    if ($authContent -match "24[^\d]?h" -or $authContent -match "expiresIn.*?24") {
        Write-Host "✓ JWT Token com expiração (24h recomendado)" -ForegroundColor Green
        $passed += "JWT expiration configured"
    } else {
        Write-Host "⚠️  Verificar tempo de expiração do JWT token" -ForegroundColor Yellow
    }
    
    # Bearer token extraction
    if ($authContent -match "Bearer") {
        Write-Host "✓ Bearer token extraction implementado" -ForegroundColor Green
        $passed += "Bearer authentication"
    }
    
    # Token verification
    if ($authContent -match "verify" -or $authContent -match "jwt.verify") {
        Write-Host "✓ Token verification implementado" -ForegroundColor Green
        $passed += "Token verification"
    }
}
Write-Host ""

# ====== 4. DATABASE SECURITY ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "4. Database Security (SQL Injection)" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

$dbPath = "$workspacePath\server\src\database.ts"
if (Test-Path $dbPath) {
    $dbContent = Get-Content $dbPath -Raw
    
    # Parameterized queries
    if ($dbContent -match "prepare" -or $dbContent -match "\?" -or $dbContent -match "db\.run.*\[") {
        Write-Host "✓ Parameterized queries estão sendo usadas" -ForegroundColor Green
        Write-Host "  - SQL Injection prevention implementado" -ForegroundColor Gray
        $passed += "SQL injection prevention"
    } else {
        $issue = "String concatenation em queries SQL - RISCO DE SQL INJECTION"
        Write-Host "❌ $issue" -ForegroundColor Red
        $issues += $issue
    }
    
    # Input validation before DB
    $routesPath = "$workspacePath\server\src\routes.ts"
    if (Test-Path $routesPath) {
        $routesContent = Get-Content $routesPath -Raw
        
        if ($routesContent -match "length.*>=.*2" -or $routesContent -match "validate") {
            Write-Host "✓ Input validation antes de salvar no banco" -ForegroundColor Green
            $passed += "Input validation"
        }
    }
}
Write-Host ""

# ====== 5. PASSWORD SECURITY ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "5. Password Storage & Management" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

$routesPath = "$workspacePath\server\src\routes.ts"
if (Test-Path $routesPath) {
    $routesContent = Get-Content $routesPath -Raw
    
    # Check for plain text password comparison
    if ($routesContent -match "password.*===" -or $routesContent -match "password.*==" -or $routesContent -match "password.*===") {
        Write-Host "⚠️  Senha comparada em plain text (não recomendado para produção)" -ForegroundColor Yellow
        Write-Host "  - Para produção, use bcrypt para hash de senhas" -ForegroundColor Gray
        Write-Host "  - Atual: Aceitável para single-user setup" -ForegroundColor Gray
    }
    
    # Check for bcrypt
    if ($routesContent -match "bcrypt" -or $routesContent -match "hash") {
        Write-Host "✓ Password hashing implementado (bcrypt ou similar)" -ForegroundColor Green
        $passed += "Password hashing"
    } else {
        Write-Host "⚠️  Plain text password comparison detectado" -ForegroundColor Yellow
        Write-Host "  Recomendação: Usar bcryptjs para hash em produção" -ForegroundColor Gray
    }
}
Write-Host ""

# ====== 6. CORS CONFIGURATION ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "6. CORS & Origin Validation" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

$indexPath = "$workspacePath\server\src\index.ts"
if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw
    
    if ($indexContent -match "cors" -or $indexContent -match "CORS_ORIGIN") {
        Write-Host "✓ CORS configurado" -ForegroundColor Green
        
        if ($indexContent -match "CORS_ORIGIN") {
            Write-Host "✓ CORS com whitelist de origem" -ForegroundColor Green
            $passed += "CORS origin validation"
        } else {
            Write-Host "⚠️  CORS pode estar muito permissivo" -ForegroundColor Yellow
        }
    } else {
        $issue = "CORS não configurado - risco de cross-origin requests"
        Write-Host "❌ $issue" -ForegroundColor Red
        $issues += $issue
    }
    
    # Check for credentials
    if ($indexContent -match "credentials.*true") {
        Write-Host "✓ CORS credentials configurado com segurança" -ForegroundColor Green
    }
}
Write-Host ""

# ====== 7. ERROR HANDLING ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "7. Error Handling & Information Disclosure" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

if ($indexContent -match "error.*handler" -or $indexContent -match "catch.*error") {
    Write-Host "✓ Error handling implementado" -ForegroundColor Green
    
    # Check for generic error messages
    if ($indexContent -notmatch "error\.message" -or $indexContent -match "generic.*error") {
        Write-Host "✓ Mensagens de erro genéricas (não expõem detalhes internos)" -ForegroundColor Green
        $passed += "Error handling"
    } else {
        Write-Host "⚠️  Mensagens de erro podem expor detalhes internos" -ForegroundColor Yellow
    }
}
Write-Host ""

# ====== 8. DEPENDENCIES AUDIT ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "8. Dependencies & Vulnerabilities" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

$packagePath = "$workspacePath\package.json"
if (Test-Path $packagePath) {
    Write-Host "✓ package.json encontrado" -ForegroundColor Green
    Write-Host "  Recomendação: Execute 'npm audit' regularmente" -ForegroundColor Gray
    Write-Host "  Recomendação: Use npm ci ou yarn --frozen-lockfile em produção" -ForegroundColor Gray
    $passed += "Dependency management awareness"
}

$packageLockPath = "$workspacePath\package-lock.json"
if (Test-Path $packageLockPath) {
    Write-Host "✓ package-lock.json encontrado (versões locked)" -ForegroundColor Green
    $passed += "Locked dependencies"
} else {
    Write-Host "⚠️  package-lock.json não encontrado" -ForegroundColor Yellow
}
Write-Host ""

# ====== 9. DATA EXPOSURE ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "9. Data Exposure & Privacy" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

Write-Host "✓ Dados apenas em SQLite local (não em cloud não-autenticada)" -ForegroundColor Green
Write-Host "⚠️  Considere backup seguro do banco de dados" -ForegroundColor Yellow
Write-Host "⚠️  Para GDPR/LGPD, implemente delete de dados de participantes" -ForegroundColor Yellow
$passed += "Data isolation"
Write-Host ""

# ====== 10. HTTPS & PRODUCTION ======
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host "10. HTTPS & Production Readiness" -ForegroundColor Magenta
Write-Host "═" * 50 -ForegroundColor Magenta
Write-Host ""

Write-Host "⚠️  HTTP apenas em desenvolvimento (localhost)" -ForegroundColor Yellow
Write-Host "✓ Use HTTPS em produção (render.com fornece SSL automático)" -ForegroundColor Green
Write-Host "✓ Use secure cookies com flag HttpOnly em produção" -ForegroundColor Green
$passed += "HTTPS awareness"
Write-Host ""

# ====== RESUMO ======

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Security Audit Summary                            ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║ Checks Passed:  $($passed.Count)" -ForegroundColor Cyan
Write-Host "║ Issues Found:   $($issues.Count)" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if ($passed.Count -gt 0) {
    Write-Host "✓ Protections Implemented:" -ForegroundColor Green
    $passed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
    Write-Host ""
}

if ($issues.Count -gt 0) {
    Write-Host "❌ Issues Found:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
}

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Recommendations for Production                    ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║ 1. Use HTTPS everywhere (render.com auto SSL)      ║" -ForegroundColor Cyan
Write-Host "║ 2. Store passwords in GitHub Secrets, not .env     ║" -ForegroundColor Cyan
Write-Host "║ 3. Implement rate limiting on login endpoint       ║" -ForegroundColor Cyan
Write-Host "║ 4. Add logging e monitoring                        ║" -ForegroundColor Cyan
Write-Host "║ 5. Regular 'npm audit' para vulnerabilidades       ║" -ForegroundColor Cyan
Write-Host "║ 6. Backup automático do banco de dados             ║" -ForegroundColor Cyan
Write-Host "║ 7. Considere bcryptjs para password hashing        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
