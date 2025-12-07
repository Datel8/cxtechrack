# 🔍 Debug: "Firebase není inicializováno"

## Rychlá diagnostika

### 1. Otevřete Developer Console (F12)

### 2. Zkontrolujte API endpoint

V konzoli zadejte:
```javascript
fetch('/api/config')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API Config:', data);
    // Zkontrolujte, zda všechny hodnoty jsou vyplněné
    Object.keys(data).forEach(key => {
      if (!data[key]) {
        console.error('❌ Missing:', key);
      }
    });
  })
  .catch(err => {
    console.error('❌ API Error:', err);
    console.log('Zkontrolujte:');
    console.log('1. Jsou environment variables nastavené v Vercelu?');
    console.log('2. Je API endpoint /api/config dostupný?');
  });
```

### 3. Zkontrolujte Firestore inicializaci

V konzoli zadejte:
```javascript
console.log('Firestore ready:', window.firestoreReady);
console.log('saveClientDataToDb:', typeof window.saveClientDataToDb);
console.log('loadClientDataFromDb:', typeof window.loadClientDataFromDb);
```

**Očekávaný výsledek:**
- `firestoreReady: true`
- `saveClientDataToDb: function`
- `loadClientDataFromDb: function`

### 4. Test uložení do Firestore

```javascript
if (window.saveClientDataToDb) {
  window.saveClientDataToDb('test-client', {
    test: true,
    timestamp: new Date().toISOString()
  }).then(() => {
    console.log('✅ Test uložení úspěšný!');
  }).catch(err => {
    console.error('❌ Test uložení selhal:', err);
  });
} else {
  console.error('❌ Firestore funkce nejsou dostupné');
  console.log('Zkontrolujte konzoli pro chyby inicializace');
}
```

## Možné příčiny a řešení

### ❌ API endpoint vrací chybu 500
**Příčina:** Environment variables nejsou nastavené v Vercelu

**Řešení:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Přidejte všech 7 proměnných s prefixem `NEXT_PUBLIC_`
3. Redeploy aplikace

### ❌ API endpoint vrací "Missing environment variables"
**Příčina:** Některé proměnné chybí nebo jsou prázdné

**Řešení:**
- Zkontrolujte, zda všechny proměnné mají hodnoty
- Zkontrolujte, zda mají správný prefix `NEXT_PUBLIC_`

### ❌ "Firestore functions not available"
**Příčina:** Firestore se neinicializovalo kvůli chybě v API

**Řešení:**
1. Zkontrolujte konzoli pro chyby
2. Ověřte, že API endpoint funguje (viz krok 2)
3. Obnovte stránku a počkejte na inicializaci

### ❌ CORS chyby
**Příčina:** API endpoint nemá správné CORS headers

**Řešení:**
- Zkontrolujte `vercel.json` - CORS headers jsou nastavené
- Zkontrolujte, zda API route je správně nakonfigurovaná

## Testování po opravě

1. **Obnovte stránku** (F5)
2. **Počkejte 2-3 sekundy** na inicializaci
3. **Zkontrolujte konzoli** - měli byste vidět:
   ```
   ✅ Firebase config loaded: {...}
   🔥 Firebase Firestore ready for cxtechrack!
   ```
4. **Zkuste uložit** - mělo by to fungovat

## Kontrola v Firebase Console

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt
3. Firestore Database → Data
4. Měli byste vidět kolekci `clients` s dokumenty

## Pokud nic nepomáhá

1. Zkontrolujte Network tab (F12 → Network)
2. Najděte request na `/api/config`
3. Zkontrolujte Response - měl by obsahovat JSON s konfigurací
4. Zkontrolujte Status Code - měl by být 200 OK

