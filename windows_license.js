function openWA(producto) {
  const msg = producto
    ? encodeURIComponent('Hola! Me interesa la licencia de ' + producto + '. ¿Cómo puedo pagar?')
    : encodeURIComponent('Hola! Necesito info sobre licencias de Windows.');
  window.open('https://wa.me/tunumero?text=' + msg, '_blank');
}
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}
function submitForm() {
  const email = document.getElementById('cf-email').value;
  const phone = document.getElementById('cf-phone').value;
  if (!email || !phone) { alert('Por favor completá email y teléfono.'); return; }
  document.querySelector('.contact-form').querySelectorAll('input,select,button').forEach(el => el.style.display = 'none');
  document.getElementById('cf-success').style.display = 'block';
}