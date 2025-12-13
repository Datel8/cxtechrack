# 🔧 Oprava: Neukládá se do Firestore

## 🔍 Diagnostika problému

Chyba "API key not valid" znamená, že Firebase API klíč má problém.

### Krok 1: Zkontrolujte API klíč v konzoli

Otevřete Developer Console (F12) a zadejte:

```javascript
// Zkontrolujte, jaký API klíč se používá
fetch('/api/config')
  .then(r => r.json())
  .then(config => {
    console.log('API Key (prvních 10 znaků):', config.apiKey?.substring(0, 10));
    console.log('Project ID:', config.projectId);
    console.log('Auth Domain:', config.authDomain);
    
    // Zkontrolujte, zda API klíč není prázdný
    if (!config.apiKey || config.apiKey === 'YOUR_API_KEY_HERE') {
      console.error('❌ API klíč není nastavený!');
    }
  });
```

### Krok 2: Zkontrolujte Firebase Console

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt
3. ⚙️ **Project Settings** → **General** tab
4. Scrollujte na **Your apps** → vyberte web app
5. Zkontrolujte, zda **API Key** odpovídá hodnotě v Vercelu

### Krok 3: Zkontrolujte API Key Restrictions

1. Otevřete [Google Cloud Console](https://console.cloud.google.com/)
2. Vyberte projekt
3. **APIs & Services** → **Credentials**
4. Najděte váš API Key
5. Klikněte na něj a zkontrolujte **API restrictions** a **Application restrictions**

**⚠️ DŮLEŽITÉ:**
- Pokud máte **HTTP referrer restrictions**, musí obsahovat vaši Vercel doménu
- Pokud máte **API restrictions**, musí obsahovat:
  - `Cloud Firestore API`
  - `Identity Toolkit API` (pro Authentication)

### Krok 4: Oprava API Key Restrictions

#### Možnost A: Odstranit restrictions (pro testování)

1. Google Cloud Console → APIs & Services → Credentials
2. Klikněte na API Key
3. V **Application restrictions** vyberte **None**
4. V **API restrictions** vyberte **Don't restrict key**
5. **Save**

#### Možnost B: Přidat správné restrictions (doporučeno)

1. **Application restrictions:**
   - Vyberte **HTTP referrers (web sites)**
   - Přidejte:
     - `https://your-app.vercel.app/*`
     - `https://*.vercel.app/*` (pro preview deployments)
     - `http://localhost:*` (pro lokální vývoj)

2. **API restrictions:**
   - Vyberte **Restrict key**
   - Vyberte tyto API:
     - ✅ Cloud Firestore API
     - ✅ Identity Toolkit API
     - ✅ Firebase Installations API

### Krok 5: Zkontrolujte Firestore Security Rules

1. Firebase Console → **Firestore Database** → **Rules**
2. Pro testování použijte:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Klikněte **Publish**

### Krok 6: Test uložení

V konzoli zadejte:

```javascript
// Test uložení
if (window.saveClientDataToDb) {
  window.saveClientDataToDb('test-' + Date.now(), {
    test: true,
    timestamp: new Date().toISOString()
  }).then(() => {
    console.log('✅ Uložení funguje!');
  }).catch(err => {
    console.error('❌ Chyba:', err);
    console.log('Error code:', err.code);
    console.log('Error message:', err.message);
  });
} else {
  console.error('❌ saveClientDataToDb není dostupná');
}
```

## 🔧 Rychlá oprava

### Pokud API klíč není správný:

1. **Získejte nový API klíč:**
   - Firebase Console → Project Settings → General
   - Scrollujte na **Your apps** → web app
   - Zkopírujte **apiKey**

2. **Aktualizujte v Vercelu:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Najděte `NEXT_PUBLIC_apiKey` nebo `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Aktualizujte hodnotu
   - **Redeploy aplikace**

### Pokud API klíč má restrictions:

1. **Odstraňte restrictions** (pro testování)
2. Nebo **přidejte správné restrictions** (viz Krok 4)

## 🆘 Časté chyby

### "API key not valid"
- **Příčina:** API klíč je špatný nebo má špatné restrictions
- **Řešení:** Zkontrolujte API klíč v Firebase Console a restrictions v Google Cloud Console

### "Missing or insufficient permissions"
- **Příčina:** Security Rules neumožňují zápis
- **Řešení:** Upravte Security Rules (viz Krok 5)

### "Firestore is not enabled"
- **Příčina:** Firestore databáze není vytvořená
- **Řešení:** Vytvořte Firestore Database v Firebase Console

## ✅ Checklist

- [ ] API klíč je správně nastavený v Vercelu
- [ ] API klíč odpovídá hodnotě v Firebase Console
- [ ] API restrictions obsahují Cloud Firestore API
- [ ] Application restrictions obsahují vaši Vercel doménu (nebo jsou None)
- [ ] Firestore Database je vytvořený
- [ ] Security Rules umožňují zápis
- [ ] Test uložení v konzoli funguje

