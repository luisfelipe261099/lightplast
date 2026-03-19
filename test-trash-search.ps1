$job = Start-Job -ScriptBlock { 
    Set-Location 'C:\xampp\htdocs\1'
    node index.js
}
Start-Sleep -Seconds 2

try {
    # Create test data - multiple products and blogs
    $products = @(
        @{ title='Saco Biodegradável Premium'; slug='saco-biodegradavel-premium'; summary='Produto eco-friendly'; body='Descrição completa'; image='/assets/bio.jpg'; category='sacos-de-lixo' },
        @{ title='Filme Stretch Industrial'; slug='filme-stretch-industrial'; summary='Para embalagem'; body='Descrição'; image='/assets/stretch.jpg'; category='filmes-tecnicos' },
        @{ title='Bobina Picotada Especial'; slug='bobina-picotada-especial'; summary='Cortes automáticos'; body='Descrição'; image='/assets/bobina.jpg'; category='sacos-de-lixo' }
    )
    
    $blogs = @(
        @{ title='Guia Sustentabilidade em Hospitais'; slug='guia-sustentabilidade-hospitais'; excerpt='Como escolher'; body='Conteúdo completo'; image='/assets/sustent.jpg' },
        @{ title='Regulamentação de Resíduos Sólidos'; slug='regulamentacao-residuos'; excerpt='Conformidade legal'; body='Conteúdo'; image='/assets/reg.jpg' }
    )

    # Publish products
    foreach ($p in $products) {
        $json = $p | ConvertTo-Json
        $null = Invoke-RestMethod -Uri 'http://localhost:3000/api/cms/publish/product' -Method Post -ContentType 'application/json' -Body $json
    }

    # Publish blogs
    foreach ($b in $blogs) {
        $json = $b | ConvertTo-Json
        $null = Invoke-RestMethod -Uri 'http://localhost:3000/api/cms/publish/blog' -Method Post -ContentType 'application/json' -Body $json
    }

    Start-Sleep -Seconds 1

    # Move products to trash
    $prodFiles = @('produto-saco-biodegradavel-premium.html', 'produto-filme-stretch-industrial.html', 'produto-bobina-picotada-especial.html')
    foreach ($file in $prodFiles) {
        $null = Invoke-RestMethod -Uri "http://localhost:3000/api/cms/guided/product?file=$file" -Method Delete
    }

    # Move blogs to trash
    $blogFiles = @('blog-guia-sustentabilidade-hospitais.html', 'blog-regulamentacao-residuos.html')
    foreach ($file in $blogFiles) {
        $null = Invoke-RestMethod -Uri "http://localhost:3000/api/cms/guided/blog?file=$file" -Method Delete
    }

    # Fetch trash list
    $trash = Invoke-RestMethod -Uri 'http://localhost:3000/api/cms/trash' -Method Get

    Write-Output "====== TRASH TEST RESULTS ======"
    Write-Output "Total items in trash: $($trash.data.Count)"
    Write-Output ""
    Write-Output "Items:"
    $trash.data | ForEach-Object {
        Write-Output "- $($_.fileName) (Type: $($_.type))"
    }
} finally {
    Stop-Job $job | Out-Null
    Remove-Job $job
}
