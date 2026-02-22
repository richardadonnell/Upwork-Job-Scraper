[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [Parameter()]
    [ValidatePattern('^[^/\s]+/[^/\s]+$')]
    [string]$Repo = 'richardadonnell/Upwork-Job-Scraper',

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$EnvName = 'production'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-DotEnvValues {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $result = @{}

    if (-not (Test-Path -LiteralPath $Path)) {
        return $result
    }

    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith('#')) {
            continue
        }

        if ($trimmed.StartsWith('export ')) {
            $trimmed = $trimmed.Substring(7).Trim()
        }

        if ($trimmed -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$') {
            continue
        }

        $key = $Matches[1]
        $rawValue = $Matches[2].Trim()

        if ($rawValue.Length -ge 2) {
            if (($rawValue.StartsWith('"') -and $rawValue.EndsWith('"')) -or
                ($rawValue.StartsWith("'") -and $rawValue.EndsWith("'"))) {
                $rawValue = $rawValue.Substring(1, $rawValue.Length - 2)
            } elseif ($rawValue -match '^(.*?)\s+#') {
                $rawValue = $Matches[1].Trim()
            }
        }

        $result[$key] = $rawValue
    }

    return $result
}

function Read-SecretPlainText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    while ($true) {
        $secure = Read-Host -Prompt "Enter value for secret '$Name'" -AsSecureString
        $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        try {
            $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
        }

        if (-not [string]::IsNullOrWhiteSpace($plain)) {
            return $plain
        }

        Write-Warning "Secret '$Name' cannot be empty."
    }
}

function Read-PlainValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    while ($true) {
        $value = Read-Host -Prompt "Enter value for variable '$Name'"
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            return $value
        }
        Write-Warning "Variable '$Name' cannot be empty."
    }
}

function Get-MappedValue {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Source,

        [Parameter(Mandatory = $true)]
        [string]$PrimaryKey,

        [Parameter()]
        [hashtable]$LegacyMap
    )

    if ($Source.ContainsKey($PrimaryKey) -and -not [string]::IsNullOrWhiteSpace($Source[$PrimaryKey])) {
        return [string]$Source[$PrimaryKey]
    }

    if ($LegacyMap -and $LegacyMap.ContainsKey($PrimaryKey)) {
        $legacyKey = $LegacyMap[$PrimaryKey]
        if ($Source.ContainsKey($legacyKey) -and -not [string]::IsNullOrWhiteSpace($Source[$legacyKey])) {
            return [string]$Source[$legacyKey]
        }
    }

    return $null
}

function Invoke-Gh {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Args
    )

    $output = & gh @Args 2>&1
    if ($LASTEXITCODE -ne 0) {
        $msg = ($output | Out-String).Trim()
        throw "gh command failed: gh $($Args -join ' ')`n$msg"
    }
    return $output
}

function ConvertTo-NameArray {
    param(
        [Parameter(Mandatory = $false)]
        $InputObject
    )

    if ($null -eq $InputObject) {
        return @()
    }

    if ($InputObject -is [System.Array]) {
        return @($InputObject | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_.ToString().Trim() })
    }

    $text = $InputObject.ToString()
    if ([string]::IsNullOrWhiteSpace($text)) {
        return @()
    }

    return @($text -split "(`r`n|`n|`r)" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_.Trim() })
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI ('gh') is not installed or not on PATH."
}

& gh auth status 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
    throw "Not authenticated with GitHub CLI. Run 'gh auth login' first."
}

$repoRoot = if ($PSCommandPath) { Split-Path -Parent $PSCommandPath } else { (Get-Location).Path }
$dotenvPath = Join-Path $repoRoot '.env'
$envValues = Get-DotEnvValues -Path $dotenvPath

$legacyKeyMap = @{
    CWS_CLIENT_ID     = 'CHROME_CLIENT_ID'
    CWS_CLIENT_SECRET = 'CHROME_CLIENT_SECRET'
    CWS_REFRESH_TOKEN = 'CHROME_REFRESH_TOKEN'
    CWS_EXTENSION_ID  = 'CHROME_EXTENSION_ID'
}

$requiredSecrets = @(
    'SENTRY_AUTH_TOKEN',
    'CWS_CLIENT_ID',
    'CWS_CLIENT_SECRET',
    'CWS_REFRESH_TOKEN'
)

$requiredVars = @(
    'WXT_SENTRY_DSN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'CWS_PUBLISHER_ID',
    'CWS_EXTENSION_ID'
)

$secretValues = [ordered]@{}
foreach ($name in $requiredSecrets) {
    $value = Get-MappedValue -Source $envValues -PrimaryKey $name -LegacyMap $legacyKeyMap
    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = Read-SecretPlainText -Name $name
    }
    $secretValues[$name] = $value
}

$variableValues = [ordered]@{}
foreach ($name in $requiredVars) {
    $value = Get-MappedValue -Source $envValues -PrimaryKey $name -LegacyMap $legacyKeyMap
    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = Read-PlainValue -Name $name
    }
    $variableValues[$name] = $value
}

$escapedEnvName = [uri]::EscapeDataString($EnvName)
if ($PSCmdlet.ShouldProcess("$Repo / $EnvName", 'Create or update GitHub environment')) {
    Invoke-Gh -Args @(
        'api', '--method', 'PUT',
        "repos/$Repo/environments/$escapedEnvName",
        '--header', 'Accept: application/vnd.github+json',
        '--header', 'X-GitHub-Api-Version: 2022-11-28'
    ) | Out-Null
    Write-Host "Environment '$EnvName' is ensured on $Repo." -ForegroundColor Green
}

foreach ($secretName in $requiredSecrets) {
    if ($PSCmdlet.ShouldProcess("$Repo / $EnvName", "Set environment secret $secretName")) {
        $setOutput = $secretValues[$secretName] | & gh secret set $secretName --env $EnvName --repo $Repo 2>&1
        if ($LASTEXITCODE -ne 0) {
            $msg = ($setOutput | Out-String).Trim()
            throw "Failed setting secret '$secretName'.`n$msg"
        }
        Write-Host "Set secret: $secretName" -ForegroundColor Green
    }
}

foreach ($varName in $requiredVars) {
    if ($PSCmdlet.ShouldProcess("$Repo", "Set repository variable $varName")) {
        $setOutput = & gh variable set $varName --repo $Repo --body $variableValues[$varName] 2>&1
        if ($LASTEXITCODE -ne 0) {
            $msg = ($setOutput | Out-String).Trim()
            throw "Failed setting variable '$varName'.`n$msg"
        }
        Write-Host "Set variable: $varName" -ForegroundColor Green
    }
}

Write-Host ''
Write-Host 'Verification (names only):' -ForegroundColor Cyan

$envSecretNamesRaw = & gh secret list --env $EnvName --repo $Repo --json name --jq '.[].name' 2>&1
if ($LASTEXITCODE -ne 0) {
    $msg = ($envSecretNamesRaw | Out-String).Trim()
    throw "Failed listing environment secrets.`n$msg"
}
$envSecretNames = ConvertTo-NameArray -InputObject $envSecretNamesRaw

$repoVarNamesRaw = & gh variable list --repo $Repo --json name --jq '.[].name' 2>&1
if ($LASTEXITCODE -ne 0) {
    $msg = ($repoVarNamesRaw | Out-String).Trim()
    throw "Failed listing repository variables.`n$msg"
}
$repoVarNames = ConvertTo-NameArray -InputObject $repoVarNamesRaw

Write-Host "Environment secrets in '$EnvName':" -ForegroundColor Yellow
foreach ($name in $requiredSecrets) {
    $status = if ($envSecretNames -contains $name) { 'OK' } else { 'MISSING' }
    Write-Host "  [$status] $name"
}

Write-Host "Repository variables in '$Repo':" -ForegroundColor Yellow
foreach ($name in $requiredVars) {
    $status = if ($repoVarNames -contains $name) { 'OK' } else { 'MISSING' }
    Write-Host "  [$status] $name"
}

foreach ($secretName in @($secretValues.Keys)) {
    $secretValues[$secretName] = $null
}
