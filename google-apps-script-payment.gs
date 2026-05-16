/**
 * Endpoint de pagos — Google Apps Script
 *
 * Pasos para desplegar:
 *  1) Ir a https://script.google.com → Abrir el proyecto donde está la URL:
 *     AKfycbwU-2ep6x4A6dY-DIMZbw9k-usjGxZlxo5_Pz9UImvT7LykUf2RsiJ7_WQCr0nqGqif
 *  2) Pegar este archivo completo (reemplaza el contenido existente)
 *  3) Personalizar SHEET_ID, HMAC_SECRET y RECAPTCHA_SECRET (abajo)
 *  4) Implementar → Administrar implementaciones → editar la actual
 *     - Tipo: Aplicación web
 *     - Ejecutar como: Yo
 *     - Quién tiene acceso: Cualquier persona
 *     - Versión: Nueva versión
 *  5) La URL /exec se mantiene igual (ya está en main.js como PAYMENT_ENDPOINT)
 *
 * La hoja debe tener encabezados en la fila 1:
 *   A: Fecha   B: Email   C: Producto   D: Precio
 *
 * Cada email recibido se agrega como una nueva fila — la columna B
 * acumula la lista completa de mails de compradores.
 */

// ===== CONFIGURACIÓN =====
const SHEET_ID = 'PEGAR_AQUI_EL_ID_DE_LA_HOJA';      // de la URL: /spreadsheets/d/<ID>/edit
const SHEET_NAME = 'Pagos';                          // nombre de la pestaña (creala si no existe)
const HMAC_SECRET = 'a7f2c9e1b4d8f6h3k2m5n1p8q6r3s9t2u4v7w1x3y5z8a0b2c4d6e8f0g2h4i6'; // mismo string que en main.js
const RECAPTCHA_SECRET = 'TU_RECAPTCHA_SECRET_KEY';  // clave SECRETA de reCAPTCHA (NO la del sitio)
const RECAPTCHA_MIN_SCORE = 0.5;                     // 0.0=bot, 1.0=humano

// Dominios autorizados (CORS). Agregá el dominio AWS donde alojes el sitio.
const ALLOWED_ORIGINS = [
  'arturotech14.github.io',
  // 'tu-dominio-en-aws.com',
  // 'cloudfront.net'
];

// Límites anti-abuso
const MAX_EMAIL = 254;
const MAX_PRODUCT = 50;
const MAX_PRICE = 20;
const RATE_WINDOW_S = 60;     // 1 minuto
const RATE_MAX = 3;            // 3 envíos por fingerprint/min

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Validar origen (CORS)
    const origin = e.parameter.origin || (e.postData.parameters && e.postData.parameters.origin && e.postData.parameters.origin[0]);
    if (origin && !ALLOWED_ORIGINS.some(d => origin.includes(d))) {
      return output.setContent(JSON.stringify({ ok: false, error: 'forbidden' }));
    }

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

    // 4) Validación HMAC — la firma cubre email|product|ts
    const payload = `${body.email || ''}|${body.product || ''}|${ts}`;
    const expected = Utilities.computeHmacSha256Signature(payload, HMAC_SECRET)
      .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
    if (expected !== body.sig) {
      return output.setContent(JSON.stringify({ ok: false, error: 'bad_signature' }));
    }

    // 5) Sanitización y validación de campos
    const email   = String(body.email   || '').trim().slice(0, MAX_EMAIL);
    const product = String(body.product || '').trim().slice(0, MAX_PRODUCT);
    const price   = String(body.price   || '').trim().slice(0, MAX_PRICE);

    if (!email) {
      return output.setContent(JSON.stringify({ ok: false, error: 'email_required' }));
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return output.setContent(JSON.stringify({ ok: false, error: 'invalid_email' }));
    }

    // 6) Rate limit por fingerprint (UA + email)
    const fingerprint = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(body.ua || '') + '|' + email
    ).map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
    const cache = CacheService.getScriptCache();
    const key = 'rl_pay_' + fingerprint;
    const hits = Number(cache.get(key) || 0);
    if (hits >= RATE_MAX) {
      return output.setContent(JSON.stringify({ ok: false, error: 'rate_limited' }));
    }
    cache.put(key, String(hits + 1), RATE_WINDOW_S);

    // 7) Escribir fila — el email queda como nuevo ítem en la columna B
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([
      new Date(),  // A: Fecha
      email,       // B: Email
      product,     // C: Producto
      price        // D: Precio
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
        && (!data.action || data.action === 'payment');
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
