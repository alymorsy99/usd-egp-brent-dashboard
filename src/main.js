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
  <section class="panel"><div class="panel-head"><div><div class="eyebrow">RELATIVE PERFORMANCE</div><h2>Indexed price comparison</h2></div><span class="unit">START = 100</span></div><div id="price-chart" class="chart-empty">Waiting for verified market observations.</div><div class="chart-legend"><span class="fx-key">USD/EGP</span><span class="brent-key">BRENT</span></div></section>
  <section class="panel"><div class="panel-head"><div><div class="eyebrow">CO-MOVEMENT</div><h2>Rolling Pearson correlation</h2></div><span class="unit">-1.00 TO +1.00</span></div><div id="corr-chart" class="chart-empty">Waiting for aligned daily returns.</div></section>
  <section class="bottom-grid">
    <article class="panel"><div class="eyebrow">DIVERGENCE MONITOR</div><h2>Signal assessment</h2><p id="divergence">Unavailable until both price series are received from the same observation calendar.</p></article>
    <article class="panel"><div class="eyebrow">METHODOLOGY & DATA QUALITY</div><h2>Calculation controls</h2><ul><li>Prices rebased to 100 at first common observation.</li><li>Correlation calculated on aligned daily percentage returns.</li><li>No forward-filling or synthetic observations.</li><li>Missing dates excluded from paired calculations.</li></ul><p id="quality">Provider connection not configured.</p></article>
  </section>
  <footer>USD/EGP x BRENT / INTERNAL ANALYTICAL WORKSPACE</footer>
</main>`;

let selectedRange = '1Y';
const windowSelect = document.querySelector('#window');
const $ = id => document.getElementById(id);
const pct = (a,b) => (Number(a) !== 0 ? (Number(b)/Number(a)-1)*100 : NaN);
const fmtPct = x => Number.isFinite(x) ? (x > 0 ? '+' : '') + x.toFixed(2) + '%' : '--';

function pearson(xs, ys) {
  if (xs.length !== ys.length || xs.length < 2) return null;
  const mx = xs.reduce((a,b)=>a+b,0)/xs.length, my = ys.reduce((a,b)=>a+b,0)/ys.length;
  let cov=0, vx=0, vy=0;
  for(let i=0;i<xs.length;i++){const dx=xs[i]-mx,dy=ys[i]-my;cov+=dx*dy;vx+=dx*dx;vy+=dy*dy;}
  return vx && vy ? cov/Math.sqrt(vx*vy) : null;
}
function svgLine(values, width, height, min, max, color, zeroLine=false) {
  const pad=34, innerW=width-pad*2, innerH=height-30;
  const y=v=>height-18-((v-min)/(max-min))*innerH;
  const x=i=>pad+(i/Math.max(1,values.length-1))*innerW;
  const points=values.map((v,i)=>Number.isFinite(v)?`${x(i).toFixed(1)},${y(v).toFixed(1)}`:null).filter(Boolean).join(' ');
  const zero=zeroLine?`<line x1="${pad}" x2="${width-pad}" y1="${y(0)}" y2="${y(0)}" stroke="#667381" stroke-dasharray="4 5"/>`:'';
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Time series chart" preserveAspectRatio="none"><line x1="${pad}" x2="${width-pad}" y1="12" y2="12" stroke="#263442"/><line x1="${pad}" x2="${width-pad}" y1="${height-18}" y2="${height-18}" stroke="#263442"/>${zero}<polyline fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" points="${points}"/></svg>`;
}
function renderCharts(rows, windowSize, returns, rolling) {
  const width=900,height=260;
  const fx0=Number(rows[0].usdEgp), br0=Number(rows[0].brent);
  const fx=rows.map(r=>Number(r.usdEgp)/fx0*100), br=rows.map(r=>Number(r.brent)/br0*100);
  const all=[...fx,...br], lo=Math.min(...all), hi=Math.max(...all), pad=Math.max((hi-lo)*.08,.5);
  $('price-chart').classList.remove('chart-empty');
  $('price-chart').innerHTML=`<div class="chart-svg">${svgLine(fx,width,height,lo-pad,hi+pad,'#50c6a5')}${svgLine(br,width,height,lo-pad,hi+pad,'#d4b86c')}</div><div class="axis-labels"><span>${rows[0].date}</span><span>${rows[rows.length-1].date}</span></div>`;
  const corrVals=rolling.map(x=>x.value);
  $('corr-chart').classList.remove('chart-empty');
  $('corr-chart').innerHTML=`<div class="chart-svg">${svgLine(corrVals,width,height,-1,1,'#50c6a5',true)}</div><div class="axis-labels"><span>${rolling[0]?.date || 'Insufficient data'}</span><span>${rolling[rolling.length-1]?.date || ''}</span></div>`;
}
function renderData(data) {
  const raw=Array.isArray(data.observations)?data.observations:[];
  const dedup=new Map();
  let rejected=0;
  for(const r of raw){
    const date=String(r.date||'').slice(0,10), fx=Number(r.usdEgp), br=Number(r.brent);
    if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)||!Number.isFinite(fx)||!Number.isFinite(br)||fx<=0||br<=0){rejected++;continue;}
    dedup.set(date,{date,usdEgp:fx,brent:br});
  }
  const rows=[...dedup.values()].sort((a,b)=>a.date.localeCompare(b.date));
  $('obs').textContent=String(rows.length);
  if(rows.length<2){$('quality').textContent=`Insufficient valid paired observations (${rows.length}). Rejected rows: ${rejected}. At least two are required.`;return;}
  const first=rows[0],last=rows[rows.length-1];
  $('fx-price').textContent=last.usdEgp.toFixed(4);
  $('brent-price').textContent=last.brent.toFixed(2);
  $('fx-change').textContent=fmtPct(pct(first.usdEgp,last.usdEgp))+' over selected period';
  $('brent-change').textContent=fmtPct(pct(first.brent,last.brent))+' over selected period';
  const fxRet=[],brRet=[],retDates=[];
  for(let i=1;i<rows.length;i++){
    fxRet.push(rows[i].usdEgp/rows[i-1].usdEgp-1);
    brRet.push(rows[i].brent/rows[i-1].brent-1);
    retDates.push(rows[i].date);
  }
  const n=Number(windowSelect.value), rolling=[];
  for(let i=n-1;i<fxRet.length;i++){
    rolling.push({date:retDates[i],value:pearson(fxRet.slice(i-n+1,i+1),brRet.slice(i-n+1,i+1))});
  }
  const latest=rolling.length?rolling[rolling.length-1].value:null;
  $('corr').textContent=latest===null?'--':latest.toFixed(3);
  $('corr-window').textContent=latest===null?`Need ${n} return observations`:`Last ${n} aligned daily returns`;
  renderCharts(rows,n,fxRet,rolling.filter(x=>x.value!==null));
  const fxMove=pct(first.usdEgp,last.usdEgp),brMove=pct(first.brent,last.brent),gap=fxMove-brMove;
  $('divergence').textContent=`Over this period USD/EGP moved ${fmtPct(fxMove)} while Brent moved ${fmtPct(brMove)}. Relative performance gap: ${fmtPct(gap)}. ${Math.abs(gap)>=5?'Material divergence (absolute gap ≥5 percentage points).':'No material divergence under the 5 percentage-point threshold.'}`;
  $('quality').textContent=`Source: ${data.source||'Unspecified provider'}. Updated: ${data.asOf||data.timestamp||'timestamp not supplied'}. Valid paired dates: ${rows.length}; rejected rows: ${rejected}; duplicate dates consolidated: ${raw.length-rejected-rows.length}. Correlation uses ${n} paired daily returns and is blank until a full window exists.`;
}
async function checkFeed() {
  $('status').textContent='Checking provider configuration';
  $('feed-label').textContent='CHECKING DATA FEED';
  try {
    const response=await fetch('/api/market-data?range='+encodeURIComponent(selectedRange)+'&window='+encodeURIComponent(windowSelect.value),{headers:{accept:'application/json'}});
    const data=await response.json();
    if(!response.ok||!data.configured){
      $('status').textContent='Data feed not configured';
      $('feed-label').textContent='DATA FEED NOT CONNECTED';
      $('source').textContent=data.message||'LSEG connection requires account configuration';
      $('quality').textContent='No market observations received. Metrics and charts remain blank by design.';
      return;
    }
    $('status').textContent='Provider connected';
    $('feed-label').textContent='LIVE DATA CONNECTED';
    $('source').textContent=data.source||'LSEG';
    renderData(data);
  } catch(error) {
    $('status').textContent='Feed unavailable';
    $('feed-label').textContent='DATA FEED ERROR';
    $('source').textContent='Request failed; no fallback data used';
    $('quality').textContent=error.message;
  }
}
document.querySelectorAll('[data-range]').forEach(button=>button.addEventListener('click',()=>{
  selectedRange=button.dataset.range;
  document.querySelectorAll('[data-range]').forEach(x=>x.classList.toggle('active',x===button));
  checkFeed();
}));
$('refresh').addEventListener('click',checkFeed);
windowSelect.addEventListener('change',checkFeed);
checkFeed();
