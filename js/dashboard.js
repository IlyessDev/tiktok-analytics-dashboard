/**
 * dashboard.js
 * Rendu du dashboard principal — KPIs, analytics, insights, top5
 */

import { fmt, engRate, viralClass, badgeCasting, badgeLieu, updateHeaderCount } from './utils.js';
import { renderChart } from './charts.js';

const HIT  = 50000;
const FLOP = 15000;

/**
 * Point d'entrée principal du dashboard
 */
export function renderDashboard(videos) {
  const sv = [...videos].sort((a, b) => new Date(a.Date) - new Date(b.Date));

  updateHeaderCount(sv.length);
  renderKPIs();
  renderPerfCards(sv);
  renderVsRow(sv);
  renderChart(sv, Math.round(sv.reduce((s, v) => s + v.Vues, 0) / sv.length));
  renderAnalytics(sv);
  renderInsights(sv);
  renderTop5(sv);
}

/* - KPIs - */
async function renderKPIs() {
  const data = await fetchKPIs()
  const k    = data[0]

  document.getElementById('kpi-row').innerHTML =
    kpi('k-pink','Total Vues',fmt(k.total_vues), '') +
    kpi('k-red','Total Likes',fmt(k.total_likes),   '') +
    kpi('k-blue','Partages',fmt(k.total_partages),'') +
    kpi('k-green','Moy. Vues',fmt(k.moyenne_vues),  'par vidéo') +
    kpi('k-yellow','Meilleure',`<span style="font-size:.95rem">${k.meilleure_video}</span>`,fmt(k.meilleure_vues) + ' vues')
}

function kpi(cls, label, val, sub) {
  return `<div class="kpi ${cls}">
    <div class="kpi-label">${label}</div>
    <div class="kpi-val">${val}</div>
    ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
  </div>`;
}

/* - PERF CARDS - */
function renderPerfCards(sv) {
  const avg      = Math.round(sv.reduce((s,v)=>s+v.Vues,0)/sv.length);
  const first50  = sv.find(v => v.Vues >= 50000);
  const first100 = sv.find(v => v.Vues >= 100000);
  const idx50    = first50  ? sv.indexOf(first50)  + 1 : null;
  const idx100   = first100 ? sv.indexOf(first100) + 1 : null;
  const above    = sv.filter(v => v.Vues >= avg).length;
  const score    = Math.round(above / sv.length * 100);
  const scoreClass = score >= 50 ? 'good' : score >= 30 ? 'warn' : 'bad';

  const last5  = sv.slice(-5).reduce((s,v)=>s+v.Vues,0) / 5;
  const first5 = sv.slice(0,5).reduce((s,v)=>s+v.Vues,0) / 5;
  const prog   = Math.round((last5 - first5) / first5 * 100);

  document.getElementById('perf-grid').innerHTML =
    perfCard(first50  ? 'good' : 'bad',  '⚡ 1ère vidéo +50k',  first50  ? 'Vidéo #'+idx50  : 'Pas encore', first50  ? first50.Titre  : 'Continuez !') +
    perfCard(first100 ? 'good' : 'warn', '🚀 1ère vidéo +100k', first100 ? 'Vidéo #'+idx100 : 'Pas encore', first100 ? first100.Titre : 'Bientôt !') +
    perfCard(scoreClass, '📊 Score régularité', score + '%', above + ' vidéos sur ' + sv.length + ' au-dessus de la moyenne (' + fmt(avg) + ')') +
    perfCard('', '📈 Progression', (prog >= 0 ? '+' : '') + prog + '%', 'Moy. 5 dernières vs 5 premières');
}

function perfCard(cls, label, val, sub) {
  return `<div class="perf-card ${cls}">
    <div class="label">${label}</div>
    <div class="val">${val}</div>
    <div class="sub">${sub}</div>
  </div>`;
}

/* ── 3 DERNIÈRES VS MOYENNE ── */
function renderVsRow(sv) {
  const avg  = Math.round(sv.reduce((s,v)=>s+v.Vues,0)/sv.length);
  const last3 = sv.slice(-3).reverse();
  let html = last3.map(v => {
    const diff = avg ? Math.round((v.Vues - avg) / avg * 100) : 0;
    const cls  = diff >= 10 ? 'up' : diff <= -10 ? 'down' : 'eq';
    const arrow = diff >= 10 ? '↑' : diff <= -10 ? '↓' : '→';
    return `<div class="vs-card">
      <div class="vs-title">${v.Titre}</div>
      <div class="vs-val">${fmt(v.Vues)}</div>
      <div class="vs-diff ${cls}">${arrow} ${diff >= 0 ? '+' : ''}${diff}% vs moyenne</div>
    </div>`;
  }).join('');
  html += `<div class="vs-card" style="background:#faf8f4">
    <div class="vs-title">Moyenne générale</div>
    <div class="vs-val" style="color:var(--muted)">${fmt(avg)}</div>
    <div class="sub" style="font-size:.8rem;color:var(--muted);margin-top:.3rem">sur ${sv.length} vidéos</div>
  </div>`;
  document.getElementById('vs-row').innerHTML = html;
}

/* ── ANALYTICS (flop/hit, momentum, vélocité) ── */
function renderAnalytics(sv) {
  document.getElementById('analytics-section').innerHTML =
    '<div class="sec-title">💀→🔥 Séquence Flop / Hit</div>' + renderFlopHit(sv) +
    '<div class="sec-title">⚡ Momentum — impact d\'un hit sur la vidéo suivante</div>' + renderMomentum(sv) +
    '<div class="sec-title">⏱ Vélocité de publication</div>' + renderVelocite(sv);
}

function renderFlopHit(sv) {
  let seqHtml = '<div class="chart-card" style="margin-bottom:2rem"><h4>💀 flop / 😐 moyen / 🔥 hit</h4><div style="display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;padding-top:.5rem">';
  let flopCount = 0;
  const flopBeforeHit = [];

  sv.forEach((v, i) => {
    const isHit  = v.Vues >= HIT;
    const isFlop = v.Vues < FLOP;
    if (isHit) { flopBeforeHit.push(flopCount); flopCount = 0; } else { flopCount++; }
    const h      = Math.max(24, Math.min(80, Math.round(v.Vues / HIT * 80)));
    const bg     = isHit ? 'var(--green)' : isFlop ? '#fde8e4' : 'rgba(245,197,24,.3)';
    const border = isHit ? 'var(--green)' : isFlop ? 'var(--red)' : 'var(--yellow)';
    const emoji  = isHit ? '🔥' : isFlop ? '💀' : '😐';
    const short  = v.Titre.split(' ').slice(0, 2).join(' ');
    seqHtml += `<div style="display:flex;flex-direction:column;align-items:center;gap:4px" title="${v.Titre} — ${fmt(v.Vues)} vues">
      <div style="font-size:.65rem;color:var(--muted);font-family:'DM Mono',monospace">${i+1}</div>
      <div style="width:38px;height:${h}px;background:${bg};border:2px solid ${border};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:${isHit?'1.1':'0.85'}rem">${emoji}</div>
      <div style="font-size:.62rem;text-align:center;max-width:38px;line-height:1.2">${short}</div>
    </div>`;
  });

  const avgFlops = flopBeforeHit.length ? (flopBeforeHit.reduce((s,n)=>s+n,0)/flopBeforeHit.length).toFixed(1) : '—';
  seqHtml += `</div><div style="margin-top:1rem;padding:.8rem 1rem;background:var(--bg);border-radius:8px;display:flex;gap:2rem;flex-wrap:wrap">
    <div><div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">Moy. flops avant un hit</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--pink)">${avgFlops}</div></div>
    <div><div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">Hits</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--green)">${flopBeforeHit.length}</div></div>
    <div><div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">Flops</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:var(--red)">${sv.filter(v=>v.Vues<FLOP).length}</div></div>
    <div><div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">Séquences</div><div style="font-size:1rem;line-height:1.6">${flopBeforeHit.map(n=>n+' flop'+(n>1?'s':'')+'→🔥').join(' · ')}</div></div>
  </div></div>`;
  return seqHtml;
}

function renderMomentum(sv) {
  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-bottom:2rem">';
  sv.forEach((v, i) => {
    if (v.Vues < HIT) return;
    const before    = i > 0 ? sv[i-1] : null;
    const after     = i < sv.length-1 ? sv[i+1] : null;
    const afterDiff = after ? Math.round((after.Vues - v.Vues) / v.Vues * 100) : null;
    const afterColor = afterDiff === null ? 'var(--muted)' : afterDiff < -30 ? 'var(--red)' : afterDiff > 10 ? 'var(--green)' : 'var(--muted)';
    html += `<div class="insight-card">
      <h4>🔥 ${v.Titre}</h4>
      <div class="insight-item"><span style="color:var(--muted);font-size:.82rem">Vidéo d'avant</span><span style="font-size:.82rem">${before ? before.Titre + ' <span style="font-family:\'DM Mono\',monospace">' + fmt(before.Vues) + '</span>' : '—'}</span></div>
      <div class="insight-item"><span style="font-weight:700">Ce hit</span><span style="font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:var(--green)">${fmt(v.Vues)}</span></div>
      <div class="insight-item"><span style="color:var(--muted);font-size:.82rem">Vidéo d'après</span><span style="font-size:.82rem">${after ? after.Titre + ' <span style="font-family:\'DM Mono\',monospace">' + fmt(after.Vues) + '</span> <span style="color:'+afterColor+';font-weight:700">' + (afterDiff!==null?(afterDiff>0?'+':'')+afterDiff+'%':'') + '</span>' : '—'}</span></div>
    </div>`;
  });
  return html + '</div>';
}

function renderVelocite(sv) {
  const gaps = sv.slice(1).map((v,i) => Math.round((new Date(sv[i+1].Date)-new Date(sv[i].Date))/(1000*60*60*24)));
  // Note: index mapping fix
  const gapsFixed = [];
  for (let i = 1; i < sv.length; i++) {
    gapsFixed.push(Math.round((new Date(sv[i].Date) - new Date(sv[i-1].Date)) / (1000*60*60*24)));
  }
  const avgGap = Math.round(gapsFixed.reduce((s,g)=>s+g,0)/gapsFixed.length);
  const pauseStats = [];

  let html = `<div class="chart-card" style="margin-bottom:2rem"><h4>Délai entre chaque vidéo — vert = régulier · jaune = pause · rouge = longue pause</h4><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">
    <thead style="background:var(--ink);color:var(--bg)"><tr>
      <th style="padding:.6rem 1rem;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em">Vidéo</th>
      <th style="padding:.6rem 1rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em">Délai</th>
      <th style="padding:.6rem 1rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em">Type</th>
      <th style="padding:.6rem 1rem;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em">Vues</th>
    </tr></thead><tbody>`;

  for (let i = 1; i < sv.length; i++) {
    const gap    = gapsFixed[i-1];
    const isLong = gap >= 25;
    const isPause = gap >= 14;
    if (isPause) pauseStats.push({ titre: sv[i].Titre, gap, vues: sv[i].Vues });
    const typeLabel = isLong
      ? `<span style="color:var(--red);font-weight:700">⚠️ Longue pause (${gap}j)</span>`
      : isPause
        ? `<span style="color:var(--yellow);font-weight:700">⚡ Pause (${gap}j)</span>`
        : `<span style="color:var(--green)">✓ Régulier</span>`;
    const rowBg = isLong ? 'rgba(232,52,26,.05)' : isPause ? 'rgba(245,197,24,.07)' : '';
    html += `<tr style="background:${rowBg};border-bottom:1px solid var(--border)">
      <td style="padding:.6rem 1rem;font-size:.85rem"><strong>${sv[i].Titre}</strong><span style="color:var(--muted);font-size:.78rem;margin-left:.5rem">après ${sv[i-1].Titre}</span></td>
      <td style="padding:.6rem 1rem;font-family:'DM Mono',monospace;font-size:.9rem;font-weight:700">${gap}j</td>
      <td style="padding:.6rem 1rem;font-size:.82rem">${typeLabel}</td>
      <td style="padding:.6rem 1rem;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;color:${sv[i].Vues>=HIT?'var(--green)':sv[i].Vues<FLOP?'var(--red)':'var(--blue)'}">${fmt(sv[i].Vues)}</td>
    </tr>`;
  }

  html += `</tbody></table><div style="margin-top:1rem;padding:.8rem 1rem;background:var(--bg);border-radius:8px;display:flex;gap:2rem;flex-wrap:wrap">
    <div><div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">Intervalle moyen</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem">${avgGap}j</div></div>`;
  pauseStats.forEach(p => {
    html += `<div><div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em">Retour après ${p.gap}j</div><div style="font-family:'Bebas Neue',sans-serif;font-size:1.6rem;color:${p.vues>=HIT?'var(--green)':p.vues<FLOP?'var(--red)':'var(--blue)'}">${fmt(p.vues)}</div><div style="font-size:.75rem;color:var(--muted)">${p.titre}</div></div>`;
  });
  return html + '</div></div>';
}

/* ── INSIGHTS ── */
function renderInsights(sv) {
  if (sv.length < 2) {
    document.getElementById('insights-grid').innerHTML = '<p style="color:var(--muted)">Ajoutez au moins 2 vidéos !</p>';
    return;
  }
  const cm = {}, lm = {};
  const dB  = { '< 20s': 0, '20-40s': 0, '40-60s': 0, '> 60s': 0 };
  const dBV = { '< 20s': 0, '20-40s': 0, '40-60s': 0, '> 60s': 0 };

  sv.forEach(v => {
    if (!cm[v.Casting]) cm[v.Casting] = { count: 0, vues: 0 };
    cm[v.Casting].count++; cm[v.Casting].vues += v.Vues;
    if (!lm[v.Lieu]) lm[v.Lieu] = { count: 0, vues: 0 };
    lm[v.Lieu].count++; lm[v.Lieu].vues += v.Vues;
    const k = v.Duree < 20 ? '< 20s' : v.Duree < 40 ? '20-40s' : v.Duree < 60 ? '40-60s' : '> 60s';
    dB[k]++; dBV[k] += v.Vues;
  });

  const maxC = Math.max(...Object.values(cm).map(x => x.vues));
  const maxL = Math.max(...Object.values(lm).map(x => x.vues));
  const maxD = Math.max(...Object.values(dBV));

  function rows(map, maxV, color) {
    return Object.entries(map).sort((a,b)=>b[1].vues-a[1].vues).map(([k,v]) => {
      const pct = maxV ? Math.round(v.vues / maxV * 100) : 0;
      return `<div class="insight-item">
        <span>${k} <span style="color:var(--muted);font-size:.75rem">(${v.count} vidéo${v.count>1?'s':''})</span></span>
        <div class="insight-bar-wrap">
          <div class="insight-bar" style="width:${pct}px;max-width:80px;background:${color}"></div>
          <span class="insight-num">${fmt(v.vues)}</span>
        </div>
      </div>`;
    }).join('');
  }

  const dRows = Object.entries(dBV).filter(([k]) => dB[k] > 0).sort((a,b)=>b[1]-a[1]).map(([k,v]) => {
    const pct = maxD ? Math.round(v / maxD * 100) : 0;
    return `<div class="insight-item">
      <span>${k} <span style="color:var(--muted);font-size:.75rem">(${dB[k]} vidéo${dB[k]>1?'s':''})</span></span>
      <div class="insight-bar-wrap">
        <div class="insight-bar" style="width:${pct}px;max-width:80px;background:var(--green)"></div>
        <span class="insight-num">${fmt(v)}</span>
      </div>
    </div>`;
  }).join('');

  document.getElementById('insights-grid').innerHTML =
    `<div class="insight-card"><h4>🎭 Casting → Vues</h4>${rows(cm, maxC, 'var(--pink)')}</div>` +
    `<div class="insight-card"><h4>📍 Lieu → Vues</h4>${rows(lm, maxL, 'var(--blue)')}</div>` +
    `<div class="insight-card"><h4>⏱ Durée → Vues</h4>${dRows}</div>`;
}

/* ── TOP 5 ── */
function renderTop5(sv) {
  const top = [...sv].sort((a,b)=>b.Vues-a.Vues).slice(0,5);
  document.getElementById('top5').innerHTML = top.length
    ? `<div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Titre</th><th>Casting</th><th>Lieu</th><th>Vues</th><th>Eng.</th></tr></thead>
        <tbody>${top.map((v,i) => `<tr>
          <td style="font-family:'Bebas Neue',sans-serif;font-size:1.1rem;color:var(--muted)">${i+1}</td>
          <td>${v.Titre}</td>
          <td>${badgeCasting(v.Casting)}</td>
          <td>${badgeLieu(v.Lieu)}</td>
          <td class="${viralClass(v.Vues)}">${fmt(v.Vues)}</td>
          <td style="font-family:'DM Mono',monospace;font-size:.82rem">${engRate(v).toFixed(1)}%</td>
        </tr>`).join('')}</tbody>
      </table></div>`
    : '';
}
