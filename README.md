# MISSÃO 30-60 — Android / APK / Widget

## Stack
- Vite + JavaScript
- Capacitor 8
- Capacitor Local Notifications
- Widget Android nativo (`AppWidgetProvider`)
- Plugin Capacitor local para sincronizar o estado do app com o widget

## 1. Pré-requisitos
Capacitor 8 exige Node 22+; para Android, instale Android Studio e Android SDK. A documentação atual do Capacitor indica Android Studio 2025.2.1+ e Android SDK API 24+.

## 2. No PowerShell do VS Code
```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-android.ps1
```

O script:
1. instala dependências;
2. gera o build web;
3. cria `android/` se ainda não existir;
4. sincroniza Capacitor;
5. instala o plugin local e o widget;
6. injeta o receiver do widget no Manifest.

## 3. Abrir Android Studio
```powershell
npx cap open android
```

## 4. Gerar APK debug sem abrir Android Studio
```powershell
npm run android:sync
cd android
.\gradlew assembleDebug
```
APK:
`android\app\build\outputs\apk\debug\app-debug.apk`

## 5. Depois de alterar HTML/CSS/JS
```powershell
npm run android:sync
```

## 6. Widget
Instale o APK no Android, segure a tela inicial > Widgets > MISSÃO 30-60. O widget mostra dia, ofensiva, peso, progresso, água, passos e Cortex+. O app envia atualizações ao widget sempre que o estado é salvo.

## 7. Notificações
No app, toque no sino da seção JARVIS para conceder permissão e agendar as notificações diárias.

## Observação
A primeira execução do `npm install` e a primeira sincronização Android precisam de internet para baixar dependências/Gradle se ainda não estiverem em cache.
