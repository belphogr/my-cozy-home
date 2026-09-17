$ErrorActionPreference='Stop'
try {
$projectRoot=Split-Path -Parent $PSScriptRoot
$distIndex=Join-Path $projectRoot 'dist\index.html'
$serverScript=Join-Path $PSScriptRoot 'server.mjs'
$dataDirectory=Join-Path $projectRoot 'desktop-data'
$url='http://127.0.0.1:4187/'

$needsBuild=-not (Test-Path -LiteralPath $distIndex)
if(-not $needsBuild){
  $sourceCandidates=@(
    (Join-Path $projectRoot 'src'),
    (Join-Path $projectRoot 'public'),
    (Join-Path $projectRoot 'package.json'),
    (Join-Path $projectRoot 'vite.config.ts')
  )
  $latestSource=$sourceCandidates|Where-Object{Test-Path -LiteralPath $_}|ForEach-Object{
    if((Get-Item -LiteralPath $_).PSIsContainer){Get-ChildItem -LiteralPath $_ -Recurse -File}else{Get-Item -LiteralPath $_}
  }|Sort-Object LastWriteTime -Descending|Select-Object -First 1
  $needsBuild=$latestSource.LastWriteTime -gt (Get-Item -LiteralPath $distIndex).LastWriteTime
}

if($needsBuild){
  Push-Location $projectRoot
  try { npm run build } finally { Pop-Location }
}

$serverReady=$false
try {
  $response=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
  $serverReady=$response.StatusCode -eq 200
} catch {}

if(-not $serverReady){
  $node=(Get-Command node -ErrorAction Stop).Source
  Start-Process -FilePath $node -ArgumentList @($serverScript) -WorkingDirectory $projectRoot -WindowStyle Hidden
  for($attempt=0;$attempt -lt 30;$attempt++){
    Start-Sleep -Milliseconds 200
    try {
      $response=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
      if($response.StatusCode -eq 200){$serverReady=$true;break}
    } catch {}
  }
}

if(-not $serverReady){throw '小屋桌面服务未能启动。'}

$edgeCandidates=@(
  (Join-Path ([Environment]::GetEnvironmentVariable('ProgramFiles(x86)')) 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
)
$edge=$edgeCandidates|Where-Object{Test-Path -LiteralPath $_}|Select-Object -First 1
if(-not $edge){throw '未找到 Microsoft Edge，无法启动桌面窗口。'}

New-Item -ItemType Directory -Path $dataDirectory -Force|Out-Null
$gpuPreferenceKey='HKCU:\Software\Microsoft\DirectX\UserGpuPreferences'
$previousGpuPreference=$null
$hadGpuPreference=$false
try {
  New-Item -Path $gpuPreferenceKey -Force|Out-Null
  $existingPreferences=Get-ItemProperty -Path $gpuPreferenceKey -ErrorAction SilentlyContinue
  $existingPreference=$existingPreferences.PSObject.Properties[$edge]
  if($existingPreference){
    $hadGpuPreference=$true
    $previousGpuPreference=$existingPreference.Value
  }
  # Windows chooses the graphics adapter when Edge creates its GPU process.
  # Keep the preference only during startup so normal Edge windows are unaffected later.
  New-ItemProperty -Path $gpuPreferenceKey -Name $edge -Value 'GpuPreference=2;' -PropertyType String -Force|Out-Null
  Start-Process -FilePath $edge -ArgumentList @("--app=$url","--user-data-dir=$dataDirectory",'--no-first-run','--disable-session-crashed-bubble','--force_high_performance_gpu')
  Start-Sleep -Seconds 8
} finally {
  if($hadGpuPreference){
    New-ItemProperty -Path $gpuPreferenceKey -Name $edge -Value $previousGpuPreference -PropertyType String -Force|Out-Null
  } else {
    Remove-ItemProperty -Path $gpuPreferenceKey -Name $edge -ErrorAction SilentlyContinue
  }
}
$logPath=Join-Path $PSScriptRoot 'launch-error.log'
Remove-Item -LiteralPath $logPath -Force -ErrorAction SilentlyContinue
} catch {
  $logPath=Join-Path $PSScriptRoot 'launch-error.log'
  ($_|Out-String)|Set-Content -LiteralPath $logPath -Encoding UTF8
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show("启动失败，详情已保存到：`n$logPath",'我的小屋')|Out-Null
  exit 1
}
