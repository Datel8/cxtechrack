// Zabbix hostgroups proxy (serverless)
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

  const apiUrl = process.env.ZABBIX_API_URL || 'https://zabbix.cxtech.cz/api_jsonrpc.php';
  const apiToken = process.env.ZABBIX_API_TOKEN;

  if (!apiToken) {
    return res.status(500).json({ error: 'Missing ZABBIX_API_TOKEN' });
  }

  const payload = {
    jsonrpc: '2.0',
    method: 'hostgroup.get',
    params: {
      output: ['groupid', 'name'],
      sortfield: 'name'
    },
    auth: apiToken,
    id: 1
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Zabbix API request failed', status: response.status });
    }

    const data = await response.json();

    if (data.error) {
      return res.status(502).json({ error: 'Zabbix API error', details: data.error });
    }

    const groups = (data.result || []).map((group) => ({
      id: group.groupid,
      name: group.name
    }));

    return res.status(200).json({ groups });
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', details: err.message });
  }
};
