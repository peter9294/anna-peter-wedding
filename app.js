(() => {
  const CFG = window.INVITE_CONFIG || {};
  const T = {
    en: { youre: "You're invited", openInv: 'Tap to open', invite: 'invite you to celebrate their wedding', dateLong: 'Sunday, 8 November 2026', days: 'Days', hours: 'Hours', mins: 'Minutes', secs: 'Seconds', schedTitle: 'The Day', schedDate: 'November 8', schedYear: '2026', ceremony: 'Ceremony', cerTime: '4:00 PM', cerNote: 'Traditional Thai ceremony', reception: 'Reception', recTime: '6:00 PM', recNote: 'Dinner & celebration', venue: 'Venue', directions: 'Get directions', parking: 'Parking', parkingBody: 'Please park at Udomsuk Walk. A golf cart will pick you up there and take you to the venue.', gallery: 'Moments', rsvpTitle: 'RSVP', deadline: 'Kindly reply by 15 October 2026', nameL: 'Your name (nickname)', namePh: 'e.g. Somchai Jaidee (Tom)', guestsL: 'Number of guests', unit: 'guests', unit1: 'guest', msgL: 'Message to the couple (optional)', send: 'Send RSVP', sending: 'Sending…', err: 'Please enter your name.', thanks: "Thank you! We can't wait to celebrate with you.", contact: 'Questions? Give us a call' },
    th: { youre: 'ขอเรียนเชิญ', openInv: 'แตะเพื่อเปิดการ์ด', invite: 'ขอเรียนเชิญร่วมงานมงคลสมรส', dateLong: 'วันอาทิตย์ที่ 8 พฤศจิกายน 2569', days: 'วัน', hours: 'ชั่วโมง', mins: 'นาที', secs: 'วินาที', schedTitle: 'กำหนดการ', schedDate: '8 พฤศจิกายน', schedYear: '2569', ceremony: 'พิธีมงคลสมรส', cerTime: '16.00 น.', cerNote: 'พิธีแต่งงานแบบไทย', reception: 'งานเลี้ยงฉลอง', recTime: '18.00 น.', recNote: 'รับประทานอาหารและร่วมฉลอง', venue: 'สถานที่จัดงาน', directions: 'ดูเส้นทาง', parking: 'ที่จอดรถ', parkingBody: 'กรุณาจอดรถที่ Udomsuk Walk มีรถกอล์ฟรับ-ส่งไปยังสถานที่จัดงาน', gallery: 'ภาพความทรงจำ', rsvpTitle: 'RSVP', deadline: 'กรุณาตอบกลับภายในวันที่ 15 ตุลาคม 2569', nameL: 'ชื่อ-นามสกุล (ชื่อเล่น)', namePh: 'เช่น สมชาย ใจดี (ต้อม)', guestsL: 'จำนวนผู้เข้าร่วมงาน', unit: 'ท่าน', unit1: 'ท่าน', msgL: 'ข้อความถึงบ่าวสาว (ไม่บังคับ)', send: 'ส่งคำตอบ', sending: 'กำลังส่ง…', err: 'กรุณากรอกชื่อ', thanks: 'ขอบคุณมาก แล้วพบกันในงาน', contact: 'สอบถามเพิ่มเติม' }
  };
  const PH = [5, 1, 10, 2, 8, 4, 0, 9, 6, 7, 3];
  const WED = new Date('2026-11-08T16:00:00+07:00').getTime();
  const $ = id => document.getElementById(id);

  let lang = 'en', guests = 1, status = 'idle', lb = -1;

  // ---- i18n ----
  function render() {
    const t = T[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t[el.dataset.t]; });
    document.querySelectorAll('[data-tp]').forEach(el => { el.placeholder = t[el.dataset.tp]; });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('guests').textContent = guests;
    $('unit').textContent = guests === 1 ? t.unit1 : t.unit;
    $('submit').textContent = status === 'sending' ? t.sending : t.send;
  }
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    render();
  }));
  try { const saved = localStorage.getItem('lang'); if (T[saved]) lang = saved; } catch (e) {}
  if (new URLSearchParams(location.search).get('lang') === 'th') lang = 'th';

  // ---- Envelope intro ----
  const ov = $('ov');
  const done = () => { ov.remove(); document.body.classList.remove('locked'); };
  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    ov.classList.add('opened');
    setTimeout(() => ov.classList.add('rise'), 650);
    setTimeout(() => ov.classList.add('fading'), 2600);
    setTimeout(done, 3400);
  }
  if (CFG.skipIntro) done();
  else {
    ov.addEventListener('click', open);
    ov.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    ov.focus();
  }

  // ---- Countdown ----
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const diff = Math.max(0, WED - Date.now());
    $('cd-d').textContent = Math.floor(diff / 864e5);
    $('cd-h').textContent = pad(Math.floor(diff / 36e5) % 24);
    $('cd-m').textContent = pad(Math.floor(diff / 6e4) % 60);
    $('cd-s').textContent = pad(Math.floor(diff / 1e3) % 60);
  }
  tick();
  setInterval(tick, 1000);

  // ---- Gallery + lightbox ----
  const strip = $('strip');
  PH.forEach((n, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Open photo ' + (i + 1));
    b.innerHTML = '<img src="photos/p' + n + '.jpg" alt="" loading="lazy">';
    b.addEventListener('click', () => showLb(i));
    strip.appendChild(b);
  });
  const lbEl = $('lb');
  function showLb(i) {
    lb = i;
    if (i < 0) { lbEl.hidden = true; return; }
    $('lb-img').style.backgroundImage = 'url(photos/p' + PH[i] + '.jpg)';
    lbEl.hidden = false;
  }
  const step = d => showLb((lb + d + PH.length) % PH.length);
  lbEl.addEventListener('click', () => showLb(-1));
  $('lb-prev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
  $('lb-next').addEventListener('click', e => { e.stopPropagation(); step(1); });
  window.addEventListener('keydown', e => {
    if (lb < 0) return;
    if (e.key === 'Escape') showLb(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  // ---- RSVP ----
  $('inc').addEventListener('click', () => { guests = Math.min(20, guests + 1); render(); });
  $('dec').addEventListener('click', () => { guests = Math.max(1, guests - 1); render(); });
  $('name').addEventListener('input', () => { $('err').hidden = true; });
  $('form').addEventListener('submit', async e => {
    e.preventDefault();
    if (status === 'sending') return;
    const name = $('name').value.trim(), message = $('message').value;
    if (!name) { $('err').hidden = false; $('name').focus(); return; }
    status = 'sending';
    $('submit').disabled = true;
    render();
    if (CFG.formId) {
      const fd = new URLSearchParams();
      if (CFG.entryName) fd.append(CFG.entryName, name);
      if (CFG.entryGuests) fd.append(CFG.entryGuests, String(guests));
      if (CFG.entryMessage) fd.append(CFG.entryMessage, message);
      try {
        await fetch('https://docs.google.com/forms/d/e/' + CFG.formId + '/formResponse', { method: 'POST', mode: 'no-cors', body: fd });
      } catch (err) {}
    } else {
      await new Promise(r => setTimeout(r, 700));
    }
    status = 'sent';
    $('form').hidden = true;
    $('thanks').hidden = false;
  });

  render();
})();
