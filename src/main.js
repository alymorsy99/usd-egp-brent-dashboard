import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
<header class="topbar">
  <div class="brand"><div class="mark">M</div><div><div class="brand-name">MARKET RELATIONSHIPS</div><div class="brand-sub">CROSS-ASSET MONITOR</div></div></div>
  <div class="top-meta"><span class="live-dot"></span><span id="feed-label">DATA FEED NOT CONNECTED</span><span class="sep"></span><span>RESEARCH WORKSPACE</span></div>
</header>
<main>
  <section class="intro">
    <div><div class="eyebrow">EGYPT FX · ENERGY</div><h1>USD/EGP <span class="muted">×</span> Brent crude</h1><p class="lede">Track relative performance, identify divergence and measure rolling co-movement.</p></div>
    <div class="asof"><span class="eyebrow">MARKET DATA STATUS</span><strong id="status">Awaiting data connection</strong><small id="source">No provider configured</small></div>
  </section>
  <section class="toolbar">
    <div class="ranges" role="group" aria-label="Date range">
      <button data-range="1M">1M</button><button data-range="3M">3M</button><button data-range="6M">6M</button><button class="active" data-range="1Y">1Y</button><button data-range="3Y">3Y</button><button data-range="5Y">5Y</button>
    </div>
    <div class="controls"><label for="window">CORRELATION WINDOW</label><select id="window"><option value="20">20 observations</option><option value="60" selected>60 observations</option><option value="120">120 observations</option></select><button id="refresh" class="refre󯿶맱랳￀