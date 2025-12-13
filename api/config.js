// API endpoint pro Firebase konfiguraci
// Tento soubor běží jako serverless funkce na Vercelu

module.exports = function handler(req, res) {
  // CORS headers pro bezpečnost
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Helper funkce pro odstranění uvozovek z hodnot
  const stripQuotes = (value) => {
    if (!value) return value;
    return value.toString().replace(/^["']|["']$/g, '');
  };

  // Načtení environment variables z Vercelu
  // Podporujeme oba formáty: NEXT_PUBLIC_FIREBASE_* i NEXT_PUBLIC_* (pro zpětnou kompatibilitu)
  const firebaseConfig = {
    apiKey: stripQuotes(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_apiKey || process.env.FIREBASE_API_KEY),
    authDomain: stripQuotes(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_authDomain || process.env.FIREBASE_AUTH_DOMAIN),
    databaseURL: stripQuotes(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_databaseURL || process.env.NEXT_PUBLIC_databaseUrl || process.env.FIREBASE_DATABASE_URL),
    projectId: stripQuotes(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_projectId || process.env.FIREBASE_PROJECT_ID),
    storageBucket: stripQuotes(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_storageBucket || process.env.FIREBASE_STORAGE_BUCKET),
    messagingSenderId: stripQuotes(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_messagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID),
    appId: stripQuotes(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_appId || process.env.FIREBASE_APP_ID)
  };

  // Validace, že všechny hodnoty jsou nastavené
  // databaseURL je volitelný (potřebný jen pro Realtime Database, ne pro Firestore)
  const requiredVars = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingVars = requiredVars
    .filter(key => !firebaseConfig[key])
    .map(key => key);

  if (missingVars.length > 0) {
    return res.status(500).json({
      error: 'Missing required environment variables',
      missing: missingVars,
      note: 'databaseURL is optional (only needed for Realtime Database, not Firestore)'
    });
  }
  
  // Pokud databaseURL není nastavený, nastavíme null (pro Firestore to není problém)
  if (!firebaseConfig.databaseURL) {
    firebaseConfig.databaseURL = null;
  }

  // Vrácení konfigurace
  res.status(200).json(firebaseConfig);
};

