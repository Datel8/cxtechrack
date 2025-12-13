# 🚀 Rychlé nasazení na Vercel a testování

## Krok 1: Zkontrolujte, že máte Firebase konfiguraci

1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt → ⚙️ **Project Settings**
3. Scrollujte na **Your apps** → zkopírujte konfigurační hodnoty

## Krok 2: Nastavte Environment Variables v Vercelu

1. Jděte na [Vercel Dashboard](https://vercel.com/dashboard)
2. Vyberte projekt `RAck` (nebo vytvořte nový)
3. **Settings** → **Environment Variables**
4. Přidejte těchto 7 proměnných (pro **všechny** environmenty: Production, Preview, Development):

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://your-project-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789012
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123456789012:web:abcdef123456
```

⚠️ **DŮLEŽITÉ:** Vyberte **všechny tři** environmenty při přidávání!

## Krok 3: Commit a push do Git

```bash
git add .
git commit -m "Add debugging instrumentation for Firestore"
git push
```

Vercel automaticky nasadí novou verzi.

## Krok 4: Testování na nasazené verzi

1. Po dokončení deployment otevřete aplikaci na Vercelu
2. Otevřete **Developer Console** (F12 → Console)
3. Zkuste přidat nebo upravit data (klienta, rack, zařízení)
4. Počkejte 2-3 sekundy
5. Zkontrolujte konzoli - měli byste vidět logy:
   - `🔥 Firebase Firestore ready for cxtechrack!` = úspěch
   - `✅ Auto-sync to Firestore successful` = data se uložila
   - `⚠️ Auto-sync to Firestore failed` = chyba (zkontrolujte detaily)

## Krok 5: Ověření v Firebase Console

1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. **Firestore Database** → **Data**
3. Měli byste vidět kolekci `clients` s dokumenty
4. Dokument `global` obsahuje všechna data
5. Dokumenty s ID klientů obsahují data jednotlivých klientů

## 🔍 Co hledat v konzoli při testování:

✅ **Úspěch:**
- `loadFirebaseConfig SUCCESS`
- `Firestore init SUCCESS`
- `autoSyncToFirestore ENTRY` (s firestoreReady: true)
- `saveClientDataToDb SUCCESS`
- `autoSyncToFirestore SUCCESS`

❌ **Problém:**
- `loadFirebaseConfig ERROR` = API endpoint nefunguje nebo chybí env vars
- `Firestore init ERROR` = problém s inicializací
- `autoSyncToFirestore EARLY RETURN` = firestoreReady je false
- `saveClientDataToDb ERROR` = chyba při ukládání (permissions, network, atd.)

