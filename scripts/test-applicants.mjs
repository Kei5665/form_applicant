#!/usr/bin/env node

// Simple test harness to POST to /api/applicants with various payloads.
// Usage: node scripts/test-applicants.mjs [baseURL]
// Default baseURL: http://localhost:3000

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const baseURL = process.argv[2] || 'http://localhost:3000';
const endpoint = new URL('/api/applicants', baseURL).toString();

function request(method, urlString, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const lib = url.protocol === 'https:' ? https : http;

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ridejob-form-test/1.0',
        ...headers,
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const cases = [
  {
    name: '通常フォーム + UTMなし',
    headers: { Referer: `${baseURL}/applicants/new` },
    body: {
      birthDate: '1990-01-01',
      lastName: '山田',
      firstName: '太郎',
      lastNameKana: 'ヤマダ',
      firstNameKana: 'タロウ',
      postalCode: '1000001',
      phoneNumber: '08012345678',
      experiment: { name: 'ab-hero', variant: 'A' },
      formOrigin: 'default',
    },
  },
  {
    name: '通常フォーム + Google検索UTM',
    headers: { Referer: `${baseURL}/applicants/new?utm_source=google&utm_medium=search` },
    body: {
      birthDate: '1991-02-02',
      lastName: '佐藤',
      firstName: '花子',
      lastNameKana: 'サトウ',
      firstNameKana: 'ハナコ',
      postalCode: '1500001',
      phoneNumber: '08011112222',
      utmParams: { utm_source: 'google', utm_medium: 'search' },
      experiment: { name: 'ab-hero', variant: 'B' },
      formOrigin: 'default',
    },
  },
  {
    name: 'TikTok広告UTM',
    headers: { Referer: `${baseURL}/applicants/new?utm_source=tiktok&utm_medium=ad` },
    body: {
      birthDate: '1992-03-03',
      lastName: '鈴木',
      firstName: '一郎',
      lastNameKana: 'スズキ',
      firstNameKana: 'イチロウ',
      postalCode: '1600022',
      phoneNumber: '08022223333',
      utmParams: { utm_source: 'tiktok', utm_medium: 'ad' },
      experiment: { name: 'ab-cta', variant: 'A' },
      formOrigin: 'default',
    },
  },
  {
    name: 'Coupangフォーム + Meta固定',
    headers: { Referer: `${baseURL}/coupang/applicants/new` },
    body: {
      birthDate: '1993-04-04',
      lastName: '高橋',
      firstName: '三郎',
      lastNameKana: 'タカハシ',
      firstNameKana: 'サブロウ',
      postalCode: '5300001',
      phoneNumber: '08033334444',
      utmParams: { utm_source: 'meta', utm_medium: 'ad' },
      experiment: { name: 'ab-coupang', variant: 'B' },
      formOrigin: 'coupang',
    },
  },
  {
    name: 'Baseのみ送信モード (LARK_SEND_BASE_ONLY=true 想定)',
    headers: { Referer: `${baseURL}/applicants/new?utm_source=meta&utm_medium=ad` },
    body: {
      birthDate: '1994-05-05',
      lastName: '小林',
      firstName: '四郎',
      lastNameKana: 'コバヤシ',
      firstNameKana: 'シロウ',
      postalCode: '6008001',
      phoneNumber: '08044445555',
      utmParams: { utm_source: 'meta', utm_medium: 'ad' },
      experiment: { name: 'feature-flag', variant: 'base-only' },
      formOrigin: 'default',
    },
  },
];

(async () => {
  console.log(`POST ${endpoint}`);
  for (const c of cases) {
    console.log(`\n=== ${c.name} ===`);
    try {
      const res = await request('POST', endpoint, c.body, c.headers);
      console.log('Status:', res.status);
      console.log('Body:');
      try {
        console.log(JSON.parse(res.body));
      } catch {
        console.log(res.body);
      }
    } catch (e) {
      console.error('Request failed:', e.message || e);
    }
    await sleep(300);
  }
})();


