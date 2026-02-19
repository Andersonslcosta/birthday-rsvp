#!/usr/bin/env pwsh
# Birthday RSVP - API Integration Tests
# Testa todos os endpoints HTTP da API

param(
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "`n[════════════════════════════════════════]" -ForegroundColor Cyan
Write-Host "  API Integration Tests" -ForegroundColor Cyan
Write-Host "  Birthday RSVP Application" -ForegroundColor Cyan
Write-Host "[════════════════════════════════════════]`n" -ForegroundColor Cyan

Write-Host "Base URL: $BaseUrl`n" -ForegroundColor Gray

$totalTests = 0
$passedTests = 0
$failedTests = 0
$token = ""

# Helper function
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [int]$ExpectedStatus,
        [string]$AuthToken
    )

    $totalTests++
    Write-Host "[Test $totalTests]: $Name" -ForegroundColor Yellow

    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($AuthToken) {
            $headers["Authorization"] = "Bearer $AuthToken"
        }

        $url = "$BaseUrl$Endpoint"
        $params = @{
            Uri     = $url
            Method  = $Method
            Headers = $headers
        }

        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
        }

        Write-Host "  $Method $Endpoint" -ForegroundColor Gray
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json

        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✓ Status $statusCode (esperado: $ExpectedStatus)" -ForegroundColor Green
            Write-Host "  ✓ Response válido" -ForegroundColor Green
            $passedTests++
            
            # Log response details
            Write-Host "  Response: $(($content | ConvertTo-Json -Compress).Substring(0, [Math]::Min(80, ($content | ConvertTo-Json -Compress).Length)))..." -ForegroundColor Gray
            
            return $content
        } else {
            Write-Host "  ❌ Esperado status $ExpectedStatus, recebido $statusCode" -ForegroundColor Red
            $failedTests++
            return $null
        }
    }
    catch {
        $errorMessage = $_.Exception.Message
        Write-Host "  ❌ Erro: $errorMessage" -ForegroundColor Red
        $failedTests++
        return $null
    }

    Write-Host ""
}

# ====== TESTES ======

# Test 1: Health Check
Write-Host "`n[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host "SECTION 1: Health Check" -ForegroundColor Magenta
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host ""

$healthResponse = Test-Endpoint `
    -Name "GET /health" `
    -Method "GET" `
    -Endpoint "/health" `
    -ExpectedStatus 200
Write-Host ""

# Test 2: Authentication
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host "SECTION 2: Authentication (JWT)" -ForegroundColor Magenta
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host ""

$loginResponse = Test-Endpoint `
    -Name "POST /api/admin/login com senha correta" `
    -Method "POST" `
    -Endpoint "/api/admin/login" `
    -Body @{ password = "pequenoprincipe2025" } `
    -ExpectedStatus 200
Write-Host ""

if ($loginResponse -and $loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "  [*] Token obtido: $($token.Substring(0, 50))..." -ForegroundColor Green
    Write-Host ""
}

$loginFailResponse = Test-Endpoint `
    -Name "POST /api/admin/login com senha incorreta" `
    -Method "POST" `
    -Endpoint "/api/admin/login" `
    -Body @{ password = "senhaerrada" } `
    -ExpectedStatus 401
Write-Host ""

# Test 3: RSVP Creation
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host "SECTION 3: RSVP Creation" -ForegroundColor Magenta
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host ""

$rsvpConfirmado = @{
    responsibleName = "João Silva"
    confirmation = "sim"
    participants = @(
        @{ name = "João Silva"; age = 35; isChild = $false },
        @{ name = "Maria Silva"; age = 32; isChild = $false },
        @{ name = "Pedro Silva"; age = 5; isChild = $true }
    )
    totalPeople = 3
}

$createResponse1 = Test-Endpoint `
    -Name "POST /api/rsvp - RSVP Confirmado" `
    -Method "POST" `
    -Endpoint "/api/rsvp" `
    -Body $rsvpConfirmado `
    -ExpectedStatus 201
Write-Host ""

$rsvpNaoConfirmado = @{
    responsibleName = "Ana Costa"
    confirmation = "nao"
    participants = @()
    totalPeople = 0
}

$createResponse2 = Test-Endpoint `
    -Name "POST /api/rsvp - RSVP Não Confirmado" `
    -Method "POST" `
    -Endpoint "/api/rsvp" `
    -Body $rsvpNaoConfirmado `
    -ExpectedStatus 201
Write-Host ""

# Test 4: Validation
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host "SECTION 4: Input Validation" -ForegroundColor Magenta
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host ""

$invalidName = @{
    responsibleName = "A"  # muito curto
    confirmation = "sim"
    participants = @(
        @{ name = "A"; age = 30; isChild = $false }
    )
    totalPeople = 1
}

$validationTest1 = Test-Endpoint `
    -Name "POST /api/rsvp - Nome inválido" `
    -Method "POST" `
    -Endpoint "/api/rsvp" `
    -Body $invalidName `
    -ExpectedStatus 400
Write-Host ""

$invalidAge = @{
    responsibleName = "Valid Name"
    confirmation = "sim"
    participants = @(
        @{ name = "Test"; age = 150; isChild = $false }  # idade inválida
    )
    totalPeople = 1
}

$validationTest2 = Test-Endpoint `
    -Name "POST /api/rsvp - Idade inválida" `
    -Method "POST" `
    -Endpoint "/api/rsvp" `
    -Body $invalidAge `
    -ExpectedStatus 400
Write-Host ""

$mismatchCount = @{
    responsibleName = "Test User"
    confirmation = "sim"
    participants = @(
        @{ name = "Test"; age = 30; isChild = $false }
    )
    totalPeople = 2  # não corresponde ao número de participantes
}

$validationTest3 = Test-Endpoint `
    -Name "POST /api/rsvp - Contagem incoerente" `
    -Method "POST" `
    -Endpoint "/api/rsvp" `
    -Body $mismatchCount `
    -ExpectedStatus 400
Write-Host ""

# Test 5: Protected Endpoints
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host "SECTION 5: Protected Endpoints" -ForegroundColor Magenta
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host ""

if ($token) {
    $protectedTest1 = Test-Endpoint `
        -Name "GET /api/rsvp (com token)" `
        -Method "GET" `
        -Endpoint "/api/rsvp" `
        -ExpectedStatus 200 `
        -AuthToken $token
    Write-Host ""

    $protectedTest2 = Test-Endpoint `
        -Name "GET /api/statistics (com token)" `
        -Method "GET" `
        -Endpoint "/api/statistics" `
        -ExpectedStatus 200 `
        -AuthToken $token
    Write-Host ""

    $protectedTest3 = Test-Endpoint `
        -Name "GET /api/admin/export (com token)" `
        -Method "GET" `
        -Endpoint "/api/admin/export" `
        -ExpectedStatus 200 `
        -AuthToken $token
    Write-Host ""
} else {
    Write-Host "[!] Sem token valido, pulando testes protegidos" -ForegroundColor Yellow
    Write-Host ""
}

# Test 6: Unauthorized Access
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host "SECTION 6: Unauthorized Access" -ForegroundColor Magenta
Write-Host "[══════════════════════════════════════════]" -ForegroundColor Magenta
Write-Host ""

$unauthorizedTest = Test-Endpoint `
    -Name "GET /api/rsvp (sem token)" `
    -Method "GET" `
    -Endpoint "/api/rsvp" `
    -ExpectedStatus 401
Write-Host ""

# ====== RESUMO ======

Write-Host "[════════════════════════════════════════]" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "[════════════════════════════════════════]" -ForegroundColor Cyan
Write-Host "Total Tests:  $totalTests" -ForegroundColor Cyan
Write-Host "Passed:       $passedTests" -ForegroundColor Green
Write-Host "Failed:       $failedTests" -ForegroundColor Cyan
Write-Host "Success Rate: $([Math]::Round(($passedTests/$totalTests)*100))%" -ForegroundColor Cyan
Write-Host "[════════════════════════════════════════]`n" -ForegroundColor Cyan

if ($failedTests -eq 0) {
    Write-Host "[SUCCESS] Todos os testes passaram!" -ForegroundColor Green
} else {
    Write-Host "[!] Alguns testes falharam. Verifique acima." -ForegroundColor Yellow
}

Write-Host "`n"
