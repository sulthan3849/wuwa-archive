# Wuwa Archive - Banner cardPoolType Verification Guide

## Purpose
This document helps verify which cardPoolType numbers correspond to each banner type by testing against the Kuro API.

---

## Option 1: Browser DevTools Verification

### Steps
1. Open Wuwa Archive import page
2. Paste your Convene URL
3. Open **DevTools** (F12) → **Network** tab
4. Check "Preserve log" option
5. Click **Import Data**
6. For each cardPoolType (1-14), observe the response

### What to Look For
- **Success**: Response contains `pulls` array with data
- **Empty**: Response has `pulls: []` but `success: true` (banner exists but no pulls)
- **Error**: Response has `success: false` with error code

### Expected cardPoolType Mapping
| cardPoolType | Banner Name |
|--------------|------------|
| 1 | Novice Convene |
| 2 | Permanent Resonator |
| 3 | Permanent Weapon |
| 4 | Featured Resonator |
| 5 | Featured Weapon |
| 6 | Beginner's Choice |
| 7 | New Voyage Resonator |
| 8 | New Voyage Weapon |
| 9 | Tidal Chorus |
| 10 | Winter Brume |
| 11 | Utterance of Marvels |
| 12 | Giveback Event Convene |
| 13 | **Collab Resonator Convene** (Cyberpunk) |
| 14 | **Collab Weapon Convene** (Cyberpunk) |

---

## Option 2: PowerShell Test Script

### Usage
```powershell
# Run from project directory
.\test-banner-api.ps1 -ConveneUrl "YOUR_CONVENE_URL" -ServerUrl "http://localhost:3000"
```

### For Production Testing
```powershell
.\test-banner-api.ps1 -ConveneUrl "YOUR_CONVENE_URL" -ServerUrl "https://wuwa-archive.vercel.app"
```

### Script Location
`C:\Mek Project\Wuwa Archive\test-banner-api.ps1`

---

## Option 3: Deploy & Test via UI

After deployment, test directly via the Wuwa Archive import page UI.

---

## Expected Results

### If cardPoolType is CORRECT
- Banner 1-8: Should return existing pulls or empty array
- Banner 9-14: May return empty if no pulls yet, but should NOT return error

### If cardPoolType is WRONG
- API returns error like `KURO_API_CODE_*`
- Response `success: false`

### If Cyberpunk uses DIFFERENT cardPoolType
We need to find the correct one. Common alternatives:
- cardPoolType: 15, 16
- cardPoolType: 21, 22
- Different naming convention

---

## Notes
- Banner 13 & 14 (Cyberpunk collab) are UNVERIFIED
- cardPoolType 9-14 may need adjustment based on test results
- Some banners may return empty arrays if no pulls exist in that category
