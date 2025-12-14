# 🚨 URGENT: Oprava Security Rules

## Problém potvrzen
Chyba: `permission-denied` - Security Rules blokují zápis do Firestore

## KROK ZA KROKEM - Oprava

### 1. Otevřete Firebase Console
Jděte na: https://console.firebase.google.com/

### 2. Vyberte projekt
Klikněte na projekt: **rack-e72b3**

### 3. Přejděte na Firestore Database
V levém menu klikněte na: **Firestore Database**

### 4. Otevřete Rules
Klikněte na záložku **Rules** (nahoře vedle "Data")

### 5. Nahraďte obsah editoru

**VYMAŽTE** vše, co tam je, a vložte **P vací přesně tento kód:**

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

### 6. Publikujte pravidla
- Klikněte na tlačítko **Publish** (vpravo nahoře, zelené tlačítko)
- Počkejte na potvrzení "Rules published successfully"

### 7. Počkejte na propagaci
- Počkejte **10-20 sekund** (pravidla se musí propagovat na servery)
- Neobnovujte stránku hned, počkejte

### 8. Otestujte znovu
1. Obnovte aplikaci (F5)
2. Zkuste znovu test v konzoli nebo přidejte klienta
3. Mělo by to fungovat!

## ✅ Jak poznáte, že je to opravené

Po nastavení pravidel byste měli vidět v konzoli:
- ✅ `saveClientDataToDb SUCCESS` (místo ERROR)
- ✅ `✅ Auto-sync to Firestore successful`
- ✅ V Firebase Console → Firestore Database → Data byste měli vidět kolekci `clients` s dokumenty

## ⚠️ DŮLEŽITÉ

- Pravidla `allow read, write: if true;` jsou **otevřená** - kdokoliv může číst a psát
- Pro produkci byste měli použít přísnější pravidla s autentizací
- Ale pro teď to potřebujeme pro testování

