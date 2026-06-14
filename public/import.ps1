# Wuwa Archive - Convene URL Extractor with XOR Decryption
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Wuwa Archive - Convene URL Extractor" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Define possible log file locations
$possibleLogPaths = @(
    "D:\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "D:\Wuthering Waves Game\Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log",
    "C:\Wuthering Waves Game\Client\Saved\Logs\Client.log",
    "C:\Wuthering Waves Game\Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log"
)

# Find all existing log files
$logFiles = @()
foreach ($path in $possibleLogPaths) {
    if (Test-Path $path) {
        $fileInfo = Get-Item $path
        $logFiles += [PSCustomObject]@{
            Path = $path
            LastWriteTime = $fileInfo.LastWriteTime
            Size = $fileInfo.Length
        }
    }
}

if ($logFiles.Count -eq 0) {
    Write-Host "[ERROR] No log files found." -ForegroundColor Red
    return
}

# Sort by LastWriteTime (newest first)
$logFiles = $logFiles | Sort-Object LastWriteTime -Descending

Write-Host "Found $($logFiles.Count) log file(s):" -ForegroundColor Cyan
foreach ($log in $logFiles) {
    Write-Host "  - $($log.Path)" -ForegroundColor Gray
    Write-Host "    Modified: $($log.LastWriteTime), Size: $([math]::Round($log.Size / 1KB, 2)) KB" -ForegroundColor DarkGray
}

# Function to read file with shared access (allows reading while game is running)
function ReadSharedFile {
    param([string]$path)
    $stream = $null
    $memoryStream = $null
    try {
        $fileShare = [System.IO.FileShare]([System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete)
        $stream = [System.IO.File]::Open($path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, $fileShare)
        $memoryStream = [System.IO.MemoryStream]::new()
        $stream.CopyTo($memoryStream)
        return $memoryStream.ToArray()
    }
    finally {
        if ($memoryStream) { $memoryStream.Dispose() }
        if ($stream) { $stream.Dispose() }
    }
}

# Function to decrypt Client.log (XOR obfuscation by Kuro)
function DecryptClientLog {
    param([byte[]]$bytes)

    for ($i = 0; $i -lt $bytes.Length; $i++) {
        $byte = [int]$bytes[$i]
        if ((($byte -band 0x0F) % 2) -eq 1) {
            $bytes[$i] = [byte]($byte -bxor 0xA5)
        } else {
            $bytes[$i] = [byte]($byte -bxor 0xEF)
        }
    }

    return [System.Text.Encoding]::UTF8.GetString($bytes)
}

# Function to extract URL from text
function GetConveneUrl {
    param([string]$content)

    $urlMatches = [regex]::Matches($content, 'https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)/aki/gacha/index\.html#/record[^"\s]*')
    if ($urlMatches.Count -eq 0) {
        return $null
    }

    return $urlMatches[$urlMatches.Count - 1].Value
}

$foundUrl = $null
$sourceFile = $null

# Search through all log files
foreach ($log in $logFiles) {
    Write-Host ""
    Write-Host "Searching in: $($log.Path)" -ForegroundColor Cyan

    try {
        $bytes = ReadSharedFile $log.Path
        if (-not $bytes -or $bytes.Length -eq 0) {
            Write-Host "  [SKIP] Could not read file" -ForegroundColor DarkGray
            continue
        }

        Write-Host "  File size: $([math]::Round($bytes.Length / 1KB, 2)) KB" -ForegroundColor Gray

        # Try decryption for Client.log
        if ($log.Path -like "*Client.log") {
            Write-Host "  Decrypting Client.log..." -ForegroundColor Cyan
            $decryptedText = DecryptClientLog $bytes
            $foundUrl = GetConveneUrl $decryptedText

            if ($foundUrl) {
                Write-Host "  URL found after decryption!" -ForegroundColor Green
                $sourceFile = $log.Path
                break
            }

            # Also try without decryption (in case it's not encrypted)
            Write-Host "  Trying without decryption..." -ForegroundColor Cyan
            $rawText = [System.Text.Encoding]::UTF8.GetString($bytes)
            $foundUrl = GetConveneUrl $rawText

            if ($foundUrl) {
                Write-Host "  URL found (raw, not encrypted)!" -ForegroundColor Green
                $sourceFile = $log.Path
                break
            }
        }
        # For debug.log, no decryption needed
        elseif ($log.Path -like "*debug.log") {
            Write-Host "  Reading debug.log..." -ForegroundColor Cyan
            $text = [System.Text.Encoding]::UTF8.GetString($bytes)
            $foundUrl = GetConveneUrl $text

            if ($foundUrl) {
                Write-Host "  URL found!" -ForegroundColor Green
                $sourceFile = $log.Path
                break
            }
        }
    }
    catch {
        Write-Host "  [ERROR] Failed to read: $_" -ForegroundColor DarkGray
        continue
    }
}

if (-not $foundUrl) {
    Write-Host ""
    Write-Host "[ERROR] Could not find Convene URL in any log file." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you opened the Convene History in-game" -ForegroundColor White
    Write-Host "2. Wait for the page to fully load (5-10 seconds)" -ForegroundColor White
    Write-Host "3. Try switching between different banner tabs" -ForegroundColor White
    Write-Host "4. Restart the game and try again" -ForegroundColor White
    return
}

# Success!
Set-Clipboard -Value $foundUrl
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " SUCCESS! URL copied to clipboard!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Source: $sourceFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Paste it in Wuwa Archive Import page (CTRL+V)" -ForegroundColor White
Write-Host ""
Write-Host "URL: $foundUrl" -ForegroundColor DarkGray
Write-Host ""
