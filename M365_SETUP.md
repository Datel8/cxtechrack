# M365 Setup (Azure AD + Firebase Auth)

This guide describes how to connect Microsoft 365 (Azure AD) to Firebase Auth
and configure the app to allow M365 login.

## 1) Azure AD: App registration
- Azure Portal -> Entra ID (Azure AD) -> App registrations -> New registration.
- Name: e.g. "CXTech Rack".
- Supported account types:
  - Single tenant if you only allow your tenant.
  - Multi-tenant only if you need multiple tenants.
- Redirect URI (Web):
  - `https://<your-domain>/` (must match the app M365 settings).
- Create the app.

## 2) Copy IDs
- Application (client) ID -> use as Client ID.
- Directory (tenant) ID -> use as Tenant ID.

## 3) Client secret
- App -> Certificates & secrets -> New client secret.
- Copy the secret value (shown only once).
- Use it as Client Secret in Firebase and in the app settings.

## 4) API permissions
- App -> API permissions -> Add a permission -> Microsoft Graph.
- Delegated permissions:
  - `openid`, `profile`, `email`, `offline_access`, `User.Read`
- Grant admin consent if required.

## 5) Firebase Auth provider
- Firebase Console -> Authentication -> Sign-in method -> Microsoft.
- Enable provider.
- Fill Client ID + Client Secret (from Azure).
- Save.

## 6) App settings (Admin -> M365)
- Enable M365 login.
- Tenant ID (GUID).
- Client ID.
- Client Secret.
- Redirect URI (must match Azure registration).
- Scopes (keep default if unsure).
- Allowed domains: `cxtech.cz` (or your list).

## 7) Test
- Click "Microsoft 365" login.
- If tenantId does not match, login is rejected.
- If email domain is not allowed, login is rejected.

