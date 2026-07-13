$redirect = '<script>if(location.hostname.includes("firebaseapp.com")){location.replace(location.href.replace(location.hostname,"creationcue.web.app"));}</script>'
$files = @('index.html','manage-coupons.html','month-planner.html','promo-details.html','social-generator.html','play-versions.html','claim.html','privacy.html')
foreach ($f in $files) {
  $content = Get-Content $f -Raw -Encoding UTF8
  if ($content -notmatch 'firebaseapp\.com.*replace.*web\.app') {
    $content = $content -replace '(<head[^>]*>)', ('$1' + $redirect)
    Set-Content $f $content -Encoding UTF8 -NoNewline
    Write-Host "Patched: $f"
  } else {
    Write-Host "Already patched: $f"
  }
}
