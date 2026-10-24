// Minimal runtime for the *.dc.html pages: {{dotted.holes}}, <sc-for>, <sc-if>, onX handlers, DCLogic state.
class DCLogic {
  constructor(props) { this.props = props; this.state = null; }
  setState(patch) { this.state = Object.assign({}, this.state, patch); this._render(); }
}
window.DCLogic = DCLogic;

const HOLE = /\{\{\s*([\w.]+)\s*\}\}/g;
const get = (path, scope) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), scope);
const fill = (s, scope) => s.replace(HOLE, (_, p) => { const v = get(p, scope); return v == null ? '' : v; });

function build(node, scope, out) {
  if (node.nodeType === 3) return out.appendChild(document.createTextNode(fill(node.data, scope)));
  if (node.nodeType !== 1) return;
  const tag = node.localName;
  if (tag === 'helmet') return;
  if (tag === 'sc-for') {
    const list = get(node.getAttribute('list').replace(/[{}\s]/g, ''), scope) || [];
    const as = node.getAttribute('as');
    list.forEach(item => node.childNodes.forEach(c => build(c, Object.assign({}, scope, { [as]: item }), out)));
    return;
  }
  if (tag === 'sc-if') {
    if (get(node.getAttribute('value').replace(/[{}\s]/g, ''), scope)) node.childNodes.forEach(c => build(c, scope, out));
    return;
  }
  if (node.hasAttribute('data-for')) {
    const as = node.getAttribute('data-as'), list = get(node.getAttribute('data-for').replace(/[{}\s]/g, ''), scope) || [];
    const proto = node.cloneNode(true);
    proto.removeAttribute('data-for'); proto.removeAttribute('data-as');
    list.forEach(item => build(proto, Object.assign({}, scope, { [as]: item }), out));
    return;
  }
  const el = node.cloneNode(false);
  for (const a of [...node.attributes]) {
    if (/^on/.test(a.name)) {
      el.removeAttribute(a.name);
      const fn = get(a.value.replace(/[{}\s]/g, ''), scope);
      if (typeof fn === 'function') el.addEventListener(a.name.slice(2), fn);
    } else if (a.name.startsWith('hint-')) el.removeAttribute(a.name);
    else el.setAttribute(a.name, fill(a.value, scope));
  }
  node.childNodes.forEach(c => build(c, scope, el));
  out.appendChild(el);
}

// Patient data from ../Data (serve the Hospital folder over http; fetch fails on file://). ?p=<patient_id> picks the patient.
async function loadPatient() {
  let id = new URLSearchParams(location.search).get('p');
  try { if (id) localStorage.setItem('pt', id); else id = localStorage.getItem('pt'); } catch (e) {}
  const all = await (await fetch('../Data/patients.json')).json();
  const p = all.find(x => x.patient_id === id) || all[0];
  const rows = await (await fetch('../Data/' + p.patient_id + '_telemetry.json')).json();
  const col = k => rows.map(r => r[k]);
  const sum = a => a.reduce((x, y) => x + y, 0);
  const avg = a => sum(a) / a.length;
  const t12 = i => { const d = new Date(rows[i].timestamp); return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toUpperCase(); };
  const steps = col('step_count'), stage = col('sleep_stage');
  const sleepMin = stage.filter(x => x !== 'Awake').length * 5;
  const names = p.name.split(' ');
  return {
    p, rows, t12, avg, sum,
    hr: col('heart_rate_bpm'), glu: col('glucose_mg_dl'), hrv: col('hrv_rmssd_ms'), steps, stage,
    info: Object.assign({}, p, {
      deepMin: stage.filter(x => x === 'Deep').length * 5, remMin: stage.filter(x => x === 'REM').length * 5, lightMin: stage.filter(x => x === 'Light').length * 5,
      minsHigh: col('glucose_mg_dl').filter(x => x > 180).length * 5, egfrLabel: p.egfr >= 90 ? 'Normal' : p.egfr >= 60 ? 'Mildly reduced' : 'Reduced',
      first: names[0], riskLevel: p.risk_phenotype.split(' - ')[0], initials: names.map(n => n[0]).join('').slice(0, 2),
      stepsTotal: sum(steps).toLocaleString('en-IN'), stepsN: sum(steps),
      km: (sum(steps) * 0.00075).toFixed(1), activeMin: steps.filter(x => x >= 60).length * 5,
      sleepText: Math.floor(sleepMin / 60) + 'h ' + (sleepMin % 60) + 'm', sleepMin,
      hrvAvg: Math.round(avg(col('hrv_rmssd_ms'))), gluAvg: Math.round(avg(col('glucose_mg_dl'))),
      gluMin: Math.round(Math.min(...col('glucose_mg_dl'))), gluMax: Math.round(Math.max(...col('glucose_mg_dl'))),
      window: new Date(rows[0].timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateLong: new Date(rows[rows.length - 1].timestamp).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      lastTime: t12(rows.length - 1)
    })
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  try { window.PT = await loadPatient(); } catch (e) {
    document.body.innerHTML = '<div style="max-width:560px;margin:15vh auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.5"><h1 style="font-size:22px">Could not load patient data</h1><p>This page reads <code>../Data/</code> with <code>fetch</code>, which needs a web server. Opening the file directly, or starting the server inside <code>portal/</code>, will not work.</p><p>From the folder that contains both <code>portal/</code> and <code>Data/</code>, run:</p><pre style="background:#F2F4F7;padding:12px;border-radius:8px">python -m http.server 8000</pre><p>then open <code>http://localhost:8000/portal/Main.dc.html</code>.</p></div>';
    throw e;
  }
  const root = document.querySelector('x-dc');
  const cfg = document.querySelector('script[data-dc-script]');
  const props = {};
  const decl = JSON.parse(cfg.dataset.props || '{}');
  for (const k in decl) if (k[0] !== '$' && 'default' in decl[k]) props[k] = decl[k].default;
  const Component = new Function('DCLogic', cfg.textContent + '\nreturn Component;')(DCLogic);
  const inst = new Component(props);

  root.querySelectorAll('helmet').forEach(h => { document.head.append(...h.childNodes); h.remove(); });
  const tpl = root.cloneNode(true);
  root.style.display = 'block';
  inst._render = () => {
    const out = document.createDocumentFragment();
    const vals = Object.assign({ pt: PT.info }, inst.renderVals());
    tpl.childNodes.forEach(c => build(c, vals, out));
    root.replaceChildren(out);
  };
  inst._render();
});
