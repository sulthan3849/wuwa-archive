Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Wuwa Archive - Convene URL Extractor" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$possiblePaths = @(
    "C:\Program Files\Wuthering Waves\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "C:\Kuro Games\Wuthering Waves\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "D:\Kuro Games\Wuthering Waves\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "E:\Kuro Games\Wuthering Waves\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "C:\Wuthering Waves\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "D:\Wuthering Waves\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "E:\Wuthering Waves\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "C:\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "D:\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "E:\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "$env:LOCALAPPDATA\WutheringWaves\Saved\Logs\Client.log"
)

$targetLog = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $targetLog = $path
        break
    }
}

if (-not $targetLog) {
    Write-Host "[ERROR] Client.log not found in standard directories." -ForegroundColor Red
    Write-Host "Please manually upload your Client.log at the import page." -ForegroundColor Yellow
    return
}

Write-Host "Found log file at: $targetLog" -ForegroundColor Green

$regexPattern = "https://aki-gm-resources(?:-oversea)?\.aki-game\.(?:net|com)/aki/gacha/index\.html#/record\?[^`"'\s]+"

$content = Get-Content -Path $targetLog -Raw -ErrorAction SilentlyContinue

if (-not $content) {
    Write-Host "[ERROR] Failed to read Client.log (Game might be actively locking it, or it is empty)." -ForegroundColor Red
    return
}

$matches = [regex]::Matches($content, $regexPattern)

if ($matches.Count -eq 0) {
    Write-Host "[ERROR] Could not find Convene URL in the log file." -ForegroundColor Red
    Write-Host "Make sure you opened the Convene History in-game before running this script." -ForegroundColor Yellow
    return
}

$lastMatch = $matches[$matches.Count - 1].Value

Set-Clipboard -Value $lastMatch
Write-Host ""
Write-Host "SUCCESS! The URL has been copied to your clipboard." -ForegroundColor Green
Write-Host "You can now paste it in the Wuwa Archive Import page (CTRL+V)." -ForegroundColor Cyan
Write-Host "URL: $lastMatch" -ForegroundColor DarkGray
Write-Host ""
