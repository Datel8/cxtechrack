# ✅ OVĚŘENÍ: Jsou Security Rules skutečně aktivní?

## Kritická kontrola

### 1. Zkontrolujte, že Rules jsou publikované

V Firebase Console → Firestore Database → **Rules**:

**MUSÍTE VIDĚT:**
- ✅ Zelenou zprávu pod editorem: **"Rules published successfully"** nebo **"Published"**
- ✅ Datum a čas posledního publikování

**NEMĚLI BYSTE VIDĚT:**
- ❌ Červené tlačítko "Publish" (pokud ano, klikněte na něj!)
- ❌ Žádnou zprávu o publikování

### 2. Zkuste manuální test v Firebase Console

**Toto je nejdůležitější test:**

1. Firebase Console → Firestore Database → **Data** tab
2. Klikněte **"Start collection"** (nebo pokud už existuje kolekce `clients`, klikněte na ni)
3. Collection ID: `clients`
4. Document ID: `test-manual-123`
5. Add field:
   - Field name: `rackData`
   - Type: **map** (nebo object)
   - Klikněte na map a přidejte:
     - Field: `test`
     - Type: **boolean**
     - Value: `true`
6. Klikněte **Save**

**Výsledek:**
- ✅ **Pokud se dokument vytvoří** = Rules fungují, problém je v kódu aplikace
- ❌ **Pokud dostanete chybu "Missing or insufficient permissions"** = Rules nejsou publikované nebo jsou špatně nastavené

### 3. Zkontrolujte režim Firestore

1. Firebase Console → Firestore Database
2. V horní části by mělo být vidět, zda je databáze v **"Test mode"** nebo **"Production mode"**
3. Pokud je v **Production mode**, MUSÍTE mít Security Rules
4. Pokud je v **Test mode**, měly by být automaticky otevřené (ale někdy nefungují)

### 4. Zkuste úplně nová rules (vyměňte celý obsah)

**Vymažte VŠECHNO v Rules editoru a vložte:**

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

**Pak:**
1. Klikněte **Publish**
2. Počkejte na zelenou zprávu "Rules published successfully"
3. Počkejte **60 sekund** (někdy trvá déle)
4. Obnovte aplikaci (Ctrl+F5)
5. Zkuste znovu test

### 5. Zkontrolujte project ID

V konzoli prohlížeče zadejte:

```javascript
// Zkontrolujte, jestli se připojujeme ke správnému projektu
console.log('Project ID z config:', window.firestoreDb?.app?.options?.projectId);
console.log('Očekávaný Project ID:', 'rack-e72b3');
```

Měly by se shodovat!


