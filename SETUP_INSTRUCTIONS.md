# 🚀 Rychlý průvodce nastavením Firebase v Vercelu

## ✅ Co bylo změněno

1. **Vytvořen API endpoint** (`/api/config.js`) - načítá Firebase config z environment variables
2. **Upraven `index.html`** - načítá config z API místo hardcodovaných hodnot
3. **Vytvořen `vercel.json`** - konfigurace pro Vercel deployment
4. **Přidán `.gitignore`** - ochrana environment variables

## 📝 KROKY PRO NASTAVENÍ

### 1️⃣ Získejte Firebase konfiguraci

1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt → ⚙️ **Project Settings**
3. Scrollujte na **Your apps** → pokud nemáte web app, klikněte **Add app** → **Web** (</>)
4. Zkopírujte tyto hodnoty:

```
apiKey
authDomain  
databaseURL
projectId
storageBucket
messagingSenderId
appId
```

### 2️⃣ Nastavte Environment Variables v Vercelu

**Přes Dashboard:**
1. [Vercel Dashboard](https://vercel.com/dashboard) → váš projekt
2. **Settings** → **Environment Variables**
3. Přidejte tyto proměnné (pro všechny environmenty):

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://your-project-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789012
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123456789012:web:abcdef123456
```

**Přes CLI:**
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

### 3️⃣ Deploy

```bash
git add .
git commit -m "Add Firebase config via env variables"
git push
```

Vercel automaticky nasadí novou verzi.

### 4️⃣ Ověření

1. Otevřete aplikaci na Vercelu
2. F12 → Console
3. Měli byste vidět: `🔥 Firebase initialized for CX.TECH Rack Manager`
4. Test API: `https://your-app.vercel.app/api/config` → měl by vrátit JSON s configem

## 🔧 Lokální vývoj

Vytvořte `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## 🆘 Troubleshooting

**Chyba: "Failed to load Firebase config"**
- Zkontrolujte `/api/config` endpoint
- Ověřte, že jsou všechny env proměnné nastavené
- Po přidání proměnných musíte redeployovat

**Chyba: "Missing environment variables"**
- Zkontrolujte názvy proměnných (musí začínat `NEXT_PUBLIC_`)
- Ujistěte se, že jsou nastavené pro správný environment

## 📚 Více informací

Podrobnější instrukce najdete v `README_VERCEL_SETUP.md`




