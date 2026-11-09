import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
<header class="topbar">
  <div class="brand"><div class="mark">N</div><div><div class="brand-name">MARKET RELATIONSHIPS</div><div class="brand-sub">CROSS-ASSET MONITOR</div></div></div>
  <div class="top-meta"><span class="live-dot"></span><span id="feed-label">DATA FEED NOT CONNECTED</span><span class="sep"></span><span>RESEARCH WORKSPACE</span></div>
</header>
<main>
  <section class="intro">
    <div><div class="eyebrow">EGYPT FX / ENERGY</div><h1>USD/EGP <span class="muted">x</span> Brent crude</h1><p class="lede">Track relative performance, identify divergence and measure rolling co-movement.</p></div>
    <div class="asof"><span class="eyebrow">MARKET DATA STATUS</span><strong id="status">Awaiting data connection</strong><small id="source">No provider configured</small></div>
  </section>
  <section class="toolbar">
    <div class="ranges" role="group" aria-label="Date range">
      <button data-range="1M">1M</button><button data-range="3M">3M</button><button data-range="6M">6M</button><button class="active" data-range="1Y">1Y</button><button data-range="3Y">3Y</button><button data-range="5Y">5Y</button>
    </div>
    <div class="controls"><label for="window">CORRELATION WINDOW</label><select id="window"><option value="20">20 observations</option><option value="60" selected>60 observations</option><option value="120">120 observations</option></select><button id="refresh" class="refresh">CHECK FEED</button></div>
  </section>
  <section class="stats">
    <article class="stat"><span>USD/EGP SPOT</span><strong id="fx-price">--</strong><small id="fx-change">No observations</small></article>
    <article class="stat"><span>BRENT (USD/BBL)</span><strong id="brent-price">--</strong><small id="brent-change">No observations</small></article>
    <article class="stat"><span>ROLLING CORRELATION</span><strong id="corr">--</strong><small id="corr-window">60 observations</small></article>
    <article class="stat"><span>COMMON OBSERVATIONS</span><strong id="obs">0</strong><small>Aligned daily dates</small></article>
  </section>
  <section class="panel"><div class="panel-head"><div><div class="eyebrow">RELATIVE PERFORMANCE</div><h2>Indexed price comparison</h2></div><span class="unit">START = 100</span></div><div id="price-chart" class="chart-empty">Chart will populate when verified market observations are connected.</div></section>
  <section class="panel"><div class="panel-head"><div><div class="eyebrow">CO-MOVEMENT</div><h2>Rolling Pearson correlation</h2></div><span class="unit">-1.00 TO +1.00</span></div><div id="corr-chart" class="chart-empty">Correlation will populate from aligned daily returns.</div></section>
  <section class="bottom-grid">
    <article class="panel"><div class="eyebrow">DIVERGENCE MONITOR</div><h2>Signal assessment</h2><p id="divergence">Unavailable until both price series are received from the same observation calendar.</p></article>
    <article class="panel"><div class="eyebrow">METHODOLOGY & DATA QUALITY</div><h2>Calculation controls</h2><ul><li>Prices rebased to 100 at first common observation.</li><li>Correlation calculated on aligned daily percentage returns.</li><li>No forward-filling or synthetic observations.</li><li>Missing dates excluded from paired calculations.</li></ul><p id="quality">Provider connection not configured.</p></article>
  </section>
  <footer>USD/EGP x BRENT / INTERNAL ANALYTICAL WORKSPACE</footer>
</main>`;

let selectedRange = '1Y';
const windowSelect = document.querySelector('#window');
async function checkFeed() {
  const status = document.querySelector('#status');
  const source = document.querySelector('#source');
  status.textContent = 'Checking provider configuration';
  try {
    const response = await fetch('/api/market-data?range=' + encodeURIComponent(selectedRange) + '&window=' + encodeURIComponent(windowSelect.value), { headers: { accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok || !data.configured) {
      status.textContent = 'Data feed not configured';
      source.textContent = data.message || 'LSEG connection requires account configuration';
      document.querySelector('#quality').textContent = 'No market observations received. Metrics and charts remain blank by design.';
      return;
    }
    status.textContent = 'Provider connected';
    source.textContent = data.source || 'LSEG';
    renderData(data);
  } catch (error) {
    status.textContent = 'Feed unavailable';
    source.textContent = 'Request failed; no fallback data used';
    document.querySelector('#quality').textContent = error.message;
  }
}
function renderData(data) {
  const rows = Array.isArray(data.observations) ? data.observations : [];
  const valid = rows.filter(x => Number.isFinite(Number(x.usdEgp)) && Number.isFinite(Number(x.brent)));
  document.querySelector('#obs').textContent = String(valid.length);
  if (!valid.length) return;
  const first = valid[0], last = valid[valid.length - 1];
  document.querySelector('#fx-price').textContent = Number(last.usdEgp).toFixed(4);
  document.querySelector('#brent-price').textContent = Number(last.brent).toFixed(2);
  const pct = (a,b) => ((Number(b)/Number(a))-1)*100;
  document.querySelector('#fx-change').textContent = pct(first.usdEgp,last.usdEgp).toFixed(2) + '% over selected period';
  document.querySelector('#brent-change').textContent = pct(first.brent,last.brent).toFixed(2) + '% over selected period';
  document.querySelector('#price-chart').textContent = 'Indexed observations loaded: ' + valid.length + '. Chart rendering pending.';
  document.querySelector('#corr-chart').textContent = 'Aligned observations loaded: ' + valid.length + '. Correlation calculation pending.';
}
document.querySelectorAll('[data-range]').forEach(button => button.addEventListener('click', () => {
  selectedRange = button.dataset.range;
  document.querySelectorAll('[data-range]').forEach(x => x.classList.toggle('active', x === button));
  checkFeed();
}));
document.querySelector('#refresh').addEventListener('click', checkFeed);
windowSelect.addEventListener('change', checkFeed);
checkFeed();
