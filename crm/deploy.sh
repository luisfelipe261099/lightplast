#!/bin/bash
# 🚀 Script de Preparação para Deploy

echo "📦 Preparando CRM para Vercel..."

# 1. Instalar dependências
echo "✅ Instalando dependências..."
npm install

# 2. Build TypeScript
echo "✅ Compilando TypeScript..."
npm run build

# 3. Verificar estrutura
echo "✅ Verificando arquivos..."
test -f "dist/api/index.js" && echo "   ✓ API compilada" || echo "   ✗ Erro na API"
test -f "dashboard/index.html" && echo "   ✓ Dashboard pronto" || echo "   ✗ Erro no Dashboard"
test -f ".env" && echo "   ✓ .env configurado" || echo "   ✗ Configure .env"
test -f "vercel.json" && echo "   ✓ vercel.json presente" || echo "   ✗ Falta vercel.json"

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. git add ."
echo "2. git commit -m 'Deploy CRM com TiDB Cloud'"
echo "3. git push origin main"
echo "4. Configurar Environment Variables no Vercel:"
echo "   - TIDB_HOST=gateway01us-east1prod.aws.tidbcloud.com"
echo "   - TIDB_PORT=4000"
echo "   - TIDB_USER=wYESZBLpQwYM5hn.root"
echo "   - TIDB_PASSWORD=GJlg4N2UHGauRmG7"
echo "   - TIDB_DATABASE=test"
echo "   - NODE_ENV=production"
echo ""
echo "✨ Tudo pronto para deploy!"
