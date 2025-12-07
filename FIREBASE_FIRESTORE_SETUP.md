# 🔥 Nastavení Firestore v Firebase Console

## 📋 Krok 1: Vytvoření Firestore Database

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte váš projekt (nebo vytvořte nový)
3. V levém menu klikněte na **"Firestore Database"**
4. Pokud ještě nemáte Firestore vytvořený, klikněte na **"Create database"**

## 📋 Krok 2: Výběr režimu

Při vytváření Firestore zvolte:

### ⚠️ DŮLEŽITÉ: Vyberte **"Start in production mode"** nebo **"Start in test mode"**

**Test mode** (pro vývoj):
- Povolí čtení a zápis na 30 dní
- Po 30 dnech se automaticky přepne na production mode
- Vhodné pro testování

**Production mode** (doporučeno):
- Vyžaduje nastavení Security Rules
- Bezpečnější pro produkci

## 📋 Krok 3: Výběr lokace (Location)

Vyberte lokaci databáze:
- **Pro EU:** `europe-west1` (Belgium) nebo `europe-west3` (Frankfurt)
- **Pro USA:** `us-central1` (Iowa)
- **Důležité:** Tuto lokaci už později nelze změnit!

## 📋 Krok 4: Nastavení Security Rules

Po vytvoření databáze přejděte na záložku **"Rules"**

### Pro testování (dočasné):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Povolit čtení a zápis všem (POUZE PRO TESTOVÁNÍ!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Pro produkci (doporučeno):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kolekce "clients" - povolit čtení a zápis autentizovaným uživatelům
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    
    // Nebo povolit všem (pokud nechcete autentizaci)
    match /clients/{clientId} {
      allow read, write: if true;
    }
  }
}
```

**Jak upravit Rules:**
1. Firestore Database → **Rules** tab
2. Upravte pravidla podle výše
3. Klikněte **"Publish"**

## 📋 Krok 5: Ověření struktury dat

Aplikace ukládá data do Firestore v této struktuře:

```
clients/
  ├── global/
  │   └── rackData: {
  │       clients: [...],
  │       clientData: {...},
  │       lastClientId: "...",
  │       updatedAt: "..."
  │     }
  ├── {clientId1}/
  │   └── rackData: {
  │       racks: [...],
  │       devices: [...],
  │       connections: [...]
  │     }
  └── {clientId2}/
      └── rackData: {...}
```

## 📋 Krok 6: Ověření, že Firestore funguje

### V Firebase Console:
1. Firestore Database → **Data** tab
2. Měli byste vidět kolekci `clients`
3. Po uložení dat z aplikace byste měli vidět dokumenty

### V aplikaci:
1. Otevřete Developer Console (F12)
2. Zkontrolujte, zda vidíte: `🔥 Firebase Firestore ready for cxtechrack!`
3. Zkuste uložit data - měla by se objevit v Firebase Console

## 🔐 Nastavení autentizace (volitelné)

Pokud chcete používat autentizaci:

1. Firebase Console → **Authentication**
2. Klikněte **"Get started"**
3. Povolte **"Google"** jako Sign-in provider
4. V nastavení můžete přidat autorizované domény

**Poznámka:** Aplikace aktuálně nevyžaduje autentizaci pro Firestore (pokud nastavíte Rules jako `allow read, write: if true`)

## 🆘 Troubleshooting

### Chyba: "Missing or insufficient permissions"
**Příčina:** Security Rules neumožňují zápis

**Řešení:**
- Zkontrolujte Security Rules v Firestore
- Pro testování použijte: `allow read, write: if true;`
- Klikněte "Publish" po úpravě

### Chyba: "Firestore is not enabled"
**Příčina:** Firestore databáze není vytvořená

**Řešení:**
- Vytvořte Firestore Database (Krok 1)
- Počkejte na dokončení inicializace

### Data se neukládají
**Příčina:** Možné problémy s Rules nebo konfigurací

**Řešení:**
1. Zkontrolujte Security Rules
2. Zkontrolujte Console pro chyby
3. Ověřte, že Firestore je inicializováno v aplikaci

## ✅ Checklist

- [ ] Firestore Database vytvořený
- [ ] Lokace vybraná (např. `europe-west1`)
- [ ] Security Rules nastavené (alespoň pro testování)
- [ ] Kolekce `clients` je viditelná v Data tab (po prvním uložení)
- [ ] Aplikace zobrazuje: `🔥 Firebase Firestore ready`

## 📚 Další zdroje

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Pricing](https://firebase.google.com/pricing)

