#!/usr/bin/env node
// Reads the latest wlib.SMS rows through GET /api/pmws/smslatest, so a test can pick up an OTP.
// Credentials come from .env (PMWS_BASE_URL / PMWS_USER / PMWS_PASSWORD) - never from the command line.
// CLI:    node tools/pmws-sms.js [phoneNo]
// Module: const { waitForOtp } = require('./tools/pmws-sms')
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
  const body = await r.json();
  if (!body.success) throw new Error(`smslatest failed: ${body.error}`);
  return body.data ?? [];
}

/**
 * The OTP follows the word OTP in every locale the resx files ship:
 * en "OTP code 630367 for reference number R3411", th "รหัส OTP 630367 สำหรับเลขอ้างอิง R3411".
 */
function otpFrom(rows) {
  for (const row of rows) {
    const m = /OTP[^0-9]{0,12}(\d{4,8})/i.exec(row.message ?? '');
    if (m) return { otp: m[1], smsId: row.smsId, phoneNo: mask(row.phoneNo), dtInsert: row.dtInsert };
  }
  return null;
}

/** Keep real phone numbers out of logs and CI output. */
function mask(phoneNo) {
  return (phoneNo ?? '').replace(/\d(?=\d{4})/g, '*');
}

/** Highest smsId currently stored for that number - call before triggering a new OTP. */
async function latestSmsId(phoneNo) {
  const rows = await smsLatest(await login(), phoneNo);
  return rows[0]?.smsId ?? 0;
}

/**
 * Polls until an SMS newer than `afterSmsId` carries an OTP.
 * Delivery goes through the SMS vendor, so allow a generous timeout.
 */
async function waitForOtp(phoneNo, afterSmsId = 0, { timeoutMs = 90_000, intervalMs = 5_000 } = {}) {
  const token = await login();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const fresh = (await smsLatest(token, phoneNo)).filter((r) => r.smsId > afterSmsId);
    const hit = otpFrom(fresh);
    if (hit) return hit;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`no OTP for ${mask(phoneNo)} within ${timeoutMs / 1000}s (after smsId ${afterSmsId})`);
}

module.exports = { login, smsLatest, otpFrom, latestSmsId, waitForOtp, mask };

if (require.main === module) {
  (async () => {
    const rows = await smsLatest(await login(), process.argv[2]);
    for (const row of rows) console.log(`${row.smsId}  ${mask(row.phoneNo)}  ${row.dtInsert}  ${row.smsStatus}`);
    console.log('OTP:', otpFrom(rows) ?? 'none in the latest rows');
  })().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
