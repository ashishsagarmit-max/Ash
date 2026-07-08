function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FEATURED = [
  'Paracetamol', 'Metformin', 'Vitamin D3 supplement', 'Iron supplement',
  'Omeprazole / Antacids', 'Calcium supplement', 'Amlodipine / BP medication'
];

function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)} — The Alternate Pharmacopoeia</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<div class="wrap">
  <div class="topnav">
    <a href="/" class="brand">The Alternate <em>Pharmacopoeia</em></a>
    <div class="navlinks">
      <a href="/">Index</a>
      <a href="/about">About</a>
      <a href="/add" class="add-link">+ Add entry</a>
    </div>
  </div>
  ${bodyHtml}
  <div class="footnote">
    <strong>Read this before you use it.</strong> This app is an educational cross-reference,
    built from commonly cited nutritional and traditional-use associations — it is not medical
    advice and has not been reviewed by a clinician. Food and Ayurvedic options are typically
    discussed as supportive or complementary, not as substitutes for prescribed treatment. Never
    stop or change a prescribed medicine — especially for diabetes, thyroid, blood pressure,
    heart, or mental health conditions — without talking to the doctor who prescribed it.
  </div>
</div>
</body>
</html>`;
}

function searchIcon() {
  return `<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="#21301F" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
}

function homePage(query, results, allCount) {
  const chips = FEATURED.map(t =>
    `<a class="chip" href="/?q=${encodeURIComponent(t)}">${esc(t)}</a>`
  ).join('');

  const rows = results.map(m => `
    <a class="row" href="/medicine/${esc(m.slug)}">
      <div>
        <h3>${esc(m.name)}</h3>
        <div class="aliases">${esc((m.aliases || []).slice(0, 3).join(' · '))}</div>
      </div>
      <div class="arrow">&rarr;</div>
    </a>`).join('');

  const listBlock = results.length
    ? `<div class="list">${rows}</div>`
    : `<div class="empty">No entry yet for &ldquo;${esc(query)}&rdquo;.<br>Try a generic name, e.g. &ldquo;metformin&rdquo; instead of a brand, or <a href="/add" style="color:var(--leaf-deep); text-decoration:underline;">add it yourself</a>.</div>`;

  const body = `
    <div class="eyebrow">Index &amp; Cross-Reference · Modern Medicine &harr; Food &amp; Ayurveda</div>
    <h1>The Alternate<br><em>Pharmacopoeia</em></h1>
    <p class="sub">Enter a medicine you take. See what it's typically prescribed for, the deficiency or
    root cause behind it, and food, Ayurvedic, or home-remedy options associated with the same need.</p>

    <div class="search-box">
      <form method="GET" action="/">
        ${searchIcon()}
        <input type="text" name="q" value="${esc(query)}" placeholder="Try &ldquo;paracetamol&rdquo;, &ldquo;metformin&rdquo;, &ldquo;vitamin D&rdquo;&hellip;" autocomplete="off" autofocus>
      </form>
    </div>
    ${query ? '' : `<div class="chips">${chips}</div>`}
    <div class="count-label">${results.length} of ${allCount} entries${query ? ` matching &ldquo;${esc(query)}&rdquo;` : ''}</div>
    ${listBlock}
  `;
  return layout('Index', body);
}

function detailPage(m) {
  const foods = (m.foods || []).map(f => `<span class="pill leaf">${esc(f)}</span>`).join('');
  const ayurveda = (m.ayurveda || []).map(f => `<span class="pill turmeric">${esc(f)}</span>`).join('');
  const aliases = (m.aliases || []).join(' · ');

  const body = `
    <a class="back-link" href="/">&larr; Back to index</a>
    <div class="card">
      <div class="card-head">
        <div>
          <h2>${esc(m.name)}</h2>
          <div class="aliases">${esc(aliases)}</div>
        </div>
        <div class="card-num">SLUG: ${esc(m.slug)}</div>
      </div>
      <div class="card-body">
        <div class="field">
          <div class="field-label"><span class="dot"></span>Typically used for</div>
          <div class="field-text">${esc(m.treats)}</div>
        </div>
        <div class="field">
          <div class="field-label"><span class="dot"></span>Root cause / deficiency link</div>
          <div class="field-text">${esc(m.deficiency)}</div>
        </div>
        <div class="field">
          <div class="field-label"><span class="dot"></span>Food sources to explore</div>
          <div class="pill-row">${foods}</div>
        </div>
        <div class="field">
          <div class="field-label"><span class="dot"></span>Ayurvedic &amp; home-remedy angle</div>
          <div class="pill-row">${ayurveda}</div>
        </div>
        <div class="field">
          <div class="field-label"><span class="dot"></span>Caution</div>
          <div class="caution">${esc(m.caution)}</div>
        </div>
      </div>
    </div>
  `;
  return layout(m.name, body);
}

function addPage(flash, errors) {
  const flashBlock = flash ? `<div class="flash">${esc(flash)}</div>` : '';
  const errBlock = errors ? `<div class="flash" style="background:#f4e9e2; border-color:#d9b8a9; color:#5c2f22;">${esc(errors)}</div>` : '';
  const body = `
    <a class="back-link" href="/">&larr; Back to index</a>
    <div class="eyebrow">Contribute an entry</div>
    <h1 style="font-size:32px;">Add a <em>medicine</em></h1>
    <p class="sub">Add a new cross-reference entry. It's saved to the shared database immediately and appears in the index for everyone.</p>
    ${flashBlock}${errBlock}
    <form method="POST" action="/add" class="form-card" style="margin-top:22px;">
      <div class="form-field">
        <label for="name">Medicine name *</label>
        <input type="text" id="name" name="name" required placeholder="e.g. Loperamide">
      </div>
      <div class="form-field">
        <label for="aliases">Brand names / aliases (one per line)</label>
        <textarea id="aliases" name="aliases" placeholder="Imodium&#10;Lomotil"></textarea>
      </div>
      <div class="form-field">
        <label for="treats">Typically used for *</label>
        <textarea id="treats" name="treats" required placeholder="What condition or symptom this treats"></textarea>
      </div>
      <div class="form-field">
        <label for="deficiency">Root cause / deficiency link</label>
        <textarea id="deficiency" name="deficiency" placeholder="Any nutrient gap or root cause this is linked to, if relevant"></textarea>
      </div>
      <div class="form-field">
        <label for="foods">Food sources (one per line) *</label>
        <textarea id="foods" name="foods" required placeholder="Ginger tea&#10;Turmeric milk"></textarea>
      </div>
      <div class="form-field">
        <label for="ayurveda">Ayurvedic / home-remedy angle (one per line) *</label>
        <textarea id="ayurveda" name="ayurveda" required placeholder="Triphala churna&#10;Fennel tea"></textarea>
      </div>
      <div class="form-field">
        <label for="caution">Caution *</label>
        <textarea id="caution" name="caution" required placeholder="When this needs a doctor instead of a home remedy"></textarea>
        <div class="hint">Be specific — this is the most important field on the page.</div>
      </div>
      <button type="submit" class="submit-btn">Save entry</button>
    </form>
  `;
  return layout('Add entry', body);
}

function aboutPage() {
  const body = `
    <a class="back-link" href="/">&larr; Back to index</a>
    <div class="eyebrow">About this tool</div>
    <h1 style="font-size:32px;">What this <em>is</em>, and isn't</h1>
    <div class="card">
      <div class="card-body">
        <div class="field">
          <div class="field-label"><span class="dot"></span>What it is</div>
          <div class="field-text">A personal reference that maps common medicines to what they're
          typically prescribed for, and lists food, Ayurvedic, and home-remedy options commonly
          associated with the same need — for reading and comparing, not for prescribing.</div>
        </div>
        <div class="field">
          <div class="field-label"><span class="dot"></span>What it is not</div>
          <div class="field-text">It is not a medical device, not reviewed by a clinician, and not
          a substitute for a diagnosis. Entries — including any added through the "Add entry" form —
          reflect commonly cited associations, not verified clinical guidance.</div>
        </div>
        <div class="field">
          <div class="field-label"><span class="dot"></span>Chronic conditions</div>
          <div class="field-text">For diabetes, thyroid disorders, blood pressure, heart conditions,
          and mental health medication, never stop or change a prescribed dose based on anything in
          this tool. Food and herbs listed here are framed as complementary at best.</div>
        </div>
      </div>
    </div>
  `;
  return layout('About', body);
}

function notFoundPage() {
  const body = `
    <div class="empty" style="margin-top:100px;">
      404 — that entry doesn't exist.<br><a href="/" style="color:var(--leaf-deep); text-decoration:underline;">Back to the index</a>
    </div>
  `;
  return layout('Not found', body);
}

module.exports = { layout, homePage, detailPage, addPage, aboutPage, notFoundPage, esc };
