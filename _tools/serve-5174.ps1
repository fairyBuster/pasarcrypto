# Claims port 5174 as soon as it frees up and starts the dev server there.
# Runs detached so it survives the shell that launched it.
$log = 'D:\Pscryp\_tools\serve-5174.log'
"waiting for 5174 - $(Get-Date -Format o)" | Set-Content $log

for ($i = 0; $i -lt 120; $i++) {
    $busy = Get-NetTCPConnection -LocalPort 5174 -State Listen -ErrorAction SilentlyContinue
    if (-not $busy) { break }
    Start-Sleep -Milliseconds 500
}

"starting vite - $(Get-Date -Format o)" | Add-Content $log
Set-Location 'D:\Pscryp\app'
npm run dev -- --port 5174 --strictPort *>> $log
