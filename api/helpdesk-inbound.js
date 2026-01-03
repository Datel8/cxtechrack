// Helpdesk inbound email webhook (Power Automate -> Firestore + Storage)
const admin = require('firebase-admin');
const crypto = require('crypto');

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function stripQuotes(value) {
  if (!value) return value;
  return value.toString().replace(/^["']|["']$/g, '');
}

function parseServiceAccount() {
  const raw = stripQuotes(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT);
  if (!raw) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
  }
  let jsonString = raw;
  if (!raw.trim().startsWith('{')) {
    jsonString = Buffer.from(raw, 'base64').toString('utf8');
  }
  const parsed = JSON.parse(jsonString);
  if (parsed.private_key && parsed.private_key.includes('\\n')) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return parsed;
}

function initAdmin() {
  if (admin.apps.length) return admin.app();
  const serviceAccount = parseServiceAccount();
  const bucket = stripQuotes(process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucket
  });
  return admin.app();
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

function normalizeEmail(value) {
  const raw = (value || '').toString().trim();
  if (!raw) return '';
  const match = raw.match(/<([^>]+)>/);
  const email = (match ? match[1] : raw).trim();
  return email.toLowerCase();
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function sanitizeFileName(name) {
  const safe = (name || 'priloha').toString().replace(/[/\\?%*:|"<>]/g, '-').trim();
  return safe || 'priloha';
}

function extractMailbox(payload) {
  const candidates = [
    payload.mailbox,
    payload.sharedMailbox,
    payload.inbox,
    payload.recipient,
    payload.to,
    payload.To
  ].filter(Boolean);

  const mailboxList = [];
  candidates.forEach((candidate) => {
    if (typeof candidate === 'string') {
      mailboxList.push(normalizeEmail(candidate));
      return;
    }
    if (Array.isArray(candidate)) {
      candidate.forEach((entry) => {
        if (typeof entry === 'string') {
          mailboxList.push(normalizeEmail(entry));
        } else if (entry && entry.emailAddress && entry.emailAddress.address) {
          mailboxList.push(normalizeEmail(entry.emailAddress.address));
        }
      });
      return;
    }
    if (candidate && candidate.emailAddress && candidate.emailAddress.address) {
      mailboxList.push(normalizeEmail(candidate.emailAddress.address));
    }
  });

  const normalized = mailboxList.filter(Boolean);
  return normalized.length ? normalized[0] : '';
}

function extractAttachments(payload) {
  const list = payload.attachments || payload.Attachments || payload.files || [];
  return Array.isArray(list) ? list : [];
}

async function uploadAttachment(bucket, ticketId, attachment) {
  const contentBytes = attachment.contentBytes || attachment.ContentBytes || attachment.content || attachment.data || '';
  if (!contentBytes) return null;
  const cleanName = sanitizeFileName(attachment.name || attachment.fileName || 'priloha');
  const contentType = attachment.contentType || attachment.content_type || 'application/octet-stream';
  const buffer = Buffer.from(contentBytes.replace(/^data:.*;base64,/, ''), 'base64');
  if (!buffer.length) return null;
  if (buffer.length > MAX_ATTACHMENT_BYTES) return null;

  const token = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const fileId = createId('ATT');
  const path = `helpdesk/inbound/${ticketId}/${fileId}-${cleanName}`;
  const file = bucket.file(path);

  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  return {
    id: fileId,
    name: cleanName,
    type: contentType,
    size: buffer.length,
    url,
    path,
    createdAt: Date.now(),
    source: 'email'
  };
}

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

  try {
    initAdmin();
    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const mailbox = extractMailbox(payload);
    const subject = (payload.subject || payload.Subject || '(bez predmetu)').toString();
    const fromRaw = payload.from || payload.From || payload.sender || payload.Sender || '';
    const fromAddress = normalizeEmail(fromRaw);
    const fromName = payload.fromName || payload.FromName || payload.senderName || '';
    const messageId = payload.messageId || payload.MessageId || payload.internetMessageId || '';
    const body = (payload.body || payload.text || payload.plain || payload.content || '').toString();

    if (!mailbox) {
      return res.status(400).json({ error: 'Missing mailbox address' });
    }

    const docPath = stripQuotes(process.env.RACK_MANAGER_GLOBAL_PATH || 'rackManager/global');
    const docRef = db.doc(docPath);

    const ticketId = createId('HD');
    const now = Date.now();
    const attachmentsPayload = extractAttachments(payload);
    const attachmentResults = [];

    for (const attachment of attachmentsPayload) {
      const saved = await uploadAttachment(bucket, ticketId, attachment);
      if (saved) attachmentResults.push(saved);
    }

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(docRef);
      const data = snap.exists ? (snap.data() || {}) : {};
      const clients = Array.isArray(data.clients) ? data.clients : [];
      let clientId = payload.clientId || payload.ClientId || '';
      let clientName = payload.clientName || payload.ClientName || '';

      if (!clientId && mailbox) {
        const domain = mailbox.includes('@') ? mailbox.split('@')[1] : '';
        const match = clients.find((client) => {
          const emails = Array.isArray(client.helpdeskEmails) ? client.helpdeskEmails : [];
          const domains = Array.isArray(client.helpdeskDomains) ? client.helpdeskDomains : [];
          const normalizedEmails = emails.map((entry) => entry.toLowerCase().trim());
          const emailMatch = normalizedEmails
            .filter((entry) => entry.includes('@'))
            .map(normalizeEmail)
            .includes(mailbox);
          const emailDomainMatch = normalizedEmails
            .filter((entry) => !entry.includes('@'))
            .map((entry) => entry.replace(/^@/, ''))
            .includes(domain);
          const domainMatch = domain
            ? domains.map((item) => item.toLowerCase().replace(/^@/, '')).includes(domain)
            : false;
          return emailMatch || domainMatch || emailDomainMatch;
        });
        if (match) {
          clientId = match.id;
          clientName = match.name || clientName;
        }
      }

      const ticket = {
        id: ticketId,
        title: subject || '(bez predmetu)',
        description: body || '',
        clientId: clientId || '',
        clientName: clientName || '',
        status: 'open',
        priority: 'medium',
        assignee: '',
        dueAt: '',
        source: 'email',
        tags: [],
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        attachments: attachmentResults,
        chat: [
          {
            id: createId('MSG'),
            channel: 'customer',
            author: fromName || fromAddress || 'Zakaznik',
            content: body || '',
            createdAt: now
          }
        ],
        requesterEmail: fromAddress || '',
        createdByEmail: fromAddress || '',
        createdByName: fromName || '',
        external: {
          provider: 'email',
          externalId: messageId || '',
          externalUrl: '',
          lastSyncAt: now,
          status: 'linked',
          mailbox: mailbox,
          sender: fromAddress
        }
      };

      const tickets = Array.isArray(data.helpdeskTickets) ? data.helpdeskTickets : [];
      tickets.push(ticket);
      transaction.set(docRef, {
        helpdeskTickets: tickets,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAtMs: Date.now(),
        updatedBy: 'helpdesk-inbound'
      }, { merge: true });
    });

    return res.status(200).json({ ok: true, ticketId });
  } catch (err) {
    console.error('Helpdesk inbound failed:', err);
    return res.status(500).json({ error: 'Helpdesk inbound failed', details: err.message });
  }
};
