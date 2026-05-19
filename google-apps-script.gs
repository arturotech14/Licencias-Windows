/**
 * Endpoint de contacto — Google Apps Script
 *
 * Pasos para desplegar:
 *  1) Ir a https://script.google.com → abrir el proyecto cuya URL /exec
 *     ya está pegada en main.js como CONTACT_ENDPOINT
 *  2) Reemplazar TODO el contenido por este archivo
 *  3) Guardar (Ctrl+S)
 *  4) Implementar → Administrar implementaciones → editar (lápiz) la actual
 *     - Tipo: Aplicación web
 *     - Ejecutar como: Yo
 *     - Quién tiene acceso: Cualquier persona
 *     - Versión: Nueva versión   ← IMPORTANTE, si no, sigue corriendo el código viejo
 *  5) Implementar. La URL /exec se mantiene igual.
 *
 * La hoja debe tener una pestaña llamada exactamente "Contactos" con
 * encabezados en la fila 1:
 *   A: Fecha   B: Email   C: Teléfono   D: Mensaje
 */

const SHEET_ID = '1Hq8EpEc-3L2MyEM7KsrR46YmevZ9AAiX7OrFEgL4BlQ';
const SHEET_NAME = 'Contactos';

const MAX_EMAIL = 254;
const MAX_PHONE = 20;
const MAX_MESSAGE = 1000;
const RATE_WINDOW_S = 60;
const RATE_MAX = 3;

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const body = JSON.parse(e.postData.contents);

    // Honeypot — bot llenó campo oculto → fingimos éxito y descartamos
    if (body.website && String(body.website).length > 0) {
      return output.setContent(JSON.stringify({ ok: true }));
    }

    // Anti-replay con timestamp (ventana 5 min)
    const ts = Number(body.ts || 0);
    if (!ts || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
      return output.setContent(JSON.stringify({ ok: false, error: 'expired' }));
    }

    const email   = String(body.email   || '').trim().slice(0, MAX_EMAIL);
    const phone   = String(body.phone   || '').trim().slice(0, MAX_PHONE);
    const message = String(body.message || '').trim().slice(0, MAX_MESSAGE);

    if (!email && !phone) {
      return output.setContent(JSON.stringify({ ok: false, error: 'email_or_phone_required' }));
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return output.setContent(JSON.stringify({ ok: false, error: 'invalid_email' }));
    }
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      return output.setContent(JSON.stringify({ ok: false, error: 'invalid_phone' }));
    }

    // Rate limit por fingerprint (UA + email/teléfono)
    const fingerprint = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(body.ua || '') + '|' + (email || phone)
    ).map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
    const cache = CacheService.getScriptCache();
    const key = 'rl_' + fingerprint;
    const hits = Number(cache.get(key) || 0);
    if (hits >= RATE_MAX) {
      return output.setContent(JSON.stringify({ ok: false, error: 'rate_limited' }));
    }
    cache.put(key, String(hits + 1), RATE_WINDOW_S);

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return output.setContent(JSON.stringify({ ok: false, error: 'sheet_not_found' }));
    }
    sheet.appendRow([
      new Date(),
      email,
      phone,
      message
    ]);

    return output.setContent(JSON.stringify({ ok: true }));
  } catch (err) {
    return output.setContent(JSON.stringify({ ok: false, error: 'server_error' }));
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
