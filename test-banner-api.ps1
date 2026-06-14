<#
    Wuwa Archive - Banner cardPoolType Test Script

    Tests all cardPoolType values (1-14) against the API
    to verify which banners are accessible and have data.

    Usage:
        .\test-banner-api.ps1 -ConveneUrl "YOUR_URL" -ServerUrl "http://localhost:3000"
        .\test-banner-api.ps1 -ConveneUrl "YOUR_URL" -ServerUrl "https://wuwa-archive.vercel.app"

    Requirements:
        - PowerShell 5.1 or later
        - Valid Convene URL from Wuthering Waves game
#>

param(
    [Parameter(Mandatory=$true, HelpMessage="Enter your Convene URL from the game")]
    [string]$ConveneUrl,

    [Parameter(Mandatory=$false, HelpMessage="Server URL (default: http://localhost:3000)")]
    [string]$ServerUrl = "http://localhost:3000",

    [Parameter(Mandatory=$false, HelpMessage="Comma-separated list of cardPoolType to test (default: 1-14)")]
    [string]$CardPoolTypes = "1,2,3,4,5,6,7,8,9,10,11,12,13,14"
)

# Banner names mapping
$BANNER_NAMES = @{
    "1"  = "Novice Convene"
    "2"  = "Permanent Resonator"
    "3"  = "Permanent Weapon"
    "4"  = "Featured Resonator"
    "5"  = "Featured Weapon"
    "6"  = "Beginner's Choice"
    "7"  = "New Voyage Resonator"
    "8"  = "New Voyage Weapon"
    "9"  = "Tidal Chorus"
    "10" = "Winter Brume"
    "11" = "Utterance of Marvels"
    "12" = "Giveback Event Convene"
    "13" = "Collab Resonator Convene (Cyberpunk)"
    "14" = "Collab Weapon Convene (Cyberpunk)"
}

$ApiEndpoint = "$ServerUrl/api/v1/import/parse"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Wuwa Archive - Banner Test Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Validate URL
if ($ConveneUrl -notmatch "^https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)/aki/gacha/index\.html#/)") {
    Write-Host "ERROR: Invalid Convene URL format" -ForegroundColor Red
    Write-Host "URL should start with: https://aki-gm-resources...aki-game.net/aki/gacha/index.html#/record?" -ForegroundColor Yellow
    exit 1
}

Write-Host "Server URL: $ServerUrl" -ForegroundColor Gray
Write-Host "Testing cardPoolTypes: $CardPoolTypes" -ForegroundColor Gray
Write-Host ""

# Parse cardPoolTypes
$typesToTest = $CardPoolTypes -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

$results = @()

foreach ($type in $typesToTest) {
    $bannerName = $BANNER_NAMES[$type]
    if (-not $bannerName) {
        $bannerName = "Unknown Banner"
    }

    Write-Host "Testing cardPoolType $type ($bannerName)..." -NoNewline

    $body = @{
        conveneUrl = $ConveneUrl
        cardPoolType = [int]$type
    } | ConvertTo-Json -Compress

    try {
        $response = Invoke-RestMethod -Uri $ApiEndpoint -Method Post -ContentType "application/json" -Body $body -TimeoutSec 30

        if ($response.success) {
            $pullCount = $response.pulls.Count
            $pullWord = if ($pullCount -eq 1) { "pull" } else { "pulls" }

            if ($pullCount -gt 0) {
                Write-Host " SUCCESS" -ForegroundColor Green
                Write-Host "        -> Found $pullCount $pullWord" -ForegroundColor DarkGreen
            } else {
                Write-Host " OK (empty)" -ForegroundColor Yellow
                Write-Host "        -> No pulls in this banner" -ForegroundColor DarkYellow
            }

            $results += @{
                Type = $type
                Name = $bannerName
                Status = "SUCCESS"
                PullCount = $pullCount
                Error = $null
            }
        } else {
            Write-Host " ERROR" -ForegroundColor Red
            Write-Host "        -> $($response.error): $($response.message)" -ForegroundColor DarkRed

            $results += @{
                Type = $type
                Name = $bannerName
                Status = "ERROR"
                PullCount = 0
                Error = $response.error
            }
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "        -> $errorMsg" -ForegroundColor DarkRed

        $results += @{
            Type = $type
            Name = $bannerName
            Status = "FAILED"
            PullCount = 0
            Error = $errorMsg
        }
    }

    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$successCount = ($results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$errorCount = ($results | Where-Object { $_.Status -eq "ERROR" }).Count
$failedCount = ($results | Where-Object { $_.Status -eq "FAILED" }).Count

Write-Host "Total Tested: $($results.Count)" -ForegroundColor White
Write-Host "Successful:   $successCount" -ForegroundColor Green
Write-Host "Errors:       $errorCount" -ForegroundColor Yellow
Write-Host "Failed:       $failedCount" -ForegroundColor Red
Write-Host ""

# Show banners with pulls
$bannersWithPulls = $results | Where-Object { $_.PullCount -gt 0 }
if ($bannersWithPulls.Count -gt 0) {
    Write-Host "Banners with pulls:" -ForegroundColor Cyan
    foreach ($banner in $bannersWithPulls) {
        Write-Host "  - Type $($banner.Type): $($banner.Name) ($($banner.PullCount) pulls)" -ForegroundColor Green
    }
    Write-Host ""
}

# Show errors
$errorResults = $results | Where-Object { $_.Status -ne "SUCCESS" }
if ($errorResults.Count -gt 0) {
    Write-Host "Banners with issues:" -ForegroundColor Cyan
    foreach ($banner in $errorResults) {
        $errorInfo = if ($banner.Error) { ": $($banner.Error)" } else { "" }
        Write-Host "  - Type $($banner.Type): $($banner.Name) ($($banner.Status)$errorInfo)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Note about Cyberpunk
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Cyberpunk Collab Note" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If banner types 13 & 14 show errors, the Cyberpunk" -ForegroundColor White
Write-Host "collab may use different cardPoolType values." -ForegroundColor White
Write-Host ""
Write-Host "Common alternatives to try:" -ForegroundColor Yellow
Write-Host "  - 15, 16" -ForegroundColor Gray
Write-Host "  - 21, 22" -ForegroundColor Gray
Write-Host "  - 30, 31" -ForegroundColor Gray
Write-Host ""
