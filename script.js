// Client-first submission: try server, fall back to client rendering (works on GitHub Pages)
// Set BACKEND_URL to the full URL of your hosted submit.php (or '' to use relative 'submit.php')
const BACKEND_URL = 'https://reg-app.xo.je/submit.php'; // <-- REPLACE this with your PHP host URL

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('regForm');
  const resultArea = document.getElementById('resultArea');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');

  function showError(name, msg) {
    const el = document.querySelector('.error[data-for="'+name+'"]');
    if (el) el.textContent = msg || '';
  }
  function clearErrors() {
    document.querySelectorAll('.error').forEach(e => e.textContent = '');
  }

  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildResultHtml(data) {
    return `
      <div class="result-card" role="status" aria-live="polite">
        <h2>Application Received</h2>
        <p>Thank you <strong>${escapeHtml(data.fullName)}</strong>. Below is the formatted information you submitted:</p>
        <div class="result-row">
          <div class="result-item"><strong>Full Name</strong><div>${escapeHtml(data.fullName)}</div></div>
          <div class="result-item"><strong>Email</strong><div>${escapeHtml(data.email)}</div></div>
          <div class="result-item"><strong>Phone</strong><div>${escapeHtml(data.phone)}</div></div>
          <div class="result-item"><strong>Date of Birth</strong><div>${escapeHtml(data.dob) || '—'}</div></div>
          <div class="result-item"><strong>Gender</strong><div>${escapeHtml(data.gender) || '—'}</div></div>
          <div class="result-item"><strong>Course / Program</strong><div>${escapeHtml(data.course) || '—'}</div></div>
        </div>
        <div class="print-area">
          <button id="printBtn" class="print-btn">Print / Save as PDF</button>
          <span style="color:var(--muted); margin-left:10px">Use the Print button to save or print this summary.</span>
        </div>
      </div>`;
  }

  function renderResult(data){
    resultArea.innerHTML = buildResultHtml(data);
    resultArea.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  async function tryPostToServer(data) {
    // choose absolute BACKEND_URL if provided; otherwise use relative 'submit.php'
    const endpoint = (typeof BACKEND_URL === 'string' && BACKEND_URL.trim() !== '') ? BACKEND_URL : 'submit.php';
    try {
      const fd = new FormData();
      Object.keys(data).forEach(k => fd.append(k, data[k] ?? ''));

      const resp = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        credentials: 'include' // keep if backend expects cookies; otherwise 'omit' or 'same-origin'
      });

      if (!resp.ok) throw new Error('server returned ' + resp.status);

      const text = await resp.text();
      // If server returned the expected HTML snippet, inject it
      if (text && text.indexOf('Application Received') !== -1) {
        resultArea.innerHTML = text;
        resultArea.scrollIntoView({behavior: 'smooth', block: 'start'});
        return { ok: true };
      }

      // fallback: treat response as unusable
      return { ok: false, error: new Error('server response not usable') };
    } catch (err) {
      return { ok: false, error: err };
    }
  }

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    clearErrors();

    const data = {
      fullName: (document.getElementById('fullName').value || '').trim(),
      email: (document.getElementById('email').value || '').trim(),
      phone: (document.getElementById('phone').value || '').trim(),
      dob: document.getElementById('dob').value || '',
      gender: document.getElementById('gender').value || '',
      course: (document.getElementById('course').value || '').trim(),
      agree: document.getElementById('agree').checked ? 'yes' : ''
    };

    // Validation
    let ok = true;
    if (!data.fullName) { showError('fullName','Full name is required.'); ok = false; }
    if (!data.email) { showError('email','Email is required.'); ok = false; } 
    else {
      const eRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!eRe.test(data.email)) { showError('email','Enter a valid email.'); ok = false; }
    }
    if (!data.phone) { showError('phone','Phone is required.'); ok = false; } 
    else {
      const pRe = /^[0-9+\-\s()]{6,20}$/;
      if (!pRe.test(data.phone)) { showError('phone','Enter a valid phone number.'); ok = false; }
    }
    if (!data.agree) { showError('agree','You must confirm the information.'); ok = false; }

    if (!ok) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    // Try server first (if available), otherwise fallback to client-side render
    const serverResult = await tryPostToServer(data);
    if (serverResult.ok) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
      return;
    }

    // fallback to client rendering
    renderResult(data);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';
  });

  clearBtn && clearBtn.addEventListener('click', function(){
    form.reset();
    clearErrors();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';
    resultArea.innerHTML = `<div class="placeholder"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"/><path d="M8 11l2.5 3L16 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"/></svg><p class="placeholder__text">Submission results will appear here after you press Submit. Use the Print button to save as PDF.</p></div>`;
    document.getElementById('fullName').focus();
  });

  // delegated print handler
  resultArea.addEventListener('click', function(e){
    if (e.target && e.target.id === 'printBtn') window.print();
  });
});