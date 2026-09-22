#!/usr/bin/env node
// Reads the latest wlib.SMS rows through GET /api/pmws/smslatest, so a test can pick up an OTP.
// Credentials come from .env (PMWS_BASE_URL / PMWS_USER / PMWS_PASSWORD) - never from the command line.
// Usage: node tools/pmws-sms.js [phoneNo]
require('dotenv/config');

const BASE = process.env.PMWS_BASE_URL ?? 'https://partner-roadside-uat.aspireasia.net';

async function login() {
  const r = await fetch(`${BASE}/api/pmws/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: process.env.PMWS_USER, pwd: process.env.PMWS_PASSWORD }),
  });
  const body = await r.json();
  if (!body.success) throw new Error(`login failed: ${body.error}`);
  return body.accessToken;
}

async function smsLatest(token, phoneNo) {
  const url = new URL(`${BASE}/api/pmws/smslatest`);
  if (phoneNo) url.searchParams.set('phoneNo', phoneNo);
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return r.json();
}

/**
 * The OTP follows the word OTP in every locale the resx files ship:
 * en "OTP code 630367 for reference number R3411", th "รหัส OTP 630367 สำหรับเลขอ้างอิง R3411".
 */
function otpFrom(rows) {
  for (const row of rows ?? []) {
    const m = /OTP[^0-9]{0,12}(\d{4,8})/i.exec(row.message ?? '');
    if (m) return { otp: m[1], smsId: row.smsId, phoneNo: mask(row.phoneNo), dtInsert: row.dtInsert };
  }
  return null;
}

/** Keep real phone numbers out of logs and CI output. */
function mask(phoneNo) {
  return (phoneNo ?? '').replace(/\d(?=\d{4})/g, '*');
}

(async () => {
  const token = await login();
  const resp = await smsLatest(token, process.argv[2]);
  if (!resp.success) throw new Error(resp.error);
  for (const row of resp.data) {
    console.log(`${row.smsId}  ${mask(row.phoneNo)}  ${row.dtInsert}  ${row.smsStatus}`);
  }
  console.log('OTP:', otpFrom(resp.data) ?? 'none in the latest rows');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
