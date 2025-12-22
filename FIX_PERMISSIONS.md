# 🔐 Oprava: Missing or insufficient permissions

## Problém
Chyba: `Missing or insufficient permissions` při ukládání do Firestore

## Řešení: Nastavení Firestore Security Rules

1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt **rack-e72b3**
3. V levém menu klikněte na **Firestore Database**
4. Klikněte na záložku **Rules** (nahoře)
5. Nahraďte stávající pravidla tímto kódem:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kolekce "clients" - povolit čtení a zápis všem (pro testování)
    match /clients/{clientId} {
      allow read, write: if true;
    }
    
    // Všechny ostatní kolekce - zamknout
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Klikněte na tlačítko **Publish** (vpravo nahoře)
7. Počkejte několik sekund na propagaci pravidel

## Ověření

Po nastavení pravidel:
1. Obnovte aplikaci (F5)
2. Zkuste znovu přidat klienta nebo data
3. Měli byste vidět v konzoli: `✅ Auto-sync to Firestore successful`
4. V Firebase Console → Firestore Database → Data byste měli vidět kolekci `clients` s dokumenty

## Pro produkci (bezpečnější pravidla)

Pro produkční prostředí můžete použít přísnější pravidla:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kolekce "clients" - povolit čtení a zápis autentizovaným uživatelům
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Ale pro testování použijte první variantu s `if true`.


