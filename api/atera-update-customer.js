// Atera customer update proxy (serverless)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripQuotes = (value) => {
    if (!value) return value;
    return value.toString().replace(/^["']|["']$/g, '');
  };

  const apiKey = stripQuotes(process.env.ATERA_API_KEY || process.env.ATERA_API_TOKEN);
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing ATERA_API_KEY' });
  }

  const baseUrl = stripQuotes(process.env.ATERA_UPDATE_API_URL || 'https://app.atera.com/api/v3/customers');
  const apiKeyHeader = stripQuotes(process.env.ATERA_API_KEY_HEADER || 'X-API-KEY');
  const authScheme = stripQuotes(process.env.ATERA_API_AUTH_SCHEME || 'Bearer');
  const updateMethod = stripQuotes(process.env.ATERA_UPDATE_METHOD || 'PUT').toUpperCase();

  const headers = { 'Content-Type': 'application/json' };
  if (apiKeyHeader.toLowerCase() === 'authorization') {
    headers[apiKeyHeader] = `${authScheme} ${apiKey}`;
  } else {
    headers[apiKeyHeader] = apiKey;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const customerId = body.customerId || body.id || body.customerID || body.CustomerID;
    const customer = body.customer || body.payload || body.data || body.customerData || {};

    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' });
    }
    if (!customer || typeof customer !== 'object') {
      return res.status(400).json({ error: 'Missing customer payload' });
    }

    const safeBase = baseUrl.replace(/\/$/, '');
    const url = `${safeBase}/${encodeURIComponent(customerId)}`;
    const response = await fetch(url, {
      method: updateMethod,
      headers,
      body: JSON.stringify(customer)
    });

    const responseBody = await response.text();
    if (!response.ok) {
      return res.status(502).json({
        error: 'Atera API request failed',
        status: response.status,
        body: responseBody ? responseBody.slice(0, 500) : ''
      });
    }

    if (!responseBody) {
      return res.status(200).json({ ok: true });
    }

    try {
      return res.status(200).json(JSON.parse(responseBody));
    } catch (err) {
      return res.status(200).json({ ok: true, raw: responseBody.slice(0, 500) });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', details: err.message });
  }
};
