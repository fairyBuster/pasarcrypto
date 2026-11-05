Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = 'D:\Pscryp'
$stage = Join-Path $root '_stage'
$report = Join-Path $root '_tools\inventory.csv'

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage -Force | Out-Null

function Get-Slug([string]$name) {
    $s = $name -replace '(?i)-pasarcrypto$', '' -replace '(?i)-pasarrypto$', ''
    $s = $s.Trim().ToLower()
    $s = $s -replace '[^a-z0-9]+', '-'
    $s = $s.Trim('-')
    return $s
}

$rows = @()
foreach ($zip in (Get-ChildItem (Join-Path $root '*.zip') | Sort-Object Name)) {
    $slug = Get-Slug $zip.BaseName
    $dest = Join-Path $stage $slug
    try {
        [IO.Compression.ZipFile]::ExtractToDirectory($zip.FullName, $dest)
    } catch {
        Write-Output ("EXTRACT FAIL: " + $zip.Name + " :: " + $_.Exception.Message)
        continue
    }

    $html = Get-ChildItem $dest -Filter *.html -Recurse | Select-Object -First 1
    $css  = Get-ChildItem $dest -Filter *.css  -Recurse
    $imgs = Get-ChildItem $dest -Path (Join-Path $dest 'images') -File -ErrorAction SilentlyContinue

    $htmlText = if ($html) { Get-Content $html.FullName -Raw } else { '' }
    $cssText  = if ($css) { ($css | ForEach-Object { Get-Content $_.FullName -Raw }) -join "`n" } else { '' }

    $rows += [pscustomobject]@{
        slug          = $slug
        zip           = $zip.Name
        htmlBytes     = if ($html) { $html.Length } else { 0 }
        imgCount      = $imgs.Count
        imgBytes      = ($imgs | Measure-Object Length -Sum).Sum
        bgImages      = ([regex]::Matches($cssText, 'background-image\s*:')).Count
        absolute      = ([regex]::Matches($cssText, 'position\s*:\s*absolute')).Count
        flexCount     = ([regex]::Matches($cssText, 'display\s*:\s*flex')).Count
        grids         = ([regex]::Matches($cssText, 'display\s*:\s*grid')).Count
        mediaQueries  = ([regex]::Matches($cssText, '@media')).Count
    }
}

$rows | Export-Csv -Path $report -NoTypeInformation -Encoding UTF8

Write-Output ("screens: " + $rows.Count)
Write-Output ("total images: " + (($rows | Measure-Object imgCount -Sum).Sum))
Write-Output ("total image MB: " + [math]::Round((($rows | Measure-Object imgBytes -Sum).Sum / 1MB), 1))
Write-Output ("screens using bg-image: " + (($rows | Where-Object { $_.bgImages -gt 0 }).Count))
Write-Output ("screens with position:absolute: " + (($rows | Where-Object { $_.absolute -gt 0 }).Count))
Write-Output ("screens with flex: " + (($rows | Where-Object { $_.flexCount -gt 0 }).Count))
Write-Output ''
Write-Output '--- worst offenders (absolute positioning) ---'
$rows | Sort-Object absolute -Descending | Select-Object -First 8 slug, absolute, flexCount, imgCount | Format-Table -AutoSize
