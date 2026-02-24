#!/usr/bin/env pwsh
# Script de teste do painel administrativo

Write-Host "=== Teste do Painel Administrativo ===" -ForegroundColor Cyan

# 1. Testar backend diretamente
Write-Host "`n1. Testando backend (porta 5000)..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:5000/health'
    Write-Host "   ✓ Backend respondendo: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend não está respondendo!" -ForegroundColor Red
    Write-Host "   Execute: cd server; npm run dev" -ForegroundColor Yellow
    exit 1
}

# 2. Testar login direto no backend
Write-Host "`n2. Testando login no backend..." -ForegroundColor Yellow
try {
    $body = @{ password = 'Pequenoprincipe2026@' } | ConvertTo-Json
    $loginDirect = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/login' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "   ✓ Login no backend OK" -ForegroundColor Green
    Write-Host "   Token: $($loginDirect.token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro no login: $_" -ForegroundColor Red
    exit 1
}

# 3. Testar frontend
Write-Host "`n3. Testando frontend (porta 5173)..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing
    Write-Host "   ✓ Frontend respondendo: HTTP $($frontend.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Frontend não está respondendo!" -ForegroundColor Red
    Write-Host "   Execute: npm run dev" -ForegroundColor Yellow
    exit 1
}

# 4. Testar rota /admin
Write-Host "`n4. Testando rota /admin..." -ForegroundColor Yellow
try {
    $admin = Invoke-WebRequest -Uri 'http://localhost:5173/admin' -UseBasicParsing
    Write-Host "   ✓ Rota /admin acessível: HTTP $($admin.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Erro ao acessar /admin: $_" -ForegroundColor Red
    exit 1
}

# 5. Testar proxy do Vite
Write-Host "`n5. Testando proxy do Vite..." -ForegroundColor Yellow
try {
    $body = @{ password = 'Pequenoprincipe2026@' } | ConvertTo-Json
    $loginProxy = Invoke-RestMethod -Uri 'http://localhost:5173/api/admin/login' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "   ✓ Proxy funcionando - Login OK através do frontend" -ForegroundColor Green
    Write-Host "   Token: $($loginProxy.token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Erro no proxy: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== TODOS OS TESTES PASSARAM! ===" -ForegroundColor Green
Write-Host "`nAcesse: http://localhost:5173/admin" -ForegroundColor Cyan
Write-Host "Senha: Pequenoprincipe2026@" -ForegroundColor Cyan
Write-Host "`nSe você ver erros no navegador, pressione F12 para abrir o Console e me informe a mensagem de erro exata.`n" -ForegroundColor Yellow
