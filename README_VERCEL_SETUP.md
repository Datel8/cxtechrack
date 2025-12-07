# 🔥 Instrukce pro nastavení Firebase konfigurace v Vercelu

## 📋 Krok 1: Získání Firebase konfiguračních dat

1. Přejděte na [Firebase Console](https://console.firebase.google.com/)
2. Vyberte váš projekt (nebo vytvořte nový)
3. Klikněte na ikonu ⚙️ **Project Settings** (nastavení projektu)
4. Scrollujte dolů na sekci **Your apps**
5. Pokud nemáte webovou aplikaci, klikněte na **Add app** → **Web** (</>)
6. Zkopírujte následující hodnoty z konfigurace:

```
apiKey: "AIzaSy..."
authDomain: "your-project.firebaseapp.com"
databaseURL: "https://your-project-default-rtdb.europe-west1.firebasedatabase.app"
projectId: "your-project-id"
storageBucket: "your-project.appspot.com"
messagingSenderId: "123456789012"
appId: "1:123456789012:web:abcdef123456"
```

## 📋 Krok 2: Nastavení Environment Variables v Vercelu

### Metoda A: Přes Vercel Dashboard (doporučeno)

1. Přejděte na [Vercel Dashboard](https://vercel.com/dashboard)
2. Vyberte váš projekt
3. Klikněte na **Settings** → **Environment Variables**
4. Přidejte následující proměnné:

| Název proměnné | Hodnota | Environment |
|---------------|--------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` (vaše API klíč) | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | `https://your-project-default-rtdb...` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789012:web:...` | Production, Preview, Development |

**⚠️ DŮLEŽITÉ:** 
- Použijte prefix `NEXT_PUBLIC_` pro proměnné, které mají být dostupné v prohlížeči
- Nebo použijte bez prefixu (pak budou dostupné jen na serveru přes API)
- Vyberte všechny environmenty (Production, Preview, Development)

### Metoda B: Přes Vercel CLI

```bash
# Instalace Vercel CLI (pokud ještě nemáte)
npm i -g vercel

# Přihlášení
vercel login

# Nastavení proměnných
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

## 📋 Krok 3: Deployment

1. Commitněte změny do Git repozitáře:
```bash
git add .
git commit -m "Add Firebase config via environment variables"
git push
```

2. Vercel automaticky nasadí novou verzi
3. Nebo manuálně deploy:
```bash
vercel --prod
```

## 📋 Krok 4: Ověření

1. Po nasazení otevřete vaši aplikaci na Vercelu
2. Otevřete Developer Console (F12)
3. Měli byste vidět: `🔥 Firebase initialized for CX.TECH Rack Manager`
4. Pokud vidíte chybu, zkontrolujte:
   - Zda jsou všechny environment variables nastavené
   - Zda mají správné hodnoty
   - Zda je API endpoint `/api/config` dostupný

## 🔧 Lokální vývoj

Pro lokální vývoj můžete vytvořit soubor `.env.local` (nebo `.env`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**⚠️ POZOR:** 
- `.env.local` přidejte do `.gitignore`, aby se nedostal do repozitáře
- Pro lokální testování můžete také použít `window.firebaseConfig` v HTML (viz níže)

## 🆘 Troubleshooting

### Chyba: "Failed to load Firebase config from API"
- Zkontrolujte, zda je API endpoint `/api/config` dostupný
- Otevřete v prohlížeči `https://your-app.vercel.app/api/config`
- Měli byste vidět JSON s konfigurací

### Chyba: "Missing environment variables"
- Zkontrolujte, zda jsou všechny proměnné nastavené v Vercelu
- Ujistěte se, že mají prefix `NEXT_PUBLIC_` (pokud chcete, aby byly dostupné v prohlížeči)
- Po přidání proměnných musíte redeployovat aplikaci

### Fallback pro lokální vývoj
Pokud chcete použít lokální konfiguraci bez API, můžete přidat do `index.html` před `</body>`:

```html
<script>
  // Fallback pro lokální vývoj
  window.firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
  };
</script>
```

## 📚 Další zdroje

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)

