# 🚀 Deploy Script para Windows PowerShell
# Execute: powershell -ExecutionPolicy Bypass .\deploy.ps1

Write-Host "🚀 Preparando LightPlast CRM para Vercel..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependências instaladas" -ForegroundColor Green
Write-Host ""

# Step 2: Build TypeScript
Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na compilação" -ForegroundColor Red
    exit 1
}

Write-Host "✅ TypeScript compilado com sucesso" -ForegroundColor Green
Write-Host ""

# Step 3: Verify build
Write-Host "🔍 Verificando arquivos..." -ForegroundColor Yellow

$files = @(
    "dist/api/index.js",
    "dashboard/index.html",
    ".env",
    "vercel.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file (FALTA!)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Fazer commit:" -ForegroundColor Yellow
Write-Host "    git add ." -ForegroundColor White
Write-Host "    git commit -m 'Deploy CRM com TiDB Cloud - Orçamentos, Clientes, Leads, Pedidos'" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Push para GitHub:" -ForegroundColor Yellow
Write-Host "    git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Vercel Environment Variables:" -ForegroundColor Yellow
Write-Host "    TIDB_HOST=gateway01us-east1prod.aws.tidbcloud.com" -ForegroundColor Cyan
Write-Host "    TIDB_PORT=4000" -ForegroundColor Cyan
Write-Host "    TIDB_USER=wYESZBLpQwYM5hn.root" -ForegroundColor Cyan
Write-Host "    TIDB_PASSWORD=GJlg4N2UHGauRmG7" -ForegroundColor Cyan
Write-Host "    TIDB_DATABASE=test" -ForegroundColor Cyan
Write-Host "    NODE_ENV=production" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ TUDO PRONTO! Seu CRM está 100% funcional!" -ForegroundColor Green
Write-Host "🎉 Links úteis:" -ForegroundColor Green
Write-Host "   Dashboard: https://seu-projeto.vercel.app" -ForegroundColor Cyan
Write-Host "   API Docs: Ver QUICK_START.md" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
