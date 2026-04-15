// ── Tab switching ──────────────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('single-panel').classList.toggle('hidden', tab !== 'single');
  document.getElementById('batch-panel').classList.toggle('hidden', tab !== 'batch');
  document.querySelectorAll('.tab').forEach((el, i) => {
    el.classList.toggle('active', (i === 0) === (tab === 'single'));
  });
}

// ── Character counter ──────────────────────────────────────────────────────
document.getElementById('review-input').addEventListener('input', function () {
  document.getElementById('char-count').textContent = this.value.length;
});

// ── Single review analysis ─────────────────────────────────────────────────
async function analyzeSingle() {
  const text     = document.getElementById('review-input').value.trim();
  const resultEl = document.getElementById('single-result');
  const errorEl  = document.getElementById('single-error');

  resultEl.classList.add('hidden');
  errorEl.classList.add('hidden');

  if (!text) {
    showError(errorEl, 'Please enter a review before analyzing.');
    return;
  }

  const btn = document.querySelector('#single-panel .btn-primary');
  btn.textContent = 'Analyzing...';
  btn.disabled    = true;

  try {
    const res  = await fetch('/predict', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text })
    });
    const data = await res.json();

    if (data.error) { showError(errorEl, data.error); return; }

    document.getElementById('res-emoji').textContent   = data.emoji;
    document.getElementById('res-label').textContent   = data.label;
    document.getElementById('res-score').textContent   = data.confidence + '%';

    const bar = document.getElementById('res-bar');
    bar.className = 'bar ' + data.color;
    bar.style.width = '0%';

    resultEl.className = 'result-box ' + data.color;
    resultEl.classList.remove('hidden');

    requestAnimationFrame(() => { bar.style.width = data.confidence + '%'; });

  } catch (err) {
    showError(errorEl, 'Server error. Make sure Flask is running.');
  } finally {
    btn.textContent = 'Analyze Sentiment';
    btn.disabled    = false;
  }
}

// ── Batch CSV handling ─────────────────────────────────────────────────────
let batchReviews = [];

// ✅ FIXED: Properly parses CSV including reviews that contain commas
function parseCSVLine(line) {
  const result = [];
  let current  = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function handleCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const raw = e.target.result;

    // ✅ Detect line ending: \r\n, \r, or \n
    const lines = raw.split(/\r\n|\r|\n/).filter(l => l.trim() !== '');

    console.log('Total lines found:', lines.length);
    console.log('First line (header):', lines[0]);

    if (lines.length < 2) {
      alert('CSV file appears empty or has only a header row.');
      return;
    }

    // ✅ Find the 'review' column index
    const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    console.log('Parsed headers:', header);

    const col = header.indexOf('review');

    if (col === -1) {
      alert(`CSV must have a column named "review".\nFound columns: ${header.join(', ')}`);
      return;
    }

    // ✅ Parse each review row
    batchReviews = lines.slice(1)
      .map(line => {
        const cols = parseCSVLine(line);
        return (cols[col] || '').replace(/^"|"$/g, '').trim();
      })
      .filter(Boolean);

    console.log(`✅ Found ${batchReviews.length} reviews:`, batchReviews);

    if (batchReviews.length === 0) {
      alert('No reviews found in CSV. Please check the file content.');
      return;
    }

    document.getElementById('batch-btn').disabled = false;
    document.getElementById('batch-btn').textContent =
      `Analyze ${batchReviews.length} Reviews`;
  };

  // ✅ Try reading with different encodings
  reader.readAsText(file, 'UTF-8');
}

let batchResultData = [];

async function analyzeBatch() {
  const btn = document.getElementById('batch-btn');
  btn.textContent = 'Analyzing...';
  btn.disabled    = true;
  document.getElementById('download-btn').classList.add('hidden');

  // ✅ FIXED: Clear old results before new analysis
  document.getElementById('batch-results').innerHTML = '';

  try {
    const res  = await fetch('/batch', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ reviews: batchReviews })
    });
    const data = await res.json();

    // ✅ FIXED: Handle error response from server
    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }

    batchResultData = data;
    renderBatchTable(data);
    document.getElementById('download-btn').classList.remove('hidden');

  } catch (err) {
    alert('Server error. Make sure Flask is running.');
  } finally {
    btn.textContent = `Analyze ${batchReviews.length} Reviews`;
    btn.disabled    = false;
  }
}

function renderBatchTable(results) {
  const wrap = document.getElementById('batch-results');

  // ✅ NEW: Show summary counts at top
  const positive = results.filter(r => r.label === 'POSITIVE').length;
  const negative = results.filter(r => r.label === 'NEGATIVE').length;

  const rows = results.map(r => `
    <tr>
      <td>${r.emoji} ${r.text}</td>
      <td><span class="badge ${r.label.toLowerCase()}">${r.label}</span></td>
      <td>${r.confidence}%</td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <div class="batch-summary">
      ✅ Total: ${results.length} &nbsp;|&nbsp;
      😊 Positive: ${positive} &nbsp;|&nbsp;
      😞 Negative: ${negative}
    </div>
    <table class="batch-table">
      <thead><tr><th>Review</th><th>Sentiment</th><th>Confidence</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function downloadCSV() {
  const rows = [['Review', 'Sentiment', 'Confidence']];
  batchResultData.forEach(r => rows.push([`"${r.text}"`, r.label, r.confidence + '%']));
  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'sentiment_results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Utility ────────────────────────────────────────────────────────────────
function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}