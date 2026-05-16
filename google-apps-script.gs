/**
 * Endpoint de contacto — Google Apps Script
 *
 * Pasos para desplegar:
 *  1) Ir a https://script.google.com → Nuevo proyecto
 *  2) Pegar este archivo completo
 *  3) Personalizar SHEET_ID, HMAC_SECRET y RECAPTCHA_SECRET (abajo)
 *  4) Implementar → Implementación nueva
 *     - Tipo: Aplicación web
 *     - Ejecutar como: Yo
 *     - Quién tiene acceso: Cualquier persona
 *  5) Copiar la URL /exec y pegarla en main.js como CONTACT_ENDPOINT
 *
 * La hoja debe tener encabezados en la fila 1:
 *   A: Fecha   B: Email   C: Teléfono   D: Mensaje
 */

// ===== CONFIGURACIÓN =====
const SHEET_ID = '1Hq8EpEc-3L2MyEM7KsrR46YmevZ9AAiX7OrFEgL4BlQ';      // de la URL: /spreadsheets/d/<ID>/edit
const SHEET_NAME = 'Contactos';                      // nombre de la pestaña
const HMAC_SECRET = 'a7f2c9e1b4d8f6h3k2m5n1p8q6r3s9t2u4v7w1x3y5z8a0b2c4d6e8f0g2h4i6'; // mismo string que en main.js
const RECAPTCHA_SECRET = 'TU_RECAPTCHA_SECRET_KEY';  // clave SECRETA de reCAPTCHA (NO la del sitio)
const RECAPTCHA_MIN_SCORE = 0.5;                     // 0.0=bot, 1.0=humano

// Límites anti-abuso
const MAX_EMAIL = 254;
const MAX_PHONE = 20;
const MAX_MESSAGE = 1000;
const RATE_WINDOW_S = 60;     // 1 minuto
const RATE_MAX = 3;            // 3 envíos por fingerprint/min

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const body = JSON.parse(e.postData.contents);

    // 1) Honeypot — bot llenó campo oculto → fingimos éxito y descartamos
    if (body.website && String(body.website).length > 0) {
      return output.setContent(JSON.stringify({ ok: true }));
    }

    // 2) reCAPTCHA v3
    if (!body.recaptcha) {
      return output.setContent(JSON.stringify({ ok: false, error: 'no_recaptcha' }));
    }
    const recaptchaOk = verifyRecaptcha(body.recaptcha);
    if (!recaptchaOk) {
      return output.setContent(JSON.stringify({ ok: false, error: 'recaptcha_failed' }));
    }

    // 3) Anti-replay con timestamp (ventana 5 min)
    const ts = Number(body.ts || 0);
    if (!ts || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
      return output.setContent(JSON.stringify({ ok: false, error: 'expired' }));
    }

    // 4) Validación HMAC
    const payload = `${body.email || ''}|${body.phone || ''}|${body.message || ''}|${ts}`;
    const expected = Utilities.computeHmacSha256Signature(payload, HMAC_SECRET)
      .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
    if (expected !== body.sig) {
      return output.setContent(JSON.stringify({ ok: false, error: 'bad_signature' }));
    }

    // 5) Sanitización y validación de campos
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

    // 6) Rate limit por fingerprint (UA — Apps Script no expone IP del cliente directamente)
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

    // 7) Escribir fila — vacíos quedan en blanco, cada dato en su columna
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      new Date(),  // A: Fecha
      email,       // B: Email
      phone,       // C: Teléfono
      message      // D: Mensaje
    ]);

    return output.setContent(JSON.stringify({ ok: true }));
  } catch (err) {
    return output.setContent(JSON.stringify({ ok: false, error: 'server_error' }));
  }
}

function verifyRecaptcha(token) {
  try {
    const res = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: RECAPTCHA_SECRET, response: token },
      muteHttpExceptions: true
    });
    const data = JSON.parse(res.getContentText());
    return data.success === true
        && (typeof data.score !== 'number' || data.score >= RECAPTCHA_MIN_SCORE)
        && (!data.action || data.action === 'contact');
  } catch (err) {
    return false;
  }
}

// Endpoint de healthcheck (opcional)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
