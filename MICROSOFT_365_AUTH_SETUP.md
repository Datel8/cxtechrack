# 🔷 Nastavení Microsoft 365 autentizace

## 📋 Krok 1: Nastavení v Firebase Console

1. Otevřete [Firebase Console](https://console.firebase.google.com/)
2. Vyberte váš projekt
3. V levém menu klikněte na **"Authentication"**
4. Klikněte na záložku **"Sign-in method"**
5. Klikněte na **"Microsoft"** v seznamu poskytovatelů

## 📋 Krok 2: Konfigurace Microsoft provideru

### Možnost A: Použití Azure AD App Registration (doporučeno)

1. **V Azure Portal:**
   - Otevřete [Azure Portal](https://portal.azure.com/)
   - Jděte na **Azure Active Directory** → **App registrations**
   - Klikněte **"New registration"**
   - Název: `CX.TECH Rack Manager` (nebo jiný)
   - Supported account types: 
     - **Accounts in this organizational directory only** (jen vaše organizace)
     - Nebo **Accounts in any organizational directory** (multi-tenant)
   - Redirect URI: 
     - Type: **Web**
     - URI: `https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler`
     - (Nahraďte YOUR-PROJECT-ID vaším Firebase project ID)
   - Klikněte **Register**

2. **Zkopírujte hodnoty:**
   - **Application (client) ID** → toto je **App ID** pro Firebase
   - Jděte na **Certificates & secrets** → vytvořte **New client secret**
   - Zkopírujte **Value** secretu (zobrazí se jen jednou!)

3. **V Firebase Console:**
   - Vložte **Application (client) ID** do pole **App ID**
   - Vložte **Client secret value** do pole **App secret**
   - Klikněte **Save**

### Možnost B: Použití Microsoft Account (jednodušší, ale méně bezpečné)

1. V Firebase Console → Authentication → Sign-in method → Microsoft
2. Klikněte **Enable**
3. Firebase automaticky vytvoří OAuth app
4. Klikněte **Save**

**⚠️ Poznámka:** Tato metoda je méně bezpečná a nedoporučuje se pro produkci.

## 📋 Krok 3: Nastavení autorizovaných domén

1. V Firebase Console → Authentication → Settings
2. Scrollujte na **Authorized domains**
3. Přidejte vaši doménu (např. `cxtechrack.vercel.app`)
4. Přidejte také `localhost` pro lokální vývoj

## 📋 Krok 4: Nastavení tenant ID (volitelné)

Pokud chcete omezit přístup jen na vaši organizaci:

1. V Azure Portal → Azure Active Directory → Overview
2. Zkopírujte **Tenant ID**
3. V kódu aplikace můžete nastavit:
```javascript
provider.setCustomParameters({
  tenant: 'your-tenant-id-here'
});
```

## 📋 Krok 5: Testování

1. Otevřete aplikaci
2. Klikněte na **"🔷 Přihlásit se (Microsoft 365)"**
3. Měli byste být přesměrováni na Microsoft přihlášení
4. Po úspěšném přihlášení byste měli vidět váš email v statusu

## 🔐 Bezpečnostní doporučení

### Pro produkci:

1. **Použijte Azure AD App Registration** (ne Microsoft Account)
2. **Nastavte tenant ID** pro omezení na vaši organizaci
3. **Povolte jen autorizované domény**
4. **Nastavte Security Rules v Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      // Pouze autentizovaní uživatelé
      allow read, write: if request.auth != null;
      
      // Nebo jen uživatelé z vaší domény
      allow read, write: if request.auth != null && 
        request.auth.token.email.matches('.*@cxtech\\.cz$');
    }
  }
}
```

## 🆘 Troubleshooting

### Chyba: "auth/popup-blocked"
**Příčina:** Prohlížeč blokuje popup okno

**Řešení:**
- Povolte popupy pro vaši doménu
- Nebo použijte `signInWithRedirect()` místo `signInWithPopup()`

### Chyba: "auth/unauthorized-domain"
**Příčina:** Doména není v seznamu autorizovaných domén

**Řešení:**
- Firebase Console → Authentication → Settings → Authorized domains
- Přidejte vaši doménu

### Chyba: "Invalid client secret"
**Příčina:** Špatný client secret nebo expirovaný

**Řešení:**
- Azure Portal → App registrations → Certificates & secrets
- Vytvořte nový secret
- Aktualizujte v Firebase Console

### Uživatel se nemůže přihlásit
**Příčina:** Možné problémy s tenant ID nebo oprávněními

**Řešení:**
- Zkontrolujte, zda je tenant ID správně nastavený
- Zkontrolujte, zda má uživatel přístup k aplikaci v Azure AD

## 📚 Další zdroje

- [Firebase Auth Microsoft Provider](https://firebase.google.com/docs/auth/web/microsoft-oauth)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)

