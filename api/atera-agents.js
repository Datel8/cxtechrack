// Atera agents proxy (serverless)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

  const baseUrl = stripQuotes(process.env.ATERA_AGENTS_URL || 'https://app.atera.com/api/v3/agents');
  const pageParam = stripQuotes(process.env.ATERA_PAGE_PARAM || 'page');
  const pageSizeParam = stripQuotes(process.env.ATERA_PAGE_SIZE_PARAM || 'pageSize');
  const pageSize = parseInt(process.env.ATERA_PAGE_SIZE || '100', 10);
  const apiKeyHeader = stripQuotes(process.env.ATERA_API_KEY_HEADER || 'X-API-KEY');
  const authScheme = stripQuotes(process.env.ATERA_API_AUTH_SCHEME || 'Bearer');

  const headers = { 'Content-Type': 'application/json' };
  if (apiKeyHeader.toLowerCase() === 'authorization') {
    headers[apiKeyHeader] = `${authScheme} ${apiKey}`;
  } else {
    headers[apiKeyHeader] = apiKey;
  }

  const buildUrl = (page) => {
    try {
      const url = new URL(baseUrl);
      if (pageParam) url.searchParams.set(pageParam, String(page));
      if (pageSizeParam && Number.isFinite(pageSize)) {
        url.searchParams.set(pageSizeParam, String(pageSize));
      }
      return url.toString();
    } catch (err) {
      if (!pageParam) return baseUrl;
      const glue = baseUrl.includes('?') ? '&' : '?';
      const sizePart = pageSizeParam && Number.isFinite(pageSize)
        ? `${encodeURIComponent(pageSizeParam)}=${encodeURIComponent(pageSize)}&`
        : '';
      return `${baseUrl}${glue}${sizePart}${encodeURIComponent(pageParam)}=${encodeURIComponent(page)}`;
    }
  };

  const extractList = (data) => {
    if (!data) return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.agents)) return data.agents;
    if (Array.isArray(data.devices)) return data.devices;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.value)) return data.value;
    if (Array.isArray(data)) return data;
    return [];
  };

  const getTotal = (data) => {
    if (!data) return null;
    return data.totalItemCount || data.totalCount || data.total || data.TotalItemCount || data.TotalCount || null;
  };

  try {
    const agents = [];
    let page = 1;
    let total = null;
    let keepFetching = true;

    while (keepFetching) {
      const response = await fetch(buildUrl(page), { method: 'GET', headers });
      if (!response.ok) {
        const body = await response.text();
        return res.status(502).json({
          error: 'Atera API request failed',
          status: response.status,
          body: body ? body.slice(0, 500) : ''
        });
      }

      const data = await response.json();
      const items = extractList(data);
      if (!items.length) break;

      agents.push(...items);
      total = total || getTotal(data);
      page += 1;

      if (total && agents.length >= total) {
        keepFetching = false;
      }

      if (!total && items.length < pageSize) {
        keepFetching = false;
      }
    }

    return res.status(200).json({
      agents,
      count: agents.length,
      total: total || agents.length
    });
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', details: err.message });
  }
};
