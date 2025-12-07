# 🚨 Rychlá oprava: "Firestore Error"

## Krok 1: Otevřete Developer Console (F12)

## Krok 2: Zkontrolujte API endpoint

V konzoli zadejte:
```javascript
fetch('/api/config')
  .then(r => {
    console.log('Status:', r.status);
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return r.json();
  })
  .then(data => {
    console.log('✅ Config:', data);
    // Zkontrolujte, zda všechny hodnoty jsou vyplněné
    const missing = Object.entries(data).filter(([k, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      console.error('❌ Chybí hodnoty:', missing);
    } else {
      console.log('✅ Všechny hodnoty jsou vyplněné');
    }
  })
  .catch(err => {
    console.error('❌ Chyba:', err);
    console.log('\n🔧 ŘEŠENÍ:');
    console.log('1. Jděte do Vercel Dashboard');
    console.log('2. Project → Settings → Environment Variables');
    console.log('3. Přidejte všech 7 proměnných s prefixem NEXT_PUBLIC_');
    console.log('4. Redeploy aplikace');
  });
```

## Krok 3: Pokud API vrací chybu 500

**To znamená, že environment variables nejsou nastavené!**

### Řešení:
1. Otevřete [Vercel Dashboard](https://vercel.com/dashboard)
2. Vyberte projekt `cxtechrack`
3. Klikněte **Settings** → **Environment Variables**
4. Přidejte těchto 7 proměnných:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://your-project-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789012
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123456789012:web:abcdef123456
```

5. **DŮLEŽITÉ:** Vyberte všechny environmenty (Production, Preview, Development)
6. Klikněte **Save**
7. Jděte na **Deployments** tab
8. Klikněte na tři tečky u posledního deploymentu → **Redeploy**

## Krok 4: Ověření

Po redeploy:
1. Obnovte stránku (F5)
2. Klikněte na status "🔴 Firestore Error" vpravo nahoře
3. V konzoli byste měli vidět detailní informace
4. Status by se měl změnit na "🟢 Firestore Ready"

## Krok 5: Test uložení

```javascript
// V konzoli
if (window.saveClientDataToDb) {
  window.saveClientDataToDb('test', { test: true })
    .then(() => console.log('✅ Uložení funguje!'))
    .catch(err => console.error('❌ Chyba:', err));
} else {
  console.error('❌ Firestore funkce nejsou dostupné');
}
```

## 🔍 Kde získat Firebase config hodnoty?

1. [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt
3. ⚙️ **Project Settings**
4. Scrollujte na **Your apps**
5. Pokud nemáte web app, klikněte **Add app** → **Web** (</>)
6. Zkopírujte hodnoty z konfigurace

## ⚠️ Časté chyby

### "Missing environment variables"
- **Příčina:** Některé proměnné chybí nebo jsou prázdné
- **Řešení:** Zkontrolujte, zda všechny 7 proměnných mají hodnoty

### "Failed to load Firebase config"
- **Příčina:** API endpoint nefunguje
- **Řešení:** Zkontrolujte Network tab (F12) → najděte `/api/config` → zkontrolujte Response

### "Firestore is not enabled"
- **Příčina:** Firestore databáze není vytvořená v Firebase Console
- **Řešení:** Firebase Console → Firestore Database → Create database

