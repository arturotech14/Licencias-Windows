const state = { os: 'win11', edition: 'pro' };

const config = {
  'win11-pro':  {
    price: 'USD 11.50',
    desc: 'Productividad avanzada y seguridad empresarial para Windows 11.',
    mpLink: "https://mpago.la/25AS9az"
  },
  'win11-home': {
    price: 'USD 11.00',
    desc: 'Perfecto para el uso diario y gaming en casa con Windows 11.',
    mpLink: "https://mpago.la/2LeqWts"
  },
  'win10-pro':  {
    price: 'USD 10.50',
    desc: 'La mejor opción para profesionales y empresas en Windows 10.',
    mpLink: "https://mpago.la/19eeyDZ"
  },
  'win10-home': {
    price: 'USD 10.00',
    desc: 'Activación completa para uso doméstico en Windows 10.',
    mpLink: "https://mpago.la/2gieQNw"
  }
};

function selectOS(os) {
  state.os = os;
  updateUI();
}

function selectEdition(edition) {
  state.edition = edition;
  updateUI();
}

function quickSelect(os, edition) {
  selectOS(os);
  selectEdition(edition);
  toggleSidebar();
  scrollToSelector();
}

function getProductName() {
  const osName      = state.os      === 'win11' ? 'Windows 11' : 'Windows 10';
  const editionName = state.edition === 'pro'   ? 'Pro'        : 'Home';
  return `${osName} ${editionName}`;
}

function buildWhatsAppUrl() {
  const text = `Hola! quiero la licencia de ${getProductName()}`;
  return `https://wa.me/541123865336?text=${encodeURIComponent(text)}`;
}

function refreshWhatsAppLinks() {
  const url = buildWhatsAppUrl();
  ['wa-float', 'wa-bottom', 'wa-modal'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = url;
  });
}

function updateUI() {
  const data = config[`${state.os}-${state.edition}`];
  const infoContent = document.getElementById('info-content');

  infoContent.style.opacity = '0';
  setTimeout(() => {
    document.getElementById('selected-price').innerText = data.price;
    document.getElementById('selected-desc').innerText = data.desc;
    document.getElementById('buy-btn-text').innerText =
      `Comprar ${state.edition.charAt(0).toUpperCase() + state.edition.slice(1)}`;
    infoContent.style.opacity = '1';
  }, 100);

  refreshWhatsAppLinks();

  const baseBtn = 'tab-button flex-1 flex items-center justify-center gap-2 py-2 md:py-3 rounded-xl font-bold text-sm';

  const win11Btn = document.getElementById('win11');
  const win10Btn = document.getElementById('win10');
  if (state.os === 'win11') {
    win11Btn.className = `${baseBtn} tab-active-os`;
    win10Btn.className = `${baseBtn} text-white/50 hover:text-white`;
  } else {
    win10Btn.className = `${baseBtn} tab-active-os`;
    win11Btn.className = `${baseBtn} text-white/50 hover:text-white`;
  }

  const proBtn  = document.getElementById('pro-edition');
  const homeBtn = document.getElementById('home-edition');
  if (state.edition === 'pro') {
    proBtn.className  = `${baseBtn} tab-active-edition`;
    homeBtn.className = `${baseBtn} text-white/50 hover:text-white`;
  } else {
    homeBtn.className = `${baseBtn} tab-active-edition`;
    proBtn.className  = `${baseBtn} text-white/50 hover:text-white`;
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('side-navbar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  if (sidebar.classList.contains('open')) {
    overlay.classList.remove('pointer-events-none');
    overlay.classList.add('opacity-100');
  } else {
    overlay.classList.add('pointer-events-none');
    overlay.classList.remove('opacity-100');
  }
}

function toggleHelpModal() {
  document.getElementById('help-modal').classList.toggle('hidden');
}

function scrollToSelector() {
  document.getElementById('product-selector').scrollIntoView({ behavior: 'smooth' });
}

function scrollToContact() {
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

window.onload = updateUI;

// ===== MODAL DE PAGO =====
// El input de email es solo visual — no envía datos a ningún backend.

function openPaymentModal() {
  var data = config[state.os + '-' + state.edition];

  document.getElementById('modal-product-name').innerText  = getProductName();
  document.getElementById('modal-product-price').innerText = data.price;
  document.getElementById('modal-email').value = '';
  refreshWhatsAppLinks();

  document.getElementById('payment-modal').classList.remove('hidden');
}

function handleCardPayment() {
  const emailInput = document.getElementById('modal-email');
  const statusEl   = document.getElementById('payment-status');

  const setStatus = (text, kind) => {
    const color = kind === 'error'   ? 'text-red-400'
                : kind === 'success' ? 'text-green-400'
                                     : 'text-white/60';
    statusEl.className = `text-[11px] text-center min-h-[14px] ${color}`;
    statusEl.textContent = text;
  };
  setStatus('');

  const email = emailInput.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    emailInput.focus();
    setStatus('Ingresá un email válido para continuar.', 'error');
    return;
  }

  const data = config[state.os + '-' + state.edition];
  window.open(data.mpLink || '#', '_blank');
  closePaymentModal();
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
}

function handleBackdropClick(event) {
  if (event.target === document.getElementById('payment-modal')) {
    closePaymentModal();
  }
}

// ===== FORMULARIO DE CONTACTO =====
const CONTACT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwwuSRYUY-eyJI8OxbEomADjiUTgZK9gLyODLhaoVRSpj1cu-iCSNHodAQicRppc84d/exec';

function clientRateLimitOk() {
  const now = Date.now();
  const last = Number(localStorage.getItem('contact_last') || 0);
  if (now - last < 15 * 1000) return false;
  localStorage.setItem('contact_last', String(now));
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const statusEl  = document.getElementById('contact-status');
    const submitBtn = document.getElementById('contact-submit');
    const email     = document.getElementById('contact-email').value.trim();
    const phone     = document.getElementById('contact-phone').value.trim();
    const message   = document.getElementById('contact-message').value.trim();
    const honeypot  = document.getElementById('contact-website').value;

    const setStatus = (text, kind) => {
      const color = kind === 'error'   ? 'text-red-400'
                  : kind === 'success' ? 'text-green-400'
                                       : 'text-white/60';
      statusEl.className = `text-xs text-center min-h-[16px] ${color}`;
      statusEl.textContent = text;
    };
    setStatus('');

    if (!email && !phone) {
      setStatus('Completá email o teléfono para enviar.', 'error');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setStatus('Email inválido.', 'error');
      return;
    }
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
      setStatus('Teléfono inválido.', 'error');
      return;
    }
    if (!clientRateLimitOk()) {
      setStatus('Esperá unos segundos antes de reenviar.', 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Enviando...');

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          email, phone, message,
          ts: Date.now(),
          website: honeypot,
          ua: navigator.userAgent.slice(0, 200)
        })
      });
      const data = await res.json();

      if (data.ok) {
        setStatus('¡Mensaje enviado! Te contactaremos pronto.', 'success');
        form.reset();
      } else {
        throw new Error(data.error || 'unknown');
      }
    } catch (err) {
      setStatus('No se pudo enviar. Probá de nuevo en un momento.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
