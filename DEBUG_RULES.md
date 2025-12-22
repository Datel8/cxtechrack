# 🔍 Debug Security Rules

## Kontrola 1: Jsou Rules publikované?

1. V Firebase Console → Firestore Database → **Rules**
2. Pod editorem by mělo být: **"Rules published successfully"** nebo podobné
3. Pokud vidíte **"Publish"** tlačítko stále aktivní, klikněte na něj znovu

## Kontrola 2: Zkuste úplně minimální rules

**Vyměňte celý obsah Rules editoru za:**

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

Toto povolí **vše** - pokud toto nefunguje, je problém někde jinde.

**Pak:**
1. Klikněte **Publish**
2. Počkejte **30 sekund** (někdy trvá déle)
3. Obnovte aplikaci (Ctrl+F5)
4. Zkuste znovu test

## Kontrola 3: Ověřte, že Rules jsou skutečně aktivní

V konzoli prohlížeče zkuste:

```javascript
// Zkontrolujte, jestli se připojujeme k správné databázi
console.log('Project ID:', firestoreDb?.app?.options?.projectId);

// Zkuste vytvořit dokument přímo přes Firestore SDK
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const testRef = doc(firestoreDb, "test-collection", "test-doc");
setDoc(testRef, { test: true })
  .then(() => console.log('✅ Test dokument vytvořen'))
  .catch(err => console.error('❌ Test selhal:', err.code, err.message));
```

## Kontrola 4: Zkontrolujte Firebase Console → Firestore Database → Data

1. Zkuste manuálně vytvořit dokument:
   - Klikněte na **"Start collection"**
   - Collection ID: `clients`
   - Document ID: `test-manual`
   - Field: `rackData` (type: map/object) s hodnotou `{test: true}`
   - Klikněte **Save**
2. Pokud to selže s chybou permissions, pak jsou Rules skutečně problém

## Možné další problémy

- **Firestore není v test mode** - pokud jste zvolili "production mode", musíte mít Rules
- **Rules nejsou správně validní** - zkuste validovat rules v editoru (měl by být nějaký validator)
- **Propagace rules trvá déle** - někdy to trvá až minutu


