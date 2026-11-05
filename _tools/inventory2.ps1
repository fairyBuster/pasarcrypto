$root = 'D:\Pscryp'
$stage = Join-Path $root '_stage'
$out = Join-Path $root '_tools'

$rows = @()
foreach ($dir in (Get-ChildItem $stage -Directory | Sort-Object Name)) {
    $files  = Get-ChildItem $dir.FullName -Recurse -File
    $imgs   = $files | Where-Object { $_.DirectoryName -like '*images*' }
    $html   = $files | Where-Object { $_.Extension -eq '.html' } | Select-Object -First 1
    $cssTxt = ($files | Where-Object { $_.Extension -eq '.css' } | ForEach-Object { Get-Content $_.FullName -Raw }) -join "`n"
    $htmlTxt = if ($html) { Get-Content $html.FullName -Raw } else { '' }

    $rows += [pscustomobject]@{
        slug       = $dir.Name
        htmlKB     = [math]::Round((($html.Length) / 1KB), 1)
        svg        = ($imgs | Where-Object { $_.Extension -eq '.svg' }).Count
        png        = ($imgs | Where-Object { $_.Extension -eq '.png' }).Count
        jpg        = ($imgs | Where-Object { $_.Extension -in '.jpg', '.jpeg' }).Count
        imgKB      = [math]::Round((($imgs | Measure-Object Length -Sum).Sum / 1KB), 1)
        bgImage    = ([regex]::Matches($cssTxt, 'background-image\s*:')).Count
        imgTags    = ([regex]::Matches($htmlTxt, '<img\s')).Count
        absPos     = ([regex]::Matches($cssTxt, 'position\s*:\s*absolute')).Count
        flexN      = ([regex]::Matches($cssTxt, 'display\s*:\s*flex')).Count
        screenshots= ($imgs | Where-Object { $_.Name -eq 'screenshot.png' }).Count
    }
}
$rows | Export-Csv (Join-Path $out 'inventory2.csv') -NoTypeInformation -Encoding UTF8

Write-Output ("screens: " + $rows.Count)
Write-Output ("svg total: " + (($rows | Measure-Object svg -Sum).Sum))
Write-Output ("png total: " + (($rows | Measure-Object png -Sum).Sum))
Write-Output ("asset MB: " + [math]::Round((($rows | Measure-Object imgKB -Sum).Sum / 1KB), 1))
Write-Output ("screens w/ bg-image: " + (($rows | Where-Object { $_.bgImage -gt 0 }).Count)
)
Write-Output ("screens w/ absPos>3: " + (($rows | Where-Object { $_.absPos -gt 3 }).Count))
Write-Output ''

# unique assets by content hash
$seen = @{}
$dup = 0; $uniq = 0; $uniqBytes = 0
foreach ($f in (Get-ChildItem $stage -Recurse -File | Where-Object { $_.DirectoryName -like '*images*' })) {
    $h = (Get-FileHash $f.FullName -Algorithm SHA1).Hash
    if ($seen.ContainsKey($h)) { $dup++ } else { $seen[$h] = $f.FullName; $uniq++; $uniqBytes += $f.Length }
}
Write-Output ("unique assets: " + $uniq + "  dupes: " + $dup + "  unique MB: " + [math]::Round($uniqBytes / 1MB, 1))
Write-Output ''
Write-Output '--- all slugs ---'
($rows.slug) -join ', '
