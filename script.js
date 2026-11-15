// =========================================================
// SKRYPT STRONY – Paweł Solon Perkusja
// JavaScript odpowiada za "zachowanie" strony:
// 1) menu na telefonie, 2) animacje, 3) wysyłanie formularza.
// =========================================================

// ---------- 1. Menu na telefonie (hamburger) ----------
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav__toggle');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('nav--open');
  toggle.setAttribute('aria-expanded', open);
});
// Po kliknięciu w link menu się zamyka
document.querySelectorAll('.nav__links a').forEach(link =>
  link.addEventListener('click', () => {
    nav.classList.remove('nav--open');
    toggle.setAttribute('aria-expanded', false);
  })
);

// ---------- 2. Elementy pojawiają się przy przewijaniu ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

// Aktualny rok w stopce (zmienia się sam co roku)
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- 3. Formularz kontaktowy ----------
// Zgłoszenia trafiają na e-mail przez darmową usługę FormSubmit.co.
// Przy PIERWSZYM zgłoszeniu FormSubmit wyśle Ci e-mail z prośbą
// o potwierdzenie adresu – kliknij link, a od tej pory wszystko działa.
// Teksty komunikatów w dwóch językach (język bierzemy z <html lang="...">)
const isEN = document.documentElement.lang === 'en';
const MSG = isEN ? {
  invalid: 'Please fill in your name, a valid email and tick the consent box.',
  thanks: 'Thanks!',
  sending: 'Sending…',
  ok: 'Thanks! Your message is on its way. I\'ll get back to you soon.',
  err: 'Something went wrong. Call me: +48 510 309 817 or email: pawel.solon@hotmail.com',
  subject: 'New drum lesson request (EN) – '
} : {
  invalid: 'Uzupełnij imię, poprawny e-mail i zaznacz zgodę.',
  thanks: 'Dziękuję!',
  sending: 'Wysyłanie…',
  ok: 'Dziękuję! Zgłoszenie dotarło. Odezwę się wkrótce.',
  err: 'Nie udało się wysłać. Zadzwoń: +48 510 309 817 lub napisz: pawel.solon@hotmail.com',
  subject: 'Nowe zgłoszenie na lekcję perkusji – '
};

const FORM_ENDPOINT = 'https://formsubmit.co/ajax/pawel.solon@hotmail.com';

const form = document.getElementById('form');
const statusEl = form.querySelector('.form__status');

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = 'form__status ' + (type || '');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // nie przeładowuj strony

  // Prosta walidacja: sprawdzamy wymagane pola
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const bad = field.type === 'checkbox' ? !field.checked : !field.value.trim() ||
      (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value));
    field.classList.toggle('invalid', bad);
    if (bad) valid = false;
  });
  if (!valid) {
    setStatus(MSG.invalid, 'err');
    return;
  }

  // Bot wypełnił ukryte pole? Udajemy sukces i nic nie wysyłamy.
  if (form._honey.value) { setStatus(MSG.thanks, 'ok'); return; }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setStatus(MSG.sending);

  const data = Object.fromEntries(new FormData(form));
  delete data._honey;
  data._subject = MSG.subject + data.imie;
  data._template = 'table';

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Błąd serwera');
    form.reset();
    setStatus(MSG.ok, 'ok');
  } catch (error) {
    setStatus(MSG.err, 'err');
  } finally {
    button.disabled = false;
  }
});
