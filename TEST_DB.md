# 🧪 Testování funkčnosti databáze

## 📋 Krok 1: Ověření API endpointu

Nejprve ověřte, že API endpoint vrací Firebase konfiguraci:

### V prohlížeči:
1. Otevřete aplikaci na Vercelu: `https://your-app.vercel.app`
2. Otevřete Developer Console (F12)
3. Zadejte do konzole:
```javascript
fetch('/api/config')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Očekávaný výsledek:**
```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "your-project.firebaseapp.com",
  "databaseURL": "https://...",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789012",
  "appId": "1:123456789012:web:..."
}
```

**Pokud vidíte chybu:**
- Zkontrolujte, zda jsou environment variables nastavené v Vercelu
- Zkontrolujte Network tab v DevTools, zda endpoint vrací 200 OK

---

## 📋 Krok 2: Ověření Firebase inicializace

V konzoli prohlížeče byste měli vidět:
```
🔥 Firebase initialized for CX.TECH Rack Manager
🔥 Firebase Firestore ready for cxtechrack!
```

Pokud nevidíte tyto zprávy:
1. Zkontrolujte, zda je API endpoint dostupný
2. Zkontrolujte Console pro chyby
3. Ověřte, že všechny env proměnné jsou nastavené

---

## 📋 Krok 3: Test Realtime Database (starší SDK)

### Test ukládání:
1. V aplikaci vytvořte klienta (nebo vyberte existujícího)
2. Přidejte nějaký rack nebo zařízení
3. Klikněte na tlačítko **"☁️ Uložit do cloudu"** (v sekci "🔥 Firebase Sync")
4. V konzoli byste měli vidět: `✅ Data saved to Firebase`
5. Otevřete [Firebase Console](https://console.firebase.google.com/) → Realtime Database
6. Měli byste vidět data pod cestou: `clients/{clientId}`

### Test načítání:
1. Změňte nějaká data v aplikaci
2. Klikněte na **"⬇️ Načíst z cloudu"**
3. Data by se měla obnovit na hodnoty z databáze
4. V konzoli: `✅ Data loaded from Firebase`

### Test v konzoli:
```javascript
// Ověření, že db je inicializováno
console.log('DB initialized:', typeof db !== 'undefined' && db !== null);

// Test zápisu
if (db) {
  db.ref('test/connection').set({
    timestamp: new Date().toISOString(),
    test: true
  }).then(() => {
    console.log('✅ Realtime DB write successful');
  }).catch(err => {
    console.error('❌ Realtime DB write failed:', err);
  });
  
  // Test čtení
  db.ref('test/connection').once('value').then(snapshot => {
    console.log('✅ Realtime DB read successful:', snapshot.val());
  }).catch(err => {
    console.error('❌ Realtime DB read failed:', err);
  });
}
```

---

## 📋 Krok 4: Test Firestore (novější SDK)

### Test v konzoli:
```javascript
// Ověření, že Firestore funkce jsou dostupné
console.log('saveClientDataToDb:', typeof window.saveClientDataToDb);
console.log('loadClientDataFromDb:', typeof window.loadClientDataFromDb);

// Test zápisu
if (window.saveClientDataToDb) {
  window.saveClientDataToDb('test-client', {
    test: true,
    timestamp: new Date().toISOString(),
    data: { racks: [], devices: [] }
  }).then(() => {
    console.log('✅ Firestore write successful');
  }).catch(err => {
    console.error('❌ Firestore write failed:', err);
  });
}

// Test čtení
if (window.loadClientDataFromDb) {
  window.loadClientDataFromDb('test-client').then(data => {
    console.log('✅ Firestore read successful:', data);
  }).catch(err => {
    console.error('❌ Firestore read failed:', err);
  });
}
```

### Test přes UI:
1. V aplikaci vytvořte klienta
2. Přidejte nějaká data (racky, zařízení)
3. Klikněte na **"☁ Uložit do Firestore"** (v sekci "Cloud / Firestore")
4. Otevřete [Firebase Console](https://console.firebase.google.com/) → Firestore Database
5. Měli byste vidět kolekci `clients` s dokumentem obsahujícím `rackData`

---

## 📋 Krok 5: Test end-to-end workflow

### Kompletní test:
1. **Vytvořte nového klienta** v aplikaci
2. **Přidejte rack** (např. "RACK-01", 42U)
3. **Přidejte zařízení** (např. switch na pozici U10)
4. **Uložte do Realtime DB**: Klikněte "☁️ Uložit do cloudu"
5. **Ověřte v Firebase Console**: Data by měla být v Realtime Database
6. **Vymažte data lokálně**: Klikněte "Vymazat vše"
7. **Načtěte z Realtime DB**: Klikněte "⬇️ Načíst z cloudu"
8. **Ověřte**: Data by se měla obnovit

### Test Firestore workflow:
1. **Vytvořte klienta a data** (stejně jako výše)
2. **Uložte do Firestore**: Klikněte "☁ Uložit do Firestore"
3. **Ověřte v Firebase Console**: Firestore → kolekce `clients`
4. **Vymažte lokálně**: "Vymazat vše"
5. **Načtěte z Firestore**: Klikněte "☁ Načíst z Firestore"
6. **Ověřte**: Data by se měla obnovit

---

## 🔍 Debugging

### Pokud nic nefunguje:

1. **Zkontrolujte Console pro chyby:**
   - F12 → Console tab
   - Hledejte červené chyby

2. **Zkontrolujte Network tab:**
   - F12 → Network tab
   - Zkontrolujte, zda `/api/config` vrací 200 OK
   - Zkontrolujte response obsahuje správné hodnoty

3. **Zkontrolujte Firebase Console:**
   - [Firebase Console](https://console.firebase.google.com/)
   - Ověřte, že projekt existuje
   - Zkontrolujte, zda jsou Realtime Database a Firestore povolené

4. **Zkontrolujte Vercel Environment Variables:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Ověřte, že všech 7 proměnných je nastavených
   - Zkontrolujte, že mají prefix `NEXT_PUBLIC_`

5. **Test API endpointu přímo:**
```bash
curl https://your-app.vercel.app/api/config
```

---

## ✅ Checklist úspěšného testu

- [ ] API endpoint `/api/config` vrací JSON s konfigurací
- [ ] V konzoli vidím: `🔥 Firebase initialized`
- [ ] Realtime Database: Uložení dat funguje
- [ ] Realtime Database: Načtení dat funguje
- [ ] Firestore: Uložení dat funguje
- [ ] Firestore: Načtení dat funguje
- [ ] End-to-end workflow funguje (uložit → vymazat → načíst)
- [ ] Data jsou viditelná v Firebase Console

---

## 🆘 Časté problémy

### "Failed to load Firebase config from API"
- **Řešení**: Zkontrolujte environment variables v Vercelu a redeploy

### "Firebase není inicializováno"
- **Řešení**: Zkontrolujte, zda API endpoint funguje a vrací správná data

### "Missing environment variables"
- **Řešení**: Přidejte všechny 7 proměnných do Vercelu s prefixem `NEXT_PUBLIC_`

### Data se neukládají
- **Řešení**: Zkontrolujte Firebase Console → Realtime Database/Firestore → Rules (pravidla musí povolovat zápis)

### CORS chyby
- **Řešení**: Zkontrolujte `vercel.json` - CORS headers jsou nastavené

