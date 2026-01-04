// UniFi devices proxy (serverless)
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

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const baseUrl = stripQuotes(payload.baseUrl || process.env.UNIFI_BASE_URL || '');
  const apiToken = stripQuotes(payload.apiToken || process.env.UNIFI_API_TOKEN || '');
  const siteId = stripQuotes(payload.siteId || process.env.UNIFI_SITE_ID || '');

  if (!baseUrl || !apiToken) {
    return res.status(400).json({ error: 'Missing baseUrl or apiToken' });
  }

  const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');
  const joinUrl = (root, path) => `${normalizeBaseUrl(root)}${path}`;

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiToken}`,
    'X-API-KEY': apiToken
  };

  const parseResponse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  };

  const extractList = (data) => {
    if (!data) return [];
    if (Array.isArray(data.devices)) return data.devices;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  try {
    const integrationPath = siteId
      ? `/proxy/network/integration/v1/sites/${encodeURIComponent(siteId)}/devices`
      : '/proxy/network/integration/v1/devices';
    let response = await fetch(joinUrl(baseUrl, integrationPath), { method: 'GET', headers });

    if (!response.ok) {
      const legacySite = siteId || 'default';
      const legacyPath = `/proxy/network/api/s/${encodeURIComponent(legacySite)}/stat/device`;
      response = await fetch(joinUrl(baseUrl, legacyPath), { method: 'GET', headers });
    }

    if (!response.ok) {
      const body = await response.text();
      return res.status(502).json({
        error: 'UniFi API request failed',
        status: response.status,
        body: body ? body.slice(0, 500) : ''
      });
    }

    const data = await parseResponse(response);
    const devices = extractList(data);
    return res.status(200).json({
      devices,
      count: devices.length
    });
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', details: err.message });
  }
};
