# 🔍 Test Firestore připojení a oprávnění

## Rychlý test v konzoli prohlížeče

Po načtení stránky zadejte do konzole (F12 → Console):

```javascript
// Test 1: Ověření, že Firestore je inicializovaný
console.log('Firestore ready:', window.firestoreReady);
console.log('saveClientDataToDb:', typeof window.saveClientDataToDb);

// Test 2: Přímý test zápisu do Firestore
if (window.saveClientDataToDb) {
  window.saveClientDataToDb('test-direct', { test: true, timestamp: new Date().toISOString() })
    .then(() => {
      console.log('✅ Přímý test zápisu ÚSPĚŠNÝ!');
    })
    .catch((err) => {
      console.error('❌ Přímý test zápisu SELHAL:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
    });
} else {
  console.error('❌ saveClientDataToDb není dostupná');
}

// Test 3: Test čtení z Firestore
if (window.loadClientDataFromDb) {
  window.loadClientDataFromDb('test-direct')
    .then((data) => {
      console.log('✅ Test čtení úspěšný:', data);
    })
    .catch((err) => {
      console.error('❌ Test čtení selhal:', err);
    });
}
```

## Co znamenají výsledky

- ✅ **Firestore ready: true** a **saveClientDataToDb: function** = Firestore je správně inicializovaný
- ✅ **Přímý test zápisu ÚSPĚŠNÝ** = Security Rules fungují správně
- ❌ **permission-denied** = Security Rules blokují zápis - zkontrolujte pravidla v Firebase Console
- ❌ **unavailable** = Firestore není dostupný (síťový problém)

## Kontrola Security Rules

1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt **rack-e72b3**
3. **Firestore Database** → **Rules**
4. Mělo by tam být:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read, write: if true;
    }
  }
}
```

5. Pokud ne, nastavte a klikněte **Publish**
6. Počkejte 10-20 sekund na propagaci

