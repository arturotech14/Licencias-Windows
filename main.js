const state = { os: 'win11', edition: 'pro' };

const config = {
  'win11-pro':  { price: '€19.99', desc: 'Productividad avanzada y seguridad empresarial para Windows 11.' },
  'win11-home': { price: '€14.99', desc: 'Perfecto para el uso diario y gaming en casa con Windows 11.' },
  'win10-pro':  { price: '€17.99', desc: 'La mejor opción para profesionales y empresas en Windows 10.' },
  'win10-home': { price: '€12.99', desc: 'Activación completa para uso doméstico en Windows 10.' }
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
