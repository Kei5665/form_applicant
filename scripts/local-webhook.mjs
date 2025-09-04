#!/usr/bin/env node

import http from 'node:http';

const port = process.env.WEBHOOK_PORT ? Number(process.env.WEBHOOK_PORT) : 3333;

const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    const now = new Date().toISOString();
    console.log(`\n[${now}] POST ${url}`);
    try {
      const json = JSON.parse(body || '{}');
      console.dir(json, { depth: null, colors: true });
    } catch {
      console.log(body);
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  });
});

server.listen(port, () => {
  console.log(`Local webhook server listening on http://localhost:${port}`);
});


