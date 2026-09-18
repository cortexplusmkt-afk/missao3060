$ErrorActionPreference = "Stop"
Write-Host "`n=== MISSÃO 30-60 // ANDROID SETUP ===`n" -ForegroundColor Cyan

$node = node --version
Write-Host "Node: $node"
if ([int]($node.TrimStart('v').Split('.')[0]) -lt 22) { throw "Capacitor 8 exige Node 22+." }

npm install
npm run build

if (-not (Test-Path ".\android")) {
  npx cap add android
}

npm run android:sync

$pkg = ".\android\app\src\main\java\com\cortexplus\missao3060"
New-Item -ItemType Directory -Force -Path $pkg | Out-Null
Copy-Item ".\native\android\java\MissaoWidgetPlugin.java" "$pkg\MissaoWidgetPlugin.java" -Force
Copy-Item ".\native\android\java\MissaoWidgetProvider.java" "$pkg\MissaoWidgetProvider.java" -Force
Copy-Item ".\native\android\java\MainActivity.java" "$pkg\MainActivity.java" -Force

New-Item -ItemType Directory -Force -Path ".\android\app\src\main\res\layout" | Out-Null
New-Item -ItemType Directory -Force -Path ".\android\app\src\main\res\drawable" | Out-Null
New-Item -ItemType Directory -Force -Path ".\android\app\src\main\res\xml" | Out-Null
New-Item -ItemType Directory -Force -Path ".\android\app\src\main\res\values" | Out-Null
Copy-Item ".\native\android\res\layout\widget_missao.xml" ".\android\app\src\main\res\layout\widget_missao.xml" -Force
Copy-Item ".\native\android\res\drawable\widget_bg.xml" ".\android\app\src\main\res\drawable\widget_bg.xml" -Force
Copy-Item ".\native\android\res\xml\missao_widget_info.xml" ".\android\app\src\main\res\xml\missao_widget_info.xml" -Force
Copy-Item ".\native\android\res\values\widget_strings.xml" ".\android\app\src\main\res\values\widget_strings.xml" -Force

$manifest = ".\android\app\src\main\AndroidManifest.xml"
$xml = Get-Content $manifest -Raw
if ($xml -notmatch "MissaoWidgetProvider") {
$receiver = @'
        <receiver
            android:name=".MissaoWidgetProvider"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/missao_widget_info" />
        </receiver>
'@
  $xml = $xml -replace '</application>', "$receiver`r`n    </application>"
  Set-Content $manifest $xml -Encoding UTF8
}

Write-Host "`nWidget nativo instalado na estrutura Android." -ForegroundColor Green
Write-Host "Agora rode: npm run android:sync" -ForegroundColor Yellow
Write-Host "Depois:     npx cap open android" -ForegroundColor Yellow
Write-Host "Ou APK debug direto: cd android; .\gradlew assembleDebug" -ForegroundColor Yellow
Write-Host "APK esperado: android\app\build\outputs\apk\debug\app-debug.apk`n" -ForegroundColor Cyan
