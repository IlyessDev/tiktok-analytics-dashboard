/**
 * charts.js
 * Rendu des graphiques Canvas — aucune logique métier ici
 */

import { fmt } from './utils.js';

/**
 * Dessine la courbe d'évolution des vues
 */
export function renderChart(sv, avgVues) {
  const canvas = document.getElementById('chart-vues');
  const W = canvas.parentElement.getBoundingClientRect().width || 700;
  canvas.width = W;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');
  const pad = { top: 20, right: 20, bottom: 50, left: 60 };
  const cw = W - pad.left - pad.right;
  const ch = 220 - pad.top - pad.bottom;
  const maxV = Math.max(...sv.map(v => v.Vues));
  const n = sv.length;

  ctx.clearRect(0, 0, W, 220);

  // Lignes de grille
  ctx.strokeStyle = '#e8e2d8';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const gy = pad.top + ch - (g / 4) * ch;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(pad.left + cw, gy);
    ctx.stroke();
    ctx.fillStyle = '#8a8478';
    ctx.font = '10px DM Mono,monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmt(Math.round(maxV * g / 4)), pad.left - 6, gy + 4);
  }

  // Ligne moyenne
  const avgY = pad.top + ch - (avgVues / maxV) * ch;
  ctx.strokeStyle = '#e8341a';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, avgY);
  ctx.lineTo(pad.left + cw, avgY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#e8341a';
  ctx.font = 'bold 10px DM Mono,monospace';
  ctx.textAlign = 'left';
  ctx.fillText('moy. ' + fmt(avgVues), pad.left + 4, avgY - 5);

  // Zone de remplissage
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
  grad.addColorStop(0, 'rgba(255,77,143,0.25)');
  grad.addColorStop(1, 'rgba(255,77,143,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  sv.forEach((v, i) => {
    const x = pad.left + (i / (n - 1)) * cw;
    const y = pad.top + ch - (v.Vues / maxV) * ch;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + cw, pad.top + ch);
  ctx.lineTo(pad.left, pad.top + ch);
  ctx.closePath();
  ctx.fill();

  // Ligne principale
  ctx.strokeStyle = '#ff4d8f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  sv.forEach((v, i) => {
    const x = pad.left + (n > 1 ? (i / (n - 1)) * cw : cw / 2);
    const y = pad.top + ch - (v.Vues / maxV) * ch;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Points et labels
  sv.forEach((v, i) => {
    const x = pad.left + (n > 1 ? (i / (n - 1)) * cw : cw / 2);
    const y = pad.top + ch - (v.Vues / maxV) * ch;

    ctx.beginPath();
    ctx.arc(x, y, v.Vues >= 50000 ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = v.Vues >= 50000 ? '#1a9e5c' : '#ff4d8f';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label axe X
    ctx.fillStyle = '#8a8478';
    ctx.font = '9px DM Mono,monospace';
    ctx.textAlign = 'center';
    const short = v.Titre.split(' ').slice(0, 2).join(' ');
    ctx.fillText(short, x, 220 - pad.bottom + 14);

    // Valeur sur les hits
    if (v.Vues >= 50000) {
      ctx.fillStyle = '#0f0e0b';
      ctx.font = 'bold 10px DM Mono,monospace';
      ctx.fillText(fmt(v.Vues), x, y - 12);
    }
  });
}
