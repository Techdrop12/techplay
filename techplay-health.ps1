$ErrorActionPreference='Continue'
$root="$env:USERPROFILE\Desktop\TechPlay_FINAL_DELIVERY"
Set-Location $root

Write-Host "▶ Repo: " (Get-Item $root).FullName

# — Node 20 via nvm si dispo
if (Get-Command nvm -ErrorAction SilentlyContinue) {
  nvm install 20.17.0 | Out-Null
  nvm use 20.17.0 | Out-Null
}
"20.17.0" | Set-Content .nvmrc

# — package.json (engines + scripts)
if (Test-Path package.json) {
  $pkg = [IO.File]::ReadAllText(package.json) | ConvertFrom-Json
  if (-not $pkg.engines) { $pkg | Add-Member -NotePropertyName engines -NotePropertyValue (@{}) }
  $pkg.engines.node = "20.x"
  if (-not $pkg.scripts) { $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue (@{}) }
  $pkg.scripts.lint = 'eslint "src/**/*.ts" "src/**/*.tsx" --no-error-on-unmatched-pattern'
  $pkg.scripts."start:prod" = "next build && next start -p 3000"
  $pkg.scripts.start = "next start -p 3000"
  ($pkg | ConvertTo-Json -Depth 100) | Set-Content package.json -Encoding UTF8
}

# — ESLint minimal non-interactif
if (-not (Test-Path .eslintrc.json)) {
  '{"root":true,"parser":"@typescript-eslint/parser","plugins":["@typescript-eslint","react"],"extends":["eslint:recommended","plugin:@typescript-eslint/recommended","plugin:react/recommended"],"settings":{"react":{"version":"detect"}}}' | Set-Content .eslintrc.json -Encoding UTF8
}

# — .env.local
if (-not (Test-Path .env.local)) { New-Item .env.local -ItemType File | Out-Null }
$envRaw = [IO.File]::ReadAllText(.env.local) -ErrorAction SilentlyContinue
if ($envRaw -notmatch '^\s*NEXT_PUBLIC_SITE_URL\s*=' ) { Add-Content .env.local "NEXT_PUBLIC_SITE_URL=http://localhost:3000`n" }
if ($envRaw -notmatch '^\s*NEXT_PUBLIC_META_PIXEL_ID\s*=' ) { Add-Content .env.local "NEXT_PUBLIC_META_PIXEL_ID=`n" }

# — env.ts (Zod) + import dans app/layout.tsx si présent
if (-not (Test-Path "src\env.ts")) {
  if (-not (Test-Path node_modules\zod)) { npm i zod --silent | Out-Null }
  @"
import { z } from "zod";
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
});
export const env = schema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
});
export default env;
"@ | Set-Content "src\env.ts" -Encoding UTF8
}
$layoutRoot = Join-Path $root "src\app\layout.tsx"
if (Test-Path $layoutRoot) {
  $lr = [IO.File]::ReadAllText($layoutRoot)
  if ($lr -notmatch 'import\s+["'']\./env["'']') {
    $lr = $lr -replace "^(import[^\n]*\n)","`$1import ""./env"";`n"
    Set-Content $layoutRoot $lr -Encoding UTF8
  }
}

# — next.config.mjs : domains (idempotent)
$ncm = Join-Path $root "next.config.mjs"
if (Test-Path $ncm) {
  $nc = [IO.File]::ReadAllText($ncm)
  if ($nc -notmatch 'images:\s*\{[^}]*domains') {
    $nc = $nc -replace 'images:\s*\{','images: { domains: ["fakestoreapi.com","images.unsplash.com","i.imgur.com"], '
    Set-Content $ncm $nc -Encoding UTF8
  } elseif ($nc -notmatch 'fakestoreapi\.com') {
    $nc = $nc -replace '(domains:\s*\[)([^\]]*)', '$1$2,"fakestoreapi.com"'
    Set-Content $ncm $nc -Encoding UTF8
  }
}

# — Remplace onLoadingComplete deprecated
if (Test-Path "src") {
  Get-ChildItem -Recurse -Include *.tsx,*.ts -Path src | ForEach-Object {
    $t = [IO.File]::ReadAllText($_.FullName)
    if ($t -match 'onLoadingComplete\s*=') {
      ($t -replace 'onLoadingComplete\s*=', 'onLoad=') | Set-Content $_.FullName -Encoding UTF8
    }
  }
}

# — Clean & install
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
if (Test-Path .\package-lock.json) { npm ci --silent } else { npm install --silent }

# — Rapport checks
Write-Host "▶ Checks"
Write-Host ("  • Node {0} / npm {1}" -f (node -v),(npm -v))
Write-Host "  • .env.local:"
foreach($k in @("NEXT_PUBLIC_SITE_URL","NEXT_PUBLIC_META_PIXEL_ID")){
  $line = (Get-Content .env.local -ErrorAction SilentlyContinue | Select-String -Pattern ("^\s*{0}\s*=" -f $k) | Select-Object -First 1).Line
  $val = if ($line) { $line.Split("=",2)[1] } else { "" }
  if ([string]::IsNullOrWhiteSpace($val)) { Write-Host "     - $($k): (`manquant)" } else { Write-Host "     - $($k): $($val)" }
}

$scan=@()
if (Test-Path src) {
  $scan += (Get-ChildItem -Recurse -Include *.tsx,*.ts -Path src | Select-String -Pattern '_id\s*:\s*\{' | ForEach-Object { "Objet potentiellement non-plain -> $($_.Path):$($_.LineNumber)" })
  $scan += (Get-ChildItem -Recurse -Include layout.tsx -Path src\app | Select-String -Pattern 'params\.locale' | ForEach-Object { "Vérifier Next15 (await params) -> $($_.Path):$($_.LineNumber)" })
}
if ($scan.Count) { Write-Host "  • Scan:"; $scan | ForEach-Object { "     - $_" } } else { Write-Host "  • Scan: RAS" }

# — Build (utilise $LASTEXITCODE au lieu des parenthèses coupables)
Write-Host "▶ Build"
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "✖ Build KO" -ForegroundColor Red
  exit 1
}

# — Dev + health-check puis stop
Write-Host "▶ Dev + healthcheck"
$dev = Start-Process -FilePath "node" -ArgumentList ".\node_modules\next\dist\bin\next","dev" -WorkingDirectory $root -PassThru -WindowStyle Hidden
$ok=$false
1..40 | ForEach-Object {
  Start-Sleep 1
  try {
    $r=Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -ge 200) { $ok=$true; break }
  } catch {}
}

$urls=@("http://localhost:3000/","http://localhost:3000/fr","http://localhost:3000/en","http://localhost:3000/api/products")
foreach($u in $urls){
  try{
    $r=Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 6
    Write-Host ("  OK {0} -> {1}" -f $u,$r.StatusCode)
  } catch {
    Write-Host ("  ERR {0} -> {1}" -f $u,$ErrorActionPreference='Continue'
$root="$env:USERPROFILE\Desktop\TechPlay_FINAL_DELIVERY"
Set-Location $root

Write-Host "▶ Repo: " (Get-Item $root).FullName

# — Node 20 via nvm si dispo
if (Get-Command nvm -ErrorAction SilentlyContinue) {
  nvm install 20.17.0 | Out-Null
  nvm use 20.17.0 | Out-Null
}
"20.17.0" | Set-Content .nvmrc

# — package.json (engines + scripts)
if (Test-Path package.json) {
  $pkg = [IO.File]::ReadAllText(package.json) | ConvertFrom-Json
  if (-not $pkg.engines) { $pkg | Add-Member -NotePropertyName engines -NotePropertyValue (@{}) }
  $pkg.engines.node = "20.x"
  if (-not $pkg.scripts) { $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue (@{}) }
  $pkg.scripts.lint = 'eslint "src/**/*.ts" "src/**/*.tsx" --no-error-on-unmatched-pattern'
  $pkg.scripts."start:prod" = "next build && next start -p 3000"
  $pkg.scripts.start = "next start -p 3000"
  ($pkg | ConvertTo-Json -Depth 100) | Set-Content package.json -Encoding UTF8
}

# — ESLint minimal non-interactif
if (-not (Test-Path .eslintrc.json)) {
  '{"root":true,"parser":"@typescript-eslint/parser","plugins":["@typescript-eslint","react"],"extends":["eslint:recommended","plugin:@typescript-eslint/recommended","plugin:react/recommended"],"settings":{"react":{"version":"detect"}}}' | Set-Content .eslintrc.json -Encoding UTF8
}

# — .env.local
if (-not (Test-Path .env.local)) { New-Item .env.local -ItemType File | Out-Null }
$envRaw = [IO.File]::ReadAllText(.env.local) -ErrorAction SilentlyContinue
if ($envRaw -notmatch '^\s*NEXT_PUBLIC_SITE_URL\s*=' ) { Add-Content .env.local "NEXT_PUBLIC_SITE_URL=http://localhost:3000`n" }
if ($envRaw -notmatch '^\s*NEXT_PUBLIC_META_PIXEL_ID\s*=' ) { Add-Content .env.local "NEXT_PUBLIC_META_PIXEL_ID=`n" }

# — env.ts (Zod) + import dans app/layout.tsx si présent
if (-not (Test-Path "src\env.ts")) {
  if (-not (Test-Path node_modules\zod)) { npm i zod --silent | Out-Null }
  @"
import { z } from "zod";
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
});
export const env = schema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
});
export default env;
"@ | Set-Content "src\env.ts" -Encoding UTF8
}
$layoutRoot = Join-Path $root "src\app\layout.tsx"
if (Test-Path $layoutRoot) {
  $lr = [IO.File]::ReadAllText($layoutRoot)
  if ($lr -notmatch 'import\s+["'']\./env["'']') {
    $lr = $lr -replace "^(import[^\n]*\n)","`$1import ""./env"";`n"
    Set-Content $layoutRoot $lr -Encoding UTF8
  }
}

# — next.config.mjs : domains (idempotent)
$ncm = Join-Path $root "next.config.mjs"
if (Test-Path $ncm) {
  $nc = [IO.File]::ReadAllText($ncm)
  if ($nc -notmatch 'images:\s*\{[^}]*domains') {
    $nc = $nc -replace 'images:\s*\{','images: { domains: ["fakestoreapi.com","images.unsplash.com","i.imgur.com"], '
    Set-Content $ncm $nc -Encoding UTF8
  } elseif ($nc -notmatch 'fakestoreapi\.com') {
    $nc = $nc -replace '(domains:\s*\[)([^\]]*)', '$1$2,"fakestoreapi.com"'
    Set-Content $ncm $nc -Encoding UTF8
  }
}

# — Remplace onLoadingComplete deprecated
if (Test-Path "src") {
  Get-ChildItem -Recurse -Include *.tsx,*.ts -Path src | ForEach-Object {
    $t = [IO.File]::ReadAllText($_.FullName)
    if ($t -match 'onLoadingComplete\s*=') {
      ($t -replace 'onLoadingComplete\s*=', 'onLoad=') | Set-Content $_.FullName -Encoding UTF8
    }
  }
}

# — Clean & install
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
if (Test-Path .\package-lock.json) { npm ci --silent } else { npm install --silent }

# — Rapport checks
Write-Host "▶ Checks"
Write-Host ("  • Node {0} / npm {1}" -f (node -v),(npm -v))
Write-Host "  • .env.local:"
foreach($k in @("NEXT_PUBLIC_SITE_URL","NEXT_PUBLIC_META_PIXEL_ID")){
  $line = (Get-Content .env.local -ErrorAction SilentlyContinue | Select-String -Pattern ("^\s*{0}\s*=" -f $k) | Select-Object -First 1).Line
  $val = if ($line) { $line.Split("=",2)[1] } else { "" }
  if ([string]::IsNullOrWhiteSpace($val)) { Write-Host "     - $($k): (`manquant)" } else { Write-Host "     - $($k): $($val)" }
}

$scan=@()
if (Test-Path src) {
  $scan += (Get-ChildItem -Recurse -Include *.tsx,*.ts -Path src | Select-String -Pattern '_id\s*:\s*\{' | ForEach-Object { "Objet potentiellement non-plain -> $($_.Path):$($_.LineNumber)" })
  $scan += (Get-ChildItem -Recurse -Include layout.tsx -Path src\app | Select-String -Pattern 'params\.locale' | ForEach-Object { "Vérifier Next15 (await params) -> $($_.Path):$($_.LineNumber)" })
}
if ($scan.Count) { Write-Host "  • Scan:"; $scan | ForEach-Object { "     - $_" } } else { Write-Host "  • Scan: RAS" }

# — Build (utilise $LASTEXITCODE au lieu des parenthèses coupables)
Write-Host "▶ Build"
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "✖ Build KO" -ForegroundColor Red
  exit 1
}

# — Dev + health-check puis stop
Write-Host "▶ Dev + healthcheck"
$dev = Start-Process -FilePath "node" -ArgumentList ".\node_modules\next\dist\bin\next","dev" -WorkingDirectory $root -PassThru -WindowStyle Hidden
$ok=$false
1..40 | ForEach-Object {
  Start-Sleep 1
  try {
    $r=Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -ge 200) { $ok=$true; break }
  } catch {}
}

$urls=@("http://localhost:3000/","http://localhost:3000/fr","http://localhost:3000/en","http://localhost:3000/api/products")
foreach($u in $urls){
  try{
    $r=Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 6
    Write-Host ("  OK {0} -> {1}" -f $u,$r.StatusCode)
  } catch {
    Write-Host ("  ⚠ {0} -> {1}" -f $u,$_.Exception.Message)
  }
}

if ($dev) { try { Get-Process -Id $dev.Id -ErrorAction SilentlyContinue | Stop-Process -Force } catch {} }
Write-Host "✔ Done."

.Exception.Message)
  }
}

if ($dev) { try { Get-Process -Id $dev.Id -ErrorAction SilentlyContinue | Stop-Process -Force } catch {} }
Write-Host "✔ Done."

