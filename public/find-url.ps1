# Wuwa Archive - Comprehensive URL Finder
# Jalankan script ini untuk menemukan URL dari berbagai sumber

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Wuwa Archive - URL Finder" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Tutup game jika sedang jalan
$gameProc = Get-Process -Name "Client-Win64-Shipping" -ErrorAction SilentlyContinue
if ($gameProc) {
    Write-Host "Game detected, closing..." -ForegroundColor Yellow
    Stop-Process -Name "Client-Win64-Shipping" -Force
    Start-Sleep -Seconds 5
}

# 2. Define semua kemungkinan path
$allLogPaths = @(
    "D:\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "D:\Wuthering Waves Game\Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log",
    "C:\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "C:\Wuthering Waves Game\Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log"
)

# 3. Find existing files
$existingLogs = @()
foreach ($path in $allLogPaths) {
    if (Test-Path $path) {
        $existingLogs += $path
        Write-Host "Found: $path" -ForegroundColor Green
    }
}

if ($existingLogs.Count -eq 0) {
    Write-Host "[ERROR] No log files found!" -ForegroundColor Red
    return
}

# 4. Encoding yang akan dicoba
$encodings = @(
    @{Name="UTF-8"; Enc=[System.Text.Encoding]::UTF8},
    @{Name="ASCII"; Enc=[System.Text.Encoding]::ASCII},
    @{Name="UTF-7"; Enc=[System.Text.Encoding]::UTF7},
    @{Name="BigEndianUnicode"; Enc=[System.Text.Encoding]::BigEndianUnicode},
    @{Name="Default"; Enc=[System.Text.Encoding]::Default}
)

# 5. Pattern yang akan dicoba
$patterns = @(
    "aki-gm-resources[^\s""'<>]+",
    "https?://[^\s""'<>]*aki-gm-resources[^\s""'<>]+",
    "aki-gm-resources[^\s]+",
    "gacha.*record[^\s""'<>]+"
)

# 6. Cari di semua file dengan semua encoding
$foundUrl = $null
$sourceFile = $null

foreach ($logPath in $existingLogs) {
    Write-Host ""
    Write-Host "Processing: $logPath" -ForegroundColor Cyan

    # Copy ke temp
    $tempPath = "$env:TEMP\wuwa_temp_$([guid]::NewGuid().ToString('N')).log"
    try {
        Copy-Item -Path $logPath -Destination $tempPath -Force -ErrorAction Stop
    } catch {
        Write-Host "  Cannot copy file: $_" -ForegroundColor DarkGray
        continue
    }

    # Baca bytes
    $bytes = [System.IO.File]::ReadAllBytes($tempPath)
    Write-Host "  File size: $([math]::Round($bytes.Length / 1MB, 2)) MB" -ForegroundColor Gray

    # Coba setiap encoding
    foreach ($encInfo in $encodings) {
        try {
            $text = $encInfo.Enc.GetString($bytes)

            # Coba setiap pattern
            foreach ($pattern in $patterns) {
                $matches = [regex]::Matches($text, $pattern)
                if ($matches.Count -gt 0) {
                    $lastMatch = $matches[$matches.Count - 1].Value

                    # Validasi URL
                    if ($lastMatch -match "player_id=" -and $lastMatch -match "record_id=") {
                        if ($lastMatch -notmatch "^https?://") {
                            $lastMatch = "https://" + $lastMatch
                        }
                        $foundUrl = $lastMatch
                        $sourceFile = $logPath
                        Write-Host "  FOUND with $($encInfo.Name)!" -ForegroundColor Green
                        break
                    }
                }
            }
        } catch {
            # Skip encoding yang gagal
        }

        if ($foundUrl) { break }
    }

    # Cleanup
    Remove-Item $tempPath -Force -ErrorAction SilentlyContinue

    if ($foundUrl) { break }
}

# 7. Hasil
if ($foundUrl) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host " SUCCESS! URL found!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Source: $sourceFile" -ForegroundColor Cyan
    Write-Host ""
    Set-Clipboard -Value $foundUrl
    Write-Host "URL (copied to clipboard):" -ForegroundColor White
    Write-Host $foundUrl -ForegroundColor DarkGray
} else {
    Write-Host ""
    Write-Host "[ERROR] URL not found in any log file" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Convene History belum dibuka di game" -ForegroundColor White
    Write-Host "2. URL tidak ada di log (game tidak menulisnya)" -ForegroundColor White
    Write-Host "3. Log file terenkripsi dengan cara baru" -ForegroundColor White
    Write-Host ""
    Write-Host "Solusi alternatif:" -ForegroundColor Yellow
    Write-Host "- Buka Convene History di game" -ForegroundColor White
    Write-Host "- Tunggu halaman muat penuh (10 detik)" -ForegroundColor White
    Write-Host "- Buka browser DevTools (F12) dan cari URL di Network tab" -ForegroundColor White
}
